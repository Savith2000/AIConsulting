# MOWOCNC Volunteer Dashboard

A modern volunteer dashboard for Meals on Wheels Orange County, built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🔐 Authentication (Login/Register) with Supabase
- 🎨 Glassmorphism design with Teal (#3BB4C1) primary color
- ✨ Smooth animations and transitions using Framer Motion
- 🛡️ Protected routes with middleware
- 📱 Responsive design

## Tech Stack

- **Next.js 16** - React framework with App Router (Turbopack enabled)
- **TypeScript** - Type safety
- **Supabase** - Authentication and backend
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── app/
│   ├── (auth)/
│   │   └── login/          # Login/Register page
│   ├── dashboard/          # Protected dashboard page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Home page (redirects)
│   └── globals.css         # Global styles
├── components/
│   ├── AnimatedBackground.tsx
│   ├── DashboardContent.tsx
│   └── LogoutButton.tsx
├── lib/
│   └── supabase/
│       ├── client.ts       # Client-side Supabase client
│       └── server.ts       # Server-side Supabase client
└── middleware.ts           # Route protection
```

## Getting Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Navigate to Project Settings > API
3. Copy your Project URL and anon/public key
4. Add them to your `.env.local` file

## Development

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
