// app/api/mpesa/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fundraiser from '@/models/Fundraiser';
import Donation from '@/models/Donation';
import { initiateSTKPush } from '@/lib/mpesa';

export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const { fundraiserId, phoneNumber, amount, donorName, message, anonymous } = await req.json();

    if (!fundraiserId || !phoneNumber || !amount || !donorName) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (amount < 10) {
      return NextResponse.json({ error: 'Minimum donation is KES 10' }, { status: 400 });
    }

    const fundraiser = await Fundraiser.findById(fundraiserId);
    if (!fundraiser || fundraiser.status !== 'active') {
      return NextResponse.json({ error: 'Fundraiser not found or inactive' }, { status: 404 });
    }

    // Create a pending donation record first
    const donation = await Donation.create({
      fundraiserId,
      donorName: anonymous ? 'Anonymous' : donorName,
      donorPhone: phoneNumber,
      amount: Number(amount),
      message,
      anonymous: Boolean(anonymous),
      status: 'pending',
    });

    // Initiate STK push
    const stkResponse = await initiateSTKPush({
      phoneNumber,
      amount: Number(amount),
      accountRef: fundraiser.slug,
      description: `Donate to ${fundraiser.title.slice(0, 20)}`,
    });

    // Save checkout request ID for callback matching
    await Donation.findByIdAndUpdate(donation._id, {
      mpesaCheckoutRequestId: stkResponse.CheckoutRequestID,
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      donationId: donation._id,
      message: 'Check your phone for the M-Pesa prompt',
    });
  } catch (err: unknown) {
    console.error(err);
    const message = err instanceof Error ? err.message : 'Payment initiation failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
