// app/api/fundraisers/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fundraiser from '@/models/Fundraiser';
import { getAuthUser } from '@/lib/auth';
import { slugify } from '@/lib/utils';

// GET /api/fundraisers - list fundraisers with filters
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);

    const page     = parseInt(searchParams.get('page')     || '1');
    const limit    = parseInt(searchParams.get('limit')    || '12');
    const category = searchParams.get('category');
    const search   = searchParams.get('search');
    const sort     = searchParams.get('sort') || 'recent';
    const urgent   = searchParams.get('urgent');

    const query: Record<string, unknown> = { status: 'active' };

    if (category && category !== 'all') query.category = category;
    if (urgent === 'true') query.urgent = true;
    if (search) {
      query.$text = { $search: search };
    }

    const sortMap: Record<string, Record<string, number>> = {
      recent:   { createdAt: -1 },
      trending: { donorCount: -1, amountRaised: -1 },
      ending:   { endDate: 1 },
      urgent:   { urgent: -1, createdAt: -1 },
    };

    const skip = (page - 1) * limit;

    const [fundraisers, total] = await Promise.all([
      Fundraiser.find(query)
        .populate('creatorId', 'name phone verified avatar')
        .sort(sortMap[sort] || sortMap.recent)
        .skip(skip)
        .limit(limit)
        .lean(),
      Fundraiser.countDocuments(query),
    ]);

    return NextResponse.json({
      success: true,
      data: fundraisers,
      total,
      page,
      limit,
      hasMore: skip + fundraisers.length < total,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to fetch fundraisers' }, { status: 500 });
  }
}

// POST /api/fundraisers - create new fundraiser
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const user = getAuthUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { title, description, story, goalAmount, category, images, phoneNumber, paybillNumber, endDate, urgent } = body;

    if (!title || !description || !story || !goalAmount || !category || !phoneNumber) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create unique slug
    let slug = slugify(title);
    const existingSlug = await Fundraiser.findOne({ slug });
    if (existingSlug) slug = `${slug}-${Date.now()}`;

    const fundraiser = await Fundraiser.create({
      title: title.trim(),
      description: description.trim(),
      story: story.trim(),
      goalAmount: Number(goalAmount),
      category,
      images: images || [],
      creatorId: user.userId,
      phoneNumber,
      paybillNumber,
      endDate: endDate ? new Date(endDate) : undefined,
      urgent: Boolean(urgent),
      slug,
    });

    return NextResponse.json({ success: true, data: fundraiser }, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Failed to create fundraiser' }, { status: 500 });
  }
}
