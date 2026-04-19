# SanityHub

SanityHub is a lightweight key-based file workspace built with Next.js and Sanity.
Users enter a workspace key, upload files, manage them, and share/download from a simple dashboard.

Full feature inventory and roadmap ideas: see `FEATURES.md`.

## Features

- Key-based workspace access (no traditional auth flow)
- Multi-file upload with live progress indicator
- File search, filter, and sort controls
- Per-file actions: download, share, delete
- Custom delete confirmation modal
- Workspace-level wipe action with typed confirmation (GitHub-style)
- Toast notifications for success/error states
- Light/dark theme support

## Tech Stack

- Next.js 15 (App Router)
- React 19
- TypeScript
- Tailwind CSS
- Sanity (content + file assets)
- next-sanity

## Project Structure

```text
app/
	(root)/
		user/[id]/           # Workspace pages by key
	components/            # UI and feature components
sanity/
	lib/                   # Sanity client, queries, upload helpers
	schemaTypes/           # Sanity document schemas
```

## Getting Started

### 1. Clone and install

```bash
git clone https://github.com/yash5800/test_sanity.git
cd test_sanity
npm install
```

### 2. Add environment variables

Create a `.env.local` file in the project root:

```bash
NEXT_PUBLIC_SANITY_API_VERSION=2024-12-19
NEXT_PUBLIC_SANITY_PROJECT_ID=your_project_id
NEXT_PUBLIC_SANITY_DATASET=production
NEXT_PUBLIC_SANITY_TOKEN=your_sanity_token
```

Notes:

- `NEXT_PUBLIC_SANITY_TOKEN` is currently used by browser-side upload/delete actions in this project.
- Use a token with the minimum required permissions.

### 3. Run the app

```bash
npm run dev
```

Open http://localhost:3000

## Available Scripts

- `npm run dev` - Start development server (Turbopack)
- `npm run build` - Build production app
- `npm run start` - Start production server
- `npm run lint` - Run lint checks

## Sanity Schema

The main schema is `post` with these fields:

- `key` (string, required): workspace key
- `filename` (string): file name
- `file` (file, required): uploaded Sanity file asset

## Safety Behavior

- Single-file delete uses a custom confirmation dialog.
- Workspace wipe requires exact typed confirmation: `wipe <workspace-key>`.
- Wipe removes all documents for that key and attempts asset cleanup.

## Deployment

This project is ready for deployment on Vercel.

Before deploying:

- Add all required environment variables in your hosting provider.
- Ensure your Sanity dataset and token permissions are set correctly.

## License

No license file is currently included in this repository.
