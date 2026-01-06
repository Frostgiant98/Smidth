# Implementation Notes

## 🔒 PIN Security Model

### Overview
The app uses a client-side PIN hashing system to protect sensitive data edits. The PIN is never stored in plain text - only a cryptographic hash is persisted.

### Implementation Details

#### PIN Hashing (`src/utils/pin.ts`)
- **Algorithm**: SHA-256 via Web Crypto API
- **Input**: 4-6 digit numeric PIN string
- **Output**: Hex-encoded hash string (64 characters)
- **Storage**: Hash stored in IndexedDB, never raw PIN

#### PIN Flow
1. **Setup**: User creates PIN → Hashed → Stored in IndexedDB
2. **Verification**: User enters PIN → Hashed → Compared with stored hash
3. **Protection**: PIN required for:
   - Editing loan details
   - Adding/editing payments
   - Uploading/deleting receipts
   - Resetting data

#### Security Considerations
- ✅ PIN never leaves the device
- ✅ No backend communication (completely offline)
- ✅ Hash comparison prevents PIN recovery
- ⚠️ Note: Client-side security has limitations - determined attackers could potentially bypass PIN checks in browser DevTools. For production use, consider server-side validation.

### Code Example
```typescript
// Hashing a PIN
const pinHash = await hashPIN('1234');
// Result: '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4'

// Verifying a PIN
const isValid = await verifyPIN('1234', storedHash);
// Returns: true if PIN matches, false otherwise
```

---

## 📅 Date & Payment Logic

### Monday-Based Week System

#### Week Definition
- **Week Start**: Monday (00:00:00)
- **Week End**: Sunday (23:59:59)
- **Payment Day**: Must be Monday (enforced in UI)

#### Date Utilities (`src/utils/dateUtils.ts`)

**Key Functions:**
1. `getMonday(date)` - Returns Monday of the week containing the date
2. `getSunday(date)` - Returns Sunday of the week containing the date
3. `getWeekMondays(startDate, weeks)` - Generates all Monday dates for loan duration
4. `getWeekNumber(weekStartDate, loanStartDate)` - Calculates week index (0-based)

#### Payment Status Logic (`src/utils/paymentStatus.ts`)

**Status Calculation:**
```typescript
function calculatePaymentStatus(payment, today):
  if (payment.paymentDate exists):
    return 'PAID'
  else if (today > payment.weekEndDate):
    return 'MISSED'
  else:
    return 'UPCOMING'
```

**Dynamic Recalculation:**
- Statuses are recalculated on every app load
- Past weeks without payments automatically become MISSED
- Future weeks remain UPCOMING until payment is recorded

#### Example Timeline
```
Loan Start: Monday, Jan 1, 2024
Week 1: Jan 1 (Mon) → Jan 7 (Sun)
Week 2: Jan 8 (Mon) → Jan 14 (Sun)
...

If today is Jan 10:
- Week 1: Status depends on payment existence
- Week 2: UPCOMING (week hasn't ended)
- Week 3+: UPCOMING (future weeks)
```

---

## 💰 Financial Calculations

### Interest Input Modes

#### Mode A: Interest Rate (%)
```
Input: principal, interestRate, weeklyInstallment, duration
Process:
  interestAmount = principal × (interestRate / 100)
  totalPayable = principal + interestAmount
  effectiveInterestRate = interestRate
```

#### Mode B: Final Total Payable
```
Input: principal, totalPayable, weeklyInstallment, duration
Process:
  interestAmount = totalPayable - principal
  effectiveInterestRate = (interestAmount / principal) × 100
```

### Normalized Data Structure
Both modes produce the same normalized structure:
```typescript
{
  principal: number,
  interestAmount: number,
  effectiveInterestRate: number,
  totalPayable: number,
  weeklyInstallment: number,
  loanDurationWeeks: number,
  loanStartDate: string (ISO date, Monday)
}
```

### Dashboard Metrics (`src/utils/finance.ts`)
```typescript
amountPaid = sum of all PAID payments
remainingBalance = totalPayable - amountPaid
progress = (amountPaid / totalPayable) × 100
paidWeeks = count of payments with status 'PAID'
missedWeeks = count of payments with status 'MISSED'
remainingWeeks = loanDurationWeeks - paidWeeks
```

---

## 🗄️ Data Storage (IndexedDB)

### Database Schema
```typescript
interface AppData {
  loanDetails: LoanDetails | null;
  payments: WeeklyPayment[];
  pinHash: string | null;
}
```

### Storage Operations (`src/utils/db.ts`)
- **getAppData()** - Retrieve all app data
- **saveAppData(data)** - Save complete app data
- **savePINHash(hash)** - Update PIN hash
- **saveLoanDetails(details)** - Update loan details
- **savePayments(payments)** - Update payments array
- **updatePayment(weekStartDate, payment)** - Update single payment

### Data Persistence
- All data stored in browser's IndexedDB
- Persists across browser sessions
- Cleared only if user clears browser data
- No cloud sync or backup (local-only)

---

## 🎨 UI/UX Patterns

### Mobile-First Design
- **Bottom Navigation**: Fixed bottom nav for easy thumb access
- **Bottom Sheets**: Slide-up modals for actions (native mobile feel)
- **Large Tap Targets**: Minimum 44×44px for accessibility
- **Touch Optimization**: `touch-action: manipulation` prevents double-tap zoom

### Component Architecture
```
App (Main Router)
├── Onboarding Flow
│   ├── PINSetup (Step 1)
│   └── LoanSetup (Step 2)
└── Main App
    ├── Dashboard (View)
    ├── Calendar (View)
    ├── BottomNav (Navigation)
    ├── PINModal (Protected Actions)
    └── PaymentBottomSheet (Edit Payment)
```

### State Management
- React hooks (`useState`, `useEffect`)
- Local component state
- IndexedDB as source of truth
- Data reloaded on save operations

---

## 🚀 Version 2 Suggestions

### High Priority
1. **Session Unlock**: Cache PIN verification for 5 minutes
2. **Payment Reminders**: Browser notifications for upcoming payments
3. **Data Export**: CSV/PDF export of payment history

### Medium Priority
4. **Multiple Loans**: Support tracking multiple car loans
5. **Payment History View**: Detailed list with filters and search
6. **Charts & Analytics**: Visual progress charts and trends
7. **Backup & Restore**: Export/import JSON data file

### Nice to Have
8. **Dark Mode**: Theme toggle
9. **Biometric Auth**: Fingerprint/Face ID (where available)
10. **Cloud Backup**: Optional sync to user's cloud storage (Google Drive, iCloud)

---

## 🐛 Known Limitations

1. **Client-Side Security**: PIN protection can be bypassed via browser DevTools
2. **No Multi-Device Sync**: Data is device-specific
3. **No Backup**: Data loss if browser data is cleared
4. **Single User**: No multi-user support
5. **No Offline Receipt OCR**: Receipts stored as images only

---

## 📝 Code Quality

### TypeScript
- Strict mode enabled
- Full type coverage
- No `any` types

### Code Organization
- Modular utility functions
- Component-based architecture
- Clear separation of concerns
- Comprehensive comments

### Best Practices
- Error handling in async operations
- Input validation
- Date manipulation with proper timezone handling
- Memory-efficient image storage (base64)

---

**Last Updated**: Implementation complete as of initial build.

