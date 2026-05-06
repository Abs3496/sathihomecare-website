# Sathi Homecare Launch Checklist

This checklist tracks what is already completed in the product and what still needs to be finalized before company launch.

## 1. Product Flow

- [x] Customers can register and login with real accounts
- [x] Admin login is restricted to the company admin account
- [x] Employee accounts are created by admin only
- [x] Customers can place bookings from the website
- [x] Admin can manage services, partners, and bookings
- [x] Customer dashboard shows booking history and payment state
- [x] Pending-payment bookings can be paid later from customer dashboard

## 2. Payment Flow

- [x] UPI deep-link checkout integrated
- [x] UTR/proof verification wired through backend
- [x] Pending-payment retry flow added
- [x] Admin cannot assign unpaid bookings
- [x] Legal consent checkbox added before booking
- [ ] Confirm production UPI ID `8090806731@ybl`
- [ ] Configure `RESEND_API_KEY` if email delivery should be active
- [ ] Test UPI app launch on Android
- [ ] Test QR fallback from desktop
- [ ] Test payment proof upload and retry flow

## 3. Legal and Compliance

- [x] Privacy Policy page added
- [x] Terms & Conditions page added
- [x] Refund & Cancellation Policy page added
- [x] Footer links added for legal pages
- [ ] Replace `Effective Date: [Insert Date]` with final date
- [ ] Review legal wording with company/legal advisor if needed
- [ ] Confirm support email and phone on legal pages

## 4. Admin Operations

- [x] Admin dashboard empty states improved
- [x] Booking payment badges added
- [x] Booking filters added for booking status, payment status, and search
- [ ] Final manual check of admin workflow:
- [ ] Create employee
- [ ] Create/update service
- [ ] View customer booking
- [ ] Assign employee after successful payment
- [ ] Update booking lifecycle

## 5. Customer Experience

- [x] Checkout validation improved
- [x] Pending payment messaging improved
- [x] Dashboard pay-now flow added
- [ ] Final mobile responsiveness pass on:
- [ ] Home page
- [ ] Services page
- [ ] Checkout page
- [ ] User dashboard
- [ ] Admin dashboard
- [ ] Replace any remaining temporary company text if needed

## 6. Technical Verification

- [x] Frontend lint passes
- [x] Frontend production build passes
- [x] Backend tests pass
- [x] Java 25 test compatibility issue fixed
- [ ] Run full frontend + backend together on final env values
- [ ] Do one full end-to-end booking test from registration to assignment

## 7. Deployment Readiness

- [ ] Final frontend env file
- [ ] Final backend env file
- [ ] Production database configuration
- [ ] Run `backend/sql/mysql/prod_auth_schema_fix.sql`
- [ ] Confirm seeded admin exists after backend boot
- [ ] Final frontend domain
- [ ] Final backend domain
- [ ] HTTPS enabled
- [ ] CORS updated for production domain
- [ ] Deploy frontend
- [ ] Deploy backend
- [ ] Final smoke test on production URLs

## 8. Nice To Do Before Launch

- [ ] Compress heavy image assets for faster loading
- [ ] Add company favicon/logo polish if needed
- [ ] Add support/contact page if required
- [ ] Add analytics/monitoring setup

## Launch Decision

### Ready after these are done

Minimum required before launch:

- production UPI ID and optional Resend email configured
- effective dates filled
- production env configured
- one successful end-to-end payment tested
- one successful admin assignment tested
- deployment smoke test completed
