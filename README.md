# CoRegula Client App

Frontend application for CoRegula - AI-Powered Collaborative Learning Platform. Built with Laravel 12, Vue 3, TypeScript, and Tailwind CSS.

## 🎯 Purpose

CoRegula is an educational platform designed for **Socially Shared Regulated Learning (SSRL)**. It enables:
- **Students**: Collaborative group learning with AI-powered guidance
- **Lecturers**: Monitor student progress, set learning goals, manage knowledge bases
- **AI Assistant**: Context-aware responses using RAG (Retrieval-Augmented Generation)
- **Analytics**: Process mining and engagement analytics for research

## 🛠️ Tech Stack

- **Backend Framework**: Laravel 12 (PHP 8.3+)
- **Frontend Framework**: React 19 + TypeScript
- **State Management**: Inertia.js (server-side state)
- **Styling**: Tailwind CSS
- **Build Tool**: Vite (HMR-enabled)
- **Database**: PostgreSQL (Eloquent ORM)
- **Real-time**: Socket.IO Client
- **Package Manager**: Composer (PHP), npm (JavaScript)

## 📋 Prerequisites

- PHP 8.3+
- Composer 2.6+
- Node.js 20.x
- npm 10.x
- PostgreSQL 14+
- Git

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd client-app

# Install PHP dependencies
composer install

# Install JavaScript dependencies
npm install
```

### 2. Environment Configuration

```bash
# Copy environment file
cp .env.example .env

# Generate APP_KEY
php artisan key:generate

# Update .env with your settings
```

**Key .env variables:**

```env
APP_NAME=CoRegula
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost:8000

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=coregula
DB_USERNAME=postgres
DB_PASSWORD=your_password

VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000
```

### 3. Database Setup

```bash
# Run migrations
php artisan migrate

# Seed demo data (optional)
php artisan db:seed
```

### 4. Start Development Server

**Terminal 1 - Laravel Backend:**
```bash
php artisan serve
# Runs on http://localhost:8000
```

**Terminal 2 - Vite Frontend:**
```bash
npm run dev
# HMR runs on http://localhost:5173
```

**Terminal 3 - Socket.IO (from Core-API):**
```bash
# Ensure core-api is running on :3000
cd ../core-api && npm run dev
```

Access the app at `http://localhost:8000`

## 📁 Project Structure

```
client-app/
├── app/
│   ├── Http/
│   │   ├── Controllers/           # Request handlers (courses, auth, etc.)
│   │   ├── Middleware/            # Auth, CORS, etc.
│   │   └── Requests/              # Form validation rules
│   ├── Models/                    # Eloquent models (User, Course, Group, etc.)
│   └── Providers/                 # Service providers
├── bootstrap/
│   └── app.php                    # Framework initialization
├── config/
│   ├── app.php                    # Core config
│   ├── auth.php                   # Auth drivers
│   ├── database.php               # Database config
│   ├── filesystems.php            # Storage config
│   ├── inertia.php                # Inertia.js config
│   └── session.php                # Session config
├── database/
│   ├── factories/                 # Model factories
│   ├── migrations/                # Database schema
│   └── seeders/                   # Database seeders
├── public/
│   ├── index.php                  # Entry point
│   └── build/                     # Compiled assets (Vite output)
├── resources/
│   ├── css/
│   │   └── app.css                # Global Tailwind styles
│   ├── js/
│   │   ├── app.ts                 # Vue app setup
│   │   ├── Pages/                 # Inertia page components
│   │   │   ├── Auth/
│   │   │   ├── Dashboard/
│   │   │   ├── Lecturer/
│   │   │   └── Student/
│   │   ├── components/            # Reusable Vue components
│   │   ├── layouts/               # Layout wrappers
│   │   ├── types/                 # TypeScript interfaces
│   │   └── utils/                 # Helper functions
│   └── views/
│       └── app.blade.php          # Root Blade template
├── routes/
│   ├── web.php                    # Web routes (Inertia)
│   └── console.php                # Console commands
├── storage/
│   ├── app/                       # File uploads
│   ├── framework/                 # Framework files
│   └── logs/                      # Application logs
├── tests/
│   ├── Feature/                   # Feature tests
│   └── Unit/                      # Unit tests
├── docker/
│   └── nginx/
│       └── default.conf           # Nginx config for Docker
├── vite.config.ts                 # Vite configuration
├── tsconfig.json                  # TypeScript configuration
├── composer.json                  # PHP dependencies
├── package.json                   # Node.js dependencies
├── phpunit.xml                    # PHPUnit configuration
└── Dockerfile                     # Docker build file

```

## 🔐 Authentication Flow

```
┌──────────────┐
│  Login Page  │
└──────┬───────┘
       │ POST /api/login
       ▼
┌──────────────────────┐
│ Laravel Controller   │ → Validate credentials
│ (AuthController)     │ → Generate JWT
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Store JWT in      │
│ Session (Inertia)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│  Redirect to        │
│  Dashboard          │
└──────────────────────┘
```

## 🎓 User Roles & Features

### Student
- View enrolled courses
- Create/join study groups
- Set learning goals
- Submit reflections
- Chat with AI and group members
- View engagement analytics

### Lecturer
- Create courses (with join codes)
- Manage enrolled students
- Create study groups
- Upload knowledge base (PDFs)
- Monitor group progress
- View learning analytics

## 📊 Key Pages

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | Dashboard | Landing / role-based redirect |
| `/login` | Auth/Login | User authentication |
| `/register` | Auth/Register | User registration |
| `/courses` | Courses/Index | My courses list |
| `/courses/{id}` | Courses/Show | Course details & knowledge base |
| `/courses/{id}/groups/{groupId}` | Groups/Show | Group chat & collaboration |
| `/goals` | Goals/Index | My learning goals |
| `/analytics` | Analytics/Dashboard | Engagement dashboard |

## 🔄 Real-time Features

The client communicates with **Core-API** via Socket.IO for real-time updates:

```typescript
// Example: Join chat room
socket.emit('join_room', { courseId, groupId });

// Listen for new messages
socket.on('receive_message', (message) => {
  // Update UI
});

// Send message to @AI
socket.emit('send_message', {
  content: 'Hey @AI, what is...?'
});
```

## 📤 Knowledge Base Upload

Students and lecturers can upload PDFs to the knowledge base:

1. **File Selection**: Choose PDF files (max 10MB)
2. **Processing**: 
   - Sent to Core-API `/api/courses/:id/knowledge-base`
   - Forwarded to AI-Engine `/api/ingest/batch`
   - Text extraction + optional OCR
3. **Status Tracking**:
   - `pending`: Processing
   - `ready`: Available for RAG queries
   - `failed`: Upload error
4. **Display**: Only `ready` files shown to users

## 🌐 Environment Variables

```env
# App Config
APP_NAME=CoRegula
APP_ENV=local|production
APP_KEY=base64:...
APP_URL=http://localhost:8000
APP_DEBUG=true|false

# Database
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=coregula
DB_USERNAME=postgres
DB_PASSWORD=your_password

# Frontend API Integration
VITE_API_URL=http://localhost:3000
VITE_SOCKET_URL=http://localhost:3000

# Optional: MongoDB for chat logs
MONGODB_URI=mongodb://localhost:27017/coregula

# Mail (optional)
MAIL_DRIVER=log
```

## 🏗️ Building & Deployment

### Development Build
```bash
npm run dev
# Vite dev server with hot reload
```

### Production Build
```bash
npm run build
# Compiles assets to public/build/
php artisan migrate --force
php artisan config:cache
php artisan route:cache
```

### Docker Deployment

Build and run in Docker:
```bash
docker build -t coregula-client .
docker run -p 8080:80 -e APP_KEY=base64:... coregula-client
```

Or use docker-compose (recommended):
```bash
docker-compose up -d client-app-php client-app-web
```

## 📝 Database Schema

### Core Tables
- `users` - User accounts with roles
- `courses` - Courses created by lecturers
- `groups` - Study groups within courses
- `knowledge_bases` - Uploaded PDF files
- `learning_goals` - Student goals
- `reflections` - Student reflections
- `chat_messages` - Chat history (also in MongoDB)

## 🔗 Integration Points

### Core-API (Backend)
- Authentication: `/api/login`, `/api/register`
- Courses: `/api/courses`, `/api/courses/{id}`
- Knowledge Base: `/api/courses/{id}/knowledge-base`
- Real-time chat: Socket.IO on `:3000`

### AI-Engine
- Document upload: `/api/ingest/batch`
- RAG queries: `/api/query`
- Interventions: `/api/intervention/*`

## 📚 Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `php artisan serve` | Start Laravel dev server |
| `php artisan migrate` | Run database migrations |
| `php artisan db:seed` | Seed demo data |
| `php artisan tinker` | Interactive shell |
| `php artisan storage:link` | Create storage symlink |

## 🧪 Testing

```bash
# Run PHPUnit tests
php artisan test

# Run specific test
php artisan test tests/Feature/CourseTest.php

# With coverage
php artisan test --coverage
```

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Laravel on different port
php artisan serve --port=8001

# Vite on different port
npm run dev -- --port 5174
```

### Database Connection Error
```bash
# Check PostgreSQL is running
# Verify DB_HOST, DB_PORT, DB_USERNAME, DB_PASSWORD in .env
php artisan migrate --fresh --seed
```

### CORS Issues
- Ensure `VITE_API_URL` matches Core-API URL
- Check Core-API CORS configuration

### Asset Not Found (404)
```bash
# Rebuild assets
npm run build

# Or in development:
npm run dev
```

## 📖 Additional Resources

- [Laravel Documentation](https://laravel.com/docs)
- [Vue 3 Guide](https://vuejs.org/guide/)
- [Inertia.js Documentation](https://inertiajs.com)
- [Tailwind CSS](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Commit changes: `git commit -m "Add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

## 📄 License

MIT License - CoRegula Project

## 👥 Support

For issues and feature requests, please open an issue in the main CoRegula repository.
