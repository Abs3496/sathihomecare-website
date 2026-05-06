# Sathi Homecare

Sathi Homecare is a full-stack homecare booking platform with:

- a React + Vite frontend
- a Spring Boot backend
- customer login and registration
- partner and admin dashboards
- service catalogue browsing
- booking creation and tracking
- admin partner/service management
- direct UPI payment intents with UTR/proof verification endpoints

## Project Structure

- `src/`: frontend application
- `backend/`: Spring Boot API
- `public/`: static frontend assets

## Frontend Setup

From the project root:

```bash
npm install
npm run dev
```

The Vite dev server runs on `http://localhost:5173` by default and proxies `/api` requests to the backend at `http://localhost:8080`.

Useful frontend commands:

```bash
npm run lint
npm run build
```

## Backend Setup

From `backend/`:

```bash
mvn spring-boot:run
```

Useful backend commands:

```bash
mvn test
mvn spring-boot:run
```

The backend uses H2 by default for local development and exposes health checks at:

```text
http://localhost:8080/api/health
```

Swagger UI is available at:

```text
http://localhost:8080/swagger-ui/index.html
```



Customers sign up using the registration flow. Partner accounts are created by admin from the dashboard.

## Environment Notes

Frontend environment values:

- `VITE_API_BASE_URL`

Backend environment values:

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
- `JPA_DDL_AUTO`
- `JPA_SHOW_SQL`
- `APP_CORS_ALLOWED_ORIGINS`
- `APP_BOOTSTRAP_ADMIN1_EMAIL`
- `APP_BOOTSTRAP_ADMIN1_PASSWORD`

## Production DB Note

If the production MySQL database already exists, run these before the next backend deploy:

- [backend/sql/mysql/prod_auth_schema_fix.sql](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/backend/sql/mysql/prod_auth_schema_fix.sql:1)
- [backend/sql/mysql/prod_diagnostics.sql](C:/Users/LENOVO/OneDrive/Desktop/sathi-front/sathi-front/backend/sql/mysql/prod_diagnostics.sql:1)

## Current Known Constraints

- Checkout currently supports one service per booking.
- Online payment uses UPI deep links, QR fallback, and post-payment UTR submission.
- Java 21 is the target baseline; the backend build now also enables Byte Buddy experimental mode during tests to behave better on newer JDKs.
