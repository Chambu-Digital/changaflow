# 🇰🇪 ChangaFlow — Kenya's M-Pesa Fundraising Platform

> The easiest way for Kenyans to raise and receive money via M-Pesa.

---

## 🚀 Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

```bash
cp .env.local.example .env.local
```

Fill in your values:

| Variable | Where to get it |
|---|---|
| `MONGODB_URI` | [MongoDB Atlas](https://cloud.mongodb.com) — free tier |
| `JWT_SECRET` | Any random string (run `openssl rand -hex 32`) |
| `MPESA_CONSUMER_KEY` | [Safaricom Developer Portal](https://developer.safaricom.co.ke) |
| `MPESA_CONSUMER_SECRET` | Same as above |
| `MPESA_SHORTCODE` | Use `174379` for sandbox testing |
| `MPESA_PASSKEY` | Safaricom Developer Portal |
| `MPESA_CALLBACK_URL` | Your production URL or use [ngrok](https://ngrok.com) for testing |

### 3. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## 📁 Project Structure

```
ChangaFlow/
├── app/                          # Next.js App Router
│   ├── page.tsx                  # Homepage
│   ├── browse/page.tsx           # Browse all fundraisers
│   ├── create/page.tsx           # Multi-step create form
│   ├── dashboard/page.tsx        # User dashboard
│   ├── how-it-works/page.tsx     # How it works page
│   ├── fundraisers/[slug]/       # Individual fundraiser page
│   │   └── page.tsx
│   ├── auth/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   └── register/route.ts
│   │   ├── fundraisers/
│   │   │   ├── route.ts           # GET (list) + POST (create)
│   │   │   └── [id]/
│   │   │       ├── route.ts       # GET + PATCH single fundraiser
│   │   │       └── update/route.ts # POST campaign update
│   │   ├── mpesa/
│   │   │   ├── initiate/route.ts  # Trigger STK push
│   │   │   ├── callback/route.ts  # Safaricom callback
│   │   │   └── status/route.ts    # Poll payment status
│   │   └── user/
│   │       └── fundraisers/route.ts
│   └── globals.css
│
├── components/
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   ├── fundraiser/
│   │   ├── FundraiserCard.tsx
│   │   ├── DonateModal.tsx        # M-Pesa STK push flow
│   │   └── ShareButton.tsx        # WhatsApp + copy link
│   └── ui/
│       ├── CategoryFilter.tsx
│       └── EmptyState.tsx
│
├── models/
│   ├── User.ts
│   ├── Fundraiser.ts
│   └── Donation.ts
│
├── lib/
│   ├── mongodb.ts                 # DB connection
│   ├── auth.ts                    # JWT utilities
│   ├── mpesa.ts                   # Safaricom Daraja API
│   ├── utils.ts                   # Helpers (formatKES, slugify, etc.)
│   └── store.ts                   # Zustand auth store
│
├── hooks/
│   └── useFundraisers.ts          # Data fetching hooks
│
├── types/
│   └── index.ts                   # TypeScript interfaces
│
├── .env.local.example
├── next.config.js
├── tailwind.config.js
├── tsconfig.json
└── package.json
```

---

## 🔑 M-Pesa Integration Guide

### Sandbox Testing

1. Register at [developer.safaricom.co.ke](https://developer.safaricom.co.ke)
2. Create an app → get Consumer Key & Secret
3. Use shortcode `174379` and the provided passkey for sandbox
4. Use `ngrok http 3000` to get a public callback URL:
   ```bash
   MPESA_CALLBACK_URL=https://abc123.ngrok.io
   ```
5. Test phone number: `254708374149` (Safaricom sandbox test number)

### Going to Production

1. Apply for Safaricom Go-Live approval
2. Replace `sandbox.safaricom.co.ke` with `api.safaricom.co.ke` in `lib/mpesa.ts`
3. Use your real shortcode and passkey

---

## 💳 Payment Flow

```
User clicks "Donate"
    ↓
Frontend → POST /api/mpesa/initiate
    ↓
Server creates pending Donation record
    ↓
Server calls Safaricom Daraja STK Push API
    ↓
User receives M-Pesa prompt on phone
    ↓
User enters PIN
    ↓
Safaricom calls POST /api/mpesa/callback
    ↓
Server confirms donation, updates fundraiser totals
    ↓
Frontend polls GET /api/mpesa/status → shows success
```

---

## 💰 Monetization

Current: **2.5% platform fee** per confirmed donation (deduct in callback handler).

Future ideas:
- **Boost** — pay KES 200 to feature fundraiser on homepage for 48h
- **Verified badge** — one-time KES 500 ID verification
- **Business fundraisers** — premium plan for NGOs/companies

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS |
| State | Zustand (persisted auth) |
| Database | MongoDB via Mongoose |
| Auth | JWT (httpOnly cookies) |
| Payments | Safaricom Daraja API (M-Pesa) |
| Fonts | Playfair Display + DM Sans |
| Icons | Lucide React |

---

## 📦 Production Deployment

### Vercel (recommended)

```bash
npm install -g vercel
vercel
```

Add all `.env.local` variables in Vercel dashboard → Settings → Environment Variables.

### Self-hosted (Ubuntu/VPS)

```bash
npm run build
npm start
```

Use PM2 + Nginx for production process management.

---

## 🤝 Contributing

PRs welcome! Please open an issue first.

---

Built with ❤️ for Kenya 🇰🇪
