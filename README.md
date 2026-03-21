# Music App Monorepo

A modern, full-stack music streaming application (Spotify clone) built with Next.js, NestJS, and Shared Packages.

## Project Structure

- `apps/web`: Next.js frontend with Tailwind CSS and Framer Motion.
- `apps/api`: NestJS backend API with an in-memory storage system.
- `apps/mobile`: (Placeholder) Mobile application workspace.
- `packages/shared`: Shared TypeScript types and utilities.

## Getting Started

### Prerequisites

- Node.js (v18+ recommended)
- npm

### Installation

Run the following command in the root directory to install dependencies for all workspaces:

```bash
npm install
```

### Running the Application

To start both the frontend and backend simultaneously:

```bash
npm run dev:all
```

Alternatively, you can run them separately:

- **Backend (API)**: `npm run dev:api` (runs on http://localhost:3001)
- **Frontend (Web)**: `npm run dev:web` (runs on http://localhost:3000)

## Features

- **Music Search**: Powered by the JioSaavn API.
- **Real-time Player**: Smooth playback controlled via Zustand.
- **In-Memory Store**: Likes and Playlists are persisted in the API's memory for this demo (No MongoDB required).
- **Guest Login**: Instant access without complex authentication setup.

## Technical Details

- **Frontend**: Next.js 14, Lucide Icons, Shadcn UI components.
- **Backend**: NestJS, Swagger documentation (available at `/api-docs`).
- **State Management**: Zustand for both auth and music playback.
