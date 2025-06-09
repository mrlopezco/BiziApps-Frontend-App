# Job Bookmark Functionality

This document describes the job bookmarking functionality that has been implemented in the BiziApps application.

## Overview

Users can now bookmark job postings to save them for later review. The bookmark functionality is fully integrated with the Supabase database and follows Next.js 15 best practices.

## Database Schema

The functionality uses a new table `user_job_interactions` with the following structure:

```sql
CREATE TABLE public.user_job_interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    job_id UUID NOT NULL,
    is_favorite BOOLEAN NOT NULL DEFAULT FALSE,
    is_not_interested BOOLEAN NOT NULL DEFAULT FALSE,
    vote_type VOTE_TYPE_ENUM NULL,
    vote_reason TEXT NULL,
    notes TEXT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT unique_user_job_interaction UNIQUE (user_id, job_id),
    CONSTRAINT fk_user_id FOREIGN KEY (user_id) REFERENCES auth.users (id) ON DELETE CASCADE,
    CONSTRAINT fk_job_id FOREIGN KEY (job_id) REFERENCES public.transformed_jobs (id) ON DELETE CASCADE
);
```

## Features Implemented

### 1. Bookmark Toggle

- Users can bookmark/unbookmark jobs from job cards
- Visual feedback with filled/unfilled bookmark icons
- Toast notifications for user feedback
- Optimistic UI updates

### 2. Bookmarks Page

- Dedicated page at `/dashboard/bookmarks`
- Displays all bookmarked jobs in a grid layout
- Pagination support for large numbers of bookmarks
- Empty state when no bookmarks exist

### 3. Server Actions

- `toggleJobBookmark(jobId)` - Toggle bookmark status
- `getUserBookmarkedJobs(page, limit)` - Get paginated bookmarked jobs
- `getUserJobInteractions(jobIds)` - Get interactions for multiple jobs
- Additional actions for future features (voting, notes, not interested)

### 4. API Endpoints

- `GET /api/jobs` - Enhanced to include user interactions
- `GET /api/jobs/bookmarks` - Dedicated endpoint for bookmarked jobs

### 5. Type Safety

- Extended type definitions with `JobWithInteraction`
- Proper TypeScript interfaces for all interactions
- Type-safe server actions and API responses

## File Structure

```
src/
├── lib/
│   ├── types/jobs.ts                    # Extended with interaction types
│   └── actions/job-interactions.ts     # Server actions for bookmarks
├── app/
│   ├── api/jobs/
│   │   ├── route.ts                     # Enhanced with interactions
│   │   └── bookmarks/route.ts           # Bookmarks API endpoint
│   └── dashboard/bookmarks/page.tsx     # Bookmarks page
├── components/
│   ├── jobs/
│   │   ├── job-posting-card.tsx         # Enhanced with bookmark button
│   │   └── job-details-dialog.tsx       # Enhanced with bookmark button
│   └── dashboard/bookmarks/
│       └── bookmarks-page-content.tsx   # Bookmarks page content
```

## Usage

### For Users

1. Browse jobs on the `/jobs` page
2. Click the bookmark icon on any job card to save it
3. View saved jobs on the `/dashboard/bookmarks` page
4. Click the bookmark icon again to remove from bookmarks

### For Developers

```typescript
// Toggle bookmark
const result = await toggleJobBookmark(jobId)
if (result.success) {
  console.log("Bookmark toggled:", result.is_favorite)
}

// Get bookmarked jobs
const bookmarks = await getUserBookmarkedJobs(1, 20)
console.log("Bookmarked jobs:", bookmarks.jobs)
```

## Security

- All actions require user authentication
- Row-level security through Supabase auth
- Server-side validation of user permissions
- Proper error handling and logging

## Performance

- Efficient database queries with proper indexing
- Pagination for large datasets
- Optimistic UI updates for better UX
- Caching through Next.js revalidation

## Future Enhancements

The database schema supports additional features that can be implemented:

1. **Job Voting**: Users can upvote/downvote jobs with reasons
2. **Personal Notes**: Users can add private notes to jobs
3. **Not Interested**: Users can mark jobs as not interested
4. **Advanced Filtering**: Filter bookmarks by various criteria

## Navigation

A "Bookmarks" link has been added to the dashboard sidebar for easy access to saved jobs.
