// app/api/mpesa/callback/route.ts
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Donation from '@/models/Donation';
import Fundraiser from '@/models/Fundraiser';

// Safaricom calls this URL after payment
export async function POST(req: NextRequest) {
  try {
    await connectDB();

    const body = await req.json();
    const callback = body?.Body?.stkCallback;

    if (!callback) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    const { CheckoutRequestID, ResultCode, CallbackMetadata } = callback;

    // ── Check if this is a fundraiser activation payment ──────────────────
    const activationFundraiser = await Fundraiser.findOne({
      activationCheckoutId: CheckoutRequestID,
    });

    if (activationFundraiser) {
      if (ResultCode === 0) {
        await Fundraiser.findByIdAndUpdate(activationFundraiser._id, { status: 'active' });
      }
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    // ── Regular donation payment ───────────────────────────────────────────
    const donation = await Donation.findOne({ mpesaCheckoutRequestId: CheckoutRequestID });
    if (!donation) {
      return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
    }

    if (ResultCode === 0) {
      const items = CallbackMetadata?.Item || [];
      const getMeta = (name: string) =>
        items.find((i: { Name: string }) => i.Name === name)?.Value;

      const mpesaTransactionId = getMeta('MpesaReceiptNumber');
      const paidAmount = getMeta('Amount') || donation.amount;

      await Donation.findByIdAndUpdate(donation._id, {
        status: 'confirmed',
        mpesaTransactionId,
        amount: paidAmount,
      });

      await Fundraiser.findByIdAndUpdate(donation.fundraiserId, {
        $inc: { amountRaised: paidAmount, donorCount: 1 },
      });
    } else {
      await Donation.findByIdAndUpdate(donation._id, { status: 'failed' });
    }

    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  } catch (err) {
    console.error('M-Pesa callback error:', err);
    return NextResponse.json({ ResultCode: 0, ResultDesc: 'Accepted' });
  }
}
