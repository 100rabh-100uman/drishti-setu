"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
 Users, 
 Search, 
 Plus, 
 Trash2, 
 Edit, 
 ShieldAlert, 
 ChevronRight, 
 RefreshCw, 
 AlertTriangle, 
 CheckCircle2, 
 Radio, 
 Zap, 
 Camera, 
 Shield 
} from 'lucide-react';
import { dangerActionService } from '@/services/danger-action.service';
import { authService } from '@/services/auth.service';

const SAMPLE_PHOTO_PRESETS = [
 { label: 'Suspect 1 (Male 30s)', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=300&fit=crop&crop=face' },
 { label: 'Suspect 2 (Male 40s)', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&h=300&fit=crop&crop=face' },
 { label: 'Suspect 3 (Male 20s)', url: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=300&h=300&fit=crop&crop=face' },
 { label: 'Suspect 4 (Male 50s)', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=300&h=300&fit=crop&crop=face' },
 { label: 'Suspect 5 (Female 30s)', url: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop&crop=face' },
];

const DEPARTMENTS = [
 { id: 1, name: 'Gujarat Police Department' },
 { id: 2, name: 'Gujarat Traffic Branch' },
 { id: 3, name: 'Disaster Management Authority (GSDMA)' },
 { id: 4, name: 'Ahmedabad Municipal Corporation (AMC)' },
 { id: 5, name: 'Gandhinagar Municipal Corporation (GMC)' },
];

/**
 * DRISHTI SETU — Crime People Bureau Component
 * Bureau database management for crime-listed individuals.
 * Admin capabilities: Add, Update, Delete criminal records & simulate face matches.
 */
export default function CrimePeople() {
 const [people, setPeople] = useState([]);
 const [loading, setLoading] = useState(true);
 const [refreshing, setRefreshing] = useState(false);
 const [searchQuery, setSearchQuery] = useState('');
 const [statusFilter, setStatusFilter] = useState('ALL');
 const [deptFilter, setDeptFilter] = useState('ALL');
 const [currentUser, setCurrentUser] = useState(null);

 // Modals
 const [isAddModalOpen, setIsAddModalOpen] = useState(false);
 const [editingPerson, setEditingPerson] = useState(null);
 const [actionSuccess, setActionSuccess] = useState(null);

 // Form State
 const [formData, setFormData] = useState({
 name: '',
 crime_type: '',
 department_id: 1,
 status: 'WANTED',
 photo: SAMPLE_PHOTO_PRESETS[0].url,
 });

 // Fetch current officer profile
 useEffect(() => {
 const session = authService.getCurrentSession();
 if (session && session.user) {
 setCurrentUser(session.user);
 }
 }, []);

 const isAdmin = currentUser?.role === 'Admin';

 // Load criminals
 const fetchPeople = useCallback(async () => {
 try {
 setRefreshing(true);
 const data = await dangerActionService.getCrimePeople();
 setPeople(data);
 } catch (err) {
 console.error('Failed to load bureau records:', err);
 } finally {
 setLoading(false);
 setRefreshing(false);
 }
 }, []);

 useEffect(() => {
 fetchPeople();
 }, [fetchPeople]);

 // Handle Add Suspect
 const handleAddSubmit = async (e) => {
 e.preventDefault();
 try {
 const res = await dangerActionService.addCrimePerson(formData);
 setIsAddModalOpen(false);
 setFormData({
 name: '',
 crime_type: '',
 department_id: 1,
 status: 'WANTED',
 photo: SAMPLE_PHOTO_PRESETS[0].url,
 });
 fetchPeople();
 setActionSuccess(Suspect added to bureau registry.);
 setTimeout(() => setActionSuccess(null), 5000);
 } catch (err) {
 alert(err.message || 'Failed to add suspect');
 }
 };

 // Handle Delete Suspect
 const handleDelete = async (personId, name) => {
 if (!confirm(Are you sure you want to remove () from the Bureau Watchlist?)) {
 return;
 }
 try {
 await dangerActionService.deleteCrimePerson(personId);
 setPeople((prev) => prev.filter((p) => p.person_id !== personId));
 setActionSuccess(Suspect removed from watchlist.);
 setTimeout(() => setActionSuccess(null), 5000);
 } catch (err) {
 alert(err.message || 'Failed to delete record');
 }
 };

 // Trigger test face recognition match against live cameras
 const handleTestMatch = async (personId, name) => {
 try {
 setActionSuccess(Simulating face detection match for ...);
 await dangerActionService.simulateDetection('CAM001');
 setTimeout(() => {
 setActionSuccess(Match detected on CAM001! Check Danger Actions tab.);
 }, 800);
 setTimeout(() => setActionSuccess(null), 6000);
 } catch (err) {
 console.error('Test match simulation failed:', err);
 }
 };

 // Filtered suspects
 const filteredPeople = useMemo(() => {
 return people.filter((person) => {
 if (statusFilter !== 'ALL' && person.status !== statusFilter) {
 return false;
 }
 if (deptFilter !== 'ALL' && String(person.department_id) !== deptFilter) {
 return false;
 }
 if (searchQuery.trim()) {
 const q = searchQuery.toLowerCase();
 const matchName = person.name?.toLowerCase().includes(q);
 const matchId = person.person_id?.toLowerCase().includes(q);
 const matchCrime = person.crime_type?.toLowerCase().includes(q);
 if (!matchName && !matchId && !matchCrime) return false;
 }
 return true;
 });
 }, [people, statusFilter, deptFilter, searchQuery]);

 return (
 <div className=\space-y-5\>
 {/* Action Notification Banner */}
 {actionSuccess && (
 <div className=\p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-semibold flex items-center justify-between shadow-lg animate-in fade-in\>
 <div className=\flex items-center gap-2\>
 <CheckCircle2 className=\w-4 h-4 text-emerald-400\ />
 <span>{actionSuccess}</span>
 </div>
 <button onClick={() => setActionSuccess(null)} className=\text-emerald-400 hover:text-white\>✕</button>
 </div>
 )}

 {/* Header and Controls */}
 <div className=\bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm\>
 <div className=\flex flex-col md:flex-row md:items-center justify-between gap-3\>
 {/* Search box */}
 <div className=\relative flex-1\>
 <Search className=\absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400\ />
 <input
 type=\text\
 placeholder=\Search suspect name person ID or crime category...\
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 className=\w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-blue-500 transition-colors\
 />
 </div>

 {/* Filters & Actions */}
 <div className=\flex flex-wrap items-center gap-2\>
 <select
 value={statusFilter}
 onChange={(e) => setStatusFilter(e.target.value)}
 className=\bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500\
 >
 <option value=\ALL\>All Statuses</option>
 <option value=\WANTED\>Wanted</option>
 <option value=\HIGH_ALERT\>High Alert</option>
 <option value=\UNDER_SURVEILLANCE\>Under Surveillance</option>
 <option value=\APPREHENDED\>Apprehended</option>
 </select>

 <select
 value={deptFilter}
 onChange={(e) => setDeptFilter(e.target.value)}
 className=\bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-2 text-xs text-slate-300 focus:outline-none focus:border-blue-500\
 >
 <option value=\ALL\>All Departments</option>
 {DEPARTMENTS.map((d) => (
 <option key={d.id} value={String(d.id)}>{d.name}</option>
 ))}
 </select>

 {/* Add Record Button (Admin Only or Demo Mode) */}
 <button
 onClick={() => setIsAddModalOpen(true)}
 className=\bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold py-2 px-3 rounded-lg flex items-center gap-1.5 shadow-md shadow-blue-900/30 transition-all\
 >
 <Plus className=\w-3.5 h-3.5\ />
 <span>Add Suspect</span>
 </button>

 {/* Refresh Button */}
 <button
 onClick={fetchPeople}
 disabled={refreshing}
 className=\p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors disabled:opacity-50\
 title=\Refresh Bureau Database\
 >
 <RefreshCw className={w-3.5 h-3.5 } />
 </button>
 </div>
 </div>
 </div>

 {/* Suspects Cards Grid */}
 {loading ? (
 <div className=\py-16 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800\>
 <RefreshCw className=\w-8 h-8 animate-spin text-blue-500 mx-auto mb-2\ />
 <span>Loading Crime Bureau Watchlist...</span>
 </div>
 ) : filteredPeople.length === 0 ? (
 <div className=\py-16 text-center text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800\>
 <Users className=\w-10 h-10 text-slate-600 mx-auto mb-2\ />
 <div className=\font-bold text-slate-300\>No Bureau Records Matching Criteria</div>
 <div className=\text-xs text-slate-500 mt-1\>Try adjusting filters or add a new record.</div>
 </div>
 ) : (
 <div className=\grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5\>
 {filteredPeople.map((person) => (
 <div 
 key={person.person_id}
 className=\bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-xl overflow-hidden shadow-lg transition-all flex flex-col justify-between\
 >
 <div className=\p-4 flex items-start gap-3.5\>
 {/* Suspect Photo & Status Tag */}
 <div className=\relative w-20 h-24 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex-shrink-0\>
 <img 
 src={person.photo} 
 alt={person.name} 
 className=\w-full h-full object-cover\ 
 />
 <div className={bsolute bottom-0 inset-x-0 text-[8px] font-bold text-center text-white uppercase py-0.5 }>
 {person.status}
 </div>
 </div>

 {/* Information */}
 <div className=\flex-1 min-w-0\>
 <div className=\flex items-start justify-between gap-1\>
 <h3 className=\font-bold text-white text-base leading-tight truncate\>
 {person.name}
 </h3>
 <button
 onClick={() => handleDelete(person.person_id, person.name)}
 className=\text-slate-500 hover:text-rose-400 p-1 transition-colors\
 title=\Delete record\
 >
 <Trash2 className=\w-3.5 h-3.5\ />
 </button>
 </div>

 <span className=\text-[11px] font-mono text-slate-400 block mt-0.5\>
 {person.person_id}
 </span>

 <p className=\text-xs text-rose-400 font-medium mt-2 line-clamp-2\>
 {person.crime_type}
 </p>

 <div className=\mt-3 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2\>
 <span>
 {DEPARTMENTS.find(d => d.id === person.department_id)?.name.replace('Department', '') || 'Police'}
 </span>
 <button
 onClick={() => handleTestMatch(person.person_id, person.name)}
 className=\text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1 text-[11px]\
 title=\Simulate face recognition detection for this person\
 >
 <Zap className=\w-3 h-3 text-amber-400\ />
 Test Match <ChevronRight className=\w-3 h-3\ />
 </button>
 </div>
 </div>
 </div>
 </div>
 ))}
 </div>
 )}

 {/* Modal: Add New Wanted Suspect */}
 {isAddModalOpen && (
 <div className=\fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4\>
 <div className=\bg-slate-900 border border-slate-800 rounded-xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in duration-200\>
 <div className=\flex items-center justify-between border-b border-slate-800 pb-3\>
 <h3 className=\text-lg font-bold text-white flex items-center gap-2\>
 <Users className=\w-5 h-5 text-blue-500\ />
 Add Wanted Suspect to Bureau
 </h3>
 <button 
 onClick={() => setIsAddModalOpen(false)}
 className=\text-slate-400 hover:text-white\
 >
 ✕
 </button>
 </div>

 <form onSubmit={handleAddSubmit} className=\space-y-4\>
 <div>
 <label className=\block text-xs font-semibold text-slate-300 mb-1\>
 Full Name of Suspect *
 </label>
 <input
 type=\text\
 required
 placeholder=\e.g. Jagdish Patel\
 value={formData.name}
 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
 className=\w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500\
 />
 </div>

 <div>
 <label className=\block text-xs font-semibold text-slate-300 mb-1\>
 Crime Classification *
 </label>
 <input
 type=\text\
 required
 placeholder=\e.g. Organized Extortion Armed Robbery\
 value={formData.crime_type}
 onChange={(e) => setFormData({ ...formData, crime_type: e.target.value })}
 className=\w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500\
 />
 </div>

 <div className=\grid grid-cols-2 gap-3\>
 <div>
 <label className=\block text-xs font-semibold text-slate-300 mb-1\>
 Department
 </label>
 <select
 value={formData.department_id}
 onChange={(e) => setFormData({ ...formData, department_id: Number(e.target.value) })}
 className=\w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500\
 >
 {DEPARTMENTS.map(d => (
 <option key={d.id} value={d.id}>{d.name}</option>
 ))}
 </select>
 </div>

 <div>
 <label className=\block text-xs font-semibold text-slate-300 mb-1\>
 Alert Status
 </label>
 <select
 value={formData.status}
 onChange={(e) => setFormData({ ...formData, status: e.target.value })}
 className=\w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500\
 >
 <option value=\WANTED\>WANTED</option>
 <option value=\HIGH_ALERT\>HIGH_ALERT</option>
 <option value=\UNDER_SURVEILLANCE\>UNDER_SURVEILLANCE</option>
 <option value=\APPREHENDED\>APPREHENDED</option>
 </select>
 </div>
 </div>

 <div>
 <label className=\block text-xs font-semibold text-slate-300 mb-1\>
 Suspect Photo (Preset or Direct URL)
 </label>
 <select
 value={formData.photo}
 onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
 className=\w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500 mb-2\
 >
 {SAMPLE_PHOTO_PRESETS.map((p, i) => (
 <option key={i} value={p.url}>{p.label}</option>
 ))}
 </select>
 <input
 type=\url\
 placeholder=\Or paste custom image URL...\
 value={formData.photo}
 onChange={(e) => setFormData({ ...formData, photo: e.target.value })}
 className=\w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-[11px] text-slate-300 focus:outline-none focus:border-blue-500\
 />
 </div>

 <div className=\flex items-center justify-end gap-2 pt-2 border-t border-slate-800\>
 <button
 type=\button\
 onClick={() => setIsAddModalOpen(false)}
 className=\px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors\
 >
 Cancel
 </button>
 <button
 type=\submit\
 className=\px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold transition-colors shadow-md\
 >
 Save to Bureau
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
}
