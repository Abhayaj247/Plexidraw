# PlexiDraw

**PlexiDraw** is a modern, collaborative drawing application built with Next.js, React, and shadcn/ui. It enables real-time sketching, diagramming, and creative teamwork with a beautiful, responsive UI.

## Tech Stack

### Frontend
- Next.js
- React
- TypeScript
- shadcn/ui (Radix UI + Tailwind CSS)
- Framer Motion (animations)
- Lucide React (icons)

### Backend
- Node.js
- Express.js (HTTP API)
- WebSocket (real-time collaboration)
- Prisma ORM
- PostgreSQL (or your preferred database)
- JWT (authentication)

## Features

- 🎨 **Intuitive Drawing Tools:** Sketch, diagram, and annotate with ease.
- 🧑‍🤝‍🧑 **Real-Time Collaboration:** Draw and chat with your team in shared rooms.
- 🌗 **Theme Toggle:** Instantly switch between Light, Dark, and System themes with a modern toggle.
- 🧭 **Modern Navbar:** Always-visible, semi-transparent, and responsive navigation bar.
- 💬 **Chat Modal:** In-room chat with theme-aware message colors for visibility.
- 🔒 **Authentication:** Only authenticated users can access drawing and chat features.
- 🛡️ **Access Control:** Guests cannot see or delete authorized users' drawings.
- 🧹 **Clean UI:** Modern tooltips, centered sign-out, and consistent design throughout.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [pnpm](https://pnpm.io/) (recommended for monorepo support, or use npm/yarn)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Abhayaj247/Plexidraw.git
   cd plexidraw
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the development servers:**
   ```bash
   pnpm run dev
   ```
   (Or start each app individually as needed.)

### Usage

- Visit `http://localhost:3000` to access the frontend.
- Sign up or sign in to create or join drawing rooms.
- Use the theme toggle in the navbar to switch between Light, Dark, and System themes.
- Start drawing and chatting with your team!

## Project Structure

```
apps/
  plexidraw-frontend/   # Next.js frontend
  http-backend/         # HTTP API backend
  ws-backend/           # WebSocket backend
packages/
  common/               # Shared types and utilities
  db/                   # Database and Prisma schema
  ui/                   # Shared UI components (shadcn/ui)
```

## Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

## License

[MIT](LICENSE)

---

**Enjoy creative collaboration with PlexiDraw!**
