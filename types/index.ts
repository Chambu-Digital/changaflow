// types/index.ts

export interface User {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  avatar?: string;
  verified: boolean;
  createdAt: string;
}

export interface Fundraiser {
  _id: string;
  title: string;
  description: string;
  story: string;
  goalAmount: number;
  amountRaised: number;
  currency: 'KES';
  category: FundraiserCategory;
  images: string[];
  creator: User;
  creatorId: string;
  phoneNumber: string;         // M-Pesa receiving number
  paybillNumber?: string;
  status: 'pending' | 'active' | 'completed' | 'paused' | 'removed';
  verified: boolean;
  donorCount: number;
  updates: FundraiserUpdate[];
  endDate?: string;
  urgent: boolean;
  slug: string;
  createdAt: string;
  updatedAt: string;
}

export type FundraiserCategory =
  | 'medical'
  | 'education'
  | 'business'
  | 'funeral'
  | 'emergency'
  | 'community'
  | 'religious'
  | 'other';

export interface FundraiserUpdate {
  _id: string;
  message: string;
  createdAt: string;
}

export interface Donation {
  _id: string;
  fundraiserId: string;
  donorName: string;
  donorPhone: string;
  amount: number;
  message?: string;
  anonymous: boolean;
  mpesaTransactionId?: string;
  status: 'pending' | 'confirmed' | 'failed';
  createdAt: string;
}

export interface MpesaSTKPushRequest {
  phoneNumber: string;
  amount: number;
  fundraiserId: string;
  donorName: string;
  message?: string;
  anonymous?: boolean;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}
