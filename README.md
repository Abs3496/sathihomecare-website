# Sathi Homecare

Sathi Homecare is a full-stack homecare booking platform with:

- a React + Vite frontend
- a Spring Boot backend
- customer login and registration
- partner and admin dashboards
- service catalogue browsing
- booking creation and tracking
- admin partner/service management
- Razorpay-backed payment order and verification endpoints

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

## Current Known Constraints

- Checkout currently supports one service per booking.
- Cash-on-visit is shown in the UI, but the active backend flow expects online payment.
- Java 21 is the target baseline; the backend build now also enables Byte Buddy experimental mode during tests to behave better on newer JDKs.
