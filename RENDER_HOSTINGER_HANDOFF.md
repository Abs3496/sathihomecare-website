# Render + Hostinger Handoff

This is the exact deployment checklist for taking Sathi Homecare live cleanly.

## 1. Hostinger MySQL First

Run these SQL files on the production Hostinger MySQL database in this order:

1. [backend/sql/mysql/prod_auth_schema_fix.sql](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/backend/sql/mysql/prod_auth_schema_fix.sql:1)
2. [backend/sql/mysql/prod_diagnostics.sql](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/backend/sql/mysql/prod_diagnostics.sql:1)

Confirm after running diagnostics:

- at least one `ADMIN` row exists in `users`
- partner accounts have matching `partner_profiles.employee_id`
- `users` contains `full_name`, `role`, `active`, `created_at`, `updated_at`

## 2. Render Backend Env Vars

Set these in the Render service exactly:

```env
SERVER_PORT=8080
DB_URL=jdbc:mysql://YOUR_HOSTINGER_HOST:3306/YOUR_DATABASE?useSSL=true&requireSSL=true&serverTimezone=UTC
DB_USERNAME=YOUR_DATABASE_USER
DB_PASSWORD=YOUR_DATABASE_PASSWORD
JPA_DDL_AUTO=update
JPA_SHOW_SQL=false
JWT_SECRET=REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_BYTES
JWT_EXPIRATION_MS=86400000
APP_PAYMENT_UPI_ID=8090806731@ybl
APP_PAYMENT_MERCHANT_NAME=SATHIHOMECARE
APP_PAYMENT_SUPPORT_WHATSAPP=918090806731
APP_PAYMENT_PROOF_UPLOAD_DIR=uploads/payment-proofs
APP_EMAIL_FROM=SATHIHOMECARE <bookings@sathihomecare.com>
APP_EMAIL_ADMIN_TO=YOUR_REAL_ADMIN_EMAIL
RESEND_API_KEY=
APP_CORS_ALLOWED_ORIGINS=https://sathihomecare.in,https://www.sathihomecare.in
APP_BOOTSTRAP_ADMIN1_NAME=Abhishek Admin
APP_BOOTSTRAP_ADMIN1_EMAIL=YOUR_REAL_ADMIN_EMAIL
APP_BOOTSTRAP_ADMIN1_PHONE=YOUR_REAL_ADMIN_PHONE
APP_BOOTSTRAP_ADMIN1_PASSWORD=YOUR_REAL_ADMIN_PASSWORD
APP_BOOTSTRAP_ADMIN2_NAME=
APP_BOOTSTRAP_ADMIN2_EMAIL=
APP_BOOTSTRAP_ADMIN2_PHONE=
APP_BOOTSTRAP_ADMIN2_PASSWORD=
```

Notes:

- `APP_BOOTSTRAP_ADMIN1_EMAIL` and `APP_BOOTSTRAP_ADMIN1_PASSWORD` are mandatory if you want the backend to auto-create the admin account.
- Keep `JPA_DDL_AUTO=update` for now because the schema fix SQL is already included.
- If your backend domain is still `https://sathihomecare-backend.onrender.com`, that is fine. Use the real backend URL in frontend env.

## 3. Hostinger Frontend Env Vars

Set these in the frontend build environment or final `.env.production`:

```env
VITE_API_BASE_URL=https://YOUR_RENDER_BACKEND_DOMAIN/api
```

If your final backend URL is:

- `https://sathihomecare-backend.onrender.com`

then use:

```env
VITE_API_BASE_URL=https://sathihomecare-backend.onrender.com/api
```

## 4. Render Deploy Checks

After backend deploy, verify:

1. `GET https://YOUR_RENDER_BACKEND_DOMAIN/api/health`
2. Render logs show successful startup with no SQL grammar errors
3. Run [backend/sql/mysql/prod_diagnostics.sql](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/backend/sql/mysql/prod_diagnostics.sql:1) again
4. Confirm admin row exists in MySQL

## 5. Hostinger Deploy Checks

After frontend deploy, verify:

1. home page loads
2. customer register works
3. admin login works
4. partner login works with employee ID
5. no browser console error for failed API URL or CORS

## 6. Launch Blockers

Do not launch if any of these fail:

- register returns `500`
- admin login returns `404`
- partner login returns `Partner not found` for a known existing employee ID
- frontend is still pointing to the wrong backend domain
- MySQL does not contain an `ADMIN` user row
