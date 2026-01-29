
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { SignJWT } from 'jose';
import crypto from 'crypto';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const SECRET_KEY = new TextEncoder().encode(process.env.SUPABASE_SERVICE_ROLE_KEY);

function hashPassword(password: string) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

export async function POST(request: Request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
        }

        // Check admin credentials in Supabase
        const { data: admin, error } = await supabase
            .from('admins')
            .select('*')
            .eq('email', email)
            .single();

        if (error) {
            console.error("Admin Login Error: Supabase query failed", error);
            return NextResponse.json({ message: 'Database error', details: error.message }, { status: 401 });
        }

        if (!admin) {
            console.error("Admin Login Error: User not found", email);
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const hashed = hashPassword(password);
        if (admin.password !== hashed) {
            console.error("Admin Login Error: Password mismatch for", email);
            // Constructively logging hash for debug purposes (WARNING: Only in dev/debug)
            console.log("Input Hash:", hashed.substring(0, 10) + "...", "Stored Hash:", admin.password.substring(0, 10) + "...");
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        // Generate JWT
        const token = await new SignJWT({ id: admin.id, email: admin.email, isAdmin: true })
            .setProtectedHeader({ alg: 'HS256' })
            .setExpirationTime('7d')
            .sign(SECRET_KEY);

        const response = NextResponse.json({ message: 'Login successful', token });

        // Set cookie
        response.cookies.set('map_admin_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60, // 7 days
            path: '/',
        });

        return response;
    } catch (error: any) {
        return NextResponse.json({ message: 'Server error', error: error.message }, { status: 500 });
    }
}
