// app/api/mpesa/status/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Donation from '@/models/Donation';

// GET /api/mpesa/status?donationId=xxx  — frontend polls this
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const donationId = new URL(req.url).searchParams.get('donationId');
    if (!donationId) return NextResponse.json({ error: 'donationId required' }, { status: 400 });

    const donation = await Donation.findById(donationId).lean();
    if (!donation) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      success: true,
      status: donation.status,
      amount: donation.amount,
      mpesaTransactionId: donation.mpesaTransactionId,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Status check failed' }, { status: 500 });
  }
}
