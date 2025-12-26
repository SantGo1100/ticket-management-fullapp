# Ticket Management API

A production-ready NestJS REST API for managing support tickets with authentication, comprehensive Swagger documentation, and SQLite database support.

## 🚀 Tech Stack

- **Framework**: NestJS 10.x
- **Language**: TypeScript
- **Database**: SQLite with TypeORM
- **Authentication**: Account SID + API Key (bcrypt hashed)
- **Documentation**: Swagger/OpenAPI
- **Validation**: class-validator, class-transformer

## 📋 Features

- ✅ RESTful API for ticket CRUD operations
- ✅ Account-based authentication (SID + API Key)
- ✅ API key hashing with bcrypt
- ✅ Global authentication guard with public route support
- ✅ Comprehensive Swagger documentation
- ✅ Request validation and error handling
- ✅ Ticket status workflow management
- ✅ TypeORM with SQLite database
- ✅ Environment-based configuration

## 🏗️ Architecture

### Project Structure

```
.
├── src/
│   ├── auth/                  # Authentication module
│   │   ├── auth.guard.ts     # Global authentication guard
│   │   ├── auth.service.ts   # Account & API key validation
│   │   ├── auth.module.ts    # Auth module configuration
│   │   └── decorators/
│   │       └── public.decorator.ts  # @Public() route decorator
│   ├── entities/             # TypeORM entities
│   │   ├── account.entity.ts
│   │   ├── api-key.entity.ts
│   │   └── ticket.entity.ts
│   ├── tickets/              # Ticket module
│   │   ├── ticket.controller.ts
│   │   ├── ticket.service.ts
│   │   ├── ticket.module.ts
│   │   └── dto/              # Data Transfer Objects
│   ├── config/               # Configuration services
│   ├── scripts/              # Utility scripts
│   │   └── seed-account.ts   # Account seeding script
│   └── main.ts               # Application entry point
├── .env.example              # Environment variables template
└── README.md
```

### Authentication

The API uses a dual-header authentication system:

- **x-account-sid**: Account identifier (public)
- **x-api-key**: API key secret (hashed in database)

**Security Features:**
- API keys are hashed using bcrypt before storage
- One account can have multiple API keys
- API keys can be activated/deactivated
- Global guard protects all routes by default
- Use `@Public()` decorator to exempt routes

## 📦 Installation

```bash
# Install dependencies
npm install
```

## ⚙️ Configuration

1. Copy the example environment file:
```bash
cp .env.example .env
```

2. Update `.env` with your configuration:
```env
NODE_ENV=development
PORT=3000
DB_DATABASE=database.sqlite
DB_SYNCHRONIZE=true
```

## 🏃 Running the Application

### Development Mode
```bash
npm run start:dev
```

### Production Mode
```bash
npm run build
npm run start:prod
```

### Seed Test Account
```bash
npm run seed:account
```

This creates a test account with:
- SID: `AC123456789`
- API Key: `sk_live_abc123xyz456`

## 📚 API Documentation

Once the server is running, access Swagger UI at:

```
http://localhost:3000/api/docs
```

**Note**: Swagger is only available in non-production environments.

### Using Swagger UI

1. Open `http://localhost:3000/api/docs` in your browser
2. Click the **"Authorize"** button (lock icon)
3. Enter your credentials:
   - `x-account-sid`: Your account SID
   - `x-api-key`: Your API key
4. Click **"Authorize"** and **"Close"**
5. Test endpoints directly from the UI

## 🔐 Authentication

All endpoints (except `/health`) require authentication headers:

```bash
curl -X GET http://localhost:3000/tickets \
  -H "x-account-sid: AC123456789" \
  -H "x-api-key: sk_live_abc123xyz456"
```

### Public Endpoints

- `GET /health` - Health check (no authentication required)

### Protected Endpoints

All ticket endpoints require authentication:

- `POST /tickets` - Create a new ticket
- `GET /tickets` - Get all tickets (with optional filters)
- `GET /tickets/:id` - Get ticket by ID
- `PATCH /tickets/:id` - Update ticket
- `POST /tickets/:id/finalizar` - Finalize ticket

## 📝 API Examples

### Create Ticket
```bash
curl -X POST http://localhost:3000/tickets \
  -H "Content-Type: application/json" \
  -H "x-account-sid: AC123456789" \
  -H "x-api-key: sk_live_abc123xyz456" \
  -d '{
    "requester_id": 1,
    "topic": "bug",
    "priority": "high",
    "description": "User cannot login after password reset"
  }'
```

### Get All Tickets
```bash
curl -X GET "http://localhost:3000/tickets?status=in_progress" \
  -H "x-account-sid: AC123456789" \
  -H "x-api-key: sk_live_abc123xyz456"
```

### Update Ticket
```bash
curl -X PATCH http://localhost:3000/tickets/1 \
  -H "Content-Type: application/json" \
  -H "x-account-sid: AC123456789" \
  -H "x-api-key: sk_live_abc123xyz456" \
  -d '{
    "assignee_id": 5,
    "status": "in_progress"
  }'
```

## 🗄️ Database Schema

### Accounts Table
- `id` - Primary key
- `sid` - Account SID (unique identifier)
- `name` - Account name
- `created_at` - Creation timestamp

### API Keys Table
- `id` - Primary key
- `account_id` - Foreign key to accounts
- `key_hash` - Bcrypt hashed API key
- `is_active` - Active status flag
- `created_at` - Creation timestamp

### Tickets Table
- `ticket_id` - Primary key
- `requester_id` - User ID who created the ticket
- `assignee_id` - User ID assigned to the ticket (nullable)
- `topic` - Ticket category (billing, bug, feature, other)
- `priority` - Priority level (low, medium, high)
- `status` - Ticket status (created, in_progress, completed)
- `description` - Ticket description
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## 🛠️ Development

### Available Scripts

```bash
# Development
npm run start:dev          # Start in watch mode
npm run start:debug        # Start in debug mode

# Production
npm run build              # Build for production
npm run start:prod         # Start production server

# Code Quality
npm run format             # Format code with Prettier
npm run lint               # Run ESLint

# Database
npm run seed:account       # Seed test account
```

## 🔒 Security Notes

- **Never commit** `.env` files or database files
- API keys are hashed using bcrypt (10 salt rounds)
- Use strong, randomly generated API keys in production
- Set `DB_SYNCHRONIZE=false` in production
- Keep `NODE_ENV=production` in production environments

## 📄 License

MIT

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

---

**Built with ❤️ using NestJS**
