// app/api/fundraisers/[id]/withdraw/route.ts
// Creator withdraws funds — 2.5% platform fee is deducted
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Fundraiser from '@/models/Fundraiser';
import { getAuthUser } from '@/lib/auth';

const PLATFORM_FEE_RATE = 0.025;

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectDB();
    const user = getAuthUser(req);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const fundraiser = await Fundraiser.findById(params.id);
    if (!fundraiser) return NextResponse.json({ error: 'Fundraiser not found' }, { status: 404 });
    if (fundraiser.creatorId.toString() !== user.userId)
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    if (fundraiser.status !== 'active')
      return NextResponse.json({ error: 'Fundraiser is not active' }, { status: 400 });
    if (fundraiser.withdrawnAt)
      return NextResponse.json({ error: 'Already withdrawn' }, { status: 400 });

    const goalMet    = fundraiser.amountRaised >= fundraiser.goalAmount;
    const deadlineMet = fundraiser.endDate && new Date() >= new Date(fundraiser.endDate);

    if (!goalMet && !deadlineMet) {
      return NextResponse.json({
        error: 'Withdrawal only available once goal is reached or end date has passed',
      }, { status: 400 });
    }

    const gross      = fundraiser.amountRaised;
    const fee        = Math.ceil(gross * PLATFORM_FEE_RATE);
    const net        = gross - fee;

    // Mark as completed + record withdrawal time
    await Fundraiser.findByIdAndUpdate(params.id, {
      status: 'completed',
      withdrawnAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      summary: {
        grossAmount:  gross,
        platformFee:  fee,
        netAmount:    net,
        feeRate:      `${PLATFORM_FEE_RATE * 100}%`,
      },
      message: `KES ${net.toLocaleString()} will be sent to ${fundraiser.phoneNumber} after the 2.5% platform fee.`,
    });
  } catch (err: unknown) {
    console.error(err);
    return NextResponse.json({ error: 'Withdrawal failed' }, { status: 500 });
  }
}
