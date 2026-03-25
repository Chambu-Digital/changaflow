// app/api/fundraisers/[id]/activate/route.ts
// Initiates the KES 50 activation STK push for a pending fundraiser
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fundraiser from '@/models/Fundraiser';
import { getAuthUser } from '@/lib/auth';
import { initiateSTKPush } from '@/lib/mpesa';

export const ACTIVATION_FEE = 50; // KES

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const fundraiser = await Fundraiser.findById(params.id);
    if (!fundraiser) return NextResponse.json({ error: 'Fundraiser not found' }, { status: 404 });
    if (fundraiser.creatorId.toString() !== user.userId)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (fundraiser.status === 'active')
      return NextResponse.json({ error: 'Already active' }, { status: 400 });

    const stkResponse = await initiateSTKPush({
      phoneNumber: fundraiser.phoneNumber,
      amount: ACTIVATION_FEE,
      accountRef: `ACT-${fundraiser.slug}`.slice(0, 12),
      description: 'ChangaFlow Activation',
    });

    await Fundraiser.findByIdAndUpdate(params.id, {
      activationCheckoutId: stkResponse.CheckoutRequestID,
    });

    return NextResponse.json({
      success: true,
      checkoutRequestId: stkResponse.CheckoutRequestID,
      message: `Check your phone (${fundraiser.phoneNumber}) for a KES ${ACTIVATION_FEE} M-Pesa prompt`,
    });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Failed' }, { status: 500 });
  }
}
