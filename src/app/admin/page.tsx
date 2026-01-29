'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { ArrowLeft, MapPin, Plus, Bell, Trash2, Edit2, X } from 'lucide-react';

export default function AdminPage() {
    const [locations, setLocations] = useState<any[]>([]);
    const [events, setEvents] = useState<any[]>([]);
    const [selectedLocation, setSelectedLocation] = useState<{ lat: number, lng: number } | null>(null);

    // Forms & Editing
    const [activeTab, setActiveTab] = useState<'locations' | 'events'>('locations');
    const [editingLocId, setEditingLocId] = useState<string | null>(null);
    const [editingEventId, setEditingEventId] = useState<string | null>(null);

    const [locName, setLocName] = useState('');
    const [locDesc, setLocDesc] = useState('');

    const [eventName, setEventName] = useState('');
    const [eventStart, setEventStart] = useState('');
    const [eventEnd, setEventEnd] = useState('');
    const [eventLocId, setEventLocId] = useState('');

    const Map = useMemo(() => dynamic(
        () => import('@/components/Map'),
        { ssr: false, loading: () => <p>Loading Map...</p> }
    ), []);

    useEffect(() => {
        fetchLocations();
        fetchEvents();
    }, []);

    const fetchLocations = async () => {
        const res = await fetch('/api/locations');
        const data = await res.json();
        setLocations(data);
    };

    const fetchEvents = async () => {
        const res = await fetch('/api/events');
        const data = await res.json();
        setEvents(data);
    };

    const handleMapClick = (lat: number, lng: number) => {
        setSelectedLocation({ lat, lng });
    };

    const resetLocForm = () => {
        setLocName('');
        setLocDesc('');
        setSelectedLocation(null);
        setEditingLocId(null);
    };

    const resetEventForm = () => {
        setEventName('');
        setEventStart('');
        setEventEnd('');
        setEventLocId('');
        setEditingEventId(null);
    };

    // --- Location Handlers ---

    const handleSaveLocation = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLocation && !editingLocId) return alert('Click on the map to select a location first');

        if (editingLocId) {
            await fetch(`/api/locations/${editingLocId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: locName,
                    description: locDesc,
                    ...(selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : {})
                })
            });
        } else {
            await fetch('/api/locations', {
                method: 'POST',
                body: JSON.stringify({
                    name: locName,
                    description: locDesc,
                    lat: selectedLocation!.lat,
                    lng: selectedLocation!.lng
                })
            });
        }

        resetLocForm();
        fetchLocations();
    };

    const handleEditLocation = (loc: any) => {
        setActiveTab('locations');
        setEditingLocId(loc.id);
        setLocName(loc.name);
        setLocDesc(loc.description || '');
        // Optionally focus map on location?
    };

    const handleDeleteLocation = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`/api/locations/${id}`, { method: 'DELETE' });
        fetchLocations();
    };

    // --- Event Handlers ---

    const handleSaveEvent = async (e: React.FormEvent) => {
        e.preventDefault();

        if (editingEventId) {
            await fetch(`/api/events/${editingEventId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    name: eventName,
                    startTime: eventStart,
                    endTime: eventEnd,
                    locationId: eventLocId
                })
            });
        } else {
            await fetch('/api/events', {
                method: 'POST',
                body: JSON.stringify({
                    name: eventName,
                    startTime: eventStart,
                    endTime: eventEnd,
                    locationId: eventLocId
                })
            });
        }
        resetEventForm();
        fetchEvents();
    };

    const handleEditEvent = (evt: any) => {
        setActiveTab('events');
        setEditingEventId(evt.id);
        setEventName(evt.name);
        setEventStart(evt.startTime.slice(0, 16)); // Format for datetime-local
        setEventEnd(evt.endTime.slice(0, 16));
        setEventLocId(evt.locationId);
    };

    const handleDeleteEvent = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        await fetch(`/api/events/${id}`, { method: 'DELETE' });
        fetchEvents();
    };

    const triggerNotification = () => {
        alert('Notification Triggered: "Check out the new event!"');
    };

    return (
        <div className="flex h-screen flex-col md:flex-row bg-becon-bg text-white overflow-hidden">
            {/* Sidebar Controls */}
            <div className="w-full md:w-1/3 p-6 overflow-y-auto border-r border-becon-glass-border glass-card flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-becon-accent">Admin Console</h1>
                    <Link href="/" className="text-gray-400 hover:text-white transition flex items-center gap-1 text-sm">
                        <ArrowLeft size={16} /> Back
                    </Link>
                </div>

                {/* Tabs */}
                <div className="flex mb-6 bg-white/5 rounded-xl p-1">
                    <button
                        onClick={() => setActiveTab('locations')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'locations' ? 'bg-becon-primary text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Locations
                    </button>
                    <button
                        onClick={() => setActiveTab('events')}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'events' ? 'bg-becon-primary text-white' : 'text-gray-400 hover:text-white'}`}
                    >
                        Events
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 pr-1">

                    {/* --- LOCATIONS TAB --- */}
                    {activeTab === 'locations' && (
                        <>
                            {/* Add/Edit Form */}
                            <div className="glass-card p-5 rounded-2xl mb-6 bg-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        {editingLocId ? <Edit2 size={18} className="text-orange-400" /> : <MapPin size={20} className="text-becon-primary" />}
                                        <h2 className="text-lg font-semibold">{editingLocId ? 'Edit Location' : 'Add Location'}</h2>
                                    </div>
                                    {editingLocId && <button onClick={resetLocForm} className="text-xs text-gray-400 hover:text-white"><X size={14} /></button>}
                                </div>
                                <form onSubmit={handleSaveLocation} className="space-y-4">
                                    <div className={`p-3 rounded-lg text-sm border transition-colors ${selectedLocation ? 'bg-green-900/30 border-green-500/50 text-green-300' : 'bg-red-900/20 border-red-500/30 text-red-300'}`}>
                                        {selectedLocation
                                            ? `Selected: ${selectedLocation.lat.toFixed(4)}, ${selectedLocation.lng.toFixed(4)}`
                                            : (editingLocId ? 'Map click updates coords (optional)' : 'Click on map to set coords')}
                                    </div>
                                    <input
                                        placeholder="Location Name"
                                        className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:border-becon-accent outline-none transition"
                                        value={locName}
                                        onChange={e => setLocName(e.target.value)}
                                        required
                                    />
                                    <textarea
                                        placeholder="Description"
                                        className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:border-becon-accent outline-none transition resize-none h-20"
                                        value={locDesc}
                                        onChange={e => setLocDesc(e.target.value)}
                                    />
                                    <button type="submit" disabled={!selectedLocation && !editingLocId} className="w-full bg-becon-primary text-white p-3 rounded-xl hover:bg-becon-secondary transition disabled:opacity-50 font-medium">
                                        {editingLocId ? 'Update Location' : 'Save Location'}
                                    </button>
                                </form>
                            </div>

                            {/* List */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Existing Locations</h3>
                                {locations.map(loc => (
                                    <div key={loc.id} className="glass-card p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group">
                                        <div>
                                            <div className="font-medium text-gray-200">{loc.name}</div>
                                            <div className="text-xs text-gray-500">{loc.description}</div>
                                        </div>
                                        <div className="flex gap-2 opacity-100 transition-opacity">
                                            <button onClick={() => handleEditLocation(loc)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteLocation(loc.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* --- EVENTS TAB --- */}
                    {activeTab === 'events' && (
                        <>
                            {/* Add/Edit Form */}
                            <div className="glass-card p-5 rounded-2xl mb-6 bg-white/5">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        {editingEventId ? <Edit2 size={18} className="text-orange-400" /> : <Plus size={20} className="text-becon-primary" />}
                                        <h2 className="text-lg font-semibold">{editingEventId ? 'Edit Event' : 'Add Event'}</h2>
                                    </div>
                                    {editingEventId && <button onClick={resetEventForm} className="text-xs text-gray-400 hover:text-white"><X size={14} /></button>}
                                </div>
                                <form onSubmit={handleSaveEvent} className="space-y-4">
                                    <input
                                        placeholder="Event Name"
                                        className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:border-becon-accent outline-none transition"
                                        value={eventName}
                                        onChange={e => setEventName(e.target.value)}
                                        required
                                    />
                                    <select
                                        className="w-full bg-black/40 border border-white/10 p-3 rounded-lg focus:border-becon-accent outline-none transition text-gray-300"
                                        value={eventLocId}
                                        onChange={e => setEventLocId(e.target.value)}
                                        required
                                    >
                                        <option value="">Select Location</option>
                                        {locations.map(l => <option key={l.id} value={l.id} className="bg-gray-900">{l.name}</option>)}
                                    </select>
                                    <div className="grid grid-cols-1 gap-3">
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">Start Time</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-sm text-gray-300"
                                                value={eventStart}
                                                onChange={e => setEventStart(e.target.value)}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-gray-400 mb-1 block">End Time</label>
                                            <input
                                                type="datetime-local"
                                                className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-sm text-gray-300"
                                                value={eventEnd}
                                                onChange={e => setEventEnd(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <button type="submit" className="w-full bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition font-medium">
                                        {editingEventId ? 'Update Event' : 'Create Event'}
                                    </button>
                                </form>
                            </div>

                            {/* List */}
                            <div className="space-y-3">
                                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Existing Events</h3>
                                {events.map(evt => (
                                    <div key={evt.id} className="glass-card p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center group">
                                        <div>
                                            <div className="font-medium text-gray-200">{evt.name}</div>
                                            <div className="text-xs text-gray-500">
                                                {new Date(evt.startTime).toLocaleDateString()} • {new Date(evt.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                        <div className="flex gap-2 opacity-100 transition-opacity">
                                            <button onClick={() => handleEditEvent(evt)} className="p-2 hover:bg-white/10 rounded-lg text-blue-400"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteEvent(evt.id)} className="p-2 hover:bg-red-500/20 rounded-lg text-red-400"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {/* Notifications (Always visible or in its own tab) */}
                    <div className="mt-8 pt-6 border-t border-white/10">
                        <button onClick={triggerNotification} className="w-full flex items-center justify-center gap-2 bg-orange-600/20 text-orange-400 border border-orange-500/30 p-3 rounded-xl hover:bg-orange-600/40 transition font-medium">
                            <Bell size={18} /> Trigger Notification
                        </button>
                    </div>
                </div>
            </div>

            {/* Map Preview */}
            <div className="w-full md:w-2/3 h-[40vh] md:h-auto relative border-t md:border-t-0 md:border-l border-white/10">
                <Map locations={locations} onMapClick={handleMapClick} />
                {selectedLocation && (
                    <div className="absolute top-4 right-4 bg-gray-900/90 text-white p-3 rounded-xl shadow-xl z-[1000] text-xs border border-white/10 flex items-center gap-2">
                        <MapPin size={14} className="text-green-400" />
                        Marker Placed
                    </div>
                )}
            </div>
        </div>
    );
}
