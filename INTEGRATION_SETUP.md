# Integration Setup Guide

This guide explains how to set up and run the full-stack ticket management application with the frontend (Next.js) and backend (NestJS) integrated.

## Prerequisites

- Node.js (v18 or higher)
- npm or pnpm

## Project Structure

```
ticket_management_fullapp/
├── ticket-management-api/    # NestJS Backend API
└── v0-uix-ticket-qf/          # Next.js Frontend
```

## Backend Setup (NestJS API)

1. Navigate to the backend directory:
```bash
cd ticket-management-api
```

2. Install dependencies:
```bash
npm install
```

3. Seed a test account (creates default credentials):
```bash
npm run seed:account
```

This creates:
- Account SID: `AC123456789`
- API Key: `sk_live_abc123xyz456`

4. Start the backend server:
```bash
npm run start:dev
```

The API will run on `http://localhost:3000`

**Note**: Swagger documentation is available at `http://localhost:3000/api/docs` (development only)

## Frontend Setup (Next.js)

1. Navigate to the frontend directory:
```bash
cd v0-uix-ticket-qf
```

2. Install dependencies:
```bash
npm install
# or
pnpm install
```

3. Configure environment variables:

Create a `.env.local` file in `v0-uix-ticket-qf/`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_ACCOUNT_SID=AC123456789
NEXT_PUBLIC_API_KEY=sk_live_abc123xyz456
```

**Important**: Replace these values with your actual credentials if you've seeded a different account.

4. Start the frontend development server:
```bash
npm run dev
# or
pnpm dev
```

The frontend will run on `http://localhost:3001`

## Running Both Services

### Option 1: Separate Terminals

**Terminal 1 - Backend:**
```bash
cd ticket-management-api
npm run start:dev
```

**Terminal 2 - Frontend:**
```bash
cd v0-uix-ticket-qf
npm run dev
```

### Option 2: Using a Process Manager

You can use tools like `concurrently` or `npm-run-all` to run both services together.

## Accessing the Application

- **Frontend UI**: http://localhost:3001
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs

## Environment Variables

### Backend (`ticket-management-api/.env`)
```env
NODE_ENV=development
PORT=3000
DB_DATABASE=database.sqlite
DB_SYNCHRONIZE=true
FRONTEND_URL=http://localhost:3001
```

### Frontend (`v0-uix-ticket-qf/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_API_ACCOUNT_SID=AC123456789
NEXT_PUBLIC_API_KEY=sk_live_abc123xyz456
```

## Key Integration Points

### CORS Configuration
The backend is configured to allow requests from `http://localhost:3001`. This can be changed in `ticket-management-api/src/main.ts`.

### API Client
The frontend uses `v0-uix-ticket-qf/lib/api.ts` to communicate with the backend. This file:
- Maps backend data formats to frontend formats
- Handles authentication headers
- Transforms topic enums to topic objects
- Extracts titles from descriptions (since backend doesn't have a separate title field)

### Data Format Differences

The backend and frontend have some format differences that are handled automatically:

1. **Title Field**: Backend doesn't have a `title` field. The frontend combines title and description when creating tickets, and extracts the title when reading.

2. **Topics**: Backend uses enum values (`billing`, `bug`, `feature`, `other`), while frontend expects topic objects with IDs. The API client maps between these formats.

3. **Requester Name**: Backend doesn't store requester names. The frontend uses a placeholder or the name provided during ticket creation.

## Troubleshooting

### Port Conflicts
- Backend runs on port 3000
- Frontend runs on port 3001
- If you need different ports, update:
  - Backend: `PORT` in `.env` or `ticket-management-api/src/main.ts`
  - Frontend: `-p` flag in `package.json` scripts and `FRONTEND_URL` in backend `.env`

### CORS Errors
If you see CORS errors, ensure:
1. Backend CORS is configured for the correct frontend URL
2. Both services are running
3. Environment variables are set correctly

**For Production Deployment:**
- Ensure `FRONTEND_URL` in Railway matches your Vercel production domain exactly
- Check browser Network tab to see the exact `Origin` header being sent
- Vercel provides multiple URLs; use the production domain (not preview URLs)
- See [DEPLOYMENT.md](../DEPLOYMENT.md) for detailed CORS troubleshooting

### Authentication Errors
If API calls fail with 401 errors:
1. Verify the account SID and API key in `.env.local`
2. Run `npm run seed:account` in the backend to create/verify credentials
3. Check that the headers are being sent correctly (see browser DevTools Network tab)

### Database Issues
The backend uses SQLite. If you encounter database errors:
1. Delete `ticket-management-api/database.sqlite` to reset
2. Restart the backend (it will recreate the database)
3. Run `npm run seed:account` again

## Next Steps

1. **Customize Topics**: The current topic mapping is hardcoded. Consider adding a topics endpoint to the backend for dynamic topic management.

2. **User Management**: Implement proper user authentication and management instead of using mock user data.

3. **Title Field**: Consider adding a `title` field to the backend ticket entity for better separation of concerns.

4. **Error Handling**: Enhance error handling and user feedback in the frontend.

## Support

For API documentation, visit: http://localhost:3000/api/docs


