# 📱 Car Installment Tracker (PIN-Protected)

A mobile-first Progressive Web App (PWA) for tracking weekly Monday-based car installment payments with PIN-protected data editing.

## ✨ Features

### Core Functionality
- **Monday-Based Payments**: All payments are tracked on a Monday → Sunday weekly basis
- **PIN Protection**: 4-6 digit PIN required for all data edits (loan details, payments, receipts)
- **Dual Interest Input**: Support for interest rate (%) OR final total payable
- **Payment Status**: Automatic detection of PAID, MISSED, and UPCOMING payments
- **Receipt Management**: Upload, preview, and manage payment receipts (PNG/JPEG, max 5MB)
- **Live Dashboard**: Real-time metrics including progress, amounts paid, remaining balance
- **Calendar View**: Visual Monday-locked calendar with color-coded payment status

### Security
- **PIN Hashing**: Uses SHA-256 via Web Crypto API (never stores raw PINs)
- **Local Storage**: All data stored locally using IndexedDB (no backend required)
- **PIN Verification**: Required for all protected actions (edits, uploads, deletions)

### User Experience
- **Mobile-First Design**: Optimized for one-hand usage with large tap targets
- **Bottom Navigation**: Easy access to Dashboard and Calendar views
- **Bottom Sheet Modals**: Native-feeling mobile interactions
- **Offline-First**: Works completely offline, no internet required
- **PWA Ready**: Installable as a standalone app on mobile devices

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn/pnpm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - Navigate to `http://localhost:5173` (or the port shown in terminal)
   - For mobile testing, use your local network IP address

### Building for Production

```bash
npm run build
```

The production build will be in the `dist` folder. You can preview it with:

```bash
npm run preview
```

### Deploying to Vercel

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

Quick start:
1. Install dependencies: `npm install`
2. Set up Vercel Blob storage in your Vercel project
3. Add `BLOB_READ_WRITE_TOKEN` environment variable
4. Deploy: `vercel --prod` or connect via GitHub

The app uses Vercel Blob for receipt storage while keeping loan data local in IndexedDB.

## 📖 Usage Guide

### Onboarding Flow

1. **PIN Setup** (First Launch)
   - Create a 4-6 digit numeric PIN
   - Confirm your PIN
   - PIN is hashed and stored securely

2. **Loan Setup**
   - Enter car purchase price (principal)
   - Choose interest input method:
     - **Option A**: Interest rate (%)
     - **Option B**: Final total payable
   - Enter weekly installment amount
   - Set loan duration (weeks)
   - Select loan start date (auto-adjusted to Monday)

### Main App

#### Dashboard View
- View live metrics: principal, interest, total payable, amount paid, remaining balance
- See progress percentage and week statistics (paid, missed, remaining)
- View loan details summary

#### Calendar View
- Visual grid of all payment weeks
- Color coding:
  - 🟢 Green = Paid
  - 🔴 Red = Missed
  - ⚪ Gray = Upcoming
- Tap any week to edit (requires PIN)

#### Editing Payments
1. Select a week from the calendar
2. Enter PIN when prompted
3. In the payment bottom sheet:
   - Toggle "Mark as Paid" to record payment
   - Set payment date (must be Monday)
   - Enter amount paid
   - Upload receipt image (optional)
   - Save or delete payment

## 🔒 Security Model

### PIN Storage
- PINs are hashed using SHA-256 via Web Crypto API
- Only the hash is stored in IndexedDB
- Raw PINs are never persisted

### PIN Protection
PIN is required for:
- ✅ Editing loan details
- ✅ Adding/editing payments
- ✅ Uploading/deleting receipts
- ✅ Resetting data

PIN is NOT required for:
- ❌ Viewing dashboard
- ❌ Viewing calendar
- ❌ Viewing payment history

### Data Storage
- All data stored locally in IndexedDB
- No backend or cloud sync
- Data persists across browser sessions
- Single-user app (no multi-user support)

## 🧮 Financial Logic

### Interest Rate Mode
```
interestAmount = principal × (rate / 100)
totalPayable = principal + interestAmount
```

### Total Payable Mode
```
interestAmount = totalPayable − principal
effectiveInterestRate = (interestAmount / principal) × 100
```

### Payment Status Calculation
- **PAID**: Payment exists with a payment date
- **MISSED**: Today > week end date AND no payment exists
- **UPCOMING**: Week hasn't ended yet

Status recalculates dynamically based on current date.

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── PINModal.tsx     # PIN verification modal
│   ├── PINSetup.tsx     # Onboarding PIN creation
│   ├── LoanSetup.tsx    # Onboarding loan setup
│   ├── Dashboard.tsx    # Main dashboard view
│   ├── Calendar.tsx     # Calendar grid view
│   ├── PaymentBottomSheet.tsx  # Payment edit modal
│   └── BottomNav.tsx    # Bottom navigation
├── utils/               # Utility functions
│   ├── pin.ts           # PIN hashing & verification
│   ├── db.ts            # IndexedDB operations
│   ├── dateUtils.ts     # Monday-based date calculations
│   ├── finance.ts       # Financial calculations
│   ├── paymentStatus.ts # Status calculation logic
│   └── paymentInitialization.ts  # Payment setup
├── types.ts             # TypeScript type definitions
├── App.tsx              # Main app component
└── main.tsx             # Entry point
```

## 🛠️ Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **TailwindCSS** - Styling
- **Vite** - Build tool
- **IndexedDB (via idb)** - Local database
- **Web Crypto API** - PIN hashing
- **Vite PWA Plugin** - PWA support

## 📱 PWA Installation

### Mobile (iOS/Android)
1. Open the app in your mobile browser
2. Tap the browser's share/menu button
3. Select "Add to Home Screen" or "Install App"
4. The app will appear as a standalone app

### Desktop (Chrome/Edge)
1. Click the install icon in the address bar
2. Or go to Settings → Install App

## 🔮 Version 2 Suggestions

### Potential Enhancements
1. **Session Unlock**: Temporary PIN unlock for 5 minutes after verification
2. **Payment Reminders**: Push notifications for upcoming payments
3. **Export Data**: Export payment history as CSV/PDF
4. **Multiple Loans**: Support tracking multiple car loans
5. **Payment History**: Detailed history view with filters
6. **Charts & Analytics**: Visual charts for payment trends
7. **Backup & Restore**: Export/import data for backup
8. **Dark Mode**: Theme toggle for dark/light mode
9. **Biometric Auth**: Fingerprint/Face ID support (where available)
10. **Offline Sync**: Optional cloud backup (with user's cloud storage)

## 🐛 Troubleshooting

### PIN Not Working
- Ensure you're entering the correct PIN (4-6 digits)
- Try clearing browser data and restarting onboarding

### Data Not Persisting
- Check browser IndexedDB support
- Ensure browser allows local storage
- Try clearing cache and reloading

### Calendar Not Showing Weeks
- Verify loan details are properly set up
- Check that loan start date is a Monday
- Ensure loan duration is greater than 0

## 📄 License

This project is provided as-is for educational and personal use.

## 🤝 Contributing

This is a single-user local app. For modifications, edit the source code directly.

---

**Built with ❤️ for tracking car installment payments securely and efficiently.**

