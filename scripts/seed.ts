// scripts/seed.ts
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI!;

// ── Schemas (inline to avoid Next.js module issues) ──────────────────────────

const UserSchema = new mongoose.Schema(
  {
    name:         { type: String, required: true },
    phone:        { type: String, required: true, unique: true },
    email:        { type: String, unique: true, sparse: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatar:       String,
    verified:     { type: Boolean, default: false },
    totalRaised:  { type: Number, default: 0 },
  },
  { timestamps: true }
);

const FundraiserSchema = new mongoose.Schema(
  {
    title:        { type: String, required: true },
    description:  { type: String, required: true },
    story:        { type: String, required: true },
    goalAmount:   { type: Number, required: true },
    amountRaised: { type: Number, default: 0 },
    currency:     { type: String, default: 'KES' },
    category:     { type: String, required: true },
    images:       [String],
    creatorId:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    phoneNumber:  { type: String, required: true },
    status:       { type: String, default: 'active' },
    verified:     { type: Boolean, default: false },
    donorCount:   { type: Number, default: 0 },
    updates:      [{ message: String, createdAt: { type: Date, default: Date.now } }],
    urgent:       { type: Boolean, default: false },
    slug:         { type: String, required: true, unique: true },
    shareCount:   { type: Number, default: 0 },
    viewCount:    { type: Number, default: 0 },
  },
  { timestamps: true }
);

const DonationSchema = new mongoose.Schema(
  {
    fundraiserId: { type: mongoose.Schema.Types.ObjectId, ref: 'Fundraiser', required: true },
    donorName:    { type: String, required: true },
    donorPhone:   { type: String, required: true },
    amount:       { type: Number, required: true },
    message:      String,
    anonymous:    { type: Boolean, default: false },
    mpesaTransactionId:     String,
    mpesaCheckoutRequestId: String,
    status:       { type: String, default: 'confirmed' },
  },
  { timestamps: true }
);

const User       = mongoose.models.User       || mongoose.model('User', UserSchema);
const Fundraiser = mongoose.models.Fundraiser || mongoose.model('Fundraiser', FundraiserSchema);
const Donation   = mongoose.models.Donation   || mongoose.model('Donation', DonationSchema);

// ── Seed data ────────────────────────────────────────────────────────────────

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('✅ Connected to MongoDB');

  // Clear existing data
  await Promise.all([User.deleteMany({}), Fundraiser.deleteMany({}), Donation.deleteMany({})]);
  console.log('🗑️  Cleared existing data');

  // Users
  const passwordHash = await bcrypt.hash('password123', 12);

  const users = await User.insertMany([
    { name: 'Alice Wanjiru',  phone: '0712345678', email: 'alice@example.com',  passwordHash, verified: true,  totalRaised: 150000 },
    { name: 'Brian Otieno',   phone: '0723456789', email: 'brian@example.com',  passwordHash, verified: true,  totalRaised: 80000  },
    { name: 'Carol Muthoni',  phone: '0734567890', email: 'carol@example.com',  passwordHash, verified: false, totalRaised: 0      },
  ]);
  console.log(`👤 Seeded ${users.length} users`);

  // Fundraisers
  const fundraisers = await Fundraiser.insertMany([
    {
      title: 'Help Mama Wanjiru Beat Cancer',
      description: 'Raising funds for chemotherapy treatment for a mother of three.',
      story: 'Mama Wanjiru was diagnosed with breast cancer in January. She needs KES 500,000 for a full treatment cycle. Every shilling counts.',
      goalAmount: 500000, amountRaised: 150000, category: 'medical',
      images: ['https://placehold.co/800x400?text=Medical+Fund'],
      creatorId: users[0]._id, phoneNumber: '0712345678',
      status: 'active', verified: true, donorCount: 42, urgent: true,
      slug: 'help-mama-wanjiru-beat-cancer',
    },
    {
      title: 'School Fees for Bright Kids in Kibera',
      description: 'Sponsor secondary school education for 10 talented students.',
      story: 'Ten students from Kibera scored highly in their KCPE but cannot afford secondary school fees. Help them continue their education.',
      goalAmount: 200000, amountRaised: 80000, category: 'education',
      images: ['https://placehold.co/800x400?text=Education+Fund'],
      creatorId: users[1]._id, phoneNumber: '0723456789',
      status: 'active', verified: true, donorCount: 28, urgent: false,
      slug: 'school-fees-bright-kids-kibera',
    },
    {
      title: 'Funeral Expenses for John Kamau',
      description: 'Help the Kamau family give their father a dignified send-off.',
      story: 'Mr. John Kamau passed away suddenly leaving behind a young family. They need help covering funeral and burial costs.',
      goalAmount: 80000, amountRaised: 45000, category: 'funeral',
      images: ['https://placehold.co/800x400?text=Funeral+Fund'],
      creatorId: users[2]._id, phoneNumber: '0734567890',
      status: 'active', verified: false, donorCount: 15, urgent: true,
      slug: 'funeral-expenses-john-kamau',
    },
  ]);
  console.log(`🎯 Seeded ${fundraisers.length} fundraisers`);

  // Donations
  const donations = await Donation.insertMany([
    { fundraiserId: fundraisers[0]._id, donorName: 'Brian Otieno',  donorPhone: '0723456789', amount: 5000,  message: 'Stay strong!',       status: 'confirmed', mpesaTransactionId: 'QHX12345' },
    { fundraiserId: fundraisers[0]._id, donorName: 'Anonymous',     donorPhone: '0700000000', amount: 2000,  anonymous: true,               status: 'confirmed', mpesaTransactionId: 'QHX12346' },
    { fundraiserId: fundraisers[1]._id, donorName: 'Alice Wanjiru', donorPhone: '0712345678', amount: 10000, message: 'Education is key!',   status: 'confirmed', mpesaTransactionId: 'QHX12347' },
    { fundraiserId: fundraisers[2]._id, donorName: 'Brian Otieno',  donorPhone: '0723456789', amount: 3000,  message: 'Pole sana familia.', status: 'confirmed', mpesaTransactionId: 'QHX12348' },
  ]);
  console.log(`💰 Seeded ${donations.length} donations`);

  console.log('\n🌱 Seed complete! Test credentials:');
  console.log('   Phone: 0712345678 | Password: password123');
  console.log('   Phone: 0723456789 | Password: password123');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
