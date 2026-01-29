import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// Use Service Role Key for server-side operations to bypass RLS policies
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface Location {
    id: string; // UUID from supabase
    name: string;
    lat: number;
    lng: number;
    description?: string;
}

export interface Event {
    id: string; // UUID
    name: string;
    locationId: string;
    startTime: string;
    endTime: string;
    description?: string;
}

export interface Data {
    locations: Location[];
    events: Event[];
}

export async function getData(): Promise<Data> {
    const { data: locations, error: locError } = await supabase
        .from('map_locations')
        .select('*');

    if (locError) {
        console.error('Error fetching locations:', locError);
        return { locations: [], events: [] };
    }

    const { data: events, error: evtError } = await supabase
        .from('map_events')
        .select('*');

    if (evtError) {
        console.error('Error fetching events:', evtError);
        return { locations: locations || [], events: [] };
    }

    return {
        locations: (locations as any[]).map(l => ({ ...l, lat: parseFloat(l.lat), lng: parseFloat(l.lng) })),
        events: (events as any[]).map(e => ({
            ...e,
            locationId: e.location_id, // Map snake_case to camelCase
            startTime: e.start_time,
            endTime: e.end_time
        }))
    };
}

// Helper to get Locations only (optimization)
export async function getLocations(): Promise<Location[]> {
    const { data, error } = await supabase.from('map_locations').select('*');
    if (error || !data) return [];
    return data.map((l: any) => ({ ...l, lat: parseFloat(l.lat), lng: parseFloat(l.lng) }));
}

// NOTE: Add/Update/Delete functions below will now call Supabase directly.
// The previous local file approach updated an in-memory object then saved.
// Here we do direct SQL operations.

export async function addLocation(location: Omit<Location, 'id'> & { id?: string }): Promise<any> {
    // If ID is provided, use it (migration/manual), else let Supabase gen UUID if set up, or gen one here.
    const id = location.id || crypto.randomUUID();
    const { data, error } = await supabase.from('map_locations').insert({
        id: id,
        name: location.name,
        description: location.description,
        lat: location.lat,
        lng: location.lng
    }).select().single();

    if (error) throw error;
    return data;
}

export async function updateLocation(id: string, updates: Partial<Location>): Promise<void> {
    const { error } = await supabase
        .from('map_locations')
        .update({
            name: updates.name,
            description: updates.description,
            lat: updates.lat,
            lng: updates.lng
        })
        .eq('id', id);

    if (error) throw error;
}

export async function deleteLocation(id: string): Promise<void> {
    const { error } = await supabase.from('map_locations').delete().eq('id', id);
    if (error) throw error;
}

export async function addEvent(event: Omit<Event, 'id'> & { id?: string }): Promise<any> {
    const id = event.id || crypto.randomUUID();
    const { data, error } = await supabase.from('map_events').insert({
        id: id,
        name: event.name,
        description: event.description,
        location_id: event.locationId,
        start_time: event.startTime,
        end_time: event.endTime
    }).select().single();

    if (error) throw error;
    return data;
}

export async function updateEvent(id: string, updates: Partial<Event>): Promise<void> {
    const dbUpdates: any = {};
    if (updates.name) dbUpdates.name = updates.name;
    if (updates.description) dbUpdates.description = updates.description;
    if (updates.locationId) dbUpdates.location_id = updates.locationId;
    if (updates.startTime) dbUpdates.start_time = updates.startTime;
    if (updates.endTime) dbUpdates.end_time = updates.endTime;

    const { error } = await supabase
        .from('map_events')
        .update(dbUpdates)
        .eq('id', id);

    if (error) throw error;
}

export async function deleteEvent(id: string): Promise<void> {
    const { error } = await supabase.from('map_events').delete().eq('id', id);
    if (error) throw error;
}

