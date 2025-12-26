# Ticket Management Frontend

A modern, responsive web application for managing support tickets. This Next.js frontend provides an intuitive user interface that adapts to different user roles, enabling efficient ticket creation, tracking, and resolution workflows.

*Automatically synced with your [v0.app](https://v0.app) deployments*

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com/santiagodh2010-8907s-projects/v0-uix-ticket)
[![Built with v0](https://img.shields.io/badge/Built%20with-v0.app-black?style=for-the-badge)](https://v0.app/chat/dNv0bC58RXq)

## 🎯 Purpose

This frontend application serves as the user-facing interface for the ticket management system. It provides role-specific views and interactions that enable users to effectively manage support tickets based on their responsibilities within the organization.

The application communicates with a NestJS backend API to perform all data operations, ensuring a clean separation of concerns and maintainable architecture.

## 👥 User Roles & Responsibilities

### Requester
**Who they are**: End users who need support

**What they can do**:
- Enter their requester name upon login (stored as session identity)
- Create new support tickets with title, description, topic, and priority
- View only their own tickets (filtered by requester name)
- Track ticket status and updates
- Requester name is pre-filled and locked when creating tickets

**UI Features**:
- Role selection with requester name prompt
- Ticket creation form with topic selection
- Personal dashboard showing only their tickets
- Ticket detail view (read-only)

### Assignee
**Who they are**: Support staff who resolve tickets

**What they can do**:
- Enter their assignee ID upon login
- View all tickets organized into two sections:
  - **Assigned to Me**: Tickets currently assigned to them
  - **Unassigned Tickets**: Tickets available for assignment
- Update ticket status (created → in_progress → completed)
- Assign tickets to themselves through the ticket detail modal
- Filter tickets by status, priority, and topic

**UI Features**:
- Role selection with assignee ID prompt
- Split-view dashboard (Assigned/Unassigned sections)
- Ticket detail modal with status management
- Automatic assignment when updating tickets

### Admin
**Who they are**: System administrators with full access

**What they can do**:
- All assignee capabilities
- Manage ticket topics (create, edit, enable/disable, delete)
- View all tickets without filtering
- Full system visibility

**UI Features**:
- Settings page for topic management
- Delete confirmation with type-to-confirm
- Topic CRUD operations
- Same ticket management as assignees

## 🛠️ Tech Stack

- **Framework**: Next.js 16 with App Router
- **UI Library**: React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Component Library**: Radix UI (shadcn/ui)
- **State Management**: React Context API
- **Form Handling**: React Hook Form
- **Icons**: Lucide React
- **Theme**: Dark mode support via next-themes

## 🏗️ Architecture & Responsibilities

### Frontend Responsibilities

The frontend handles:
- **User Interface**: All visual components, layouts, and interactions
- **User Experience**: Role-based UI adaptation, form validation, error handling
- **State Management**: User context, form state, UI state
- **Data Presentation**: Transforming API responses into user-friendly displays
- **Client-Side Routing**: Navigation between pages
- **Session Management**: Storing user context and preferences in localStorage

### Backend Responsibilities

The backend handles:
- **Data Persistence**: All database operations
- **Business Logic**: Ticket status transitions, validation rules
- **Authentication**: Account and API key validation
- **Data Integrity**: Enforcing constraints and relationships
- **API Endpoints**: RESTful endpoints for all operations

### Integration Pattern

The frontend communicates with the backend through:
- **API Client** (`lib/api.ts`): Centralized HTTP client that:
  - Maps frontend data structures to backend DTOs
  - Handles authentication headers automatically
  - Transforms backend responses to frontend formats
  - Manages error handling and network issues

- **Data Flow**:
  1. User interacts with UI component
  2. Component calls API client function
  3. API client sends HTTP request to backend with auth headers
  4. Backend processes request and returns response
  5. API client transforms response to frontend format
  6. Component updates UI with new data

## 📁 Project Structure

```
v0-uix-ticket-qf/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Role selection landing page
│   ├── dashboard/         # Main dashboard (role-adaptive)
│   ├── tickets/create/    # Ticket creation form
│   └── settings/          # Admin topic management
├── components/            # Reusable React components
│   ├── ui/               # shadcn/ui base components
│   ├── app-header.tsx    # Application header
│   ├── ticket-detail-modal.tsx
│   └── [role-specific components]
├── lib/                  # Core utilities
│   ├── api.ts           # Backend API client
│   ├── types.ts         # TypeScript type definitions
│   └── user-context.tsx # User state management
└── hooks/               # Custom React hooks
```

## 🚀 Getting Started

For complete setup instructions, environment configuration, and integration details, see **[../INTEGRATION_SETUP.md](../INTEGRATION_SETUP.md)**.

### Quick Overview

1. **Install dependencies**: `npm install` or `pnpm install`
2. **Configure environment**: Create `.env.local` with API credentials
3. **Start development server**: `npm run dev` (runs on port 3001)
4. **Access application**: Open `http://localhost:3001`

### Environment Variables

Required in `.env.local`:
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: `http://localhost:3000`)
- `NEXT_PUBLIC_API_ACCOUNT_SID`: Account SID for authentication
- `NEXT_PUBLIC_API_KEY`: API key for authentication

## 🎨 Key Features

### Role-Based UI Adaptation
- Different dashboards for each role
- Context-aware filtering and permissions
- Role-specific entry flows (requester name, assignee ID prompts)

### Ticket Management
- Create tickets with validation
- View tickets with filtering (status, priority, topic)
- Update ticket status through detail modal
- Real-time stats and counts

### Topic Management (Admin)
- Full CRUD operations for topics
- Delete confirmation with type-to-confirm
- Enable/disable topics
- Persistent storage via localStorage

### User Experience
- Modern, responsive design
- Dark mode support
- Loading states and error handling
- Toast notifications for user feedback
- Accessible components (Radix UI)

## 🔄 Data Transformation

The frontend handles several data transformations to bridge differences between frontend and backend:

- **Topic Mapping**: Backend uses enum values (`billing`, `bug`, etc.), frontend uses topic objects with IDs
- **Title Extraction**: Backend stores title in description, frontend extracts it for display
- **Requester Name**: Stored in backend database, displayed consistently across the UI
- **Status Formatting**: Backend uses snake_case, frontend displays as "In Progress"

## 📚 Documentation

- **[Root README](../README.md)**: Project overview and architecture
- **[INTEGRATION_SETUP.md](../INTEGRATION_SETUP.md)**: Complete setup guide
- **[Backend README](../ticket-management-api/README.md)**: API documentation

## 🚢 Deployment

This repository is automatically synced with [v0.app](https://v0.app) deployments.

**Live Deployment**: [https://vercel.com/santiagodh2010-8907s-projects/v0-uix-ticket](https://vercel.com/santiagodh2010-8907s-projects/v0-uix-ticket)

**Continue Building**: [https://v0.app/chat/dNv0bC58RXq](https://v0.app/chat/dNv0bC58RXq)

### How It Works

1. Create and modify your project using [v0.app](https://v0.app)
2. Deploy your chats from the v0 interface
3. Changes are automatically pushed to this repository
4. Vercel deploys the latest version from this repository

---

**For local development setup, see [INTEGRATION_SETUP.md](../INTEGRATION_SETUP.md)**
