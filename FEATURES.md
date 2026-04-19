# SanityHub Features

This document lists implemented features in the current codebase and proposes high-impact next features.

## Current Features

### 1. Workspace Access
- Key-based workspace access through dynamic routes: `/user/[id]`.
- No traditional auth flow required for the basic workspace flow.
- Quick actions to copy workspace key and workspace URL.

### 2. File Upload
- Multi-file upload support in one action.
- Drag-and-drop upload area.
- Sequential upload progress tracking (percentage and active filename).
- Toast feedback for success and failure states.

### 3. File Listing and Discovery
- Live file list fetched from Sanity documents by key.
- Search by filename.
- Filter by file type (All, DOCX, PDF, PPT/PPTX).
- Sort by created date (Newest and Oldest).
- Mobile detail expansion for compact cards.
- Empty-state feedback for no files and no matches.

### 4. File Actions
- Download a file from its Sanity file URL.
- Secure share link generation with configurable expiry.
- Optional passcode protection for share links.
- Public share page with unlock flow and expiry checks.
- Rename file metadata.
- Copy a file entry to another workspace key (cloned document reference).
- Delete a single file with confirmation dialog.

### 5. Workspace-Level Operations
- Workspace storage overview (per-workspace bytes and file count).
- Global storage overview (server-wide bytes across assets).
- Full workspace wipe action.
- Typed confirmation format for wipe: `wipe <workspace-key>`.
- Asset cleanup attempts after workspace wipe.

### 6. Analytics
- Dedicated analysis page at `/user/[id]/analysis`.
- 14-day daily series generation from upload timestamps.
- KPI cards:
  - Total uploads
  - Workspace bytes
  - Active upload days
  - Average uploads per active day
- Daily charts for upload count and storage growth.

### 7. UI/UX Foundation
- Responsive dashboard and card-based layout.
- Light and dark theme toggle.
- Toast system for non-blocking notifications.
- Alert dialogs for destructive or sensitive actions.
- Loading skeletons and subtle entrance animations.

### 8. Platform/SEO
- Next.js App Router structure.
- Next sitemap generation configured (`next-sitemap`).
- Robots and sitemap assets in `public`.

### 9. Sanity Integration
- Sanity document type `post` to store workspace file records.
- File asset references in documents.
- Live query support via `next-sanity` live API helper.
- Basic key form validation via Zod.

## Notable Gaps

- API route folders exist under `app/api/files/*` but currently have no route handlers.
- Share currently exposes direct file URLs, without expiring or access-controlled links.
- No workspace-level member roles or permissions.
- No upload limits, quotas, or policy controls visible in UI.

## Best Next Feature To Add

### Share Link Revocation Dashboard

Now that secure expiring links exist, the next high-impact step is to add revocation and visibility controls in the workspace UI.

Suggested scope (MVP):
1. List active share links per file (expiry, access count, last accessed).
2. Add one-click revoke action.
3. Add bulk revoke for expired/old links.
4. Add optional automatic cleanup job for expired links.

## Additional High-Value Feature Ideas

1. File Preview Drawer
- Inline preview for PDF and images without leaving the dashboard.

2. Duplicate Detection
- Detect duplicate files by size + checksum on upload.

3. Workspace Quotas
- Enforce per-key file count and storage limits.

4. File Tags and Notes
- Add searchable metadata fields to each file document.

5. Background Virus Scan Hook
- Queue uploads for scanning and mark status in the UI.
