# Momentum - Never miss your friends' events again

Momentum automatically tracks your friends' Instagram accounts for event posts and stories, organizing everything in one clean dashboard.

## 🚀 Features

- **Automatic Event Detection**: Monitors Instagram stories and posts for events
- **Clean Dashboard**: Organized view of all upcoming events
- **Calendar Integration**: One-click calendar sync
- **Smart Deduplication**: Removes duplicate events automatically
- **Mobile Responsive**: Works perfectly on all devices

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, React, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Airtable
- **Payments**: Stripe
- **Automation**: Make.com
- **Deployment**: Vercel

## 🔧 Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local` and fill in your environment variables
4. Run the development server: `npm run dev`

## 🔐 Environment Variables

All sensitive keys are stored as environment variables and never committed to the repository:

- `AIRTABLE_BASE_ID` - Your Airtable base ID
- `AIRTABLE_API_KEY` - Your Airtable API key
- `STRIPE_SECRET_KEY` - Your Stripe secret key (server-side only)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (client-side safe)

## 🚀 Deployment

This app is designed to be deployed on Vercel with automatic environment variable management.

## 📝 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

This is a personal project, but feedback and suggestions are welcome!

## 📧 Contact

Built by Daniel - reach out through the app's contact form or find me on social media.
