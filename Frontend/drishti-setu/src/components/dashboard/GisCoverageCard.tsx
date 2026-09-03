"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { ChevronDown, Filter, Plus, Minus, Layers, Maximize, MapPin, Grid, Network, Building, Users, Server, RotateCw, CheckCircle2, CheckSquare, ChevronRight, ArrowLeft } from "lucide-react";
import Map, { NavigationControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';

// Simulated open source location data hierarchy for Gujarat (All 33 Districts)
const GUJARAT_LOCATIONS: Record<string, Record<string, string[]>> = {
  "Ahmedabad": { "City": ["Navrangpura", "Satellite", "Bopal"], "Daskroi": ["Vatva", "Aslali"], "Sanand": ["Sanand City", "Chekhla"] },
  "Amreli": { "Amreli": ["Amreli City", "Lilia"], "Dhari": ["Dhari City", "Chalala"], "Rajula": ["Rajula City", "Jafrabad"] },
  "Anand": { "Anand": ["Anand City", "Karamsad"], "Borsad": ["Borsad City", "Bhadran"], "Petlad": ["Petlad City", "Dharmaj"] },
  "Aravalli": { "Modasa": ["Modasa City", "Dhansura"], "Bhiloda": ["Bhiloda City", "Shamlaji"], "Bayad": ["Bayad City"] },
  "Banaskantha": { "Palanpur": ["Palanpur City", "Deesa"], "Dantiwada": ["Dantiwada City", "Panthawada"], "Tharad": ["Tharad City"] },
  "Bharuch": { "Bharuch": ["Bharuch City", "Ankleshwar"], "Jambusar": ["Jambusar City", "Amod"], "Vagra": ["Vagra City", "Dahej"] },
  "Bhavnagar": { "Bhavnagar": ["Bhavnagar City", "Ghogha"], "Palitana": ["Palitana City", "Gariadhar"], "Talaja": ["Talaja City"] },
  "Botad": { "Botad": ["Botad City", "Gadhada"], "Barwala": ["Barwala City", "Ranpur"] },
  "Chhota Udaipur": { "Chhota Udaipur": ["City Area", "Pavi Jetpur"], "Bodeli": ["Bodeli City", "Sankheda"] },
  "Dahod": { "Dahod": ["Dahod City", "Garbada"], "Zalod": ["Zalod City", "Fatepura"], "Limkheda": ["Limkheda City"] },
  "Dang": { "Ahwa": ["Ahwa City", "Waghai"], "Subir": ["Subir City"] },
  "Devbhoomi Dwarka": { "Khambhaliya": ["Khambhaliya City", "Bhanvad"], "Dwarka": ["Dwarka City", "Okha", "Kalyanpur"] },
  "Gandhinagar": { "Gandhinagar": ["Sector 11", "Infocity", "Sector 21"], "Kalol": ["Kalol City", "Santej"], "Dehgam": ["Dehgam City"] },
  "Gir Somnath": { "Veraval": ["Veraval City", "Prabhas Patan"], "Una": ["Una City", "Gir Gadhada"], "Talala": ["Talala City"] },
  "Jamnagar": { "Jamnagar": ["Jamnagar City", "Dhrol"], "Kalavad": ["Kalavad City", "Jodiya"], "Jamjodhpur": ["Jamjodhpur City"] },
  "Junagadh": { "Junagadh": ["Junagadh City", "Bhesan"], "Keshod": ["Keshod City", "Mangrol"], "Mendarda": ["Mendarda City"] },
  "Kheda": { "Nadiad": ["Nadiad City", "Kapadvanj"], "Dakor": ["Dakor City", "Thasra"], "Matar": ["Matar City", "Kheda City"] },
  "Kutch": { "Bhuj": ["Bhuj City", "Madhapar"], "Gandhidham": ["Gandhidham City", "Adipur"], "Mandvi": ["Mandvi City", "Mundra"] },
  "Mahisagar": { "Lunawada": ["Lunawada City", "Santrampur"], "Balasinor": ["Balasinor City", "Kadana"] },
  "Mehsana": { "Mehsana": ["Mehsana City", "Visnagar"], "Kadi": ["Kadi City", "Becharaji"], "Unjha": ["Unjha City", "Vadnagar"] },
  "Morbi": { "Morbi": ["Morbi City", "Wankaner"], "Halvad": ["Halvad City", "Maliya"], "Tankara": ["Tankara City"] },
  "Narmada": { "Rajpipla": ["Rajpipla City", "Nandod"], "Kevadia": ["Statue of Unity", "Garudeshwar"], "Tilakwada": ["Tilakwada City"] },
  "Navsari": { "Navsari": ["Navsari City", "Jalalpore"], "Vansda": ["Vansda City", "Chikhli"], "Gandevi": ["Gandevi City", "Bilimora"] },
  "Panchmahal": { "Godhra": ["Godhra City", "Shehera"], "Halol": ["Halol City", "Kalol"], "Ghoghamba": ["Ghoghamba City"] },
  "Patan": { "Patan": ["Patan City", "Siddhpur"], "Radhanpur": ["Radhanpur City", "Santalpur"], "Chanasma": ["Chanasma City", "Harij"] },
  "Porbandar": { "Porbandar": ["Porbandar City", "Chhaya"], "Kutiyana": ["Kutiyana City", "Ranavav"] },
  "Rajkot": { "Rajkot": ["Kalawad Road", "Mavdi"], "Gondal": ["Gondal City", "Ribda"], "Jetpur": ["Jetpur City", "Dhoraji"] },
  "Sabarkantha": { "Himmatnagar": ["Himmatnagar City", "Idar"], "Prantij": ["Prantij City", "Talod"], "Khedbrahma": ["Khedbrahma City"] },
  "Surat": { "Surat City": ["Adajan", "Vesu", "Varachha"], "Bardoli": ["Bardoli City", "Mahuva"], "Mandvi": ["Mandvi City", "Mangrol"] },
  "Surendranagar": { "Wadhwan": ["Wadhwan City", "Surendranagar City"], "Limbdi": ["Limbdi City", "Chuda"], "Halvad": ["Halvad City", "Dhrangadhra"] },
  "Tapi": { "Vyara": ["Vyara City", "Songadh"], "Valod": ["Valod City", "Nizar"] },
  "Vadodara": { "Vadodara City": ["Alkapuri", "Sayajigunj"], "Padra": ["Padra City", "Karjan"], "Savli": ["Savli City", "Desar"] },
  "Valsad": { "Valsad": ["Valsad City", "Pardi"], "Vapi": ["Vapi City", "Umbergaon"], "Dharampur": ["Dharampur City", "Kaprada"] }
};

const FILTER_CATEGORIES: Record<string, string[]> = {
  "Department": ["Police", "Traffic", "Municipal", "Transport", "Forest"],
  "Camera Type": ["Analog", "IP Based Camera", "PTZ", "ANPR", "Thermal"],
  "Status": ["Online", "Offline", "Degraded", "Maintenance"],
  "Coverage": ["High Density", "Medium Density", "Low Density", "Coverage Gap"]
};

export function GisCoverageCard() {
  const mapRef = useRef<any>(null);
  const [showLayers, setShowLayers] = useState(false);
  
  // Active states for filters
  const [activeCategories, setActiveCategories] = useState<string[]>(['Department', 'Status']);
  const [expandedCategory, setExpandedCategory] = useState<string | null>('Department');
  const [activeOptions, setActiveOptions] = useState<string[]>(['Police', 'Online', 'IP Based Camera']);
  
  // Cascading Location States
  const [showLocDropdown, setShowLocDropdown] = useState(false);
  const [selDistrict, setSelDistrict] = useState<string | null>(null);
  const [selBlock, setSelBlock] = useState<string | null>(null);
  const [selArea, setSelArea] = useState<string | null>(null);

  const zoomIn = () => mapRef.current?.zoomIn({ duration: 300 });
  const zoomOut = () => mapRef.current?.zoomOut({ duration: 300 });
  const resetZoom = () => mapRef.current?.flyTo({ center: [71.1924, 22.2587], zoom: 6, duration: 800 });

  const toggleCategory = (category: string) => {
    if (expandedCategory === category) {
      setExpandedCategory(null);
    } else {
      setExpandedCategory(category);
    }
  };

  const toggleCategoryActive = (category: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveCategories(prev => prev.includes(category) ? prev.filter(c => c !== category) : [...prev, category]);
  };

  const toggleOption = (option: string) => {
    setActiveOptions(prev => prev.includes(option) ? prev.filter(o => o !== option) : [...prev, option]);
  };

  const getButtonText = () => {
    if (selArea) return selArea;
    if (selBlock) return selBlock;
    if (selDistrict) return selDistrict;
    return "All Locations";
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[520px] overflow-hidden col-span-1 lg:col-span-3">
      
      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between relative">
        <div className="flex items-center gap-3">
          <h2 className="text-[17px] font-bold text-slate-800">CCTV GIS Coverage Overview</h2>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-50 rounded-full border border-green-100">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-[10px] font-bold text-green-700">Live</span>
          </div>
        </div>
        <div className="flex items-center gap-3 relative">
          
          {/* Cascading Location Dropdown Button */}
          <div className="relative">
            <button 
              onClick={() => setShowLocDropdown(!showLocDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors max-w-[160px] truncate"
            >
              <span className="truncate">{getButtonText()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            </button>

            {/* Dropdown Menu */}
            {showLocDropdown && (
              <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 flex flex-col">
                
                {/* Header/Back Button */}
                {(selDistrict || selBlock) && (
                  <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
                    <button 
                      onClick={() => {
                        if (selBlock) setSelBlock(null);
                        else setSelDistrict(null);
                      }}
                      className="p-1 hover:bg-slate-200 rounded-md transition-colors"
                    >
                      <ArrowLeft className="w-3 h-3 text-slate-600" />
                    </button>
                    <span className="text-[11px] font-bold text-slate-700">
                      {selBlock ? selDistrict : "All Districts"}
                    </span>
                  </div>
                )}

                {/* List Items */}
                <div className="max-h-60 overflow-y-auto py-1">
                  
                  {/* Show Areas if Block selected */}
                  {selBlock && selDistrict && GUJARAT_LOCATIONS[selDistrict][selBlock].map(area => (
                    <button
                      key={area}
                      onClick={() => { setSelArea(area); setShowLocDropdown(false); }}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-blue-50 hover:text-blue-700 flex items-center justify-between group"
                    >
                      {area}
                      {selArea === area && <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />}
                    </button>
                  ))}

                  {/* Show Blocks if District selected */}
                  {!selBlock && selDistrict && Object.keys(GUJARAT_LOCATIONS[selDistrict]).map(block => (
                    <button
                      key={block}
                      onClick={() => setSelBlock(block)}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between group"
                    >
                      {block}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                    </button>
                  ))}

                  {/* Show Districts if nothing selected */}
                  {!selDistrict && Object.keys(GUJARAT_LOCATIONS).map(district => (
                    <button
                      key={district}
                      onClick={() => setSelDistrict(district)}
                      className="w-full text-left px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 flex items-center justify-between group"
                    >
                      {district}
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600" />
                    </button>
                  ))}
                  
                  {/* Reset Button */}
                  {selDistrict && (
                    <div className="px-3 py-2 border-t border-slate-100 mt-1">
                      <button 
                        onClick={() => { setSelDistrict(null); setSelBlock(null); setSelArea(null); setShowLocDropdown(false); }}
                        className="text-[11px] font-bold text-red-600 hover:text-red-700 w-full text-left px-1"
                      >
                        Clear Selection
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowLayers(!showLayers)}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
          >
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            Filters
          </button>
        </div>
      </div>

      <div className="flex-1 relative bg-slate-50 w-full overflow-hidden">
        {/* Real Interactive Map via maplibre-gl */}
        <div className="absolute inset-0 z-0 bg-slate-100">
          <Map
            ref={mapRef}
            initialViewState={{
              longitude: 71.1924,
              latitude: 22.2587,
              zoom: 6
            }}
            mapStyle={{
              version: 8,
              sources: {
                osm: {
                  type: 'raster',
                  tiles: ['https://a.tile.openstreetmap.org/{z}/{x}/{y}.png'],
                  tileSize: 256,
                  attribution: '&copy; OpenStreetMap Contributors'
                }
              },
              layers: [{ id: 'osm', type: 'raster', source: 'osm', minzoom: 0, maxzoom: 19 }]
            }}
            style={{ width: '100%', height: '100%' }}
          />
        </div>

        {/* Grid pattern overlay (optional styling) */}
        <div className="absolute inset-0 opacity-10 pointer-events-none z-10" style={{
            backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 0, 0, 0.1) 1px, transparent 1px)",
            backgroundSize: "40px 40px"
        }}></div>

        {/* No mock clusters per user request */}

        {/* Map Controls */}
        <div className="absolute top-4 right-4 flex flex-col gap-2 z-10">
           <button onClick={zoomIn} className="w-8 h-8 bg-white text-slate-700 rounded shadow flex items-center justify-center hover:bg-slate-50 transition-colors">
             <Plus className="w-4 h-4" />
           </button>
           <button onClick={zoomOut} className="w-8 h-8 bg-white text-slate-700 rounded shadow flex items-center justify-center hover:bg-slate-50 transition-colors">
             <Minus className="w-4 h-4" />
           </button>
           <button onClick={resetZoom} className="w-8 h-8 bg-white text-slate-700 rounded shadow flex items-center justify-center hover:bg-slate-50 transition-colors mt-2">
             <Maximize className="w-4 h-4" />
           </button>
           <button onClick={() => setShowLayers(!showLayers)} className={`w-8 h-8 ${showLayers ? 'bg-blue-50 text-blue-600 border border-blue-200' : 'bg-white text-slate-700 border border-transparent'} rounded shadow flex items-center justify-center hover:bg-slate-50 transition-colors`}>
             <Layers className="w-4 h-4" />
           </button>
        </div>

        {/* Layers Panel */}
        {showLayers && (
          <div className="absolute top-4 left-4 bg-white rounded-lg shadow-lg w-56 border border-slate-200 overflow-hidden z-20">
             <div className="px-4 py-3 border-b border-slate-100 flex justify-between items-center bg-slate-50">
               <span className="text-[13px] font-bold text-slate-800">Filter Layers</span>
               <span 
                 className="text-lg leading-none text-slate-400 cursor-pointer hover:text-slate-700" 
                 onClick={() => setShowLayers(false)}
               >×</span>
             </div>
             <div className="p-4 space-y-4 max-h-[300px] overflow-y-auto">
               {Object.keys(FILTER_CATEGORIES).map((category, idx) => (
                  <div key={idx} className="flex flex-col">
                    <div className="flex items-center justify-between cursor-pointer group" onClick={() => toggleCategory(category)}>
                      <label className="flex items-center gap-3 cursor-pointer" onClick={(e) => toggleCategoryActive(category, e)}>
                        <div className={`w-4 h-4 rounded ${activeCategories.includes(category) ? 'bg-blue-600' : 'border border-slate-300'} flex items-center justify-center text-white flex-shrink-0 shadow-sm transition-colors`}>
                          {activeCategories.includes(category) && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-3 h-3"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                        </div>
                        <span className="text-[13px] font-bold text-slate-700 group-hover:text-blue-700 transition-colors">{category}</span>
                      </label>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedCategory === category ? 'rotate-180' : ''}`} />
                    </div>
                    
                    {/* Expandable options */}
                    {expandedCategory === category && (
                      <div className="ml-7 mt-3 space-y-2.5">
                         {FILTER_CATEGORIES[category].map(option => (
                           <label key={option} className="flex items-center gap-2.5 cursor-pointer group" onClick={(e) => e.stopPropagation()}>
                             <input 
                               type="checkbox" 
                               className="hidden" 
                               checked={activeOptions.includes(option)}
                               onChange={() => toggleOption(option)} 
                             />
                             <div className={`w-3.5 h-3.5 rounded-sm ${activeOptions.includes(option) ? 'bg-blue-500' : 'border border-slate-300'} flex items-center justify-center text-white transition-colors`}>
                               {activeOptions.includes(option) && <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="w-2.5 h-2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>}
                             </div>
                             <span className="text-[12px] font-medium text-slate-600 group-hover:text-slate-800 transition-colors">{option}</span>
                           </label>
                         ))}
                      </div>
                    )}
                  </div>
               ))}
             </div>
             <div className="px-4 py-3 border-t border-slate-100 flex justify-between items-center bg-slate-50">
               <button 
                 className="text-[12px] font-bold text-red-600 hover:text-red-800 transition-colors"
                 onClick={() => { setActiveCategories([]); setActiveOptions([]); }}
               >
                 Clear All
               </button>
               <button 
                 className="text-[12px] font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1 rounded"
                 onClick={() => setShowLayers(false)}
               >
                 Apply Filters
               </button>
             </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg p-2.5 flex items-center gap-4 shadow-sm">
           <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div>
             <span className="text-[9px] text-slate-700 font-bold">High Density</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-orange-500"></div>
             <span className="text-[9px] text-slate-700 font-bold">Medium Density</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
             <span className="text-[9px] text-slate-700 font-bold">Low Density</span>
           </div>
           <div className="flex items-center gap-1.5">
             <div className="w-2.5 h-2.5 rounded-full bg-purple-500"></div>
             <span className="text-[9px] text-slate-700 font-bold">Coverage Gap</span>
           </div>
        </div>

        {/* Open Full GIS Map Button */}
        <div className="absolute bottom-4 right-4">
          <button className="bg-white text-blue-700 font-bold text-xs px-4 py-2 rounded-lg shadow-lg border border-blue-100 flex items-center gap-2 hover:bg-blue-50 transition-colors">
            Open Full GIS Map <span className="text-lg leading-none">→</span>
          </button>
        </div>

      </div>

      {/* Footer Stats */}
      <div className="bg-white border-t border-slate-100 p-3 md:p-4 flex flex-wrap items-center justify-between gap-4">
         
         <div className="flex flex-wrap items-center gap-4 lg:gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <MapPin className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 leading-none">156</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Locations</div>
              </div>
            </div>
            
            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Grid className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 leading-none">7</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Zones</div>
              </div>
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Network className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 leading-none">5,421</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Clusters</div>
              </div>
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Building className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 leading-none">26</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Departments</div>
              </div>
            </div>

            <div className="hidden sm:block w-px h-6 bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
                <Server className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-800 leading-none">12</div>
                <div className="text-[10px] text-slate-500 mt-0.5">Vendors</div>
              </div>
            </div>
         </div>

         <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-green-50 px-2 py-1 rounded-md border border-green-100">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              <div className="flex items-center gap-1">
                <span className="text-[10px] font-bold text-slate-700">System:</span>
                <span className="text-[10px] text-green-600 font-bold">Healthy</span>
              </div>
            </div>
         </div>
      </div>

    </div>
  );
}
