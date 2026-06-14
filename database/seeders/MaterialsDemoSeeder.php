<?php

namespace Database\Seeders;

use App\Models\CourseMaterial;
use App\Models\CourseWeek;
use App\Models\CourseWeekMaterial;
use App\Models\MaterialModule;
use Dompdf\Dompdf;
use Dompdf\Options;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class MaterialsDemoSeeder extends Seeder
{
    private function seedUuid(string $seed): string
    {
        $h = md5($seed);
        return sprintf(
            '%s-%s-4%s-8%s-%s',
            substr($h, 0, 8),
            substr($h, 8, 4),
            substr($h, 13, 3),
            substr($h, 17, 3),
            substr($h, 20, 12)
        );
    }

    private array $courseWeeks = [
        'IF201' => [
            ['title' => 'Fundamental Web & React', 'materials' => ['React SPA Architecture', 'Component Lifecycle & Hooks']],
            ['title' => 'API & Authentication', 'materials' => ['Autentikasi JWT', 'REST API Integration']],
            ['title' => 'Deployment & Optimization', 'materials' => ['Responsive Design Strategy', 'Deployment Pipeline']],
        ],
        'IF202' => [
            ['title' => 'Desain Database', 'materials' => ['Normalisasi Database', 'ERD & Relasi Antar Tabel']],
            ['title' => 'Optimasi Query', 'materials' => ['Query Optimization', 'Indexing Strategy']],
            ['title' => 'Database Lanjut', 'materials' => ['Transaksi & Concurrency', 'NoSQL vs RDBMS']],
        ],
        'IF203' => [
            ['title' => 'Algoritma Sorting & Searching', 'materials' => ['Sorting Algorithm Comparison', 'Binary Search & Variasinya']],
            ['title' => 'Struktur Data Lanjut', 'materials' => ['Tree & Graph Traversal', 'Linked List & Stack/Queue']],
            ['title' => 'Analisis Kompleksitas', 'materials' => ['Dynamic Programming', 'Big-O Analysis']],
        ],
        'IF204' => [
            ['title' => 'Model Jaringan', 'materials' => ['TCP/IP & OSI Layer', 'Protokol Jaringan Dasar']],
            ['title' => 'Routing & Switching', 'materials' => ['Routing Protocol (OSPF, BGP)', 'VLAN & Subnetting']],
            ['title' => 'Keamanan Jaringan', 'materials' => ['Network Security Fundamentals', 'Firewall & IDS/IPS']],
        ],
        'IF205' => [
            ['title' => 'Dasar Machine Learning', 'materials' => ['Machine Learning Pipeline', 'Supervised vs Unsupervised Learning']],
            ['title' => 'Evaluasi Model', 'materials' => ['Model Evaluation Metrics', 'Cross-Validation & Hyperparameter Tuning']],
            ['title' => 'Deep Learning & NLP', 'materials' => ['Neural Network Architecture', 'Prompt Engineering']],
        ],
        'IF206' => [
            ['title' => 'Requirements & Design', 'materials' => ['Software Requirement Analysis', 'UML & Use Case Diagram']],
            ['title' => 'Arsitektur & Pattern', 'materials' => ['Clean Architecture', 'Design Patterns']],
            ['title' => 'Testing & CI/CD', 'materials' => ['Testing Strategy (Unit, Integration)', 'CI/CD Pipeline']],
        ],
        'IF207' => [
            ['title' => 'Manajemen Proses', 'materials' => ['Process Scheduling Algorithm', 'Threading & Concurrency']],
            ['title' => 'Manajemen Memori', 'materials' => ['Memory Management & Paging', 'Virtual Memory']],
            ['title' => 'File System & I/O', 'materials' => ['File System Organization', 'Deadlock Prevention']],
        ],
        'IF208' => [
            ['title' => 'Mobile UI & Navigation', 'materials' => ['Mobile UI Pattern', 'Navigation & Routing']],
            ['title' => 'State & Data', 'materials' => ['State Management (Redux, Provider)', 'API Consumption & Caching']],
            ['title' => 'Offline & Push', 'materials' => ['Offline Storage (SQLite, Hive)', 'Push Notification Integration']],
        ],
        'IF209' => [
            ['title' => 'Dasar Grafika', 'materials' => ['Rendering Pipeline', 'Transformasi Geometri 2D/3D']],
            ['title' => 'Shading & Lighting', 'materials' => ['Lighting Model (Phong, Blinn)', 'Texture Mapping']],
            ['title' => '3D & Animasi', 'materials' => ['3D Modeling Basics', 'Camera & Projection']],
        ],
        'IF210' => [
            ['title' => 'Kriptografi Dasar', 'materials' => ['Encryption & Decryption (AES, RSA)', 'Hashing & Digital Signature']],
            ['title' => 'Application Security', 'materials' => ['Threat Modeling', 'OWASP Top 10']],
            ['title' => 'Secure Development', 'materials' => ['Access Control (RBAC, ABAC)', 'Secure Coding Practices']],
        ],
        'IF211' => [
            ['title' => 'Preprocessing & EDA', 'materials' => ['Data Preprocessing & Cleaning', 'Exploratory Data Analysis']],
            ['title' => 'Clustering & Classification', 'materials' => ['Clustering K-Means & Hierarchical', 'Classification (Decision Tree, SVM)']],
            ['title' => 'Advanced Mining', 'materials' => ['Association Rule Mining', 'Anomaly Detection']],
        ],
        'IF212' => [
            ['title' => 'Cloud Fundamentals', 'materials' => ['IaaS, PaaS, SaaS Overview', 'Cloud Deployment Models']],
            ['title' => 'Container & Orchestration', 'materials' => ['Docker Container Basics', 'Kubernetes Architecture']],
            ['title' => 'Microservices & Serverless', 'materials' => ['Microservices Design Pattern', 'Serverless (Lambda, Cloud Functions)']],
        ],
    ];

    private function generatePdf(string $courseCode, string $courseName, string $weekTitle, string $topic): string
    {
        $pdf = new Dompdf();
        $options = new Options();
        $options->set('isRemoteEnabled', true);
        $options->set('defaultFont', 'DejaVu Sans');
        $pdf->setOptions($options);
        $pdf->loadHtml($this->buildHtml($courseCode, $courseName, $weekTitle, $topic));
        $pdf->setPaper('A4', 'portrait');
        $pdf->render();
        return $pdf->output();
    }

    private function buildHtml(string $code, string $course, string $week, string $topic): string
    {
        $content = $this->topicContent($code, $topic);
        return <<<HTML
<!DOCTYPE html><html><head><meta charset="utf-8">
<style>
body{font-family:'DejaVu Sans',sans-serif;font-size:11pt;line-height:1.6;color:#333;margin:40px}
.header{text-align:center;margin-bottom:30px;padding-bottom:20px;border-bottom:2px solid #88161c}
.header h1{color:#88161c;font-size:22pt;margin:0 0 5px}
.header h2{color:#555;font-size:14pt;font-weight:normal;margin:0 0 5px}
.header .meta{color:#888;font-size:10pt}
h3{color:#88161c;font-size:14pt;margin-top:25px;border-bottom:1px solid #ddd;padding-bottom:5px}
h4{color:#444;font-size:12pt;margin-top:15px}
.cb{background:#f8f4f4;border-left:4px solid #88161c;padding:12px 16px;margin:15px 0;border-radius:0 8px 8px 0}
.code{background:#1e1e1e;color:#d4d4d4;padding:14px 18px;border-radius:8px;font-family:'Courier New',monospace;font-size:9pt;margin:12px 0;white-space:pre-wrap;line-height:1.5}
.hl{background:#fff3cd;padding:2px 6px;border-radius:3px}
table{width:100%;border-collapse:collapse;margin:15px 0}
th{background:#88161c;color:white;padding:8px 12px;text-align:left}
td{padding:8px 12px;border-bottom:1px solid #ddd}
tr:nth-child(even){background:#f9f9f9}
ul,ol{margin:8px 0;padding-left:25px}li{margin-bottom:4px}
.sb{background:#e8f5e9;border:1px solid #a5d6a7;padding:14px 18px;border-radius:8px;margin-top:25px}
.sb h4{color:#2e7d32;margin-top:0}
.ft{text-align:center;color:#999;font-size:9pt;margin-top:40px;padding-top:15px;border-top:1px solid #ddd}
</style></head><body>
<div class="header"><h1>{$topic}</h1><h2>{$course} ({$code})</h2><div class="meta">{$week}</div></div>
{$content}
<div class="ft">{$code} — {$course} — {$topic}<br>Bahan pre-read sebelum sesi diskusi kelompok.</div>
</body></html>
HTML;
    }

    private function topicContent(string $code, string $topic): string
    {
        return match ($code) {
            'IF201' => $this->if201($topic), 'IF202' => $this->if202($topic),
            'IF203' => $this->if203($topic), 'IF204' => $this->if204($topic),
            'IF205' => $this->if205($topic), 'IF206' => $this->if206($topic),
            'IF207' => $this->if207($topic), 'IF208' => $this->if208($topic),
            'IF209' => $this->if209($topic), 'IF210' => $this->if210($topic),
            'IF211' => $this->if211($topic), 'IF212' => $this->if212($topic),
            default => $this->fallback($topic),
        };
    }

    private function if201(string $t): string { return match($t) {
        'React SPA Architecture' => '<h3>Konsep Single Page Application</h3><div class="cb"><strong>SPA</strong> adalah arsitektur web di mana seluruh interaksi terjadi dalam satu halaman HTML. Server mengirim satu file HTML awal, lalu JavaScript mengambil alih rendering tanpa reload halaman penuh.</div><h3>Virtual DOM</h3><p>React menggunakan <span class="hl">Virtual DOM</span> — representasi lightweight dari DOM asli. Ketika state berubah:</p><ol><li>Membuat Virtual DOM baru</li><li>Membandingkan dengan Virtual DOM sebelumnya (diffing)</li><li>Hanya mengupdate bagian yang berubah di DOM asli (reconciliation)</li></ol><h3>Component-Based Architecture</h3><div class="code">function UserProfile({ user }) {
    return (
        &lt;div className="profile"&gt;
            &lt;Avatar src={user.avatar} /&gt;
            &lt;UserInfo name={user.name} /&gt;
            &lt;ActivityFeed userId={user.id} /&gt;
        &lt;/div&gt;
    );
}</div><h3>SPA vs MPA</h3><table><tr><th>Aspek</th><th>SPA</th><th>MPA</th></tr><tr><td>Initial Load</td><td>Lambat (bundle JS)</td><td>Cepat</td></tr><tr><td>Navigasi</td><td>Instant</td><td>Full reload</td></tr><tr><td>SEO</td><td>Perlu SSR/SSG</td><td>Langsung crawlable</td></tr><tr><td>UX</td><td>App-like</td><td>Web-like</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>React SPA memindahkan rendering ke client dengan Virtual DOM. Cocok untuk aplikasi interaktif. Gunakan Next.js jika butuh SEO dan SSR.</p></div>',
        'Component Lifecycle & Hooks' => '<h3>Hooks</h3><div class="cb"><strong>Hooks</strong> memungkinkan penggunaan state dan lifecycle di function component. Diperkenalkan di React 16.8.</div><h3>useState</h3><div class="code">const [count, setCount] = useState(0);
const [name, setName] = useState(\'\');</div><h3>useEffect — Side Effects</h3><div class="code">useEffect(() =&gt; {
    let cancelled = false;
    fetch(`/api/users/${userId}/posts`)
        .then(r =&gt; r.json())
        .then(data =&gt; { if (!cancelled) setPosts(data); });
    return () =&gt; { cancelled = true; };
}, [userId]);</div><h3>Dependency Array</h3><table><tr><th>Pattern</th><th>Perilaku</th></tr><tr><td>useEffect(fn)</td><td>Setiap render</td></tr><tr><td>useEffect(fn, [])</td><td>Sekali saat mount</td></tr><tr><td>useEffect(fn, [dep])</td><td>Saat dep berubah</td></tr></table><h3>Custom Hooks</h3><div class="code">function useLocalStorage(key, initial) {
    const [val, setVal] = useState(() =&gt; {
        const s = localStorage.getItem(key);
        return s ? JSON.parse(s) : initial;
    });
    useEffect(() =&gt; {
        localStorage.setItem(key, JSON.stringify(val));
    }, [key, val]);
    return [val, setVal];
}</div><div class="sb"><h4>Ringkasan</h4><p>useState untuk state, useEffect untuk side effects, useRef untuk mutable references. Selalu perhatikan dependency array.</p></div>',
        'Autentikasi JWT' => '<h3>JSON Web Token</h3><div class="cb"><strong>JWT</strong> adalah token terstruktur (header.payload.signature) yang digunakan untuk autentikasi stateless. Server tidak perlu menyimpan session.</div><h3>Struktur JWT</h3><table><tr><th>Bagian</th><th>Isi</th></tr><tr><td>Header</td><td>Algorithm (HS256, RS256)</td></tr><tr><td>Payload</td><td>Claims (sub, name, exp, iat)</td></tr><tr><td>Signature</td><td>HMAC(header.payload, secret)</td></tr></table><h3>Flow Autentikasi</h3><ol><li>User login → server verifikasi credentials</li><li>Server generate JWT dengan secret key</li><li>Client simpan JWT (localStorage/httpOnly cookie)</li><li>Client kirim JWT di header: <code>Authorization: Bearer &lt;token&gt;</code></li><li>Server verifikasi signature → extract claims</li></ol><div class="code">const jwt = require(\'jsonwebtoken\');
const token = jwt.sign({ userId: user.id, role: \'student\' }, SECRET, { expiresIn: \'24h\' });
const decoded = jwt.verify(token, SECRET);</div><div class="sb"><h4>Ringkasan</h4><p>JWT stateless, cocok untuk API. Simpan di httpOnly cookie (bukan localStorage) untuk keamanan. Selalu set expiration dan verifikasi signature di setiap request.</p></div>',
        'REST API Integration' => '<h3>REST API</h3><div class="cb"><strong>REST</strong> (Representational State Transfer) adalah arsitektur API berbasis HTTP. Setiap resource diidentifikasi oleh URL dan dimanipulasi via HTTP methods.</div><h3>HTTP Methods</h3><table><tr><th>Method</th><th>Aksi</th><th>Idempotent</th></tr><tr><td>GET</td><td>Read data</td><td>Ya</td></tr><tr><td>POST</td><td>Create resource</td><td>Tidak</td></tr><tr><td>PUT</td><td>Replace resource</td><td>Ya</td></tr><tr><td>PATCH</td><td>Partial update</td><td>Tidak</td></tr><tr><td>DELETE</td><td>Remove resource</td><td>Ya</td></tr></table><h3>Error Handling di Frontend</h3><div class="code">async function apiRequest(url, options = {}) {
    try {
        const res = await fetch(url, {
            headers: { \'Content-Type\': \'application/json\', ...options.headers },
            ...options,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        if (err.name === \'TypeError\') throw new Error(\'Network error\');
        throw err;
    }
}</div><div class="sb"><h4>Ringkasan</h4><p>REST menggunakan HTTP methods untuk CRUD. GET=read, POST=create, PUT=replace, PATCH=update, DELETE=remove. Handle errors dengan try-catch dan status code checking.</p></div>',
        'Responsive Design Strategy' => '<h3>Responsive Design</h3><div class="cb"><strong>Responsive Design</strong> memastikan web tampil optimal di semua ukuran layar menggunakan fluid grids, flexible images, dan media queries.</div><h3>Mobile-First Approach</h3><div class="code">/* Base: mobile styles */
.container { padding: 16px; }

/* Tablet */
@media (min-width: 768px) {
    .container { padding: 24px; max-width: 720px; margin: 0 auto; }
}

/* Desktop */
@media (min-width: 1024px) {
    .container { padding: 32px; max-width: 960px; }
}</div><h3>Breakpoints Umum</h3><table><tr><th>Device</th><th>Width</th></tr><tr><td>Mobile</td><td>&lt; 640px</td></tr><tr><td>Tablet</td><td>640-1024px</td></tr><tr><td>Desktop</td><td>1024-1440px</td></tr><tr><td>Wide</td><td>&gt; 1440px</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Mobile-first: tulis style untuk mobile dulu, tambah complexity untuk layar besar. Gunakan relative units (rem, %, vw) dan flexbox/grid untuk layout adaptif.</p></div>',
        'Deployment Pipeline' => '<h3>CI/CD Pipeline</h3><div class="cb"><strong>Deployment Pipeline</strong> mengotomasi proses dari code push hingga production. CI (Continuous Integration) memastikan kode quality, CD (Continuous Deployment) mengirim ke production otomatis.</div><h3>Stages</h3><ol><li><strong>Build:</strong> Compile, bundle, minify</li><li><strong>Test:</strong> Unit, integration, e2e tests</li><li><strong>Lint:</strong> Code quality checks</li><li><strong>Deploy:</strong> Push ke staging/production</li></ol><div class="code"># GitHub Actions example
name: Deploy
on: [push]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: npm ci
      - run: npm test
      - run: npm run build
      - run: npx vercel deploy --prod</div><div class="sb"><h4>Ringkasan</h4><p>Pipeline: build → test → lint → deploy. Automate everything. Gunakan staging environment sebelum production. Rollback strategy wajib ada.</p></div>',
        default => $this->fallback($t),
    };}

    private function if202(string $t): string { return match($t) {
        'Normalisasi Database' => '<h3>Normalisasi</h3><div class="cb"><strong>Normalisasi</strong> meminimalkan redundansi dan anomaly melalui tahapan Normal Form.</div><h3>1NF — Atomik</h3><p>Setiap kolom berisi satu nilai. Tidak ada array/grup dalam satu sel.</p><h3>2NF — Full Dependency</h3><p>Sudah 1NF + setiap non-key column bergantung penuh pada PK (bukan sebagian).</p><div class="code">-- ❌ Partial dependency: course_name hanya bergantung pada course_id
CREATE TABLE enrollment (
    student_id INT, course_id INT,
    course_name VARCHAR(100), grade CHAR(1),
    PRIMARY KEY (student_id, course_id)
);
-- ✅ Pisahkan
CREATE TABLE courses (course_id INT PK, course_name VARCHAR(100));
CREATE TABLE enrollment (student_id INT, course_id INT FK, grade CHAR(1));</div><h3>3NF — No Transitive</h3><p>Sudah 2NF + tidak ada non-key yang bergantung pada non-key lain.</p><div class="sb"><h4>Ringkasan</h4><p>1NF (atomik) → 2NF (full dep) → 3NF (no transitive). 3NF cukup untuk kebanyakan kasus. Denormalisasi untuk performa query jika perlu.</p></div>',
        'ERD & Relasi Antar Tabel' => '<h3>ERD</h3><div class="cb"><strong>ERD</strong> memodelkan entitas, atribut, dan relasi sebagai blueprint database.</div><h3>Jenis Relasi</h3><table><tr><th>Relasi</th><th>Contoh</th><th>Implementasi</th></tr><tr><td>1:1</td><td>User ↔ Profile</td><td>UNIQUE FK</td></tr><tr><td>1:N</td><td>User → Posts</td><td>FK di sisi many</td></tr><tr><td>M:N</td><td>Student ↔ Course</td><td>Tabel pivot</td></tr></table><div class="code">CREATE TABLE course_students (
    id UUID PRIMARY KEY,
    course_id UUID REFERENCES courses(id),
    student_id UUID REFERENCES users(id),
    UNIQUE(course_id, student_id)
);</div><div class="sb"><h4>Ringkasan</h4><p>1:1 pakai UNIQUE FK, 1:N pakai FK di sisi many, M:N pakai tabel pivot. Pertimbangkan ON DELETE (CASCADE, SET NULL, RESTRICT).</p></div>',
        'Query Optimization' => '<h3>Optimasi Query</h3><div class="cb"><strong>Query optimization</strong> mengurangi waktu eksekusi query melalui pemilihan index, penulisan query efisien, dan pemahaman execution plan.</div><h3>EXPLAIN ANALYZE</h3><div class="code">EXPLAIN ANALYZE SELECT * FROM students WHERE course_id = \'abc\' AND grade > 80;
-- Lihat: Seq Scan vs Index Scan, rows examined, actual time</div><h3>Prinsip Optimasi</h3><ul><li>Hindari <code>SELECT *</code> — pilih kolom yang diperlukan</li><li>Gunakan <code>WHERE</code> sebelum <code>HAVING</code></li><li><code>JOIN</code> lebih efisien dari subquery</li><li>BATCH insert lebih cepat dari loop insert</li></ul><div class="sb"><h4>Ringkasan</h4><p>Selalu cek EXPLAIN ANALYZE. Index kolom yang sering di-WHERE/JOIN. Hindari N+1 query. Gunakan connection pooling untuk high traffic.</p></div>',
        'Indexing Strategy' => '<h3>Indexing</h3><div class="cb"><strong>Index</strong> adalah struktur data (B-tree, hash) yang mempercepat pencarian, seperti indeks di buku. Trade-off: mempercepat SELECT, memperlambat INSERT/UPDATE.</div><h3>Jenis Index</h3><table><tr><th>Tipe</th><th>Struktur</th><th>Use Case</th></tr><tr><td>B-Tree</td><td>Balanced tree</td><td>Range query, ORDER BY</td></tr><tr><td>Hash</td><td>Hash table</td><td>Equality (=)</td></tr><tr><td>GIN</td><td>Inverted index</td><td>Full-text, JSONB, array</td></tr><tr><td>Composite</td><td>Multi-column</td><td>Query dengan beberapa kolom</td></tr></table><div class="code">CREATE INDEX idx_students_course ON students(course_id);
CREATE INDEX idx_enrollment_composite ON enrollment(course_id, student_id);
CREATE INDEX idx_name_trgm ON users USING gin(name gin_trgm_ops);</div><div class="sb"><h4>Ringkasan</h4><p>Index kolom yang sering di-WHERE, JOIN, ORDER BY. Composite index ikuti leftmost prefix rule. Jangan over-index: setiap index memperlambat write.</p></div>',
        'Transaksi & Concurrency' => '<h3>ACID Properties</h3><div class="cb"><strong>Transaksi</strong> menjamin operasi database bersifat Atomic, Consistent, Isolated, dan Durable (ACID).</div><h3>Isolation Levels</h3><table><tr><th>Level</th><th>Dirty Read</th><th>Non-Repeatable</th><th>Phantom</th></tr><tr><td>Read Uncommitted</td><td>Mungkin</td><td>Mungkin</td><td>Mungkin</td></tr><tr><td>Read Committed</td><td>Tidak</td><td>Mungkin</td><td>Mungkin</td></tr><tr><td>Repeatable Read</td><td>Tidak</td><td>Tidak</td><td>Mungkin</td></tr><tr><td>Serializable</td><td>Tidak</td><td>Tidak</td><td>Tidak</td></tr></table><div class="code">BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT; -- atau ROLLBACK jika ada error</div><div class="sb"><h4>Ringkasan</h4><p>Transaksi ACID menjamin konsistensi. Pilih isolation level sesuai kebutuhan: Read Committed untuk kebanyakan kasus, Serializable untuk critical operations.</p></div>',
        'NoSQL vs RDBMS' => '<h3>Perbandingan</h3><table><tr><th>Aspek</th><th>RDBMS (PostgreSQL)</th><th>NoSQL (MongoDB)</th></tr><tr><td>Schema</td><td>Fixed, predefined</td><td>Flexible, dynamic</td></tr><tr><td>Scaling</td><td>Vertical (scale up)</td><td>Horizontal (sharding)</td></tr><tr><td>Transactions</td><td>ACID compliant</td><td>Eventual consistency</td></tr><tr><td>Query</td><td>SQL (powerful joins)</td><td>Document-oriented</td></tr><tr><td>Use Case</td><td>Financial, structured</td><td>Content, IoT, real-time</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>RDBMS untuk data terstruktur dan transaksional. NoSQL untuk data fleksibel dan high-throughput. Pilih berdasarkan kebutuhan, bukan hype.</p></div>',
        default => $this->fallback($t),
    };}

    private function if203(string $t): string { return match($t) {
        'Sorting Algorithm Comparison' => '<h3>Perbandingan Sorting</h3><div class="cb"><strong>Sorting</strong> mengurutkan data. Setiap algoritma punya trade-off kecepatan, memori, dan stabilitas.</div><table><tr><th>Algoritma</th><th>Best</th><th>Average</th><th>Worst</th><th>Stable</th></tr><tr><td>Bubble</td><td>O(n)</td><td>O(n²)</td><td>O(n²)</td><td>Ya</td></tr><tr><td>Insertion</td><td>O(n)</td><td>O(n²)</td><td>O(n²)</td><td>Ya</td></tr><tr><td>Merge</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n log n)</td><td>Ya</td></tr><tr><td>Quick</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n²)</td><td>Tidak</td></tr></table><div class="code">function mergeSort(arr) {
    if (arr.length &lt;= 1) return arr;
    const mid = Math.floor(arr.length / 2);
    return merge(mergeSort(arr.slice(0, mid)), mergeSort(arr.slice(mid)));
}</div><div class="sb"><h4>Ringkasan</h4><p>n kecil: Insertion. Data besar: Merge Sort (stable) atau Quick Sort (in-place). Production: Timsort (built-in sort).</p></div>',
        'Binary Search & Variasinya' => '<h3>Binary Search</h3><div class="cb"><strong>Binary Search</strong> mencari elemen dalam array terurut dengan membagi range pencarian menjadi dua setiap iterasi. Kompleksitas: O(log n).</div><div class="code">function binarySearch(arr, target) {
    let lo = 0, hi = arr.length - 1;
    while (lo &lt;= hi) {
        const mid = lo + Math.floor((hi - lo) / 2);
        if (arr[mid] === target) return mid;
        if (arr[mid] &lt; target) lo = mid + 1;
        else hi = mid - 1;
    }
    return -1;
}</div><h3>Variasi</h3><ul><li><strong>Lower Bound:</strong> Index pertama yang >= target</li><li><strong>Upper Bound:</strong> Index pertama yang > target</li><li><strong>Rotated Array:</strong> Binary search di array yang sudah dirotasi</li></ul><div class="sb"><h4>Ringkasan</h4><p>Binary search O(log n) untuk array terurut. Variasi: lower/upper bound untuk range queries. Selalu waspada integer overflow di mid calculation.</p></div>',
        'Tree & Graph Traversal' => '<h3>Tree Traversal</h3><div class="cb"><strong>Tree traversal</strong> mengunjungi setiap node tepat sekali. Tiga jenis DFS: pre-order, in-order, post-order.</div><h3>DFS vs BFS</h3><table><tr><th>Aspek</th><th>DFS</th><th>BFS</th></tr><tr><td>Struktur</td><td>Stack/recursion</td><td>Queue</td></tr><tr><td>Space</td><td>O(height)</td><td>O(width)</td></tr><tr><td>Use Case</td><td>Path finding, topological sort</td><td>Shortest path, level order</td></tr></table><div class="code">function dfs(node) {
    if (!node) return;
    console.log(node.value);  // pre-order
    dfs(node.left);
    dfs(node.right);
}

function bfs(root) {
    const queue = [root];
    while (queue.length) {
        const node = queue.shift();
        console.log(node.value);
        if (node.left) queue.push(node.left);
        if (node.right) queue.push(node.right);
    }
}</div><div class="sb"><h4>Ringkasan</h4><p>DFS untuk deep exploration (backtracking, topological sort). BFS untuk shortest path dan level-order traversal. Graph: tambah visited set untuk menghindari siklus.</p></div>',
        'Linked List & Stack/Queue' => '<h3>Linked List</h3><div class="cb"><strong>Linked List</strong> menyimpan elemen di node terpisah yang terhubung via pointer. Insert/delete O(1), akses O(n).</div><h3>Stack (LIFO) vs Queue (FIFO)</h3><table><tr><th>Operasi</th><th>Stack</th><th>Queue</th></tr><tr><td>Insert</td><td>push (top)</td><td>enqueue (rear)</td></tr><tr><td>Remove</td><td>pop (top)</td><td>dequeue (front)</td></tr><tr><td>Use Case</td><td>Undo, call stack, DFS</td><td>BFS, task scheduling</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Linked List: insert/delete cepat, akses lambat. Stack untuk LIFO (undo, recursion). Queue untuk FIFO (BFS, scheduling).</p></div>',
        'Dynamic Programming' => '<h3>Dynamic Programming</h3><div class="cb"><strong>DP</strong> memecah masalah besar menjadi subproblem yang overlapping, menyimpan hasil subproblem (memoization/tabulation) untuk menghindari komputasi ulang.</div><h3>Contoh: Fibonacci</h3><div class="code">// Naive: O(2^n)
function fib(n) { return n &lt;= 1 ? n : fib(n-1) + fib(n-2); }

// Memoization: O(n)
const memo = {};
function fibMemo(n) {
    if (n &lt;= 1) return n;
    if (memo[n]) return memo[n];
    return memo[n] = fibMemo(n-1) + fibMemo(n-2);
}

// Tabulation: O(n) time, O(1) space
function fibTab(n) {
    let a = 0, b = 1;
    for (let i = 2; i &lt;= n; i++) [a, b] = [b, a + b];
    return b;
}</div><div class="sb"><h4>Ringkasan</h4><p>DP = overlapping subproblems + optimal substructure. Top-down: memoization (recursion + cache). Bottom-up: tabulation (iterative, sering lebih efisien).</p></div>',
        'Big-O Analysis' => '<h3>Kompleksitas Algoritma</h3><div class="cb"><strong>Big-O</strong> menggambarkan batas atas pertumbuhan waktu/ruang seiring input membesar. Fokus pada dominant term, abaikan konstanta.</div><table><tr><th>Notasi</th><th>Nama</th><th>Contoh</th></tr><tr><td>O(1)</td><td>Constant</td><td>Array access, hash lookup</td></tr><tr><td>O(log n)</td><td>Logarithmic</td><td>Binary search</td></tr><tr><td>O(n)</td><td>Linear</td><td>Linear search, traversal</td></tr><tr><td>O(n log n)</td><td>Linearithmic</td><td>Merge sort, heap sort</td></tr><tr><td>O(n²)</td><td>Quadratic</td><td>Bubble sort, nested loop</td></tr><tr><td>O(2^n)</td><td>Exponential</td><td>Brute force subset</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Big-O mengukur scalability. O(1) > O(log n) > O(n) > O(n log n) > O(n²). Analisis worst case untuk safety, average case untuk practical performance.</p></div>',
        default => $this->fallback($t),
    };}

    private function if204(string $t): string { return match($t) {
        'TCP/IP & OSI Layer' => '<h3>Model OSI (7 Layer)</h3><div class="cb"><strong>OSI</strong> adalah model referensi 7 layer untuk komunikasi jaringan.</div><table><tr><th>Layer</th><th>Nama</th><th>Protokol</th></tr><tr><td>7</td><td>Application</td><td>HTTP, DNS, SMTP</td></tr><tr><td>4</td><td>Transport</td><td>TCP, UDP</td></tr><tr><td>3</td><td>Network</td><td>IP, ICMP</td></tr><tr><td>2</td><td>Data Link</td><td>Ethernet, WiFi</td></tr></table><h3>TCP vs UDP</h3><table><tr><th>Aspek</th><th>TCP</th><th>UDP</th></tr><tr><td>Connection</td><td>Connection-oriented</td><td>Connectionless</td></tr><tr><td>Reliability</td><td>Guaranteed</td><td>Best-effort</td></tr><tr><td>Use Case</td><td>Web, email</td><td>DNS, streaming</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>OSI 7 layer (referensi), TCP/IP 4 layer (praktis). TCP reliable, UDP fast. Setiap layer berkomunikasi hanya dengan layer tetangga.</p></div>',
        'Protokol Jaringan Dasar' => '<h3>Protokol Utama</h3><div class="cb"><strong>Protokol</strong> adalah aturan komunikasi yang disepakati. Setiap protokol beroperasi di layer tertentu.</div><h3>DNS — Domain Name System</h3><p>Menerjemahkan domain (google.com) ke IP address. Proses: recursive query → root server → TLD → authoritative.</p><h3>DHCP — Dynamic Host Configuration</h3><p>Memberikan IP address otomatis ke device. Proses: DORA (Discover, Offer, Request, Acknowledge).</p><h3>ARP — Address Resolution Protocol</h3><p>Memetakan IP address ke MAC address dalam jaringan lokal.</p><div class="sb"><h4>Ringkasan</h4><p>DNS: domain → IP. DHCP: auto IP assignment. ARP: IP → MAC. ICMP: diagnostic (ping). Setiap protokol punya peran spesifik di stack jaringan.</p></div>',
        'Routing Protocol (OSPF, BGP)' => '<h3>Routing</h3><div class="cb"><strong>Routing</strong> menentukan jalur terbaik untuk paket data dari source ke destination.</div><h3>IGP vs EGP</h3><table><tr><th>Tipe</th><th>Protokol</th><th>Scope</th></tr><tr><td>IGP (Interior)</td><td>OSPF, RIP, EIGRP</td><td>Dalam satu AS</td></tr><tr><td>EGP (Exterior)</td><td>BGP</td><td>Antar AS (internet)</td></tr></table><h3>OSPF — Open Shortest Path First</h3><p>Link-state routing. Setiap router punya peta lengkap topologi. Gunakan Dijkstra untuk shortest path.</p><h3>BGP — Border Gateway Protocol</h3><p>Path-vector routing untuk internet. Memilih jalur berdasarkan AS-path, policy, bukan metrik teknis.</p><div class="sb"><h4>Ringkasan</h4><p>IGP (OSPF) untuk routing internal, EGP (BGP) untuk antar-AS. OSPF cepat konvergen, BGP skalabel untuk internet.</p></div>',
        'VLAN & Subnetting' => '<h3>VLAN</h3><div class="cb"><strong>VLAN</strong> membagi switch fisik menjadi beberapa jaringan logis terpisah untuk keamanan dan manajemen.</div><h3>Subnetting</h3><p>Membagi network besar menjadi sub-network lebih kecil. Gunakan CIDR notation.</p><div class="code">Network: 192.168.1.0/24
Subnet mask: 255.255.255.0
Host range: 192.168.1.1 - 192.168.1.254
Broadcast: 192.168.1.255
Usable hosts: 254</div><div class="sb"><h4>Ringkasan</h4><p>VLAN untuk segmentasi logis di switch. Subnetting untuk membagi IP address space. Keduanya meningkatkan keamanan dan mengurangi broadcast domain.</p></div>',
        'Network Security Fundamentals' => '<h3>Security Principles</h3><div class="cb">CIA Triad: <strong>Confidentiality</strong> (kerahasiaan), <strong>Integrity</strong> (integritas), <strong>Availability</strong> (ketersediaan).</div><h3>Defense in Depth</h3><ol><li>Physical security (access control)</li><li>Network security (firewall, IDS)</li><li>Host security (patching, antivirus)</li><li>Application security (input validation)</li><li>Data security (encryption)</li></ol><div class="sb"><h4>Ringkasan</h4><p>CIA Triad sebagai fondasi. Defense in depth: multiple layers of security. Least privilege: berikan akses minimum yang diperlukan.</p></div>',
        'Firewall & IDS/IPS' => '<h3>Firewall</h3><div class="cb"><strong>Firewall</strong> memfilter traffic berdasarkan aturan. Tipe: packet filter, stateful, application-layer (WAF).</div><h3>IDS vs IPS</h3><table><tr><th>Aspek</th><th>IDS (Detection)</th><th>IPS (Prevention)</th></tr><tr><td>Aksi</td><td>Deteksi + alert</td><td>Deteksi + block otomatis</td></tr><tr><td>Posisi</td><td>Out-of-band</td><td>Inline</td></tr><tr><td>Risiko</td><td>Low (monitoring only)</td><td>False positive bisa block legitimate</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Firewall memfilter traffic berdasarkan rules. IDS mendeteksi ancaman, IPS memblokir otomatis. Kombinasi keduanya memberikan perlindungan komprehensif.</p></div>',
        default => $this->fallback($t),
    };}

    private function if205(string $t): string { return match($t) {
        'Machine Learning Pipeline' => '<h3>ML Pipeline</h3><div class="cb"><strong>ML Pipeline</strong> adalah rangkaian tahapan dari data mentah hingga model production.</div><h3>Tahapan</h3><ol><li><strong>Collection:</strong> Kumpulkan data dari berbagai sumber</li><li><strong>Preprocessing:</strong> Clean, handle missing, encode</li><li><strong>Feature Engineering:</strong> Buat fitur baru yang informatif</li><li><strong>Training:</strong> Fit model ke data training</li><li><strong>Evaluation:</strong> Ukur performa di data test</li><li><strong>Deployment:</strong> Serve via API atau batch</li></ol><div class="code">from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, stratify=y)
model = RandomForestClassifier(n_estimators=100)
model.fit(X_train, y_train)
print(f"Accuracy: {model.score(X_test, y_test):.3f}")</div><div class="sb"><h4>Ringkasan</h4><p>Pipeline: collect → preprocess → feature engineer → train → evaluate → deploy. Kualitas data dan feature engineering biasanya lebih berdampak dari pemilihan model.</p></div>',
        'Supervised vs Unsupervised Learning' => '<h3>Jenis Pembelajaran</h3><div class="cb"><strong>Supervised:</strong> data berlabel (input → output). <strong>Unsupervised:</strong> data tanpa label, cari pola tersembunyi.</div><table><tr><th>Aspek</th><th>Supervised</th><th>Unsupervised</th></tr><tr><td>Data</td><td>Labeled (X, y)</td><td>Unlabeled (X only)</td></tr><tr><td>Task</td><td>Classification, Regression</td><td>Clustering, Dimensionality reduction</td></tr><tr><th>Algoritma</th><td>Decision Tree, SVM, Neural Net</td><td>K-Means, PCA, DBSCAN</td></tr><tr><td>Evaluation</td><td>Accuracy, RMSE</td><td>Silhouette, Elbow method</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Supervised: prediksi dari data berlabel. Unsupervised: temukan pola dari data tanpa label. Semi-supervised: kombinasi keduanya.</p></div>',
        'Model Evaluation Metrics' => '<h3>Metrics</h3><div class="cb">Pilih metric berdasarkan task dan karakteristik data.</div><h3>Classification</h3><table><tr><th>Metric</th><th>Formula</th><th>Kapan Pakai</th></tr><tr><td>Accuracy</td><td>(TP+TN)/(P+N)</td><td>Class balanced</td></tr><tr><td>Precision</td><td>TP/(TP+FP)</td><td>False positive mahal</td></tr><tr><td>Recall</td><td>TP/(TP+FN)</td><td>False negative mahal</td></tr><tr><td>F1-Score</td><td>2*P*R/(P+R)</td><td>Butuh balance P-R</td></tr></table><h3>Regression</h3><ul><li><strong>MAE:</strong> Mean Absolute Error — interpretable</li><li><strong>RMSE:</strong> Root Mean Squared Error — penalize large errors</li><li><strong>R²:</strong> Coefficient of determination — variance explained</li></ul><div class="sb"><h4>Ringkasan</h4><p>Accuracy untuk balanced data. Precision untuk spam detection. Recall untuk medical diagnosis. F1 untuk balance. RMSE untuk regression.</p></div>',
        'Cross-Validation & Hyperparameter Tuning' => '<h3>Cross-Validation</h3><div class="cb"><strong>K-Fold CV</strong> membagi data menjadi K fold, rotasi sebagai validation set. Memberikan estimasi performa yang lebih robust.</div><div class="code">from sklearn.model_selection import cross_val_score, GridSearchCV

scores = cross_val_score(model, X, y, cv=5, scoring=\'accuracy\')
print(f"Mean: {scores.mean():.3f} (+/- {scores.std():.3f})")

params = {\'n_estimators\': [50, 100, 200], \'max_depth\': [3, 5, 10]}
grid = GridSearchCV(model, params, cv=5)
grid.fit(X_train, y_train)</div><div class="sb"><h4>Ringkasan</h4><p>K-Fold CV (biasanya K=5 atau 10) memberikan estimasi performa robust. GridSearch untuk exhaustive search, RandomSearch untuk ruang parameter besar.</p></div>',
        'Neural Network Architecture' => '<h3>Neural Network</h3><div class="cb"><strong>Neural Network</strong> terinspirasi otak biologis: neuron buatan terhubung dalam lapisan, belajar melalui backpropagation.</div><h3>Arsitektur Dasar</h3><div class="code">Input Layer → Hidden Layer(s) → Output Layer
    [x₁,x₂]  →  [h₁,h₂,h₃]  →  [y₁]

Activation: ReLU(hidden), Sigmoid/Softmax(output)
Loss: MSE(regression), CrossEntropy(classification)
Optimizer: SGD, Adam, RMSprop</div><h3>Deep Learning</h3><ul><li><strong>CNN:</strong> Convolutional — image, spatial data</li><li><strong>RNN/LSTM:</strong> Recurrent — sequential, time series</li><li><strong>Transformer:</strong> Attention-based — NLP, vision</li></ul><div class="sb"><h4>Ringkasan</h4><p>NN = layers of neurons + activation + backprop. CNN untuk gambar, RNN untuk sequence, Transformer untuk NLP. Lebih dalam = lebih representatif tapi butuh lebih banyak data.</p></div>',
        'Prompt Engineering' => '<h3>Prompt Engineering</h3><div class="cb"><strong>Prompt Engineering</strong> adalah seni merancang input untuk LLM agar menghasilkan output yang akurat dan relevan.</div><h3>Teknik</h3><table><tr><th>Teknik</th><th>Deskripsi</th><th>Contoh</th></tr><tr><td>Zero-shot</td><td>Langsung tanya</td><td>"Jelaskan normalisasi database"</td></tr><tr><td>Few-shot</td><td>Beri contoh</td><td>"Contoh: X→Y. Sekarang: A→?"</td></tr><tr><td>Chain-of-Thought</td><td>Minta reasoning</td><td>"Pikirkan step by step..."</td></tr><tr><td>Role-based</td><td>Tetapkan peran</td><td>"Sebagai DBA senior..."</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Prompt engineering: spesifik, beri konteks, minta step-by-step reasoning. Few-shot untuk format konsisten. System prompt untuk persona dan batasan.</p></div>',
        default => $this->fallback($t),
    };}

    private function if206(string $t): string { return match($t) {
        'Software Requirement Analysis' => '<h3>Requirements</h3><div class="cb"><strong>Requirements Engineering</strong> mengumpulkan, menganalisis, dan mendokumentasikan kebutuhan sistem dari stakeholder.</div><h3>Jenis Requirements</h3><table><tr><th>Tipe</th><th>Contoh</th></tr><tr><td>Functional</td><td>"User dapat login dengan email"</td></tr><tr><td>Non-Functional</td><td>"Response time < 200ms"</td></tr><tr><td>Constraint</td><td>"Harus berjalan di Linux"</td></tr></table><h3>User Stories</h3><div class="code">As a [student],
I want to [join a study group using a code],
So that [I can collaborate with my classmates].

Acceptance Criteria:
- Code input accepts 8 characters
- Invalid code shows error message
- Successful join redirects to group page</div><div class="sb"><h4>Ringkasan</h4><p>Gather → analyze → specify → validate. User stories untuk agile. Acceptance criteria untuk testing. Prioritize dengan MoSCoW (Must, Should, Could, Won\'t).</p></div>',
        'UML & Use Case Diagram' => '<h3>UML</h3><div class="cb"><strong>UML</strong> (Unified Modeling Language) memvisualisasikan desain sistem. Diagram utama: Use Case, Class, Sequence, Activity.</div><h3>Use Case Diagram</h3><p>Menunjukkan interaksi actor dengan sistem. Komponen: Actor (stick figure), Use Case (ellipse), System boundary (rectangle).</p><h3>Relasi Use Case</h3><ul><li><strong>Include:</strong> Use case A selalu memanggil B</li><li><strong>Extend:</strong> Use case B opsional menambah A</li><li><strong>Generalization:</strong> Actor/use case inheritance</li></ul><div class="sb"><h4>Ringkasan</h4><p>Use Case untuk scope sistem. Class diagram untuk struktur data. Sequence diagram untuk interaksi temporal. Pilih diagram sesuai kebutuhan komunikasi.</p></div>',
        'Clean Architecture' => '<h3>Clean Architecture</h3><div class="cb"><strong>Clean Architecture</strong> memisahkan kode berdasarkan tingkat abstraksi. Dependency selalu mengarah ke dalam.</div><h3>Layers</h3><table><tr><th>Layer</th><th>Tanggung Jawab</th></tr><tr><td>Entities</td><td>Business rules inti</td></tr><tr><td>Use Cases</td><td>Application rules</td></tr><tr><td>Adapters</td><td>Controller, presenter, gateway</td></tr><tr><td>Frameworks</td><td>DB, web, UI</td></tr></table><div class="code">interface UserRepository {
    findById(id: string): Promise&lt;User&gt;;
    save(user: User): Promise&lt;void&gt;;
}

class CreateUserUseCase {
    constructor(private repo: UserRepository) {}
    async execute(name: string, email: string) {
        const user = new User(uuid(), name, email);
        await this.repo.save(user);
        return user;
    }
}</div><div class="sb"><h4>Ringkasan</h4><p>Dependency mengarah ke dalam. Domain tidak tahu framework. Interface memisahkan use case dari infrastructure. Testable, maintainable.</p></div>',
        'Design Patterns' => '<h3>Design Patterns</h3><div class="cb"><strong>Design Patterns</strong> adalah solusi teruji untuk masalah umum dalam software design. Tiga kategori: Creational, Structural, Behavioral.</div><h3>Contoh Patterns</h3><table><tr><th>Pattern</th><th>Kategori</th><th>Use Case</th></tr><tr><td>Singleton</td><td>Creational</td><td>DB connection, config</td></tr><tr><td>Factory</td><td>Creational</td><td>Object creation logic</td></tr><tr><td>Observer</td><td>Behavioral</td><td>Event system, pub/sub</td></tr><tr><td>Strategy</td><td>Behavioral</td><td>Swappable algorithms</td></tr><tr><td>Repository</td><td>Structural</td><td>Data access abstraction</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Patterns bukan silver bullet — gunakan saat benar-benar dibutuhkan. Over-engineering sama berbahayanya dengan under-engineering.</p></div>',
        'Testing Strategy (Unit, Integration)' => '<h3>Testing Pyramid</h3><div class="cb"><strong>Testing Pyramid:</strong> banyak unit test (dasar), sedikit integration test (tengah), sangat sedikit e2e test (puncak).</div><table><tr><th>Level</th><th>Scope</th><th>Speed</th><th>Contoh</th></tr><tr><td>Unit</td><td>Satu fungsi/class</td><td>Sangat cepat</td><td>Test pure function</td></tr><tr><td>Integration</td><td>Beberapa komponen</td><td>Sedang</td><td>API + DB</td></tr><tr><td>E2E</td><td>Seluruh sistem</td><td>Lambat</td><td>Browser automation</td></tr></table><div class="code">describe(\'UserService\', () =&gt; {
    it(\'should hash password before saving\', async () =&gt; {
        const mockRepo = { save: jest.fn() };
        const service = new UserService(mockRepo);
        await service.create({ email: \'a@b.com\', password: \'secret\' });
        expect(mockRepo.save).toHaveBeenCalledWith(
            expect.objectContaining({ password: expect.not.stringMatching(\'secret\') })
        );
    });
});</div><div class="sb"><h4>Ringkasan</h4><p>Testing pyramid: banyak unit, sedang integration, sedikit e2e. Mock dependencies di unit test. Test behavior, bukan implementation.</p></div>',
        'CI/CD Pipeline' => '<h3>CI/CD</h3><div class="cb"><strong>CI</strong> (Continuous Integration) merge code frequently dengan automated testing. <strong>CD</strong> (Continuous Deployment) deploy otomatis ke production.</div><h3>Pipeline Stages</h3><ol><li>Checkout code</li><li>Install dependencies</li><li>Lint & type check</li><li>Run tests (unit, integration)</li><li>Build artifact</li><li>Deploy to staging</li><li>Run e2e tests</li><li>Deploy to production</li></ol><div class="sb"><h4>Ringkasan</h4><p>Automate everything. Fast feedback loop. Blue-green atau canary deployment untuk zero-downtime. Rollback strategy wajib ada.</p></div>',
        default => $this->fallback($t),
    };}

    private function if207(string $t): string { return match($t) {
        'Process Scheduling Algorithm' => '<h3>Scheduling</h3><div class="cb"><strong>Process Scheduling</strong> menentukan proses mana yang mendapat CPU.</div><table><tr><th>Algoritma</th><th>Prinsip</th><th>Pros</th><th>Cons</th></tr><tr><td>FCFS</td><td>Datang pertama</td><td>Simple</td><td>Convoy effect</td></tr><tr><td>SJF</td><td>Terpendek dulu</td><td>Optimal avg wait</td><td>Starvation</td></tr><tr><td>Round Robin</td><td>Time slice</td><td>Fair, responsive</td><td>Context switch overhead</td></tr><tr><td>Priority</td><td>Prioritas tinggi</td><td>Flexible</td><td>Starvation low prio</td></tr></table><h3>Round Robin</h3><p>Setiap proses mendapat quantum (10-100ms). Quantum terlalu besar → FCFS. Terlalu kecil → overhead.</p><div class="sb"><h4>Ringkasan</h4><p>FCFS simple, SJF optimal, Round Robin fair. OS modern pakai multilevel feedback queue. Time quantum RR idealnya 10-100ms.</p></div>',
        'Threading & Concurrency' => '<h3>Thread</h3><div class="cb"><strong>Thread</strong> adalah unit eksekusi terkecil dalam proses. Multi-threading memungkinkan paralelisme dalam satu proses.</div><h3>Concurrency Issues</h3><ul><li><strong>Race Condition:</strong> Hasil bergantung pada urutan eksekusi</li><li><strong>Deadlock:</strong> Dua thread saling menunggu</li><li><strong>Starvation:</strong> Thread tidak pernah dapat resource</li></ul><h3>Synchronization</h3><div class="code">// Mutex
pthread_mutex_lock(&amp;mutex);
shared_counter++;
pthread_mutex_unlock(&amp;mutex);

// Semaphore
sem_wait(&amp;sem);  // acquire
critical_section();
sem_post(&amp;sem);  // release</div><div class="sb"><h4>Ringkasan</h4><p>Thread = lightweight process. Masalah: race condition, deadlock. Solusi: mutex, semaphore, atomic operations. Minimize shared state.</p></div>',
        'Memory Management & Paging' => '<h3>Memory Management</h3><div class="cb"><strong>Paging</strong> membagi memori fisik dan virtual menjadi page/frame berukuran tetap. Menghilangkan external fragmentation.</div><h3>Virtual Memory</h3><p>Setiap proses melihat address space sendiri (virtual). OS memetakan virtual → physical via page table.</p><table><tr><th>Konsep</th><th>Deskripsi</th></tr><tr><td>Page</td><td>Blok virtual memory (4KB)</td></tr><tr><td>Frame</td><td>Blok physical memory (4KB)</td></tr><tr><td>Page Table</td><td>Mapping virtual → physical</td></tr><tr><td>TLB</td><td>Cache page table untuk speed</td></tr><tr><td>Page Fault</td><td>Page tidak ada di physical memory</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Paging: fixed-size blocks, no external fragmentation. Page table mapping virtual→physical. TLB sebagai cache. Page fault trigger disk I/O.</p></div>',
        'Virtual Memory' => '<h3>Virtual Memory</h3><div class="cb"><strong>Virtual Memory</strong> memberikan ilusi memori lebih besar dari RAM fisik menggunakan disk sebagai extension.</div><h3>Page Replacement Algorithms</h3><table><tr><th>Algoritma</th><th>Prinsip</th><th>Performance</th></tr><tr><td>FIFO</td><td>First in first out</td><td>Belady\'s anomaly</td></tr><tr><td>LRU</td><td>Least recently used</td><td>Near optimal</td></tr><tr><td>Optimal</td><td>Replace farthest future</td><td>Best (theoretical)</td></tr><tr><td>Clock</td><td>Approximation LRU</td><td>Practical, efficient</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Virtual memory = RAM + swap. LRU paling praktis. Thrashing terjadi saat terlalu banyak page fault — kurangi degree of multiprogramming.</p></div>',
        'File System Organization' => '<h3>File System</h3><div class="cb"><strong>File System</strong> mengorganisir data di storage device. Menyediakan abstraksi file dan direktori di atas raw disk blocks.</div><h3>Komponen</h3><ul><li><strong>Inode:</strong> Metadata file (size, permissions, block pointers)</li><li><strong>Directory:</strong> Mapping name → inode</li><li><strong>Block allocation:</strong> Contiguous, linked, indexed</li></ul><h3>Journaling</h3><p>Mencatat perubahan sebelum menulis ke disk. Jika crash, recovery dari journal. Contoh: ext4, NTFS.</p><div class="sb"><h4>Ringkasan</h4><p>File system = abstraksi di atas raw blocks. Inode untuk metadata. Journaling untuk crash recovery. ext4 (Linux), NTFS (Windows), APFS (macOS).</p></div>',
        'Deadlock Prevention' => '<h3>Deadlock</h3><div class="cb"><strong>Deadlock</strong> terjadi saat 2+ proses saling menunggu resource yang dipegang satu sama lain. 4 kondisi perlu: mutual exclusion, hold & wait, no preemption, circular wait.</div><h3>Strategi</h3><table><tr><th>Strategi</th><th>Cara</th><th>Trade-off</th></tr><tr><td>Prevention</td><td>Hilangkan salah satu kondisi</td><td>Reduced concurrency</td></tr><tr><td>Avoidance</td><td>Banker\'s algorithm</td><td>Perlu tahu max resource</td></tr><tr><td>Detection</td><td>Resource allocation graph</td><td>Overhead detection</td></tr><tr><td>Ignorance</td><td>Ostrich algorithm</td><td>Paling praktis!</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>4 kondisi deadlock: mutual exclusion, hold&wait, no preemption, circular wait. Prevention: hilangkan satu kondisi. Kebanyakan OS pakai ostrich algorithm (ignore).</p></div>',
        default => $this->fallback($t),
    };}

    private function if208(string $t): string { return match($t) {
        'Mobile UI Pattern' => '<h3>Mobile UI Patterns</h3><div class="cb">Pattern teruji untuk antarmuka mobile, mengikuti Material Design (Android) dan HIG (iOS).</div><h3>Navigation</h3><table><tr><th>Pattern</th><th>Kapan</th></tr><tr><td>Bottom Navigation</td><td>3-5 top-level</td></tr><tr><td>Tab Bar</td><td>Content categories</td></tr><tr><td>Hamburger</td><td>Banyak nav, jarang diakses</td></tr></table><h3>Feedback</h3><ul><li><strong>Skeleton Loading:</strong> Placeholder animasi</li><li><strong>Pull-to-Refresh:</strong> Tarik ke bawah</li><li><strong>Snackbar:</strong> Non-blocking feedback</li><li><strong>Bottom Sheet:</strong> Detail tanpa full nav</li></ul><div class="sb"><h4>Ringkasan</h4><p>Ikuti platform guideline. Bottom nav untuk 3-5 destinasi. Virtualized list untuk data besar. Skeleton loading > spinner.</p></div>',
        'Navigation & Routing' => '<h3>Mobile Navigation</h3><div class="cb"><strong>Navigation</strong> di mobile app berbeda dari web. Stack-based (push/pop) lebih umum daripada tab-based.</div><h3>React Navigation</h3><div class="code">const Stack = createNativeStackNavigator();

function App() {
    return (
        &lt;NavigationContainer&gt;
            &lt;Stack.Navigator&gt;
                &lt;Stack.Screen name="Home" component={HomeScreen} /&gt;
                &lt;Stack.Screen name="Detail" component={DetailScreen}
                    options={{ presentation: \'modal\' }} /&gt;
            &lt;/Stack.Navigator&gt;
        &lt;/NavigationContainer&gt;
    );
}</div><div class="sb"><h4>Ringkasan</h4><p>Stack navigator untuk flow linear. Tab navigator untuk top-level. Drawer untuk banyak menu. Deep linking untuk URL-based navigation.</p></div>',
        'State Management (Redux, Provider)' => '<h3>State Management</h3><div class="cb">Pilih state management berdasarkan kompleksitas app. Tidak perlu Redux untuk app sederhana.</div><table><tr><th>Solusi</th><th>Kompleksitas</th><th>Use Case</th></tr><tr><td>useState/useReducer</td><td>Rendah</td><td>Local component state</td></tr><tr><td>Context + useReducer</td><td>Sedang</td><td>Shared state, few updates</td></tr><tr><td>Redux/Zustand</td><td>Tinggi</td><td>Complex state, many updates</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Local state untuk simple. Context untuk shared. Redux/Zustand untuk complex. Jangan over-engineer state management.</p></div>',
        'API Consumption & Caching' => '<h3>API di Mobile</h3><div class="cb">Mobile app perlu handle offline, slow network, dan data freshness.</div><h3>Caching Strategy</h3><div class="code">// React Query
const { data, isLoading } = useQuery({
    queryKey: [\'posts\', courseId],
    queryFn: () => fetchPosts(courseId),
    staleTime: 5 * 60 * 1000,
    cacheTime: 30 * 60 * 1000,
});</div><div class="sb"><h4>Ringkasan</h4><p>Cache-first untuk data yang jarang berubah. Network-first untuk data real-time. React Query/TanStack Query untuk caching otomatis.</p></div>',
        'Offline Storage (SQLite, Hive)' => '<h3>Offline Storage</h3><div class="cb"><strong>Offline storage</strong> memungkinkan app berfungsi tanpa koneksi internet.</div><table><tr><th>Solusi</th><th>Tipe</th><th>Platform</th></tr><tr><td>SQLite</td><td>Relational DB</td><td>iOS, Android</td></tr><tr><td>Hive</td><td>Key-value</td><td>Flutter</td></tr><tr><td>AsyncStorage</td><td>Key-value</td><td>React Native</td></tr><tr><td>Realm</td><td>Object DB</td><td>Cross-platform</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>SQLite untuk structured data dengan query complex. Key-value (Hive, AsyncStorage) untuk simple data. Sync strategy: last-write-wins atau conflict resolution.</p></div>',
        'Push Notification Integration' => '<h3>Push Notification</h3><div class="cb"><strong>Push notification</strong> mengirim pesan ke device bahkan saat app tidak aktif.</div><h3>Flow</h3><ol><li>App register ke push service (FCM/APNs)</li><li>Dapat device token</li><li>Kirim token ke backend</li><li>Backend kirim push via FCM/APNs</li><li>OS tampilkan notification</li></ol><div class="sb"><h4>Ringkansas</h4><p>FCM untuk Android, APNs untuk iOS. Token bisa berubah — refresh handler wajib. Permission request: jangan minta di first launch.</p></div>',
        default => $this->fallback($t),
    };}

    private function if209(string $t): string { return match($t) {
        'Rendering Pipeline' => '<h3>Graphics Pipeline</h3><div class="cb"><strong>Rendering Pipeline</strong> mengubah 3D scene menjadi 2D image. Modern pipeline programmable via shaders.</div><h3>Stages</h3><ol><li>Application (scene management, culling)</li><li>Vertex Shader (transform posisi)</li><li>Rasterization (geometri → piksel)</li><li>Fragment Shader (hitung warna)</li><li>Output Merger (depth test, blending)</li></ol><div class="sb"><h4>Ringkasan</h4><p>Pipeline: app → vertex shader → rasterize → fragment shader → output. Vertex shader untuk posisi, fragment shader untuk warna. GPU paralelisasi tinggi.</p></div>',
        'Transformasi Geometri 2D/3D' => '<h3>Transformasi</h3><div class="cb"><strong>Transformasi geometri</strong> memanipulasi posisi, orientasi, dan ukuran objek menggunakan matriks.</div><h3>Operasi Dasar</h3><table><tr><th>Transform</th><th>Matriks 2D</th></tr><tr><td>Translation</td><td>[1 0 tx; 0 1 ty; 0 0 1]</td></tr><tr><td>Rotation</td><td>[cos -sin 0; sin cos 0; 0 0 1]</td></tr><tr><td>Scaling</td><td>[sx 0 0; 0 sy 0; 0 0 1]</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Transformasi = perkalian matriks. Urutan penting: Scale → Rotate → Translate. Homogeneous coordinates memungkinkan semua transformasi sebagai matrix multiply.</p></div>',
        'Lighting Model (Phong, Blinn)' => '<h3>Lighting</h3><div class="cb"><strong>Phong model</strong> menghitung pencahayaan sebagai kombinasi ambient + diffuse + specular.</div><h3>Komponen</h3><ul><li><strong>Ambient:</strong> Cahaya lingkungan (konstan)</li><li><strong>Diffuse:</strong> Bergantung sudut cahaya ke permukaan</li><li><strong>Specular:</strong> Pantulan cahaya ke mata (highlight)</li></ul><div class="code">// Phong diffuse
float diff = max(dot(normal, lightDir), 0.0);
// Blinn-Phong (lebih efisien)
vec3 halfDir = normalize(lightDir + viewDir);
float spec = pow(max(dot(normal, halfDir), 0.0), shininess);</div><div class="sb"><h4>Ringkasan</h4><p>Phong = ambient + diffuse + specular. Blinn-Phong lebih efisien (half vector). Per-vertex (Gouraud) cepat, per-fragment (Phong) akurat.</p></div>',
        'Texture Mapping' => '<h3>Texture Mapping</h3><div class="cb"><strong>Texture mapping</strong> menempelkan gambar 2D ke permukaan 3D menggunakan UV coordinates.</div><h3>Filtering</h3><ul><li><strong>Nearest:</strong> Pixel-perfect, blocky</li><li><strong>Linear:</strong> Interpolasi, smooth</li><li><strong>Mipmap:</strong> Pre-computed LODs untuk jarak</li></ul><div class="sb"><h4>Ringkasan</h4><p>UV mapping: 3D surface → 2D texture. Filtering: nearest (pixel art), linear (smooth), mipmap (performance). Tiling untuk permukaan besar.</p></div>',
        '3D Modeling Basics' => '<h3>3D Modeling</h3><div class="cb"><strong>3D modeling</strong> merepresentasikan objek 3D sebagai mesh (kumpulan vertex, edge, face).</div><h3>Representasi</h3><table><tr><th>Tipe</th><th>Deskripsi</th></tr><tr><td>Polygon Mesh</td><td>Segitiga/quad faces</td></tr><tr><td>NURBS</td><td>Smooth curves/surfaces</td></tr><tr><td>Voxel</td><td>3D pixels (Minecraft)</td></tr><tr><td>Point Cloud</td><td>Scattered 3D points</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Polygon mesh paling umum di real-time graphics. Lebih banyak polygon = lebih detail tapi lebih berat. LOD untuk performa adaptif.</p></div>',
        'Camera & Projection' => '<h3>Camera</h3><div class="cb"><strong>Camera</strong> menentukan bagaimana 3D scene diproyeksikan ke 2D screen.</div><h3>Jenis Proyeksi</h3><table><tr><th>Tipe</th><th>Sifat</th><th>Use Case</th></tr><tr><td>Perspective</td><td>Objek jauh = kecil</td><td>Game, simulasi</td></tr><tr><td>Orthographic</td><td>Ukuran konstan</td><td>CAD, UI, isometric</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Perspective untuk realism (foreshortening). Orthographic untuk akurasi ukuran. View matrix = camera transform. Projection matrix = perspective/ortho.</p></div>',
        default => $this->fallback($t),
    };}

    private function if210(string $t): string { return match($t) {
        'Encryption & Decryption (AES, RSA)' => '<h3>Kriptografi</h3><div class="cb"><strong>Symmetric</strong> (AES): kunci sama untuk encrypt/decrypt. Cepat. <strong>Asymmetric</strong> (RSA): public key encrypt, private key decrypt. Aman tapi lambat.</div><h3>AES</h3><table><tr><th>Key Size</th><th>Rounds</th><th>Use Case</th></tr><tr><td>AES-128</td><td>10</td><td>General purpose</td></tr><tr><td>AES-256</td><td>14</td><td>Top secret</td></tr></table><h3>RSA</h3><div class="code">const { publicKey, privateKey } = crypto.generateKeyPairSync(\'rsa\', { modulusLength: 2048 });
const encrypted = crypto.publicEncrypt(publicKey, Buffer.from(\'secret\'));
const decrypted = crypto.privateDecrypt(privateKey, encrypted);</div><h3>Hybrid (SSL/TLS)</h3><p>RSA untuk key exchange → AES untuk data transfer.</p><div class="sb"><h4>Ringkasan</h4><p>AES cepat untuk data, RSA aman untuk key exchange. Hybrid encryption: RSA handshake + AES data. Minimal 2048-bit RSA, 256-bit AES.</p></div>',
        'Hashing & Digital Signature' => '<h3>Hashing</h3><div class="cb"><strong>Hash</strong> mengubah input menjadi fixed-length output. One-way (tidak bisa dibalik). Digunakan untuk integrity check dan password storage.</div><table><tr><th>Algoritma</th><th>Output</th><th>Status</th></tr><tr><td>MD5</td><td>128 bit</td><td>Broken, jangan pakai</td></tr><tr><td>SHA-1</td><td>160 bit</td><td>Deprecated</td></tr><tr><td>SHA-256</td><td>256 bit</td><td>Aman</td></tr><tr><td>bcrypt</td><td>Variable</td><td>Password hashing</td></tr></table><h3>Digital Signature</h3><p>Private key sign → public key verify. Menjamin authenticity + integrity.</p><div class="sb"><h4>Ringkasan</h4><p>SHA-256 untuk integrity. bcrypt/argon2 untuk password (slow hash). Digital signature = private key sign, public key verify.</p></div>',
        'Threat Modeling' => '<h3>Threat Modeling</h3><div class="cb"><strong>Threat modeling</strong> mengidentifikasi, mengkategorisasi, dan memprioritaskan ancaman terhadap sistem.</div><h3>STRIDE</h3><table><tr><th>Threat</th><th>Deskripsi</th><th>Mitigasi</th></tr><tr><td>Spoofing</td><td>Identitas palsu</td><td>Authentication</td></tr><tr><td>Tampering</td><td>Modifikasi data</td><td>Integrity checks</td></tr><tr><td>Repudiation</td><td>Menyangkal aksi</td><td>Audit logging</td></tr><tr><td>Info Disclosure</td><td>Bocor data</td><td>Encryption</td></tr><tr><td>DoS</td><td>Service unavailable</td><td>Rate limiting</td></tr><tr><td>Elevation</td><td>Privilege escalation</td><td>Least privilege</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>STRIDE untuk kategorisasi ancaman. Data Flow Diagram untuk visualisasi trust boundaries. Prioritaskan berdasarkan impact × likelihood.</p></div>',
        'OWASP Top 10' => '<h3>OWASP Top 10</h3><div class="cb"><strong>OWASP Top 10</strong> adalah daftar 10 kerentanan web paling kritis, diperbarui setiap 3 tahun.</div><h3>2021 Top 5</h3><ol><li><strong>Broken Access Control</strong> — IDOR, privilege escalation</li><li><strong>Cryptographic Failures</strong> — Weak encryption, plaintext</li><li><strong>Injection</strong> — SQL injection, XSS</li><li><strong>Insecure Design</strong> — Flawed architecture</li><li><strong>Security Misconfiguration</strong> — Default passwords, verbose errors</li></ol><div class="sb"><h4>Ringkasan</h4><p>OWASP Top 10 sebagai checklist keamanan. Access control #1 — selalu verifikasi authorization. Input validation untuk injection. Secure defaults.</p></div>',
        'Access Control (RBAC, ABAC)' => '<h3>Access Control</h3><div class="cb"><strong>RBAC</strong> (Role-Based): akses berdasarkan peran. <strong>ABAC</strong> (Attribute-Based): akses berdasarkan atribut user/resource/context.</div><table><tr><th>Model</th><th>Contoh</th></tr><tr><td>RBAC</td><td>Admin, Editor, Viewer</td></tr><tr><td>ABAC</td><td>Allow if dept=same AND time=workhours</td></tr><tr><td>ACL</td><td>Per-resource permission list</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>RBAC untuk organisasi dengan peran jelas. ABAC untuk policy dinamis. Prinsip least privilege: beri akses minimum yang diperlukan.</p></div>',
        'Secure Coding Practices' => '<h3>Secure Coding</h3><div class="cb">Praktik coding yang mencegah kerentanan keamanan sejak fase development.</div><h3>Prinsip</h3><ul><li><strong>Input Validation:</strong> Whitelist > blacklist. Sanitize semua input.</li><li><strong>Parameterized Queries:</strong> Cegah SQL injection.</li><li><strong>Output Encoding:</strong> Cegah XSS.</li><li><strong>Error Handling:</strong> Jangan expose stack trace.</li><li><strong>Secrets Management:</strong> Environment variables, vault.</li></ul><div class="code">// ❌ SQL Injection vulnerable
db.query("SELECT * FROM users WHERE id = " + userId);

// ✅ Parameterized
db.query("SELECT * FROM users WHERE id = $1", [userId]);</div><div class="sb"><h4>Ringkasan</h4><p>Validate input, parameterize queries, encode output, handle errors securely, manage secrets properly. Security is everyone\'s responsibility.</p></div>',
        default => $this->fallback($t),
    };}

    private function if211(string $t): string { return match($t) {
        'Data Preprocessing & Cleaning' => '<h3>Preprocessing</h3><div class="cb"><strong>"Garbage in, garbage out."</strong> Preprocessing mengubah data mentah menjadi format yang bisa diproses algoritma.</div><h3>Langkah</h3><ol><li><strong>Missing Values:</strong> Drop, fill mean/median/mode, interpolate</li><li><strong>Encoding:</strong> Label encoding (ordinal), one-hot (nominal)</li><li><strong>Scaling:</strong> Standardization, min-max, robust</li><li><strong>Outliers:</strong> IQR method, z-score</li></ol><div class="code">df[\'age\'].fillna(df[\'age\'].median(), inplace=True)
scaler = StandardScaler()
df[[\'income\', \'score\']] = scaler.fit_transform(df[[\'income\', \'score\']])</div><div class="sb"><h4>Ringkasan</h4><p>Handle missing → encode → scale → detect outliers. Split train/test SEBELUM scaling. Pilihan metode tergantung distribusi dan algoritma.</p></div>',
        'Exploratory Data Analysis' => '<h3>EDA</h3><div class="cb"><strong>EDA</strong> memahami data melalui statistik deskriptif dan visualisasi sebelum modeling.</div><h3>Teknik</h3><ul><li><strong>Univariate:</strong> Histogram, box plot, value counts</li><li><strong>Bivariate:</strong> Scatter plot, correlation matrix</li><li><strong>Multivariate:</strong> Pair plot, heatmap</li></ul><div class="sb"><h4>Ringkasan</h4><p>EDA: descriptive stats + visualization. Identifikasi distribusi, korelasi, outlier, missing patterns. EDA menginformasikan preprocessing dan feature engineering.</p></div>',
        'Clustering K-Means & Hierarchical' => '<h3>Clustering</h3><div class="cb"><strong>Clustering</strong> mengelompokkan data tanpa label berdasarkan kemiripan.</div><h3>K-Means</h3><ol><li>Inisialisasi K centroid random</li><li>Assign setiap point ke centroid terdekat</li><li>Update centroid = mean cluster</li><li>Ulangi sampai konvergen</li></ol><h3>Hierarchical</h3><ul><li><strong>Agglomerative:</strong> Bottom-up merge</li><li><strong>Divisive:</strong> Top-down split</li><li>Dendrogram untuk visualisasi</li></ul><div class="sb"><h4>Ringkasan</h4><p>K-Means: cepat, perlu tentukan K (elbow method). Hierarchical: tidak perlu K, tapi lambat untuk data besar. DBSCAN untuk cluster non-spherical.</p></div>',
        'Classification (Decision Tree, SVM)' => '<h3>Classification</h3><div class="cb"><strong>Classification</strong> memprediksi kategori dari data berlabel.</div><table><tr><th>Algoritma</th><th>Pros</th><th>Cons</th></tr><tr><td>Decision Tree</td><td>Interpretable, no scaling</td><td>Overfit, unstable</td></tr><tr><td>SVM</td><td>Effective high-dim</td><td>Slow large data</td></tr><tr><td>Random Forest</td><td>Robust, no overfit</td><td>Less interpretable</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Decision Tree interpretable tapi overfit. Random Forest (ensemble) lebih robust. SVM bagus untuk high-dimensional. Pilih berdasarkan data size dan interpretability needs.</p></div>',
        'Association Rule Mining' => '<h3>Association Rules</h3><div class="cb"><strong>Association Rule Mining</strong> menemukan pola hubungan antar item. Contoh klasik: market basket analysis.</div><h3>Metrics</h3><table><tr><th>Metric</th><th>Formula</th><th>Arti</th></tr><tr><td>Support</td><td>P(A ∩ B)</td><td>Seberapa sering muncul</td></tr><tr><td>Confidence</td><td>P(B|A)</td><td>Seberapa reliable rule</td></tr><tr><td>Lift</td><td>Confidence/P(B)</td><td>>1 = positive association</td></tr></table><h3>Apriori Algorithm</h3><p>Anti-monotone property: jika itemset tidak frequent, superset-nya juga tidak.</p><div class="sb"><h4>Ringkasan</h4><p>Association rules: support, confidence, lift. Apriori untuk frequent itemsets. FP-Growth lebih efisien. Gunakan untuk recommendation dan market analysis.</p></div>',
        'Anomaly Detection' => '<h3>Anomaly Detection</h3><div class="cb"><strong>Anomaly detection</strong> mengidentifikasi data point yang menyimpang dari pola normal.</div><h3>Pendekatan</h3><table><tr><th>Metode</th><th>Tipe</th><th>Use Case</th></tr><tr><td>Z-Score</td><td>Statistical</td><td>Normal distribution</td></tr><tr><td>IQR</td><td>Statistical</td><td>Non-normal data</td></tr><tr><td>Isolation Forest</td><td>ML</td><td>High-dimensional</td></tr><tr><td>Autoencoder</td><td>Deep Learning</td><td>Complex patterns</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Statistical (z-score, IQR) untuk simple data. ML (Isolation Forest) untuk high-dimensional. Deep learning (autoencoder) untuk complex patterns. Use case: fraud, network intrusion, defect.</p></div>',
        default => $this->fallback($t),
    };}

    private function if212(string $t): string { return match($t) {
        'IaaS, PaaS, SaaS Overview' => '<h3>Cloud Service Models</h3><div class="cb"><strong>IaaS</strong> (infrastruktur), <strong>PaaS</strong> (platform), <strong>SaaS</strong> (aplikasi) — semakin tinggi level, semakin sedikit yang dikelola.</div><table><tr><th>Model</th><th>Anda Manage</th><th>Provider Manage</th><th>Contoh</th></tr><tr><td>IaaS</td><td>OS, runtime, app</td><td>Hardware, network</td><td>AWS EC2, GCE</td></tr><tr><td>PaaS</td><td>App, data</td><td>OS, runtime, middleware</td><td>Heroku, GAE</td></tr><tr><td>SaaS</td><td>Data saja</td><td>Semua</td><td>Gmail, Slack</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>IaaS: max control, max responsibility. PaaS: focus on code. SaaS: just use it. Pilih berdasarkan kebutuhan control vs operational overhead.</p></div>',
        'Cloud Deployment Models' => '<h3>Deployment Models</h3><table><tr><th>Model</th><th>Deskripsi</th><th>Use Case</th></tr><tr><td>Public Cloud</td><td>Shared infrastructure</td><td>Startup, variable load</td></tr><tr><td>Private Cloud</td><td>Dedicated infrastructure</td><td>Regulated industries</td></tr><tr><td>Hybrid</td><td>Public + Private</td><td>Burst capacity</td></tr><tr><td>Multi-Cloud</td><td>Multiple providers</td><td>Avoid vendor lock-in</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Public cloud untuk flexibility. Private untuk compliance. Hybrid untuk best of both. Multi-cloud untuk redundancy dan negotiating power.</p></div>',
        'Docker Container Basics' => '<h3>Docker</h3><div class="cb"><strong>Docker</strong> mengemas aplikasi + dependensi dalam container portable. Lebih ringan dari VM.</div><h3>VM vs Container</h3><table><tr><th>Aspek</th><th>VM</th><th>Container</th></tr><tr><td>Size</td><td>GB</td><td>MB</td></tr><tr><td>Startup</td><td>Menit</td><td>Detik</td></tr><tr><td>Isolation</td><td>Strong</td><td>Process-level</td></tr></table><h3>Dockerfile</h3><div class="code">FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["node", "dist/server.js"]</div><div class="sb"><h4>Ringkasan</h4><p>Docker = portable, lightweight, consistent. Dockerfile untuk image definition. Docker Compose untuk multi-container. Fondasi Kubernetes.</p></div>',
        'Kubernetes Architecture' => '<h3>Kubernetes (K8s)</h3><div class="cb"><strong>K8s</strong> mengorkestrasi container di cluster. Auto-scaling, self-healing, rolling updates.</div><h3>Komponen</h3><table><tr><th>Component</th><th>Fungsi</th></tr><tr><td>Pod</td><td>Unit terkecil (1+ containers)</td></tr><tr><td>Service</td><td>Network abstraction</td></tr><tr><td>Deployment</td><td>Desired state management</td></tr><tr><td>Ingress</td><td>HTTP routing</td></tr><tr><td>ConfigMap/Secret</td><td>Configuration</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>K8s: orchestration untuk container. Pod = smallest unit. Deployment = desired state. Service = stable networking. Self-healing: auto restart, reschedule.</p></div>',
        'Microservices Design Pattern' => '<h3>Microservices</h3><div class="cb"><strong>Microservices</strong> membagi aplikasi menjadi service kecil yang independent. Setiap service punya database sendiri.</div><h3>Pattern</h3><table><tr><th>Pattern</th><th>Use Case</th></tr><tr><td>API Gateway</td><td>Single entry point</td></tr><tr><td>Circuit Breaker</td><td>Fault tolerance</td></tr><tr><td>Event Sourcing</td><td>Audit trail, replay</td></tr><tr><td>Saga</td><td>Distributed transactions</td></tr><tr><td>CQRS</td><td>Separate read/write</td></tr></table><div class="sb"><h4>Ringkasan</h4><p>Microservices: independent deploy, scale, technology. Trade-off: complexity (networking, data consistency). Gunakan saat monolith sudah jadi bottleneck.</p></div>',
        'Serverless (Lambda, Cloud Functions)' => '<h3>Serverless</h3><div class="cb"><strong>Serverless</strong> = jalankan kode tanpa manage server. Pay per invocation. Auto-scale.</div><h3>Characteristics</h3><ul><li>Event-driven (HTTP, queue, cron)</li><li>Stateless</li><li>Short execution time (15 min max)</li><li>Pay per use</li></ul><h3>Use Cases</h3><ul><li>API endpoints</li><li>Image/video processing</li><li>Cron jobs</li><li>Event handlers</li></ul><div class="sb"><h4>Ringkasan</h4><p>Serverless: no ops, pay per use, auto-scale. Cocok untuk event-driven, burst workloads. Cold start dan execution limit sebagai trade-off.</p></div>',
        default => $this->fallback($t),
    };}

    private function fallback(string $topic): string
    {
        return <<<HTML
<h3>{$topic}</h3>
<div class="cb"><strong>{$topic}</strong> adalah topik penting yang membahas konsep fundamental, implementasi praktis, dan best practices.</div>
<h3>Konsep Utama</h3>
<ul>
    <li><strong>Definisi:</strong> Memahami apa itu {$topic} dan mengapa penting</li>
    <li><strong>Prinsip:</strong> Aturan dan batasan yang berlaku</li>
    <li><strong>Implementasi:</strong> Cara menerapkan dalam konteks nyata</li>
    <li><strong>Evaluasi:</strong> Mengukur keberhasilan implementasi</li>
</ul>
<h3>Aplikasi Praktis</h3>
<ol>
    <li>Memecahkan masalah nyata dengan pendekatan terstruktur</li>
    <li>Mengoptimalkan proses berdasarkan best practices</li>
    <li>Berkolaborasi dalam tim menggunakan standar yang disepakati</li>
</ol>
<div class="sb"><h4>Ringkasan</h4><p>{$topic} menghubungkan teori dengan praktik. Diskusikan dengan kelompok tentang penerapannya dalam proyek nyata.</p></div>
HTML;
    }

    public function run(): void
    {
        $apiBaseUrl = rtrim(config('services.api.base_url', 'http://localhost:3000'), '/');
        $credentials = [
            ['email' => 'lecturer@kolabri.edu', 'password' => 'password123'],
            ['email' => 'sari@kolabri.edu', 'password' => 'password123'],
        ];

        CourseWeekMaterial::query()->delete();
        CourseWeek::query()->delete();
        CourseMaterial::query()->delete();
        MaterialModule::query()->delete();

        $pdfDir = storage_path('app/public/demo-materials');
        if (!is_dir($pdfDir)) mkdir($pdfDir, 0755, true);

        $weekTotal = $moduleTotal = $materialTotal = $linkTotal = $pdfGenerated = 0;
        $seenCourses = [];

        foreach ($credentials as $credential) {
            $loginResponse = Http::post($apiBaseUrl . '/api/auth/login', $credential);
            if (!$loginResponse->successful()) continue;

            $token = $loginResponse->json('data.accessToken');
            $coursesResponse = Http::withToken($token)->get($apiBaseUrl . '/api/courses/my');
            $courses = $coursesResponse->successful() ? $coursesResponse->json('data', []) : [];

            foreach ($courses as $course) {
                $courseId = $course['id'] ?? null;
                if (!$courseId || isset($seenCourses[$courseId])) continue;
                $seenCourses[$courseId] = true;

                $courseCode = $course['code'] ?? 'KLS';
                $courseName = $course['name'] ?? 'Kelas';
                $ownerId = $course['owner']['id'] ?? null;
                $weeks = $this->courseWeeks[$courseCode] ?? [
                    ['title' => "Konsep Dasar {$courseName}", 'materials' => ["Pengantar {$courseName}", "Fundamental {$courseName}"]],
                    ['title' => "Studi Kasus {$courseName}", 'materials' => ["Analisis Kasus {$courseName}", "Latihan {$courseName}"]],
                    ['title' => "Proyek Akhir {$courseName}", 'materials' => ["Perancangan Proyek", "Implementasi & Evaluasi"]],
                ];

                foreach ($weeks as $weekIndex => $weekData) {
                    $weekNum = $weekIndex + 1;
                    $weekId = $this->seedUuid("{$courseCode}-week-{$weekNum}");

                    CourseWeek::create(['id' => $weekId, 'course_id' => $courseId, 'week_index' => $weekNum, 'title' => $weekData['title'], 'sort_order' => $weekNum]);
                    $weekTotal++;

                    $module = MaterialModule::create(['id' => (string) Str::uuid(), 'course_id' => $courseId, 'title' => "Minggu {$weekNum}: {$weekData['title']}", 'sort_order' => $weekNum]);
                    $moduleTotal++;

                    foreach ($weekData['materials'] as $matIndex => $topic) {
                        $fileName = Str::slug("{$courseCode} {$topic}") . '.pdf';
                        $filePath = $pdfDir . '/' . $fileName;

                        if (!file_exists($filePath)) {
                            file_put_contents($filePath, $this->generatePdf($courseCode, $courseName, $weekData['title'], $topic));
                            $pdfGenerated++;
                        }

                        $material = CourseMaterial::create([
                            'id' => (string) Str::uuid(), 'course_id' => $courseId, 'module_id' => $module->id,
                            'title' => $topic, 'description' => "Materi {$courseName} minggu {$weekNum}: {$topic}. Baca sebelum sesi diskusi kelompok.",
                            'file_name' => $fileName, 'file_path' => 'demo-materials/' . $fileName,
                            'file_type' => 'application/pdf', 'file_size' => filesize($filePath),
                            'uploaded_by' => $ownerId, 'view_count' => 12 + ($matIndex * 7) + ($weekIndex * 5), 'sort_order' => $matIndex + 1,
                        ]);
                        $materialTotal++;

                        CourseWeekMaterial::create(['id' => (string) Str::uuid(), 'course_week_id' => $weekId, 'course_material_id' => $material->id, 'sort_order' => $matIndex + 1]);
                        $linkTotal++;
                    }
                }
            }
        }

        $this->command?->info("Seeded: {$weekTotal} weeks, {$moduleTotal} modules, {$materialTotal} materials, {$linkTotal} links, {$pdfGenerated} PDFs generated.");
    }
}
