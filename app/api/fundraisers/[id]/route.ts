// app/api/fundraisers/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fundraiser from '@/models/Fundraiser';
import Donation from '@/models/Donation';
import { getAuthUser } from '@/lib/auth';

// GET /api/fundraisers/[id] - get single fundraiser by id or slug
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const fundraiser = await Fundraiser.findOne({
      $or: [{ _id: params.id.match(/^[0-9a-fA-F]{24}$/) ? params.id : null }, { slug: params.id }],
    })
      .populate('creatorId', 'name phone verified avatar')
      .lean() as (Record<string, unknown> & { _id: unknown }) | null;

    if (!fundraiser) {
      return NextResponse.json({ error: 'Fundraiser not found' }, { status: 404 });
    }

    // Increment view count (fire-and-forget)
    Fundraiser.findByIdAndUpdate(fundraiser._id, { $inc: { viewCount: 1 } }).exec();

    // Get recent donations
    const donations = await Donation.find({
      fundraiserId: fundraiser._id,
      status: 'confirmed',
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean() as any[];

    return NextResponse.json({ success: true, data: { ...fundraiser, donations } });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch fundraiser' }, { status: 500 });
  }
}

// PATCH /api/fundraisers/[id] - update fundraiser (owner only)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();

    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const fundraiser = await Fundraiser.findById(params.id);
    if (!fundraiser) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    if (fundraiser.creatorId.toString() !== user.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    const allowed = ['title', 'description', 'story', 'images', 'status', 'urgent', 'endDate'];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const updated = await Fundraiser.findByIdAndUpdate(params.id, updates, { new: true });
    return NextResponse.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  }
}
