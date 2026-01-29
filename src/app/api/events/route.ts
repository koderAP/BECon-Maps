import { NextResponse } from 'next/server';
import { getData, addEvent } from '@/lib/db';

export async function GET() {
    const data = await getData();
    return NextResponse.json(data.events);
}

export async function POST(request: Request) {
    const body = await request.json();
    // Simple validation could go here
    const newEvent = { ...body, id: Date.now().toString() };
    await addEvent(newEvent);
    return NextResponse.json(newEvent);
}
