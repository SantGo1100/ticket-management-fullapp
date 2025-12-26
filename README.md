# Ticket Management System

A full-stack support ticket management application built with modern web technologies. This system enables organizations to efficiently track, manage, and resolve support requests through an intuitive interface with role-based access control.

## 🎯 Project Overview

This application provides a complete solution for managing support tickets across different user roles:

- **Requesters** can create and track their support tickets
- **Assignees** can manage and resolve tickets assigned to them
- **Admins** have full system oversight and topic management capabilities

The system implements a clean separation between frontend and backend, with a RESTful API architecture that ensures scalability and maintainability.

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 16 (React 19)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI (shadcn/ui)
- **State Management**: React Context API
- **Form Handling**: React Hook Form

### Backend
- **Framework**: NestJS 10
- **Language**: TypeScript
- **Database**: SQLite with TypeORM
- **Authentication**: Account SID + API Key (bcrypt hashed)
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer

## ✨ Key Features

### Ticket Management
- Create, view, update, and track support tickets
- Status workflow: Created → In Progress → Completed
- Priority levels: Low, Medium, High
- Topic categorization for better organization
- Requester name persistence in database

### Role-Based Access
- **Requester**: Create tickets and view own tickets (filtered by requester name)
- **Assignee**: View all tickets, organized by assignment status (Assigned to Me / Unassigned)
- **Admin**: Full access including topic management

### Topic Management (Admin)
- Create, edit, enable/disable, and delete topics
- Confirmation dialog with type-to-confirm for deletions
- Topics persist across sessions via localStorage

### User Experience
- Modern, responsive UI with dark mode support
- Real-time ticket updates
- Intuitive filtering and search capabilities
- Visual status and priority indicators
- Ticket detail modal for quick actions

## 📁 Project Structure

```
ticket_management_fullapp/
├── ticket-management-api/    # NestJS Backend API
│   ├── src/
│   │   ├── auth/             # Authentication module
│   │   ├── tickets/          # Ticket CRUD operations
│   │   ├── entities/         # TypeORM entities
│   │   └── filters/          # Exception handling
│   └── README.md             # Backend-specific documentation
│
├── v0-uix-ticket-qf/          # Next.js Frontend
│   ├── app/                  # Next.js app router pages
│   ├── components/           # React components
│   ├── lib/                  # API client and utilities
│   └── README.md             # Frontend-specific documentation
│
└── INTEGRATION_SETUP.md      # Full setup and integration guide
```

## 🚀 Quick Start

For detailed setup instructions, environment configuration, and integration details, please refer to **[INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md)**.

### Prerequisites
- Node.js (v18 or higher)
- npm or pnpm

### Quick Overview
1. **Backend**: Navigate to `ticket-management-api/`, install dependencies, seed account, and start server (port 3000)
2. **Frontend**: Navigate to `v0-uix-ticket-qf/`, install dependencies, configure environment variables, and start dev server (port 3001)
3. **Access**: Frontend UI at `http://localhost:3001`, API docs at `http://localhost:3000/api/docs`

## 📚 Documentation

- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Production deployment guide for Railway (backend) and Vercel (frontend)
- **[INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md)** - Complete setup guide, environment configuration, and troubleshooting
- **[ticket-management-api/README.md](./ticket-management-api/README.md)** - Backend API documentation, architecture, and endpoints
- **[v0-uix-ticket-qf/README.md](./v0-uix-ticket-qf/README.md)** - Frontend application details

## 🔐 Authentication

The API uses a dual-header authentication system:
- `x-account-sid`: Account identifier
- `x-api-key`: API key (hashed with bcrypt)

Default test credentials are created via the seed script. See `INTEGRATION_SETUP.md` for details.

## 🎨 Design Philosophy

- **Separation of Concerns**: Clear boundaries between frontend and backend
- **Type Safety**: Full TypeScript implementation across the stack
- **API-First**: RESTful API design with comprehensive Swagger documentation
- **User-Centric**: Role-based UI that adapts to user permissions
- **Data Integrity**: Backend enforces business rules and validation

## 🔄 Data Flow

1. **Frontend** sends requests to **Backend API** with authentication headers
2. **Backend** validates requests, enforces business rules, and persists to database
3. **Frontend** receives responses and updates UI accordingly
4. **State Management** handles user context and session data

## 📝 Development Notes

- Backend runs on port 3000 (configurable via environment)
- Frontend runs on port 3001 (configurable via package.json scripts)
- CORS is configured to allow frontend-backend communication
- Database schema auto-synchronizes in development mode
- Topics are currently managed in frontend (localStorage) - backend integration can be added

## 🎯 Future Enhancements

Potential improvements for production deployment:
- Backend API for topic management
- User authentication system
- Real-time updates via WebSockets
- Advanced filtering and search
- Ticket assignment notifications
- Reporting and analytics dashboard

## 📄 License

MIT

---

**For setup and integration details, see [INTEGRATION_SETUP.md](./INTEGRATION_SETUP.md)**


