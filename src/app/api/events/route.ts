import { NextResponse } from 'next/server';
import { getData, addEvent } from '@/lib/db';

export async function GET() {
    const data = await getData();
    return NextResponse.json(data.events, {
        headers: {
            'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
    });
}

export async function POST(request: Request) {
    const body = await request.json();
    // Let db.ts/Supabase handle ID generation to ensure valid UUIDs
    const result = await addEvent(body);
    return NextResponse.json(result);
}
