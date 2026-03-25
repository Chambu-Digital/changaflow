// models/Fundraiser.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IFundraiserUpdate {
  message: string;
  createdAt: Date;
}

export interface IFundraiser extends Document {
  title: string;
  description: string;
  story: string;
  goalAmount: number;
  amountRaised: number;
  currency: string;
  category: string;
  images: string[];
  creatorId: mongoose.Types.ObjectId;
  phoneNumber: string;
  paybillNumber?: string;
  status: 'pending' | 'active' | 'completed' | 'paused' | 'removed';
  activationCheckoutId?: string;   // M-Pesa checkout ID for the KES 50 activation
  platformFeeRate: number;         // 0.025 = 2.5%
  withdrawnAt?: Date;
  verified: boolean;
  donorCount: number;
  updates: IFundraiserUpdate[];
  endDate?: Date;
  urgent: boolean;
  slug: string;
  shareCount: number;
  viewCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const UpdateSchema = new Schema<IFundraiserUpdate>({
  message:   { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const FundraiserSchema = new Schema<IFundraiser>(
  {
    title:         { type: String, required: true, trim: true, maxlength: 100 },
    description:   { type: String, required: true, maxlength: 300 },
    story:         { type: String, required: true },
    goalAmount:    { type: Number, required: true, min: 100 },
    amountRaised:  { type: Number, default: 0 },
    currency:      { type: String, default: 'KES' },
    category:      {
      type: String,
      required: true,
      enum: ['medical','education','business','funeral','emergency','community','religious','other'],
    },
    images:        [{ type: String }],
    creatorId:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
    phoneNumber:   { type: String, required: true },
    paybillNumber: { type: String },
    status:        { type: String, enum: ['pending','active','completed','paused','removed'], default: 'pending' },
    activationCheckoutId: { type: String },
    platformFeeRate: { type: Number, default: 0.025 },
    withdrawnAt:   { type: Date },
    verified:      { type: Boolean, default: false },
    donorCount:    { type: Number, default: 0 },
    updates:       [UpdateSchema],
    endDate:       { type: Date },
    urgent:        { type: Boolean, default: false },
    slug:          { type: String, required: true, unique: true },
    shareCount:    { type: Number, default: 0 },
    viewCount:     { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Text search index
FundraiserSchema.index({ title: 'text', description: 'text', story: 'text' });
FundraiserSchema.index({ category: 1, status: 1 });
FundraiserSchema.index({ creatorId: 1 });

export default mongoose.models.Fundraiser ||
  mongoose.model<IFundraiser>('Fundraiser', FundraiserSchema);
