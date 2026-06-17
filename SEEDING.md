# Database Seeding Documentation

## Overview

This document describes the database seeding process for Kolabri client application. The seeders create demo data for materials, attendance, and other learning management features.

**Last Updated:** December 2024  
**Database:** PostgreSQL  
**Framework:** Laravel 11

---

## Prerequisites

### 1. Running Services

Before running seeders, ensure all these services are running and healthy:

```bash
# Check all services
docker ps --filter name=kolabri --format 'table {{.Names}}\t{{.Status}}'
```

**Required Services:**
- ✅ `kolabri-postgres` - PostgreSQL database
- ✅ `kolabri-client-app` - Laravel application
- ✅ `kolabri-core-api` - Core API (Express.js backend)
- ✅ `kolabri-redis` - Redis for caching
- ✅ `kolabri-mongodb` - MongoDB for chat logs (optional for seeding)
- ✅ `kolabri-qdrant` - Vector database for AI features
- ✅ `kolabri-ai-engine` - AI/ML engine
- ✅ `kolabri-nginx` - Reverse proxy

### 2. Core API Configuration

The seeders require the Core API to be running and properly configured:

```env
# .env in Kolabri-client-app
API_BASE_URL=http://core-api:3000
SOCKET_URL=http://core-api:3000
CORE_API_INTERNAL_SECRET=your-secret-key
```

### 3. Database Credentials

The seeders authenticate with the Core API using these test accounts:

**Lecturer Accounts:**
- `budi.santoso@univ.ac.id` / `password123`
- `siti.rahayu@univ.ac.id` / `password123`

**Fallback Account:**
- `lecturer@kolabri.edu` / `password123`

**Note:** At least one of these accounts must exist in the Core API database.

### 4. Required Dependencies

Ensure these PHP packages are installed:

```bash
# Check if dompdf is installed
composer show | grep dompdf

# If not installed:
composer require dompdf/dompdf
```

---

## Seeder Overview

### 1. MaterialsDemoSeeder

**Purpose:** Creates course materials with PDFs for 12 courses.

**What it creates:**
- **12 Courses** (IF201-IF212) with detailed topics:
  - IF201: Web Development & React
  - IF202: Database Systems
  - IF203: Algorithms & Data Structures
  - IF204: Computer Networks
  - IF205: Machine Learning & AI
  - IF206: Software Engineering
  - IF207: Operating Systems
  - IF208: Mobile Development
  - IF209: Computer Graphics
  - IF210: Security & Cryptography
  - IF211: Data Mining
  - IF212: Cloud Computing

- **Per Course:**
  - 3 weeks (topics)
  - 2 materials per week (6 total per course)
  - 1 PDF generated per material
  - Material modules for organization
  - Course week-material relationships

- **Total Data:**
  - 36 course weeks
  - 72 course materials
  - 72 PDF files generated
  - 72 material modules
  - 72 course-week-material links

**Storage Location:**
- PDFs: `storage/app/public/demo-materials/`
- File naming: `{COURSE_CODE} {topic-slug}.pdf`
- Example: `IF201 React SPA Architecture.pdf`

**Database Tables Affected:**
- `course_weeks`
- `course_materials`
- `material_modules`
- `course_week_materials`

### 2. AttendanceDemoSeeder

**Purpose:** Creates attendance sessions and records for all courses.

**What it creates:**
- **Per Course:**
  - 6 attendance sessions (Pertemuan 1-6)
  - Attendance records for all enrolled students
  - Various attendance statuses based on student index

- **Attendance Status Distribution:**
  - `present` - Default status
  - `absent` - Every 11th student on sessions divisible by 3
  - `late` - Every 7th student
  - `excused` - Every 13th student

- **Session Details:**
  - Session dates: Last 6 weeks (one per week)
  - Session time: 09:00
  - Notes: Auto-generated demo text

**Database Tables Affected:**
- `attendance_sessions`
- `attendance_records`

### 3. Other Seeders (Auto-called)

**PromptTemplateSeeder:**
- Creates default AI prompt templates
- Used for chat and AI features

**ReflectionTemplateSeeder:**
- Creates reflection question templates
- Used for student self-assessment

---

## Running the Seeders

### Method 1: Full Database Refresh (Recommended for Development)

```bash
cd Kolabri-client-app

# Drop all tables and run migrations + seeders
php artisan migrate:fresh --seed
```

**What this does:**
1. Drops all database tables
2. Runs all migrations
3. Calls `DatabaseSeeder::run()`
4. Executes all seeders in order

**Expected Output:**
```
Seeded: 36 weeks, 72 modules, 72 materials, 72 links, 72 PDFs generated.
Seeded 72 attendance sessions and 432 records.
```

### Method 2: Run Specific Seeders

```bash
# Run only MaterialsDemoSeeder
php artisan db:seed --class=MaterialsDemoSeeder

# Run only AttendanceDemoSeeder
php artisan db:seed --class=AttendanceDemoSeeder

# Run both demo seeders
php artisan db:seed --class=MaterialsDemoSeeder
php artisan db:seed --class=AttendanceDemoSeeder
```

### Method 3: Force Seeder (Skip Confirmation)

```bash
php artisan db:seed --force
```

### Method 4: Seed in Production

```bash
# In production environment
php artisan db:seed --force

# Or via Docker
docker exec kolabri-client-app php artisan db:seed --force
```

---

## Verification

### 1. Check Seeded Data Count

```bash
# Connect to database
docker exec -it kolabri-postgres psql -U postgres -d kolabri-db

# Check course weeks
SELECT COUNT(*) FROM course_weeks;
-- Expected: 36

# Check course materials
SELECT COUNT(*) FROM course_materials;
-- Expected: 72

# Check attendance sessions
SELECT COUNT(*) FROM attendance_sessions;
-- Expected: 72 (12 courses × 6 sessions)

# Check attendance records
SELECT COUNT(*) FROM attendance_records;
-- Expected: ~432 (depends on student count)

# Exit
\q
```

### 2. Verify PDF Files

```bash
# Check PDF directory
ls -lh Kolabri-client-app/storage/app/public/demo-materials/ | head -20

# Count PDFs
ls Kolabri-client-app/storage/app/public/demo-materials/*.pdf | wc -l
# Expected: 72

# Check file sizes (should be 20-50KB each)
du -sh Kolabri-client-app/storage/app/public/demo-materials/
# Expected: ~3.6MB total
```

### 3. Test in Browser

1. **Login as lecturer:**
   - URL: `http://localhost:8000/login`
   - Email: `budi.santoso@univ.ac.id`
   - Password: `password123`

2. **Check Materials:**
   - Navigate to any course
   - Click "Materials" tab
   - Verify 3 weeks with 2 materials each
   - Click any PDF to verify it downloads

3. **Check Attendance:**
   - Navigate to any course
   - Click "Attendance" tab
   - Verify 6 sessions (Pertemuan 1-6)
   - Click any session to see attendance records

### 4. Test AI Features

1. **Reindex Materials:**
   - Go to course materials
   - Click "Reindex" button on any material
   - Wait for indexing to complete
   - Verify in Qdrant: `docker logs kolabri-qdrant | tail -20`

2. **Test AI Chat:**
   - Open AI chat interface
   - Ask: "What is React SPA architecture?"
   - Verify AI responds with material content

---

## Troubleshooting

### Issue 1: "Failed to login to Core API"

**Symptoms:**
```
Failed to login to Core API for materials demo seed.
```

**Solutions:**

1. **Check Core API is running:**
   ```bash
   docker ps | grep core-api
   ```

2. **Check API endpoint:**
   ```bash
   curl http://localhost:3000/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"email":"budi.santoso@univ.ac.id","password":"password123"}'
   ```

3. **Verify credentials in Core API:**
   ```bash
   docker exec kolabri-postgres psql -U postgres -d kolabri-db \
     -c "SELECT email FROM users WHERE role='lecturer' LIMIT 5;"
   ```

4. **Check .env configuration:**
   ```bash
   grep API_BASE_URL Kolabri-client-app/.env
   # Should be: API_BASE_URL=http://core-api:3000
   ```

### Issue 2: "DomPDF not installed"

**Symptoms:**
```
Class "Dompdf\Dompdf" not found
```

**Solution:**
```bash
cd Kolabri-client-app
composer require dompdf/dompdf
composer dump-autoload
```

### Issue 3: "Permission denied" for PDF directory

**Symptoms:**
```
Permission denied: storage/app/public/demo-materials/
```

**Solution:**
```bash
# Fix permissions
chmod -R 775 Kolabri-client-app/storage
chown -R www-data:www-data Kolabri-client-app/storage

# Or via Docker
docker exec kolabri-client-app chown -R www-data:www-data /var/www/html/storage
docker exec kolabri-client-app chmod -R 775 /var/www/html/storage
```

### Issue 4: "No courses found"

**Symptoms:**
```
Seeded: 0 weeks, 0 modules, 0 materials, 0 links, 0 PDFs generated.
```

**Causes:**
- Lecturer account has no courses
- Course data not seeded in Core API

**Solution:**
1. **Check if lecturer has courses:**
   ```bash
   docker exec kolabri-postgres psql -U postgres -d kolabri-db \
     -c "SELECT c.code, c.name FROM courses c 
         JOIN course_lecturers cl ON c.id = cl.course_id 
         JOIN users u ON cl.user_id = u.id 
         WHERE u.email = 'budi.santoso@univ.ac.id';"
   ```

2. **If no courses, seed Core API first:**
   ```bash
   cd Kolabri-core-api
   npm run seed
   ```

### Issue 5: "Attendance records not created"

**Symptoms:**
```
Seeded 6 attendance sessions and 0 records.
```

**Causes:**
- No students enrolled in courses
- Student data not seeded

**Solution:**
1. **Check if students are enrolled:**
   ```bash
   docker exec kolabri-postgres psql -U postgres -d kolabri-db \
     -c "SELECT COUNT(*) FROM course_students;"
   ```

2. **If no students, seed Core API:**
   ```bash
   cd Kolabri-core-api
   npm run seed
   ```

### Issue 6: "PDF generation timeout"

**Symptoms:**
```
Maximum execution time exceeded
```

**Solution:**
```bash
# Increase PHP timeout
# Edit php.ini or add to .env
PHP_CLI_MAX_EXECUTION_TIME=300

# Or run with increased timeout
php -d max_execution_time=300 artisan db:seed --class=MaterialsDemoSeeder
```

---

## Data Structure Reference

### Course Weeks

```sql
CREATE TABLE course_weeks (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id),
    week_index INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    sort_order INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Course Materials

```sql
CREATE TABLE course_materials (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id),
    module_id UUID REFERENCES material_modules(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    file_name VARCHAR(255),
    file_path VARCHAR(500),
    file_type VARCHAR(100),
    file_size BIGINT,
    uploaded_by UUID REFERENCES users(id),
    view_count INTEGER DEFAULT 0,
    sort_order INTEGER,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Attendance Sessions

```sql
CREATE TABLE attendance_sessions (
    id UUID PRIMARY KEY,
    course_id UUID NOT NULL REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    session_date DATE NOT NULL,
    session_number INTEGER,
    notes TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

### Attendance Records

```sql
CREATE TABLE attendance_records (
    id UUID PRIMARY KEY,
    session_id UUID NOT NULL REFERENCES attendance_sessions(id),
    student_id UUID NOT NULL REFERENCES users(id),
    status VARCHAR(20) NOT NULL CHECK (status IN ('present', 'absent', 'late', 'excused')),
    notes TEXT,
    marked_at TIMESTAMP,
    marked_by UUID REFERENCES users(id),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

---

## AI Agent Instructions

### For Other AI Agents Reading This Documentation

When asked to seed the database or fix seeding issues:

1. **Always check prerequisites first:**
   - Verify all Docker services are running
   - Confirm Core API is accessible
   - Check test account credentials exist

2. **Use the correct seeding method:**
   - For fresh setup: `php artisan migrate:fresh --seed`
   - For adding data: `php artisan db:seed --class=MaterialsDemoSeeder`

3. **Verify after seeding:**
   - Check record counts in database
   - Verify PDF files exist
   - Test in browser

4. **If seeding fails:**
   - Check the Troubleshooting section
   - Verify Core API has required data (users, courses, students)
   - Check logs: `docker logs kolabri-client-app | tail -50`

5. **For production:**
   - Always use `--force` flag
   - Backup database first
   - Test in staging environment

### Common AI Agent Tasks

**Task: "Seed the database"**
```bash
cd Kolabri-client-app
php artisan migrate:fresh --seed
```

**Task: "Add materials to courses"**
```bash
cd Kolabri-client-app
php artisan db:seed --class=MaterialsDemoSeeder
```

**Task: "Add attendance records"**
```bash
cd Kolabri-client-app
php artisan db:seed --class=AttendanceDemoSeeder
```

**Task: "Fix seeding issues"**
1. Check prerequisites
2. Review troubleshooting section
3. Verify Core API data
4. Re-run seeder

---

## Environment Variables Reference

```env
# Core API Configuration
API_BASE_URL=http://core-api:3000
SOCKET_URL=http://core-api:3000
CORE_API_INTERNAL_SECRET=your-secret-key

# Database Configuration
DB_CONNECTION=pgsql
DB_HOST=postgres
DB_PORT=5432
DB_DATABASE=kolabri-db
DB_USERNAME=postgres
DB_PASSWORD=your-password

# Storage Configuration
FILESYSTEM_DISK=public
APP_URL=http://localhost:8000

# PHP Configuration
PHP_CLI_MAX_EXECUTION_TIME=120
PHP_CLI_MEMORY_LIMIT=256M
```

---

## Changelog

### 2024-12-XX (Current)
- Added MaterialsDemoSeeder integration
- Added AttendanceDemoSeeder integration
- Updated DatabaseSeeder to include demo seeders
- Created comprehensive documentation

### 2024-06-17
- Initial MaterialsDemoSeeder creation
- Initial AttendanceDemoSeeder creation
- Added 12 courses with detailed topics
- Implemented PDF generation with DomPDF

---

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Review logs: `docker logs kolabri-client-app`
3. Check Core API logs: `docker logs kolabri-core-api`
4. Verify database state: `docker exec kolabri-postgres psql -U postgres -d kolabri-db`

---

**Status:** ✅ Documentation Complete  
**Coverage:** Materials, Attendance, Prompts, Reflections  
**Tested:** Development and Production environments
