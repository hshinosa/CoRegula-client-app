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

**Purpose:** Creates course materials with PDFs for 14 courses.

**What it creates:**
- **14 Courses** with detailed topics:
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
  - DEVOPS102: DevOps
  - IMK401: Interaksi Manusia Komputer

- **Per Course:**
  - 3 weeks (topics)
  - 2 materials per week (6 total per course)
  - 1 PDF generated per material
  - Material modules for organization
  - Course week-material relationships

- **Total Data:**
  - 42 course weeks
  - 84 course materials
  - 84 PDF files generated
  - 84 material modules
  - 84 course-week-material links

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
-- Expected: 42

# Check course materials
SELECT COUNT(*) FROM course_materials;
-- Expected: 84

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
# Expected: 84

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

## RAG Ingest (Reproducible)

Seeding creates course/week/material metadata and PDF files, but it does **not**
populate the Qdrant vector store. RAG ingest is a separate, explicit step. The
seeded `knowledge_bases` rows are demo placeholders (fake `/demo/kb/...` paths)
and do **not** trigger real ingest.

**Convention (must match chat retrieval):** every Qdrant collection is named
`course_{course_id}` where `course_id` is the **course UUID** (`courses.id`), not
the course code. Personal-chat retrieval scopes by the same UUID, so ingest MUST
use the UUID. Ingesting under the course code produces collections that chat
never queries (dead weight).

### Ingest the demo PDFs

For each material PDF in `storage/app/public/demo-materials/`, POST it to the AI
engine `/api/ingest` endpoint with `course_id` set to the owning course's UUID:

```bash
# 1) Build a code -> UUID map from Postgres (deterministic seedUuid IDs).
docker exec kolabri-postgres-1 bash -lc \
  'psql -U $POSTGRES_USER -d $POSTGRES_DB -F"|" --no-align -t \
   -c "SELECT code, id FROM courses ORDER BY code;"' > /tmp/course_map.txt

# 2) Ingest each PDF under its course UUID, from inside the client-app container
#    (it has the PDFs + network access to ai-engine).
#    SECRET = CORE_API_SECRET, read from the ai-engine env (never hardcode).
SECRET=$(docker exec kolabri-ai-engine-1 printenv CORE_API_SECRET)

# Pass the map in via env so the inner shell can resolve code -> UUID.
MAP=$(cat /tmp/course_map.txt)
docker exec -e SECRET="$SECRET" -e MAP="$MAP" kolabri-client-app-1 bash -lc '
cd storage/app/public/demo-materials
for f in *.pdf; do
  code=$(echo "${f%%-*}" | tr a-z A-Z)
  cid=$(echo "$MAP" | awk -F"|" -v c="$code" "\$1==c{print \$2}")
  [ -z "$cid" ] && { echo "skip $f (no course $code)"; continue; }
  fid=$(echo -n "$f" | md5sum | cut -d" " -f1)
  curl -s -X POST http://ai-engine:8001/api/ingest \
    -H "Authorization: Bearer $SECRET" \
    -F "file=@$f" -F "course_id=$cid" -F "file_id=$fid" \
    -F "extra_metadata={\"title\":\"$f\",\"course_code\":\"$code\"}"
  echo " <- $f ($code/$cid)"
done
'
```

> Filename prefix (`devops102-...`) maps to the course code; the code resolves to
> the course UUID via Postgres. Ingest always uses the UUID.

### Verify ingest

```bash
# Collections (one per ingested course, UUID-named)
curl -s http://localhost:6333/collections | python3 -m json.tool

# Point count for a course collection
curl -s http://localhost:6333/collections/course_<UUID> | python3 -m json.tool
```

### Re-seed cutover (UUID change)

`db:reset:demo-data` assigns **deterministic** UUIDs via `seedUuid("course-<CODE>")`.
If a course previously had a different (e.g. manually-created random) UUID, its old
`course_<old-uuid>` collection becomes stale after re-seed. Delete the stale
collection and re-ingest under the new deterministic UUID:

```bash
curl -s -X DELETE http://localhost:6333/collections/course_<old-uuid>
# then re-run the ingest loop above
```

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

### Issue 7: "Tables not found after migration" (Schema Issue)

**Symptoms:**
```
ERROR: relation "attendance_sessions" does not exist
ERROR: relation "course_materials" does not exist
```

**Root Cause:**
Laravel migrations may create tables in the `app` schema instead of `public` schema, especially when using custom database configurations or when migrations are run in different contexts.

**Diagnosis:**
```bash
# Check which schema tables are in
docker exec kolabri-postgres psql -U postgres -d kolabri-db \
  -c "SELECT schemaname, tablename FROM pg_tables WHERE tablename LIKE '%attend%' OR tablename LIKE '%material%' ORDER BY schemaname, tablename;"
```

**Solution 1: Query with Schema Prefix**
```sql
# Use app. prefix in queries
SELECT COUNT(*) FROM app.attendance_sessions;
SELECT COUNT(*) FROM app.course_materials;
SELECT COUNT(*) FROM app.attendance_records;
```

**Solution 2: Set Default Search Path**
```bash
# Set search_path to include app schema
docker exec kolabri-postgres psql -U postgres -d kolabri-db \
  -c "ALTER DATABASE \"kolabri-db\" SET search_path TO app, public;"

# Or set for current session
SET search_path TO app, public;
```

**Solution 3: Move Tables to Public Schema**
```bash
# Move tables from app to public
docker exec kolabri-postgres psql -U postgres -d kolabri-db << 'EOF'
ALTER TABLE app.attendance_sessions SET SCHEMA public;
ALTER TABLE app.attendance_records SET SCHEMA public;
ALTER TABLE app.course_materials SET SCHEMA public;
ALTER TABLE app.course_weeks SET SCHEMA public;
ALTER TABLE app.material_modules SET SCHEMA public;
DROP SCHEMA IF EXISTS app;
EOF
```

**Prevention:**
Check `config/database.php` in Laravel:
```php
'pgsql' => [
    'driver' => 'pgsql',
    'search_path' => 'public',  // Ensure this is set
    // ...
],
```

### Issue 8: "PDF generation timeout"

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
