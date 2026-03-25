// models/User.ts
import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  name: string;
  phone: string;
  email?: string;
  passwordHash: string;
  avatar?: string;
  verified: boolean;
  totalRaised: number;
  createdAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const UserSchema = new Schema<IUser>(
  {
    name:         { type: String, required: true, trim: true },
    phone:        { type: String, required: true, unique: true, trim: true },
    email:        { type: String, unique: true, sparse: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatar:       { type: String },
    verified:     { type: Boolean, default: false },
    totalRaised:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

UserSchema.methods.comparePassword = function (password: string) {
  return bcrypt.compare(password, this.passwordHash);
};

UserSchema.pre('save', async function (next) {
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
