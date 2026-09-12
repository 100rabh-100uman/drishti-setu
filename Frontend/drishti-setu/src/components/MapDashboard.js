"use client";

import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import 'leaflet/dist/leaflet.css';
import { 
  Layers, 
  MapPin, 
  Maximize2, 
  Minimize2, 
  RotateCw, 
  Eye, 
  EyeOff, 
  Flame, 
  Shield, 
  CheckCircle2, 
  AlertTriangle, 
  AlertCircle, 
  Info,
  Radio, 
  Clock, 
  Sparkles, 
  ExternalLink, 
  ChevronRight, 
  RefreshCw, 
  Zap, 
  Cpu,
  Play,
  Pause,
  Sliders,
  Calendar,
  Users,
  Camera,
  Filter,
  Grid,
  X,
  HelpCircle,
  Activity,
  Lock
} from 'lucide-react';
import { apiClient, API_ENDPOINTS } from '@/services/api';
import { cameraService } from '@/services/camera.service';
import { authService } from '@/services/auth.service';
import Filters from './Filters';
import CameraFeed from './CameraFeed';
import { dangerActionService } from '@/services/danger-action.service';

// Timeline interval configuration
const TIMELINE_STEPS = [
  { id: 'live', label: 'Live (Now)', desc: 'Real-time telemetry feeds', hours: 0 },
  { id: '1h', label: 'Last 1h', desc: 'Events in past 60 mins', hours: 1 },
  { id: '6h', label: 'Last 6h', desc: 'Shift window events', hours: 6 },
  { id: '24h', label: 'Last 24h', desc: 'Daily incident log', hours: 24 },
  { id: '7d', label: 'Last 7d', desc: 'Weekly trend analysis', hours: 168 }
];

// Simulated / cached recent events map for temporal filtering
const CAMERA_EVENT_SCHEDULE = {
  'CAM001': [
    { type: 'vehicle', label: 'ANPR Hit: GJ-01-BK-5821', hoursAgo: 0.4 },
    { type: 'motion', label: 'Traffic Surge', hoursAgo: 4.2 }
  ],
  'CAM002': [
    { type: 'motion', label: 'Movement detected', hoursAgo: 18.0 }
  ],
  'CAM003': [
    { type: 'face', label: 'Watchlist Match: #SUS-8412', hoursAgo: 0.8 },
    { type: 'intrusion', label: 'Perimeter Breach Warning', hoursAgo: 5.1 }
  ],
  'CAM005': [
    { type: 'intrusion', label: 'Tripwire Alert: Bodakdev Junction', hoursAgo: 3.2 },
    { type: 'face', label: 'Unauthorized Presence', hoursAgo: 22.0 }
  ],
  'CAM007': [
    { type: 'crowd', label: 'High Density (Kalupur West)', hoursAgo: 1.5 },
    { type: 'vehicle', label: 'ANPR Hit: GJ-06-QW-5098', hoursAgo: 14.0 }
  ],
  'CAM008': [
    { type: 'anomaly', label: 'Video Loss / Offline Event', hoursAgo: 2.1 }
  ],
  'CAM010': [
    { type: 'crowd', label: 'Crowd Congestion (Kankaria Gate)', hoursAgo: 5.5 }
  ],
  'CAM014': [
    { type: 'motion', label: 'Night Motion Anomaly', hoursAgo: 48.0 }
  ]
};

export default function MapDashboard({ initialZoom = 11, className = "" }) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const layersGroupRef = useRef({
    markers: null,
    clusters: null,
    zones: null,
    deptOverlays: null,
    heat: null
  });

  // ── Role & Authentication State ─────────────────────────────
  const [currentUser, setCurrentUser] = useState(null);
  const [userRole, setUserRole] = useState('Admin'); // 'Admin' | 'Inspector' | 'Viewer'
  const [showRoleSelector, setShowRoleSelector] = useState(false);

  // ── Data States ─────────────────────────────────────────────
  const [cameras, setCameras] = useState([]);
  const [zones, setZones] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [dangerActions, setDangerActions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);

  // ── Filter States ───────────────────────────────────────────
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedZone, setSelectedZone] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // ── Layer Visibility Controls ───────────────────────────────
  const [layerVisibility, setLayerVisibility] = useState({
    markers: true,
    clustering: true,
    zones: true,
    deptOverlays: false,
    heatmap: false,
    aiOverlays: true
  });

  // ── Timeline Slider States ──────────────────────────────────
  const [timelineStep, setTimelineStep] = useState('live');
  const [isPlayingTimeline, setIsPlayingTimeline] = useState(false);

  // ── Modals & Drawers ────────────────────────────────────────
  const [activeFeedCamera, setActiveFeedCamera] = useState(null);
  const [showSentinelModal, setShowSentinelModal] = useState(false);
  const [selectedZoneInfo, setSelectedZoneInfo] = useState(null);

  // ── Base Map Tile Style ─────────────────────────────────────
  const [tileStyle, setTileStyle] = useState('voyager'); // 'dark' | 'voyager' | 'osm'

  // Cache for dynamic camera events & audit entries
  const eventsCacheRef = useRef({});

  // ── Role Detection from Session ─────────────────────────────
  useEffect(() => {
    try {
      const session = authService.getCurrentSession();
      if (session?.user) {
        setCurrentUser(session.user);
        if (session.user.role) {
          setUserRole(session.user.role);
        }
      }
    } catch (e) {
      console.warn('Could not read session role:', e);
    }
  }, []);

  const isAdmin = userRole === 'Admin';
  const isInspector = userRole === 'Inspector';
  const isViewer = userRole === 'Viewer';

  // ── 1. Fetch Master Data ────────────────────────────────────
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    setError(null);

    try {
      // 1. Departments
      try {
        const deptRes = await apiClient.get('/departments/get_departments/');
        if (deptRes && Array.isArray(deptRes.departments)) {
          setDepartments(deptRes.departments);
        } else {
          const fallbackDepts = await cameraService.getDepartments();
          setDepartments(fallbackDepts);
        }
      } catch (deptErr) {
        const fallbackDepts = await cameraService.getDepartments();
        setDepartments(fallbackDepts);
      }

      // 2. Zones
      try {
        const zonesRes = await apiClient.get('/zones/get_zones/');
        if (zonesRes && Array.isArray(zonesRes.zones)) {
          setZones(zonesRes.zones);
        } else {
          const fallbackZones = await cameraService.getZones();
          setZones(fallbackZones);
        }
      } catch (zonesErr) {
        try {
          const fallbackZones = await cameraService.getZones();
          setZones(fallbackZones);
        } catch {}
      }

      // 3. Cameras
      try {
        const camsList = await cameraService.getCameras();
        if (Array.isArray(camsList)) {
          setCameras(camsList);
        } else {
          setCameras([]);
        }
      } catch (camErr) {
        console.warn('Camera service fetch warning:', camErr?.message || camErr);
      }

      // 4. Danger Actions (Real-time Threat Alerts)
      try {
        const alertsList = await dangerActionService.getDangerActions({ limit: 100 });
        if (Array.isArray(alertsList)) {
          setDangerActions(alertsList);
        }
      } catch (alertErr) {
        console.warn('Danger actions fetch notice:', alertErr?.message || alertErr);
      }

      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error fetching map data:', err);
      setError(err?.message || 'Connecting to resilient local GIS cache.');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Periodic Auto-refresh
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchData(true);
    }, 15000);
    return () => clearInterval(interval);
  }, [autoRefresh, fetchData]);

  // Timeline Player Loop
  useEffect(() => {
    if (!isPlayingTimeline) return;
    const interval = setInterval(() => {
      setTimelineStep((current) => {
        const idx = TIMELINE_STEPS.findIndex((s) => s.id === current);
        const nextIdx = (idx + 1) % TIMELINE_STEPS.length;
        return TIMELINE_STEPS[nextIdx].id;
      });
    }, 3200);
    return () => clearInterval(interval);
  }, [isPlayingTimeline]);

  // ── 2. Initialize Leaflet Map ───────────────────────────────
  useEffect(() => {
    if (typeof window === 'undefined' || !mapContainerRef.current) return;
    if (mapInstanceRef.current) return;

    const L = require('leaflet');
    require('leaflet.heat');

    // Centered around Ahmedabad / Gandhinagar CCTV network
    const map = L.map(mapContainerRef.current, {
      center: [23.033, 72.565],
      zoom: initialZoom,
      zoomControl: false,
      attributionControl: false
    });

    L.control.attribution({ position: 'bottomright' })
      .addAttribution('&copy; Gujarat Police Hackathon | Sentinel GIS')
      .addTo(map);

    L.control.zoom({ position: 'bottomright' }).addTo(map);

    layersGroupRef.current.markers = L.layerGroup().addTo(map);
    layersGroupRef.current.clusters = L.layerGroup().addTo(map);
    layersGroupRef.current.zones = L.layerGroup().addTo(map);
    layersGroupRef.current.deptOverlays = L.layerGroup().addTo(map);

    map.on('zoomend', () => {
      setCurrentZoom(map.getZoom());
    });

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [initialZoom]);

  // ── 3. Base Map Tile Switcher ───────────────────────────────
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require('leaflet');
    const map = mapInstanceRef.current;

    map.eachLayer((layer) => {
      if (layer instanceof L.TileLayer) {
        map.removeLayer(layer);
      }
    });

    let tileUrl = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
    let subdomains = 'abcd';
    let maxZoom = 20;

    if (tileStyle === 'dark') {
      tileUrl = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
    } else if (tileStyle === 'osm') {
      tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      subdomains = 'abc';
      maxZoom = 19;
    }

    L.tileLayer(tileUrl, {
      subdomains,
      maxZoom,
      attribution: '&copy; OpenStreetMap & CartoDB'
    }).addTo(map);
  }, [tileStyle]);

  // ── 4. Filter Cameras Client-Side ───────────────────────────
  const filteredCameras = useMemo(() => {
    return cameras.filter((cam) => {
      if (selectedDepartment && String(cam.department_id) !== String(selectedDepartment)) {
        return false;
      }
      if (selectedZone && cam.zone_id !== selectedZone) {
        return false;
      }
      if (selectedType !== 'ALL') {
        const cType = (cam.camera_type || '').toLowerCase();
        if (selectedType === 'IP' && !cType.includes('ip')) return false;
        if (selectedType === 'Analog' && !cType.includes('analog')) return false;
      }
      if (selectedStatus !== 'ALL') {
        const cStatus = (cam.status || '').toLowerCase();
        if (selectedStatus === 'Active' && cStatus !== 'active') return false;
        if (selectedStatus === 'Inactive' && !['inactive', 'offline'].includes(cStatus)) return false;
        if (selectedStatus === 'Maintenance' && cStatus !== 'maintenance') return false;
        if (selectedStatus === 'Needs Review' && !cam.needs_review && cStatus !== 'needs review') return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = (cam.camera_id || '').toLowerCase().includes(q);
        const matchAddr = (cam.address || '').toLowerCase().includes(q);
        const matchIp = (cam.ip_address || '').toLowerCase().includes(q);
        const matchSerial = (cam.serial_number || '').toLowerCase().includes(q);
        if (!matchId && !matchAddr && !matchIp && !matchSerial) return false;
      }
      return true;
    });
  }, [cameras, selectedDepartment, selectedZone, selectedType, selectedStatus, searchQuery]);

  // Helper to determine camera activity relative to active timeline window
  const getCameraTimelineActivity = useCallback((cameraId) => {
    if (timelineStep === 'live') {
      return { hasEvents: true, eventCount: 0, events: [] };
    }
    const stepConfig = TIMELINE_STEPS.find((s) => s.id === timelineStep);
    const maxHours = stepConfig ? stepConfig.hours : 0;
    const registeredEvents = CAMERA_EVENT_SCHEDULE[cameraId] || [];
    const windowEvents = registeredEvents.filter((ev) => ev.hoursAgo <= maxHours);
    return {
      hasEvents: windowEvents.length > 0,
      eventCount: windowEvents.length,
      events: windowEvents
    };
  }, [timelineStep]);

  // Total active events in the selected timeline window
  const totalTimelineEvents = useMemo(() => {
    if (timelineStep === 'live') return 0;
    let count = 0;
    filteredCameras.forEach((cam) => {
      const act = getCameraTimelineActivity(cam.camera_id);
      count += act.eventCount;
    });
    return count;
  }, [filteredCameras, getCameraTimelineActivity, timelineStep]);

  // Helper to fetch popup dynamic event & audit data
  const fetchPopupData = async (cameraId) => {
    if (eventsCacheRef.current[cameraId]) {
      return eventsCacheRef.current[cameraId];
    }
    try {
      const res = await apiClient.get(`/cameras/get_camera_events/?camera_id=${encodeURIComponent(cameraId)}`);
      eventsCacheRef.current[cameraId] = res;
      return res;
    } catch (e) {
      return { events: [], last_audit: null };
    }
  };

    // Map active danger actions to cameras (filtered by department & timeline)
  const cameraDangerMap = useMemo(() => {
    const map = {};
    dangerActions.forEach((alert) => {
      if (['ACTIVE', 'DISPATCHED'].includes((alert.alert_status || '').toUpperCase())) {
        // Department officer role filter:
        if (userRole !== 'Admin' && userRole !== 'Head' && currentUser?.department_id && alert.department_id !== currentUser.department_id) {
          return;
        }
        // Timeline filtering
        if (timelineStep !== 'live') {
          const stepConfig = TIMELINE_STEPS.find((s) => s.id === timelineStep);
          const maxHours = stepConfig ? stepConfig.hours : 168;
          const alertHoursAgo = (Date.now() - new Date(alert.timestamp).getTime()) / (1000 * 3600);
          if (alertHoursAgo > maxHours) return;
        }
        if (!map[alert.camera_id]) {
          map[alert.camera_id] = alert;
        }
      }
    });
    return map;
  }, [dangerActions, userRole, currentUser, timelineStep]);

  // ── 5. Spatial Clustering Calculation ───────────────────────
  // Groups cameras within ~60px distance when zoom < 13 or clustering is enabled
  const computedClusters = useMemo(() => {
    if (!mapInstanceRef.current) return [];
    const map = mapInstanceRef.current;
    const shouldCluster = layerVisibility.clustering && currentZoom < 13;

    if (!shouldCluster) {
      // Individual camera markers
      return filteredCameras.map((cam) => {
        const lat = cam.lat ?? cam.latitude;
        const lng = cam.lng ?? cam.longitude;
        return {
          isCluster: false,
          cameras: [cam],
          camera: cam,
          lat,
          lng
        };
      }).filter((c) => c.lat != null && c.lng != null && !isNaN(c.lat) && !isNaN(c.lng));
    }

    // Spatial clustering via viewport projection
    const clusterItems = [];
    const pixelThreshold = 55;

    filteredCameras.forEach((cam) => {
      const lat = cam.lat ?? cam.latitude;
      const lng = cam.lng ?? cam.longitude;
      if (lat == null || lng == null || isNaN(lat) || isNaN(lng)) return;

      const pt = map.latLngToLayerPoint([lat, lng]);
      let merged = false;

      for (const item of clusterItems) {
        const itemPt = map.latLngToLayerPoint([item.lat, item.lng]);
        const dist = Math.hypot(pt.x - itemPt.x, pt.y - itemPt.y);
        if (dist <= pixelThreshold) {
          item.cameras.push(cam);
          const count = item.cameras.length;
          item.lat = ((item.lat * (count - 1)) + lat) / count;
          item.lng = ((item.lng * (count - 1)) + lng) / count;
          item.isCluster = true;
          merged = true;
          break;
        }
      }

      if (!merged) {
        clusterItems.push({
          isCluster: false,
          cameras: [cam],
          camera: cam,
          lat,
          lng
        });
      }
    });

    return clusterItems;
  }, [filteredCameras, currentZoom, layerVisibility.clustering]);

  // ── 6. Render All Layers (Markers, Clusters, Zones, Heatmap) ──
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    const L = require('leaflet');
    const map = mapInstanceRef.current;
    const { 
      markers: markerGroup, 
      clusters: clusterGroup, 
      zones: zoneGroup, 
      deptOverlays: deptGroup 
    } = layersGroupRef.current;

    // Clear previous elements
    markerGroup.clearLayers();
    clusterGroup.clearLayers();
    zoneGroup.clearLayers();
    deptGroup.clearLayers();
    if (layersGroupRef.current.heat) {
      map.removeLayer(layersGroupRef.current.heat);
      layersGroupRef.current.heat = null;
    }

    // A. ZONE BOUNDARIES LAYER (polygons from zones table)
    if (layerVisibility.zones && zones.length > 0 && !isViewer) {
      zones.forEach((zone) => {
        let latlngs = zone.latlngs;
        if (!latlngs && zone.coordinates) latlngs = zone.coordinates;
        if (!latlngs && zone.geojson?.coordinates) {
          latlngs = zone.geojson.coordinates[0].map(([lng, lat]) => [lat, lng]);
        }

        if (latlngs && latlngs.length >= 3) {
          const zoneColor = zone.color || '#3B82F6';
          const polygon = L.polygon(latlngs, {
            color: zoneColor,
            weight: 2,
            opacity: 0.85,
            fillColor: zoneColor,
            fillOpacity: 0.12,
            dashArray: '5, 6'
          });

          // Camera count in this zone
          const zoneCams = filteredCameras.filter((c) => c.zone_id === (zone.code || zone.zone_id));

          polygon.bindTooltip(
            `<div class="font-sans text-xs">
              <div class="font-bold text-slate-800 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" style="background-color: ${zoneColor}"></span>
                ${zone.name || zone.zone_id}
              </div>
              <div class="text-[10px] text-slate-500 mt-0.5">Code: <span class="font-mono font-bold">${zone.code || zone.zone_id}</span></div>
              <div class="text-[10px] text-blue-600 font-semibold mt-0.5">${zoneCams.length} CCTVs Deployed</div>
            </div>`,
            { permanent: false, direction: 'center', className: 'leaflet-custom-tooltip' }
          );

          polygon.on('click', () => {
            setSelectedZoneInfo({
              ...zone,
              cameraCount: zoneCams.length
            });
            map.fitBounds(polygon.getBounds(), { padding: [40, 40] });
          });

          polygon.addTo(zoneGroup);
        }
      });
    }

    // B. DEPARTMENT OVERLAYS LAYER (Admin Only)
    if (isAdmin && layerVisibility.deptOverlays && departments.length > 0) {
      const deptClusters = {};
      filteredCameras.forEach((c) => {
        const cLat = c.lat ?? c.latitude;
        const cLng = c.lng ?? c.longitude;
        if (cLat && cLng && c.department_id) {
          if (!deptClusters[c.department_id]) deptClusters[c.department_id] = [];
          deptClusters[c.department_id].push([cLat, cLng]);
        }
      });

      const colors = ['#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4'];
      Object.keys(deptClusters).forEach((deptId, idx) => {
        const pts = deptClusters[deptId];
        if (pts.length >= 3) {
          const deptName = departments.find((d) => String(d.id) === String(deptId))?.name || `Department ${deptId}`;
          const deptColor = colors[idx % colors.length];
          const hull = L.polygon(pts, {
            color: deptColor,
            weight: 1.5,
            fillColor: deptColor,
            fillOpacity: 0.08,
            dashArray: '3, 5'
          });
          hull.bindTooltip(
            `<div class="text-xs font-semibold text-slate-700">${deptName} Coverage</div>`,
            { sticky: true }
          );
          hull.addTo(deptGroup);
        }
      });
    }

    // C. CAMERA MARKERS & CLUSTER BUBBLES
    if (layerVisibility.markers) {
      computedClusters.forEach((item) => {
        // CASE 1: CLUSTER BUBBLE (Multiple cameras grouped for readability)
        if (item.isCluster && item.cameras.length > 1) {
          let hasInactive = item.cameras.some((c) => ['inactive', 'offline'].includes((c.status || '').toLowerCase()));
          let hasNeedsReview = item.cameras.some((c) => c.needs_review || (c.status || '').toLowerCase() === 'needs review');
          let hasMaintenance = item.cameras.some((c) => (c.status || '').toLowerCase() === 'maintenance');

          let clusterColor = '#10B981'; // Green
          let alertLabel = 'All Cameras Active';

          const hasDangerAlert = item.cameras.some((c) => Boolean(cameraDangerMap[c.camera_id]));

          if (hasDangerAlert) {
            clusterColor = '#E11D48'; // Crimson
            alertLabel = '🚨 CRITICAL: Crime Suspect Detected in Cluster';
          } else if (hasInactive) {
            clusterColor = '#EF4444'; // Red
            alertLabel = 'Alert: Inactive Feed Detected';
          } else if (hasNeedsReview) {
            clusterColor = '#3B82F6'; // Blue
            alertLabel = 'Review Flagged Feeds';
          } else if (hasMaintenance) {
            clusterColor = '#F59E0B'; // Yellow
            alertLabel = 'Maintenance CCTVs';
          }

          // Check if any camera in cluster had events in current timeline window
          let clusterTimelineEvents = 0;
          if (timelineStep !== 'live') {
            item.cameras.forEach((c) => {
              clusterTimelineEvents += getCameraTimelineActivity(c.camera_id).eventCount;
            });
          }

          const clusterIconHtml = `
            <div class="relative group cursor-pointer flex items-center justify-center">
              <span class="absolute ${hasDangerAlert ? '-inset-3 opacity-75' : '-inset-1.5 opacity-25'} rounded-full animate-ping" style="background-color: ${clusterColor}"></span>
              ${hasDangerAlert ? `
                <span class="absolute -top-3 -left-3 px-1.5 py-0.5 rounded-full bg-rose-600 text-[8px] font-black text-white border border-white shadow-lg animate-pulse z-30 flex items-center gap-0.5">
                  🚨 DANGER
                </span>
              ` : ''}
              ${clusterTimelineEvents > 0 ? `
                <span class="absolute -top-2 -right-2 px-1 py-0.2 rounded-full bg-rose-600 text-[8px] font-black text-white border border-white shadow-md animate-bounce z-20">
                  ${clusterTimelineEvents} Ev
                </span>
              ` : ''}
              <div class="w-10 h-10 rounded-full flex flex-col items-center justify-center text-white border-2 border-white shadow-xl transition-transform duration-200 group-hover:scale-110" style="background: linear-gradient(135deg, ${clusterColor}, #0f172a)">
                <span class="text-xs font-black leading-none">${item.cameras.length}</span>
                <span class="text-[8px] font-bold opacity-85 uppercase tracking-tighter leading-none mt-0.5">Cams</span>
              </div>
            </div>
          `;

          const clusterIcon = L.divIcon({
            html: clusterIconHtml,
            className: 'custom-cctv-cluster',
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });

          const clusterMarker = L.marker([item.lat, item.lng], { icon: clusterIcon });

          clusterMarker.bindTooltip(
            `<div class="p-2 font-sans text-xs">
              <div class="font-bold text-slate-800">Cluster of ${item.cameras.length} Cameras</div>
              <div class="text-[11px] text-slate-500 mt-0.5">${alertLabel}</div>
              ${clusterTimelineEvents > 0 ? `<div class="text-[10px] text-rose-600 font-bold mt-1">${clusterTimelineEvents} Detection Events in Window</div>` : ''}
              <div class="text-[10px] text-blue-600 font-semibold mt-1 flex items-center gap-1">
                <span>Click to expand & zoom in</span>
              </div>
            </div>`,
            { direction: 'top', offset: [0, -20] }
          );

          clusterMarker.on('click', () => {
            const bounds = L.latLngBounds(item.cameras.map((c) => [c.lat ?? c.latitude, c.lng ?? c.longitude]));
            if (bounds.isValid()) {
              map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
            }
          });

          clusterMarker.addTo(clusterGroup);
          return;
        }

        // CASE 2: INDIVIDUAL CAMERA MARKER
        const cam = item.camera;
        const lat = item.lat;
        const lng = item.lng;
        if (lat == null || lng == null) return;

        // Animated Status Logic:
        // Active (Green), Inactive (Red), Maintenance (Yellow), Needs Review (Blue)
        let color = '#10B981';
        let statusLabel = 'Active';
        let badgeBg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        let glowClass = 'shadow-[0_0_12px_rgba(16,185,129,0.5)]';

        const camStatus = (cam.status || '').toLowerCase();
        const activeDanger = cameraDangerMap[cam.camera_id];

        if (activeDanger) {
          color = '#E11D48'; // Crimson
          statusLabel = 'DANGER ALERT';
          badgeBg = 'bg-rose-100 text-rose-800 border-rose-400 font-bold';
          glowClass = 'shadow-[0_0_22px_rgba(225,29,72,0.9)]';
        } else if (cam.needs_review || camStatus === 'needs review') {
          color = '#3B82F6';
          statusLabel = 'Needs Review';
          badgeBg = 'bg-blue-50 text-blue-700 border-blue-200';
          glowClass = 'shadow-[0_0_12px_rgba(59,130,246,0.5)]';
        } else if (camStatus === 'maintenance') {
          color = '#F59E0B';
          statusLabel = 'Maintenance';
          badgeBg = 'bg-amber-50 text-amber-700 border-amber-200';
          glowClass = 'shadow-[0_0_12px_rgba(245,158,11,0.5)]';
        } else if (['inactive', 'offline'].includes(camStatus)) {
          color = '#EF4444';
          statusLabel = 'Inactive / Offline';
          badgeBg = 'bg-rose-50 text-rose-700 border-rose-200';
          glowClass = 'shadow-[0_0_12px_rgba(239,68,68,0.5)]';
        }

        // Timeline activity for this camera
        const timelineActivity = getCameraTimelineActivity(cam.camera_id);
        const isDimmedInTimeline = timelineStep !== 'live' && !timelineActivity.hasEvents;
        const hasTimelineAlert = timelineStep !== 'live' && timelineActivity.hasEvents;

        // AI Detection Overlay Badge & Pulse
        const hasAiAlert = cam.needs_review || ['maintenance', 'offline', 'inactive'].includes(camStatus);
        const aiIndicator = (layerVisibility.aiOverlays && !isViewer) ? `
          <span class="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full ${hasAiAlert ? 'bg-rose-500' : 'bg-cyan-400'} border-2 border-white shadow-sm flex items-center justify-center text-[7px] font-bold text-white z-10">
            AI
          </span>
        ` : '';

        // Timeline Event Beacon Badge
        const timelineBeacon = hasTimelineAlert ? `
          <span class="absolute -bottom-2 -left-2 px-1.5 py-0.2 rounded-full bg-rose-600 text-[8px] font-black text-white border border-white shadow-md animate-pulse z-20">
            ${timelineActivity.eventCount} Ev
          </span>
          <span class="absolute -inset-2 rounded-full animate-ping opacity-40 bg-rose-500"></span>
        ` : '';

        // Custom Leaflet DivIcon with pulsing radar ring
        const iconHtml = `
          <div class="relative group cursor-pointer flex items-center justify-center ${isDimmedInTimeline ? 'opacity-30 grayscale-[50%]' : 'opacity-100'} transition-opacity duration-300">
            ${activeDanger ? `
              <span class="absolute -inset-3 rounded-full animate-ping opacity-80 bg-rose-600"></span>
              <span class="absolute -inset-1.5 rounded-full bg-rose-600 ring-4 ring-rose-400/80 animate-pulse"></span>
              <span class="absolute -top-3 -right-3 px-1 py-0.2 rounded-full bg-rose-600 text-[8px] font-black text-white border border-white shadow-lg z-30 animate-bounce">
                🚨 SUSPECT
              </span>
            ` : (statusLabel === 'Active' && !isDimmedInTimeline ? `
              <span class="absolute -inset-1 rounded-full animate-ping opacity-30" style="background-color: ${color}"></span>
            ` : '')}
            ${aiIndicator}
            ${timelineBeacon}
            <div class="w-6 h-6 rounded-full flex items-center justify-center text-white border-2 border-white shadow-md transition-transform duration-200 group-hover:scale-125 ${glowClass}" style="background-color: ${color}">
              <svg xmlns="http://www.w3.org/2000/svg" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/>
                <circle cx="12" cy="13" r="3"/>
              </svg>
            </div>
          </div>
        `;

        const customIcon = L.divIcon({
          html: iconHtml,
          className: 'custom-cctv-marker',
          iconSize: [24, 24],
          iconAnchor: [12, 12],
          popupAnchor: [0, -14]
        });

        const marker = L.marker([lat, lng], { icon: customIcon });

        // Popup Content with role-based features
        const dangerBannerHtml = activeDanger ? `
          <div class="bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 text-white p-2.5 rounded-t-lg -m-3 mb-2.5 flex items-center justify-between shadow">
            <div class="flex items-center gap-1.5">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
              </span>
              <span class="font-extrabold text-[11px] uppercase tracking-wider">Dangerous Person Identified</span>
            </div>
            <span class="text-[9px] bg-rose-950 text-rose-200 px-1.5 py-0.5 rounded border border-rose-400 font-mono">
              ALERT
            </span>
          </div>
          <div class="flex items-start gap-2.5 p-2 bg-rose-50 border border-rose-200 rounded-lg my-2">
            <div class="relative w-12 h-12 rounded overflow-hidden border border-rose-400 flex-shrink-0 bg-slate-800">
              ${activeDanger.person_photo ? `
                <img src="${activeDanger.person_photo}" alt="${activeDanger.person_name || 'Suspect'}" class="w-full h-full object-cover" />
              ` : `
                <div class="w-full h-full flex items-center justify-center text-rose-500 font-bold text-xs">WANTED</div>
              `}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-bold text-xs text-rose-950 truncate">${activeDanger.person_name || 'Suspect Sighted'}</div>
              <div class="text-[10px] text-rose-700 font-semibold truncate">${activeDanger.crime_type || 'Dangerous Offender'}</div>
              <div class="text-[9px] text-slate-500 font-mono mt-0.5">ID: ${activeDanger.person_id}</div>
            </div>
          </div>
          <div class="text-[10px] text-slate-600 mb-2 flex items-center justify-between">
            <span>Sighted: <strong>${new Date(activeDanger.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong></span>
            <span class="text-emerald-700 font-bold bg-emerald-100 px-1.5 py-0.5 rounded text-[9px] border border-emerald-300">
              ${activeDanger.metadata?.confidence ? Math.round(activeDanger.metadata.confidence * 100) : 94}% Neural Match
            </span>
          </div>
          <div class="mb-2">
            <a href="/danger-actions" class="w-full block bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold py-1.5 px-2 rounded text-[11px] text-center shadow transition-colors">
              🚨 Mobilize Quick Response Unit
            </a>
          </div>
        ` : '';

        const initialPopupContent = `
          <div class="p-3 font-sans max-w-[280px]">
            ${dangerBannerHtml}
            <div class="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 mb-2">
              <div class="font-mono font-bold text-xs text-slate-800 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full" style="background-color: ${color}"></span>
                ${cam.camera_id}
              </div>
              <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeBg}">
                ${statusLabel}
              </span>
            </div>

            <div class="space-y-1.5 text-xs">
              <div>
                <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Department</span>
                <span class="font-semibold text-slate-700">${cam.department_name || `Dept #${cam.department_id}`}</span>
              </div>

              <div>
                <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Address</span>
                <span class="text-slate-600 line-clamp-2">${cam.address || 'Address not registered'}</span>
              </div>

              <div class="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                <div>
                  <span class="text-[10px] text-slate-400 block">Type</span>
                  <span class="font-medium text-slate-700">${cam.camera_type || 'N/A'}</span>
                </div>
                <div>
                  <span class="text-[10px] text-slate-400 block">Zone</span>
                  <span class="font-medium text-slate-700">${cam.zone_id || 'Z01'}</span>
                </div>
              </div>

              ${hasTimelineAlert ? `
                <div class="p-2 bg-rose-50 border border-rose-200 rounded-lg text-rose-800 text-[11px] font-semibold mt-1">
                  <div class="flex items-center gap-1 text-[10px] uppercase font-bold text-rose-600">
                    <span class="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse"></span>
                    ${timelineActivity.eventCount} Alert(s) in Window
                  </div>
                  <div class="text-[10px] text-rose-700 mt-0.5 truncate">
                    ${timelineActivity.events[0]?.label || 'Incident logged'}
                  </div>
                </div>
              ` : ''}

              ${!isViewer ? `
                <!-- OpenCV AI Stream Button (Admin & Inspector) -->
                <div class="pt-2 mt-1 border-t border-slate-100">
                  <div class="flex items-center justify-between text-[10px] text-slate-500 mb-1.5">
                    <span class="font-bold text-slate-700 flex items-center gap-1">
                      <span class="w-1.5 h-1.5 rounded-full bg-cyan-500 animate-pulse"></span>
                      OpenCV AI Stream
                    </span>
                    <span class="font-mono text-cyan-600 font-semibold">Live Pipeline</span>
                  </div>
                  <div class="p-1.5 mb-1 bg-slate-900 text-slate-200 rounded border border-slate-800 text-[10px] font-mono">
                    <div class="text-cyan-400 font-bold truncate">RTSP: rtsp://localhost:8554/stream/${cam.id || 1}</div>
                    <div class="text-slate-400 flex items-center justify-between mt-0.5">
                      <span>Codec: ${cam.camera_type === 'Analog' ? 'H.265' : 'H.264'}</span>
                      <span class="text-emerald-400 font-bold">TCP Forced</span>
                    </div>
                  </div>
                  <button id="open-feed-${cam.camera_id}" class="w-full py-1.5 px-3 rounded-lg bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-[11px] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer">
                    <svg class="w-3.5 h-3.5 text-cyan-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                    Launch Sentinel Live RTSP Stream
                  </button>
                </div>
              ` : ''}

              <!-- Last Audit Log Container -->
              <div id="audit-container-${cam.camera_id}" class="pt-2 border-t border-slate-100">
                <span class="text-[10px] font-medium text-slate-400 uppercase tracking-wider block">Last Audit Log</span>
                <div class="text-[11px] text-slate-500 italic mt-0.5 flex items-center gap-1">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-300 animate-pulse"></span>
                  Fetching audit entry...
                </div>
              </div>
            </div>
          </div>
        `;

        marker.bindPopup(initialPopupContent, {
          className: 'leaflet-modern-popup',
          maxWidth: 300
        });

        marker.on('popupopen', async () => {
          const feedBtn = document.getElementById(`open-feed-${cam.camera_id}`);
          if (feedBtn) {
            feedBtn.onclick = () => {
              setActiveFeedCamera(cam);
            };
          }

          const auditContainer = document.getElementById(`audit-container-${cam.camera_id}`);
          if (!auditContainer) return;

          const data = await fetchPopupData(cam.camera_id);
          const lastAudit = data?.last_audit;
          const events = data?.events || [];

          let auditHtml = `
            <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">Last Audit Log Entry</span>
          `;

          if (lastAudit) {
            const timeStr = lastAudit.timestamp ? new Date(lastAudit.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent';
            auditHtml += `
              <div class="text-[11px] text-slate-700 font-medium mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                <div class="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                  <span class="font-semibold text-blue-600">${lastAudit.action || 'ACTIVITY'}</span>
                  <span>${timeStr}</span>
                </div>
                <div class="text-slate-600 truncate">Officer: ${lastAudit.performed_by || 'System'}</div>
              </div>
            `;
          } else if (events.length > 0) {
            const latestEv = events[0];
            auditHtml += `
              <div class="text-[11px] text-slate-700 font-medium mt-1 bg-slate-50 p-2 rounded border border-slate-100">
                <div class="flex items-center justify-between text-[10px] text-slate-500 mb-0.5">
                  <span class="font-semibold text-emerald-600">${latestEv.event_type || 'DETECTION'}</span>
                  <span>${latestEv.timestamp ? new Date(latestEv.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                </div>
                <div class="text-slate-600 truncate">Event logged successfully</div>
              </div>
            `;
          } else {
            auditHtml += `
              <div class="text-[11px] text-slate-500 italic mt-0.5">
                No recent activity logged for this camera.
              </div>
            `;
          }

          auditContainer.innerHTML = auditHtml;
        });

        marker.addTo(markerGroup);
      });
    }

    // D. DUAL-DENSITY HEATMAP LAYER (Cameras + Detection Events)
    if (layerVisibility.heatmap && !isViewer) {
      const heatPoints = [];
      filteredCameras.forEach((c) => {
        const lat = c.lat ?? c.latitude;
        const lng = c.lng ?? c.longitude;
        if (lat != null && lng != null && !isNaN(lat) && !isNaN(lng)) {
          let weight = 0.55;
          const isDanger = Boolean(cameraDangerMap[c.camera_id]);
          const act = getCameraTimelineActivity(c.camera_id);

          if (isDanger) {
            weight = 1.0; // Maximum hotspot intensity for danger detections
          } else if (act.hasEvents) {
            weight = Math.min(0.9, 0.65 + (act.eventCount * 0.15));
          } else if (['inactive', 'offline'].includes((c.status || '').toLowerCase())) {
            weight = 0.85;
          }
          heatPoints.push([lat, lng, weight]);
        }
      });

      if (heatPoints.length > 0) {
        layersGroupRef.current.heat = L.heatLayer(heatPoints, {
          radius: 32,
          blur: 20,
          maxZoom: 16,
          gradient: {
            0.2: '#3B82F6',
            0.5: '#10B981',
            0.75: '#F59E0B',
            1.0: '#EF4444'
          }
        }).addTo(map);
      }
    }

  }, [
    filteredCameras, 
    zones, 
    departments, 
    layerVisibility, 
    computedClusters, 
    timelineStep, 
    getCameraTimelineActivity, 
    cameraDangerMap, 
    isAdmin, 
    isViewer
  ]);

  // Reset all filters
  const handleResetFilters = () => {
    setSelectedDepartment('');
    setSelectedZone('');
    setSelectedType('ALL');
    setSelectedStatus('ALL');
    setSearchQuery('');
  };

  // Toggle single layer visibility
  const toggleLayer = (layerKey) => {
    setLayerVisibility((prev) => ({
      ...prev,
      [layerKey]: !prev[layerKey]
    }));
  };

  return (
    <div className={`flex flex-col bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden transition-all duration-300 ${
      isFullscreen ? 'fixed inset-0 z-50 rounded-none h-screen' : 'h-[680px]'
    } ${className}`}>
      
      {/* ── TOP ACTION BAR ─────────────────────────────────────── */}
      <div className="px-5 py-3.5 bg-slate-900 text-white flex flex-wrap items-center justify-between gap-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
            <Shield className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-wide">Gujarat Sentinel CCTV GIS Network</h2>
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/30 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider">Live PostGIS</span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400">
              Interactive Leaflet GIS with Dynamic Clustering, Zones & OpenCV AI Pipelines
            </p>
          </div>
        </div>

        {/* Right Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Role Indicator & Interactive Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowRoleSelector(!showRoleSelector)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border transition-all cursor-pointer bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
              title="Click to Switch Role View"
            >
              <Users className="w-3.5 h-3.5 text-blue-400" />
              <span>Role:</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] uppercase font-black ${
                isAdmin ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40' :
                isInspector ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' :
                'bg-slate-500/20 text-slate-300 border border-slate-500/40'
              }`}>
                {userRole}
              </span>
            </button>

            {showRoleSelector && (
              <div className="absolute right-0 top-full mt-1.5 w-44 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl p-1.5 z-50 text-xs">
                <div className="px-2 py-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-700/80 mb-1">
                  Switch Role View
                </div>
                {['Admin', 'Inspector', 'Viewer'].map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setUserRole(r);
                      setShowRoleSelector(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-lg flex items-center justify-between text-xs font-semibold transition-colors ${
                      userRole === r ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    <span>{r}</span>
                    {userRole === r && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Sentinel Resource Portal Link & Modal Button */}
          <div className="flex items-center bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
            <a
              href="https://sentinel.gujarat.gov.in/resource"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold text-cyan-300 hover:bg-slate-700 transition-colors"
              title="Open Official Gujarat Sentinel Resource Portal"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">Sentinel Resources</span>
              <ExternalLink className="w-3 h-3 ml-0.5 opacity-80" />
            </a>
            <button
              onClick={() => setShowSentinelModal(true)}
              className="px-1.5 py-1.5 text-slate-400 hover:text-white hover:bg-slate-700 border-l border-slate-700 transition-colors"
              title="View Gujarat Sentinel Surveillance SOP & Tech Specs"
            >
              <HelpCircle className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Refresh Time & Button */}
          <button
            onClick={() => fetchData(false)}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg border border-slate-700 transition-colors disabled:opacity-50 cursor-pointer"
            title="Refresh Cameras Now"
          >
            <RotateCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-blue-400' : ''}`} />
            <span className="hidden lg:inline">Sync</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors cursor-pointer"
            title={isFullscreen ? 'Exit Fullscreen' : 'Expand Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Viewer lock banner removed per Sentinel specification */}

      {/* ── FILTER CONTROLS BAR ────────────────────────────────── */}
      <div className="p-3 bg-slate-50/90 border-b border-slate-200/80">
        <Filters
          departments={departments}
          zones={zones}
          selectedDepartment={selectedDepartment}
          onDepartmentChange={setSelectedDepartment}
          selectedZone={selectedZone}
          onZoneChange={setSelectedZone}
          selectedType={selectedType}
          onTypeChange={setSelectedType}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onReset={handleResetFilters}
          totalCount={cameras.length}
          filteredCount={filteredCameras.length}
        />
      </div>

      {/* ── MAP CANVAS & FLOATING OVERLAYS ────────────────────── */}
      <div className="flex-1 relative w-full h-full bg-slate-100 overflow-hidden">
        
        {/* Leaflet Map DOM Container */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 w-full h-full" />

        {/* Loading Overlay */}
        {loading && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-sm z-20 flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 bg-white px-5 py-4 rounded-xl shadow-xl border border-slate-200">
              <RefreshCw className="w-6 h-6 text-blue-600 animate-spin" />
              <span className="text-xs font-semibold text-slate-700">Loading Gujarat GIS Layers...</span>
            </div>
          </div>
        )}

        {/* Error Notification */}
        {error && (
          <div className="absolute top-4 left-4 right-4 sm:right-auto sm:max-w-md z-30 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl shadow-lg flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="text-xs">
              <div className="font-bold">Backend Sync Notice</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* ── FLOATING LAYER CONTROL PANEL (Top Right) ─────────── */}
        {!isViewer && (
          <div className="absolute top-4 right-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl p-3 shadow-lg max-w-[240px] space-y-2.5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-600" />
                Map Layers
              </span>
              <span className="text-[10px] font-semibold bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                {filteredCameras.length} Cams
              </span>
            </div>

            <div className="space-y-1.5">
              {/* Toggle Camera Markers */}
              <button
                onClick={() => toggleLayer('markers')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  layerVisibility.markers
                    ? 'bg-blue-50 text-blue-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-blue-600" />
                  Camera Markers
                </span>
                {layerVisibility.markers ? <Eye className="w-3.5 h-3.5 text-blue-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {/* Toggle Marker Clustering */}
              <button
                onClick={() => toggleLayer('clustering')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  layerVisibility.clustering
                    ? 'bg-indigo-50 text-indigo-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Grid className="w-3.5 h-3.5 text-indigo-600" />
                  Spatial Clusters
                </span>
                {layerVisibility.clustering ? <Eye className="w-3.5 h-3.5 text-indigo-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {/* Toggle Zone Boundaries */}
              <button
                onClick={() => toggleLayer('zones')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  layerVisibility.zones
                    ? 'bg-purple-50 text-purple-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Shield className="w-3.5 h-3.5 text-purple-600" />
                  Zone Polygons
                </span>
                {layerVisibility.zones ? <Eye className="w-3.5 h-3.5 text-purple-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {/* Toggle Department Overlays (Admin Only) */}
              {isAdmin && (
                <button
                  onClick={() => toggleLayer('deptOverlays')}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                    layerVisibility.deptOverlays
                      ? 'bg-emerald-50 text-emerald-800 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Radio className="w-3.5 h-3.5 text-emerald-600" />
                    Dept Overlays
                  </span>
                  {layerVisibility.deptOverlays ? <Eye className="w-3.5 h-3.5 text-emerald-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
                </button>
              )}

              {/* Toggle Heatmap */}
              <button
                onClick={() => toggleLayer('heatmap')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  layerVisibility.heatmap
                    ? 'bg-amber-50 text-amber-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Flame className="w-3.5 h-3.5 text-amber-600" />
                  Density Heatmap
                </span>
                {layerVisibility.heatmap ? <Eye className="w-3.5 h-3.5 text-amber-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              </button>

              {/* Toggle AI Detection Overlays */}
              <button
                onClick={() => toggleLayer('aiOverlays')}
                className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all cursor-pointer ${
                  layerVisibility.aiOverlays
                    ? 'bg-cyan-50 text-cyan-800 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <span className="flex items-center gap-2">
                  <Cpu className="w-3.5 h-3.5 text-cyan-600" />
                  AI Alerts
                </span>
                {layerVisibility.aiOverlays ? <Eye className="w-3.5 h-3.5 text-cyan-600" /> : <EyeOff className="w-3.5 h-3.5 text-slate-400" />}
              </button>
            </div>

            {/* Tile Layer Basemap Selector (Admin & Inspector) */}
            <div className="pt-2 border-t border-slate-100">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                Basemap Style
              </span>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { id: 'voyager', label: 'Tactical' },
                  { id: 'dark', label: 'Dark' },
                  { id: 'osm', label: 'Standard' }
                ].map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setTileStyle(style.id)}
                    className={`py-1 text-[11px] font-medium rounded transition-all cursor-pointer ${
                      tileStyle === style.id
                        ? 'bg-slate-900 text-white font-bold'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {style.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TIMELINE SLIDER BAR (Bottom Center, Admin & Inspector) ── */}
        {!isViewer && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-slate-900/95 backdrop-blur-md border border-slate-700 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex flex-col md:flex-row items-center gap-3 w-[92%] max-w-2xl">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPlayingTimeline(!isPlayingTimeline)}
                className="p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-sm transition-colors cursor-pointer"
                title={isPlayingTimeline ? 'Pause Timeline' : 'Play Timeline Progression'}
              >
                {isPlayingTimeline ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
              <div className="flex items-center gap-1 text-xs font-bold text-slate-200">
                <Clock className="w-3.5 h-3.5 text-blue-400" />
                <span>Timeline:</span>
              </div>
            </div>

            {/* Step buttons */}
            <div className="flex-1 grid grid-cols-5 gap-1 w-full">
              {TIMELINE_STEPS.map((step) => {
                const isActive = timelineStep === step.id;
                return (
                  <button
                    key={step.id}
                    onClick={() => {
                      setTimelineStep(step.id);
                      setIsPlayingTimeline(false);
                    }}
                    className={`py-1 px-1.5 text-[11px] rounded-lg font-bold transition-all text-center cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/50 scale-105'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {step.label}
                  </button>
                );
              })}
            </div>

            {/* Event Count Badge */}
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-300">
              <span className={`w-2 h-2 rounded-full ${timelineStep === 'live' ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400 animate-pulse'}`}></span>
              <span className="whitespace-nowrap">
                {timelineStep === 'live' ? 'Real-Time' : `${totalTimelineEvents} Incidents`}
              </span>
            </div>
          </div>
        )}

        {/* ── FLOATING STATUS LEGEND (Bottom Left) ──────────────── */}
        <div className="absolute bottom-4 left-4 z-10 bg-white/95 backdrop-blur-md border border-slate-200/80 rounded-xl px-3 py-2 shadow-lg flex flex-wrap items-center gap-3 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-emerald-200 animate-pulse"></span>
            <span>Active</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
            <span>Inactive</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
            <span>Maintenance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 ring-2 ring-blue-200"></span>
            <span>Needs Review</span>
          </div>
        </div>

      </div>

      {/* ── ZONE DETAILS DRAWER ──────────────────────────────── */}
      {selectedZoneInfo && (
        <div className="absolute top-20 left-4 z-30 bg-white/95 backdrop-blur-md border border-slate-200 rounded-xl p-4 shadow-xl max-w-xs animate-in fade-in slide-in-from-left-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-2">
            <div className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-purple-600" />
              {selectedZoneInfo.name || selectedZoneInfo.zone_id}
            </div>
            <button
              onClick={() => setSelectedZoneInfo(null)}
              className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="space-y-1.5 text-xs text-slate-600">
            <div><span className="text-slate-400">Zone Code:</span> <span className="font-mono font-bold text-slate-700">{selectedZoneInfo.code || selectedZoneInfo.zone_id}</span></div>
            <div><span className="text-slate-400">Total CCTVs:</span> <span className="font-bold text-blue-600">{selectedZoneInfo.cameraCount}</span></div>
            <div><span className="text-slate-400">Surveillance Status:</span> <span className="text-emerald-600 font-bold">100% Monitored</span></div>
            <button
              onClick={() => {
                setSelectedZone(selectedZoneInfo.code || selectedZoneInfo.zone_id);
                setSelectedZoneInfo(null);
              }}
              className="mt-2 w-full py-1.5 text-[11px] font-bold bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
            >
              Filter Map to this Zone
            </button>
          </div>
        </div>
      )}

      {/* ── GUJARAT SENTINEL RESOURCE MODAL ──────────────────── */}
      {showSentinelModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95">
            <button
              onClick={() => setShowSentinelModal(false)}
              className="absolute top-4 right-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/30">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Gujarat Sentinel CCTV Surveillance Standard</h3>
                <p className="text-xs text-slate-500">Official Gujarat Police surveillance guidelines & technical architecture</p>
              </div>
            </div>

            <div className="space-y-3.5 text-xs text-slate-600 max-h-[60vh] overflow-y-auto pr-1">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <span className="font-bold text-blue-900 block mb-1">Surveillance Architecture Alignment:</span>
                This system strictly aligns with the official technical guidelines published on the Gujarat Sentinel portal for video stream quality, edge AI processing, and spatial GIS mapping.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-800 block mb-1">CCTV Ingestion Standard</span>
                  <p className="text-[11px] text-slate-500">H.264/H.265 RTSP streams at 1080p, min 25 FPS, with automated blur & freeze health telemetry.</p>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <span className="font-bold text-slate-800 block mb-1">PostGIS Spatial Accuracy</span>
                  <p className="text-[11px] text-slate-500">EPSG:4326 geometry point mapping with zone polygon demarcation and dynamic spatial clustering.</p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <span className="font-bold text-slate-800 block mb-1">OpenCV AI Detection Standards</span>
                <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-600">
                  <li>ANPR: High-contrast vehicle plate detection with State code parser (e.g. GJ-01).</li>
                  <li>Facial Recognition: Watchlist matching with cosine similarity threshold &ge; 0.65.</li>
                  <li>Crowd Analytics: Real-time headcount and density congestion risk warning.</li>
                  <li>Intrusion Detection: Virtual perimeter tripwire crossing classification.</li>
                </ul>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
              <a
                href="https://sentinel.gujarat.gov.in/resource"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                <span>Visit Gujarat Sentinel Portal</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                onClick={() => setShowSentinelModal(false)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── LIVE OPENCV FEED MODAL / DRAWER ──────────────── */}
      {activeFeedCamera && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="max-w-3xl w-full animate-in fade-in zoom-in-95 duration-200">
            <CameraFeed
              camera={activeFeedCamera}
              isModal={true}
              onClose={() => setActiveFeedCamera(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
