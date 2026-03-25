// app/api/fundraisers/[id]/update/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fundraiser from '@/models/Fundraiser';
import { getAuthUser } from '@/lib/auth';

// POST /api/fundraisers/[id]/update - add a campaign update
export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const fundraiser = await Fundraiser.findById(params.id);
    if (!fundraiser) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (fundraiser.creatorId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { message } = await req.json();
    if (!message?.trim()) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    fundraiser.updates.push({ message: message.trim(), createdAt: new Date() });
    await fundraiser.save();

    return NextResponse.json({ success: true, data: fundraiser.updates });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to post update' }, { status: 500 });
  }
}
