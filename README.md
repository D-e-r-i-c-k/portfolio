# Photography Website

A professional photography website for showcasing work, listing events, selling photos, and delivering high-quality images to clients. Built for South Africa with ZAR payments, protected previews, and secure full-resolution downloads.

## Tech stack

- **Frontend:** Next.js (React), Tailwind CSS, shadcn/ui
- **Content:** Sanity (headless CMS)
- **Images:** Sanity CDN (optional: Cloudinary for transforms and watermarking)
- **Payments:** PayFast (ZAR) or Stripe
- **Forms:** Formspree
- **Hosting:** Vercel

## Prerequisites

- Node.js 18+
- npm or pnpm
- Sanity account
- PayFast or Stripe merchant account (for photo sales)

## Setup

1. **Clone and install**

   ```bash
   git clone <repo-url>
   cd portfolio
   npm install
   ```

2. **Environment variables**

   Copy `.env.example` to `.env.local` and fill in values. See [Environment variables](#environment-variables) below.

3. **Run development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Build for production**

   ```bash
   npm run build
   npm start
   ```

## Environment variables

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` | Sanity project ID (public) |
| `NEXT_PUBLIC_SANITY_DATASET` | Sanity dataset (e.g. `production`) |
| `SANITY_API_READ_TOKEN` | Optional: token for server-side or private content |
| `PAYFAST_MERCHANT_ID` | PayFast merchant ID (payments) |
| `PAYFAST_MERCHANT_KEY` | PayFast merchant key (keep secret) |
| `PAYFAST_PASSPHRASE` | PayFast passphrase if set |
| `NEXT_PUBLIC_FORMSPREE_ENDPOINT` | Formspree form ID for contact form |
| `CLOUDINARY_CLOUD_NAME` | Optional: for image transforms/watermarks |

See `.env.example` for a full list with placeholders.

## Project structure

(To be expanded as the app is built.)

- `src/app/` – Next.js App Router pages and layouts
- `src/components/` – React components
- `sanity/` – Sanity Studio and schemas (if co-located)
- `public/` – Static assets

## Deploy

- **Vercel:** Connect this repo to Vercel; set environment variables in the dashboard. Each push to `main` deploys.
- Ensure `NEXT_PUBLIC_*` and server-side env vars are set in the Vercel project.

## License

MIT – see [LICENSE](LICENSE).
