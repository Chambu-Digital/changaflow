// app/api/stats/route.ts
import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fundraiser from '@/models/Fundraiser';
import Donation from '@/models/Donation';

export async function GET() {
  try {
    await connectDB();

    const [totalRaisedResult, activeFundraisers, totalDonors] = await Promise.all([
      Donation.aggregate([
        { $match: { status: 'confirmed' } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
      Fundraiser.countDocuments({ status: 'active' }),
      Donation.distinct('donorPhone', { status: 'confirmed' }),
    ]);

    const totalRaised = totalRaisedResult[0]?.total ?? 0;

    return NextResponse.json({
      totalRaised,
      activeFundraisers,
      totalDonors: totalDonors.length,
    });
  } catch (err) {
    console.error('Stats error:', err);
    return NextResponse.json({ totalRaised: 0, activeFundraisers: 0, totalDonors: 0 });
  }
}
