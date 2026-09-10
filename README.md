# Trustlink

Trustlink is a Next.js marketplace app for service and product discovery, booking, checkout, and trust-focused verification flows.

## Features

- Service browsing and category pages
- Booking flow for service requests
- Checkout and order creation
- Admin verification and provider management
- Trust score and trust badge components
- Prisma database integration
- Tailwind-based UI styling

## Tech Stack

- Next.js 15
- React
- TypeScript
- Prisma
- SQLite (local DB)
- Tailwind CSS

## Requirements

- Node.js 18+
- npm

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Pranav-gandhale/trustlink09.git
   cd trustlink09
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create your environment file:
   ```bash
   copy .env.example .env.local
   ```
   or on macOS/Linux:
   ```bash
   cp .env.example .env.local
   ```

4. Update environment variables in `.env.local` as needed for your local setup.

5. Run the app:
   ```bash
   npm run dev
   ```

6. Open the app in your browser:
   ```text
   http://localhost:3000
   ```

## Project Scripts

```bash
npm run dev
npm run build
npm run start
```

## Database

This project uses Prisma. To initialize or apply migrations locally:

```bash
npx prisma migrate dev
```

## Notes

- The repository includes a local SQLite database file under `prisma/dev.db`.
- Sensitive environment values should not be committed to version control.

## License

This project is for personal or educational use unless a different license is specified.
