// app/api/auth/register/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import { signToken } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const { name, phone, email, password } = await req.json();

    if (!name || !phone || !password) {
      return NextResponse.json({ error: 'Name, phone, and password are required' }, { status: 400 });
    }

    const exists = await User.findOne({ phone: phone.trim().replace(/\s+/g, '') });
    if (exists) {
      return NextResponse.json({ error: 'Phone number already registered' }, { status: 409 });
    }

    const user = await User.create({
      name: name.trim(),
      phone: phone.trim().replace(/\s+/g, ''),
      email: email?.trim() || undefined,
      passwordHash: password, // hashed in pre-save hook
    });

    const token = signToken({ userId: user._id.toString(), phone: user.phone });

    const response = NextResponse.json({
      success: true,
      user: { _id: user._id, name: user.name, phone: user.phone, email: user.email },
      token,
    });

    response.cookies.set('token', token, { httpOnly: true, maxAge: 30 * 24 * 60 * 60 });
    return response;
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 });
  }
}
