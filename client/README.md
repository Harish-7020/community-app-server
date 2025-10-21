# NicheCommunity Frontend

A modern, beautiful, and performant frontend for the NicheCommunity social platform built with Next.js 14+, TypeScript, and React 18+.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **UI Library**: React 18+
- **Styling**: Tailwind CSS
- **Components**: Custom Shadcn/ui components
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **State Management**: Zustand
- **Server State**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod validation
- **Real-time**: Socket.io-client
- **Charts**: Recharts
- **HTTP Client**: Axios

## Features

### Core Features
- 🔐 Authentication (Login, Signup, JWT)
- 🏠 Dashboard with analytics
- 👥 Communities (Create, Join, Leave)
- 📝 Posts (Create, Like, Comment)
- 🔔 Real-time notifications via WebSocket
- 🔍 Global search (Users, Communities, Posts)
- 📊 Analytics with charts and metrics
- 👤 User profiles
- ⚙️ Settings page

### UI/UX Features
- 🎨 Beautiful, modern, and unique design
- 🌓 Dark/Light theme toggle
- 📱 Fully responsive (Mobile, Tablet, Desktop)
- ✨ Smooth animations and transitions
- 🎯 Intuitive navigation with sidebar
- 🚀 Fast page loads with optimizations
- ♿ Accessible components

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Backend API running (NestJS)

### Installation

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Set up environment variables:
\`\`\`bash
cp .env.local.example .env.local
\`\`\`

Edit `.env.local` and configure your API URLs:
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_SOCKET_URL=http://localhost:3000
\`\`\`

3. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

4. Open [http://localhost:3001](http://localhost:3001) in your browser.

## Project Structure

\`\`\`
client/
├── app/                      # Next.js App Router pages
│   ├── (main)/              # Main layout pages (authenticated)
│   │   ├── dashboard/       # Dashboard page
│   │   ├── communities/     # Communities list
│   │   ├── community/[id]/  # Community detail
│   │   ├── post/[id]/       # Post detail
│   │   ├── profile/         # User profiles
│   │   ├── search/          # Search page
│   │   ├── analytics/       # Analytics page
│   │   └── settings/        # Settings page
│   ├── auth/                # Authentication pages
│   │   ├── login/
│   │   └── signup/
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Home page
├── components/              # React components
│   ├── ui/                  # Base UI components (Shadcn/ui)
│   ├── Sidebar/             # Sidebar component
│   ├── Header/              # Header with search, notifications
│   ├── CommunityCard/       # Community card component
│   ├── PostCard/            # Post card component
│   ├── AnalyticsWidgets/    # Analytics widgets
│   ├── Modals/              # Modal dialogs
│   └── Providers.tsx        # App providers
├── hooks/                   # Custom React hooks
│   ├── useAuth.ts           # Authentication hooks
│   ├── useCommunities.ts    # Communities hooks
│   ├── usePosts.ts          # Posts hooks
│   ├── useNotifications.ts  # Notifications hooks
│   ├── useSearch.ts         # Search hooks
│   ├── useAnalytics.ts      # Analytics hooks
│   └── useSocket.ts         # Socket.io hook
├── services/                # API services
│   ├── auth.service.ts
│   ├── user.service.ts
│   ├── community.service.ts
│   ├── post.service.ts
│   ├── notification.service.ts
│   ├── search.service.ts
│   └── analytics.service.ts
├── store/                   # Zustand stores
│   ├── useAuthStore.ts      # Auth state
│   ├── useNotificationStore.ts
│   ├── useThemeStore.ts     # Theme state
│   └── useUIStore.ts        # UI state (sidebar, etc.)
├── lib/                     # Utilities
│   ├── api.ts               # Axios instance
│   ├── queryClient.ts       # React Query config
│   ├── utils.ts             # Utility functions
│   └── validations.ts       # Zod schemas
├── types/                   # TypeScript types
│   └── index.ts             # All type definitions
└── utils/                   # Helper functions
    ├── date.ts              # Date formatting
    └── formatter.ts         # Number/text formatting

## Key Features Explained

### Authentication
- JWT-based authentication
- Token stored in localStorage
- Auto-redirect on auth state change
- Protected routes via layout

### Real-time Notifications
- Socket.io WebSocket connection
- Automatic reconnection
- Browser notifications (with permission)
- Real-time updates in notification panel

### State Management
- **Zustand** for global client state (auth, theme, UI)
- **React Query** for server state (data fetching, caching)
- Optimistic updates for likes, comments
- Background data refresh

### Forms & Validation
- React Hook Form for form handling
- Zod for schema validation
- Type-safe form inputs
- Error handling and display

### Animations
- Framer Motion for smooth transitions
- Page transitions
- Component animations
- Hover effects
- Loading states

## API Integration

The frontend communicates with the NestJS backend via:
- RESTful API calls (Axios)
- WebSocket connection (Socket.io) for real-time features

Ensure your backend is running on `http://localhost:3000` or update the `.env.local` file.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Customization

### Theme
- Edit `app/globals.css` for theme colors
- Theme toggle in `store/useThemeStore.ts`

### Components
- Base UI components in `components/ui/`
- Customize using Tailwind classes

### API Endpoints
- Update services in `services/` folder
- Modify API base URL in `.env.local`

## Deployment

### Build for Production
\`\`\`bash
npm run build
\`\`\`

### Deploy to Vercel (Recommended)
\`\`\`bash
npx vercel
\`\`\`

Or connect your GitHub repo to Vercel for automatic deployments.

### Environment Variables
Make sure to set these in your deployment platform:
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_SOCKET_URL`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

Private - All rights reserved

## Support

For issues or questions, contact the development team.
