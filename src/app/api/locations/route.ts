import { NextResponse } from 'next/server';
import { getData, addLocation } from '@/lib/db';

export async function GET() {
    const data = await getData();
    return NextResponse.json(data.locations);
}

export async function POST(request: Request) {
    const body = await request.json();
    const newLocation = { ...body, id: Date.now().toString() };
    await addLocation(newLocation);
    return NextResponse.json(newLocation);
}
