import { NextResponse } from 'next/server';
import { getData, updateEvent, deleteEvent } from '@/lib/db';

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const body = await request.json();
    await updateEvent(id, body);
    return NextResponse.json({ success: true });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    await deleteEvent(id);
    return NextResponse.json({ success: true });
}
