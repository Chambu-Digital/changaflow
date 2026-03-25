// models/Donation.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IDonation extends Document {
  fundraiserId: mongoose.Types.ObjectId;
  donorName: string;
  donorPhone: string;
  amount: number;
  message?: string;
  anonymous: boolean;
  mpesaTransactionId?: string;
  mpesaCheckoutRequestId?: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: Date;
}

const DonationSchema = new Schema<IDonation>(
  {
    fundraiserId:          { type: Schema.Types.ObjectId, ref: 'Fundraiser', required: true },
    donorName:             { type: String, required: true },
    donorPhone:            { type: String, required: true },
    amount:                { type: Number, required: true, min: 10 },
    message:               { type: String, maxlength: 200 },
    anonymous:             { type: Boolean, default: false },
    mpesaTransactionId:    { type: String },
    mpesaCheckoutRequestId:{ type: String },
    status:                { type: String, enum: ['pending','confirmed','failed'], default: 'pending' },
  },
  { timestamps: true }
);

DonationSchema.index({ fundraiserId: 1, status: 1 });
DonationSchema.index({ mpesaCheckoutRequestId: 1 });

export default mongoose.models.Donation ||
  mongoose.model<IDonation>('Donation', DonationSchema);
