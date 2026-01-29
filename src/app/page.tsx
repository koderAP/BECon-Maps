'use client';

import dynamic from 'next/dynamic';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { MapPin, Calendar, Lock, Navigation, Search, X, List } from 'lucide-react';

export default function Home() {
  const [showDrawer, setShowDrawer] = useState(false);
  const [activeTab, setActiveTab] = useState<'locations' | 'events'>('locations');
  const [searchQuery, setSearchQuery] = useState('');

  const [events, setEvents] = useState<any[]>([]);
  const [locations, setLocations] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/events').then(res => res.json()).then(setEvents);
    fetch('/api/locations').then(res => res.json()).then(setLocations);
  }, []);

  const Map = useMemo(() => dynamic(
    () => import('@/components/Map'),
    {
      loading: () => <div className="flex h-full w-full items-center justify-center bg-becon-bg text-white"><p>Loading Experience...</p></div>,
      ssr: false
    }
  ), []);

  const openGoogleMaps = (lat: number, lng: number) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
  };

  const filteredLocations = locations.filter(l =>
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.description && l.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const filteredEvents = events.filter(e =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex min-h-screen flex-col items-center justify-between relative bg-becon-bg text-white overflow-hidden">
      <div className="absolute inset-2 sm:inset-4 z-0 rounded-3xl overflow-hidden border border-white/20 shadow-2xl opacity-100">
        <Map locations={locations} />
      </div>

      {/* Header */}
      <div className="z-10 w-full p-6 pointer-events-none">
        <div className="p-6 rounded-2xl shadow-xl pointer-events-auto max-w-md mx-auto sm:mx-0 animate-fade-in bg-[#05020a] border border-white/20">
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-becon-accent to-purple-400">BECon Maps</h1>
          <p className="text-sm text-gray-300 mt-1">Navigate the summit like a pro.</p>
        </div>
      </div>

      {/* Main Drawer (Opaque) */}
      <div className={`fixed inset-y-0 right-0 z-20 w-80 bg-[#05020a] border-l border-white/10 p-6 transform transition-transform duration-300 ease-in-out ${showDrawer ? 'translate-x-0' : 'translate-x-full'} shadow-2xl`}>

        {/* Drawer Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-white">Explore</h2>
          <button onClick={() => setShowDrawer(false)} className="text-gray-400 hover:text-white bg-white/5 p-2 rounded-full"><X size={18} /></button>
        </div>

        {/* Search */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-3 text-gray-500" size={16} />
          <input
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-sm focus:border-becon-primary outline-none transition text-white placeholder:text-gray-600"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Tabs */}
        <div className="flex mb-6 bg-white/5 rounded-xl p-1 border border-white/5">
          <button
            onClick={() => setActiveTab('locations')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'locations' ? 'bg-becon-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Locations
          </button>
          <button
            onClick={() => setActiveTab('events')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition ${activeTab === 'events' ? 'bg-becon-primary text-white shadow-lg' : 'text-gray-400 hover:text-white'}`}
          >
            Events
          </button>
        </div>

        {/* Content List */}
        <div className="space-y-4 h-[calc(100vh-250px)] overflow-y-auto pb-20 scrollbar-hide">

          {/* Locations List */}
          {activeTab === 'locations' && (
            filteredLocations.length === 0 ? (
              <p className="text-center text-gray-600 mt-10 text-sm">No locations found.</p>
            ) : (
              filteredLocations.map(loc => (
                <div key={loc.id} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-becon-primary/30 transition group">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-gray-200">{loc.name}</h3>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">{loc.description}</p>
                    </div>
                    <MapPin size={16} className="text-becon-accent shrink-0 mt-1" />
                  </div>
                  <button
                    onClick={() => openGoogleMaps(loc.lat, loc.lng)}
                    className="w-full mt-3 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-xs py-2 rounded-lg text-gray-300 transition"
                  >
                    <Navigation size={12} /> Get Directions
                  </button>
                </div>
              ))
            )
          )}

          {/* Events List */}
          {activeTab === 'events' && (
            filteredEvents.length === 0 ? (
              <p className="text-center text-gray-600 mt-10 text-sm">No events found.</p>
            ) : (
              filteredEvents.map(event => {
                const loc = locations.find(l => l.id === event.locationId);
                return (
                  <div key={event.id} className="bg-white/5 p-4 rounded-xl border border-white/5 hover:border-becon-primary/30 transition">
                    <h3 className="font-bold text-becon-accent">{event.name}</h3>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-2">
                      <MapPin size={12} />
                      <span>{loc?.name || 'Unknown Location'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                      <Calendar size={12} />
                      <span>
                        {new Date(event.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(event.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    {loc && (
                      <button
                        onClick={() => openGoogleMaps(loc.lat, loc.lng)}
                        className="w-full mt-3 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-xs py-2 rounded-lg text-gray-300 transition"
                      >
                        <Navigation size={12} /> Get Directions
                      </button>
                    )}
                  </div>
                );
              })
            )
          )}
        </div>
      </div>

      {/* Controls (Bottom Bar) */}
      <div className="z-10 w-full p-6 pointer-events-none mt-auto">
        <div className="p-4 rounded-2xl shadow-lg pointer-events-auto flex justify-between items-center max-w-3xl mx-auto bg-[#05020a] border border-white/20">
          <div className="flex gap-3">
            <button
              onClick={() => setShowDrawer(!showDrawer)}
              className={`flex items-center gap-2 px-5 py-3 rounded-xl border transition-all font-medium ${showDrawer ? 'bg-becon-primary text-white border-becon-primary shadow-[0_0_15px_rgba(124,58,237,0.5)]' : 'bg-white/5 hover:bg-white/10 text-becon-accent border-white/10'}`}
            >
              <List size={18} />
              <span>Locations & Events</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
