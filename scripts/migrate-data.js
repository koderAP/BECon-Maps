
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase credentials in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrate() {
    const dataPath = path.join(__dirname, '../data.json');
    if (!fs.existsSync(dataPath)) {
        console.log('No data.json found, skipping migration.');
        return;
    }

    const fileContent = fs.readFileSync(dataPath, 'utf8');
    const data = JSON.parse(fileContent);

    console.log(`Found ${data.locations.length} locations and ${data.events.length} events.`);

    // Map to store oldID -> newUUID
    const locationIdMap = new Map();

    // Migrate Locations
    for (const loc of data.locations) {
        // Generate new UUID
        const newId = crypto.randomUUID();
        locationIdMap.set(loc.id, newId);

        const { error } = await supabase.from('map_locations').upsert({
            id: newId,
            name: loc.name,
            description: loc.description,
            lat: parseFloat(loc.lat),
            lng: parseFloat(loc.lng)
        });

        if (error) console.error(`Failed to migrate location ${loc.name}:`, error.message);
        else console.log(`Migrated location: ${loc.name} (New ID: ${newId})`);
    }

    // Migrate Events
    for (const evt of data.events) {
        const newLocationId = locationIdMap.get(evt.locationId);
        if (!newLocationId) {
            console.warn(`Skipping event ${evt.name}: Location ID ${evt.locationId} not found in new map.`);
            continue;
        }

        const { error } = await supabase.from('map_events').upsert({
            id: crypto.randomUUID(),
            name: evt.name,
            description: evt.description,
            location_id: newLocationId,
            start_time: evt.startTime,
            end_time: evt.endTime
        });

        if (error) console.error(`Failed to migrate event ${evt.name}:`, error.message);
        else console.log(`Migrated event: ${evt.name}`);
    }

    console.log('Migration complete.');
}

migrate().catch(console.error);
