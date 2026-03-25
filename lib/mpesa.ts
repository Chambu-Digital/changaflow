// lib/mpesa.ts

const CONSUMER_KEY = process.env.MPESA_CONSUMER_KEY!;
const CONSUMER_SECRET = process.env.MPESA_CONSUMER_SECRET!;
const SHORTCODE = process.env.MPESA_SHORTCODE!;
const PASSKEY = process.env.MPESA_PASSKEY!;
const CALLBACK_URL = process.env.MPESA_CALLBACK_URL!;

const BASE_URL = 'https://sandbox.safaricom.co.ke'; // Change to https://api.safaricom.co.ke for production

/**
 * Get M-Pesa OAuth token
 */
export async function getMpesaToken(): Promise<string> {
  const credentials = Buffer.from(`${CONSUMER_KEY}:${CONSUMER_SECRET}`).toString('base64');
  
  const response = await fetch(`${BASE_URL}/oauth/v1/generate?grant_type=client_credentials`, {
    method: 'GET',
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!response.ok) {
    throw new Error('Failed to get M-Pesa token');
  }

  const data = await response.json();
  return data.access_token;
}

/**
 * Generate timestamp in YYYYMMDDHHmmss format
 */
export function generateTimestamp(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  return `${year}${month}${day}${hour}${minute}${second}`;
}

/**
 * Generate base64 password for STK push
 */
export function generatePassword(timestamp: string): string {
  const str = `${SHORTCODE}${PASSKEY}${timestamp}`;
  return Buffer.from(str).toString('base64');
}

/**
 * Format phone number to 254XXXXXXXXX
 */
export function formatPhone(phone: string): string {
  phone = phone.replace(/\s+/g, '').replace(/-/g, '');
  if (phone.startsWith('0')) return `254${phone.slice(1)}`;
  if (phone.startsWith('+254')) return phone.slice(1);
  if (phone.startsWith('254')) return phone;
  return `254${phone}`;
}

/**
 * Initiate STK Push
 */
export async function initiateSTKPush({
  phoneNumber,
  amount,
  accountRef,
  description,
}: {
  phoneNumber: string;
  amount: number;
  accountRef: string;
  description: string;
}) {
  const token = await getMpesaToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp);
  const formattedPhone = formatPhone(phoneNumber);

  const body = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    TransactionType: 'CustomerPayBillOnline',
    Amount: Math.ceil(amount),
    PartyA: formattedPhone,
    PartyB: SHORTCODE,
    PhoneNumber: formattedPhone,
    CallBackURL: `${CALLBACK_URL}/api/mpesa/callback`,
    AccountReference: accountRef.slice(0, 12),
    TransactionDesc: description.slice(0, 13),
  };

  const response = await fetch(`${BASE_URL}/mpesa/stkpush/v1/processrequest`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (data.ResponseCode !== '0') {
    throw new Error(data.errorMessage || 'STK Push failed');
  }

  return data; // Contains CheckoutRequestID for status query
}

/**
 * Query STK Push status
 */
export async function querySTKStatus(checkoutRequestId: string) {
  const token = await getMpesaToken();
  const timestamp = generateTimestamp();
  const password = generatePassword(timestamp);

  const body = {
    BusinessShortCode: SHORTCODE,
    Password: password,
    Timestamp: timestamp,
    CheckoutRequestID: checkoutRequestId,
  };

  const response = await fetch(`${BASE_URL}/mpesa/stkpushquery/v1/query`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  return response.json();
}
