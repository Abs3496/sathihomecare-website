# Sathi Homecare Production Deployment Guide

This guide is the final handoff for deploying the Sathi Homecare website and verifying it before launch.

Companion files:

- [RENDER_HOSTINGER_HANDOFF.md](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/RENDER_HOSTINGER_HANDOFF.md:1)
- [POSTMAN_SMOKE_TESTS.md](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/POSTMAN_SMOKE_TESTS.md:1)

## 1. Production Inputs Required

Before deployment, keep these ready:

- frontend domain
- backend domain
- production database credentials
- production UPI ID `8090806731@ybl`
- optional Resend API key for confirmation emails
- final JWT secret
- support email and phone

## 2. Frontend Environment

Create a production `.env` file using [.env.production.example](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/.env.production.example:1).

Required values:

- `VITE_API_BASE_URL=https://your-backend-domain/api`

## 3. Backend Environment

Create backend environment values using [backend/.env.example](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/backend/.env.example:1).

Required values:

- `SERVER_PORT`
- `DB_URL`
- `DB_USERNAME`
- `DB_PASSWORD`
- `JWT_SECRET`
- `JWT_EXPIRATION_MS`
- `APP_PAYMENT_UPI_ID`
- `APP_PAYMENT_MERCHANT_NAME`
- `APP_PAYMENT_SUPPORT_WHATSAPP`
- `APP_PAYMENT_PROOF_UPLOAD_DIR`
- `APP_EMAIL_FROM`
- `APP_EMAIL_ADMIN_TO`
- `RESEND_API_KEY`
- `APP_CORS_ALLOWED_ORIGINS`
- `APP_BOOTSTRAP_ADMIN1_EMAIL`
- `APP_BOOTSTRAP_ADMIN1_PASSWORD`

Important:

- Use `APP_BOOTSTRAP_ADMIN*` env vars for seeded admin users.
- If your Hostinger MySQL database already exists, run [backend/sql/mysql/prod_auth_schema_fix.sql](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/backend/sql/mysql/prod_auth_schema_fix.sql:1) before the next deploy.

## 4. Deployment Order

Recommended order:

1. Backup the production database
2. Run [backend/sql/mysql/prod_auth_schema_fix.sql](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/backend/sql/mysql/prod_auth_schema_fix.sql:1) on Hostinger MySQL
3. Deploy backend with production env values
4. Verify backend health endpoint
5. Run [backend/sql/mysql/prod_diagnostics.sql](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/backend/sql/mysql/prod_diagnostics.sql:1)
6. Deploy frontend with production env values
7. Verify frontend can reach backend correctly
8. Run final smoke tests

## 5. Backend Checks After Deploy

Confirm:

- backend starts without errors
- database connection succeeds
- admin login works
- at least one `ADMIN` row exists in `users`
- partner accounts have matching `partner_profiles.employee_id`
- `/api/health` or actuator health is reachable
- CORS allows your frontend domain
- UPI payment intent creation returns the correct UPI ID and QR link

## 6. Frontend Checks After Deploy

Confirm:

- homepage loads correctly
- services page loads correctly
- customer registration works
- login works
- checkout opens UPI app buttons and QR fallback
- legal pages open from footer
- admin dashboard loads
- customer dashboard loads

## 7. Final Pre-Launch Test Flow

Run this exact end-to-end test:

1. Register a fresh customer account
2. Login as customer
3. Add one service to cart
4. Open checkout
5. Fill patient and address details
6. accept legal checkbox
7. place booking
8. complete payment successfully
9. confirm booking appears in customer dashboard as paid
10. login as admin
11. confirm booking appears in admin dashboard
12. assign employee to booking
13. login as employee
14. confirm assigned booking appears in employee dashboard

## 8. Failure Case Testing

Test these before launch:

- invalid login
- UPI app not installed fallback
- invalid UTR/payment proof rejection
- retry payment from customer dashboard
- booking remains unassignable until payment success
- customer cancellation flow

## 9. Launch Blocking Issues

Do not launch until these are confirmed:

- production SQL fix has been applied on Hostinger
- production UPI ID and optional email settings are configured
- backend is on production database
- JWT secret is changed from placeholder
- admin login works in production
- customer booking + payment flow works
- admin assignment works
- legal pages are visible
- support contact details are correct

## 10. Post-Launch Recommendations

After launch, strongly consider:

- image optimization for faster loading
- log monitoring
- database backups
- uptime monitoring
- analytics tracking

## 11. Short Go-Live Checklist

- [ ] backend deployed
- [ ] frontend deployed
- [ ] env values configured
- [ ] DB connected
- [ ] UPI payment settings added
- [ ] legal pages verified
- [ ] customer booking tested
- [ ] payment tested
- [ ] admin assignment tested
- [ ] employee access tested
- [ ] support info checked
