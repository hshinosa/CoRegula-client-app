/* ============================================
 * Kolabri TypeScript Definitions
 * ============================================ */

// ============ User & Auth Types ============

export type UserRole = 'lecturer' | 'student' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    avatar?: string;
    email_verified_at: string | null;
    created_at: string;
    createdAt?: string;
    updated_at: string;
}

export interface Auth {
    user: User | null;
    token?: string;
}

export interface AuthCredentials {
    email: string;
    password: string;
}

export interface RegisterData {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
    role: UserRole;
}

// ============ Course Types ============

export type VectorStatus = 'pending' | 'processing' | 'ready' | 'failed' | 'skipped';

export type CourseStatus = 'aktif' | 'selesai' | 'belum_mulai';

export interface CourseProgress {
    percentage: number;
    completed_items: number;
    total_items: number;
    status_label: string;
}

export interface Course {
    id: string;
    code: string;
    name: string;
    owner_id: string;
    join_code: string;
    min_members_per_group?: number;
    max_members_per_group?: number;
    ai_guardrail_preset?: 'strict' | 'balanced' | 'relaxed';
    ai_guardrail_allow_rewrite?: boolean;
    ai_guardrail_allow_flag_only?: boolean;
    ai_scaffolding_level?: 'early' | 'late' | 'auto';
    ai_scaffolding_enabled?: boolean;
    semester?: string;
    academic_year?: string;
    engagement_count?: number;
    created_at: string;
    updated_at?: string;
    owner?: User;
    students_count?: number;
    groups_count?: number;
    knowledge_base?: KnowledgeBase[];
    ownerName?: string;
    status?: CourseStatus;
    category?: string;
    progress?: CourseProgress;
}

export interface CourseFilterCounts {
    aktif: number;
    selesai: number;
    belum_mulai: number;
}

export interface CourseFilterParams {
    q?: string;
    filter?: {
        status?: CourseStatus;
        semester?: string;
    };
    page?: number;
    per_page?: number;
}

export interface PaginatedResponse<T> {
    data: T[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
    filter_counts?: CourseFilterCounts;
    error?: string;
}

export interface KnowledgeBase {
    id: string;
    course_id?: string;
    course_material_id?: string;
    file_name: string;
    file_url?: string;
    uploaded_by?: string;
    vector_status: VectorStatus;
    uploaded_at: string;
    file_size?: number;
    file_type?: string;
    processed_at?: string | null;
    error_message?: string | null;
}

export interface CreateCourseData {
    code: string;
    name: string;
}

export interface CourseAnalytics {
    total_courses: number;
    total_students: number;
    total_groups: number;
    avg_students_per_course: number;
    avg_engagement: number;
    status_counts: CourseFilterCounts;
    semester_counts: Record<string, number>;
}

// ============ Group Types ============

export interface ChatSpace {
    id: string;
    group_id: string;
    name: string;
    created_at: string;
    messages_count?: number;
}

export interface Group {
    id: string;
    name: string;
    course_id: string;
    join_code?: string;
    created_at: string;
    members?: User[];
    members_count?: number;
    has_goal?: boolean;
    status?: 'green' | 'yellow' | 'red';
    chat_spaces?: ChatSpace[];
    course?: Pick<Course, 'id' | 'name'>;
}

export interface CreateGroupData {
    name: string;
    course_id: string;
    member_ids?: string[];
}

export type GroupMemberRole = 'owner' | 'admin' | 'member';

export interface GroupMember {
    id: string;
    user_id: string;
    group_id: string;
    role: GroupMemberRole;
    joined_at: string;
    user: User;
    is_online?: boolean;
}

export interface GroupSettings {
    id: string;
    name: string;
    description: string | null;
    access_policy: 'open' | 'invite_only' | 'private';
    avatar_url: string | null;
    join_code: string;
    created_at: string;
    updated_at: string;
    members_count: number;
    owner: User;
}

export interface UpdateGroupSettingsData {
    name?: string;
    description?: string | null;
    access_policy?: 'open' | 'invite_only' | 'private';
}

export type ActivityType = 'member_joined' | 'member_left' | 'task_submitted' | 'comment_added' | 'document_updated' | 'settings_changed';

export interface GroupActivity {
    id: string;
    group_id: string;
    user_id: string;
    type: ActivityType;
    description: string;
    metadata?: Record<string, unknown>;
    created_at: string;
    user: User;
    is_recent?: boolean;
}

export interface PaginatedMembers {
    data: GroupMember[];
    meta: {
        total: number;
        per_page: number;
        current_page: number;
        last_page: number;
    };
}

export interface CursorPaginatedActivities {
    data: GroupActivity[];
    next_cursor: string | null;
    has_more: boolean;
}

// ============ Goal Types ============

export interface LearningGoal {
    id: string;
    group_id: string;
    content: string;
    created_by: string;
    created_at: string;
    is_validated: boolean;
    creator?: User;
}

export interface CreateGoalData {
    group_id: string;
    content: string;
}

// ============ Reflection Types ============

export type ReflectionType = 'session' | 'weekly';

export interface Reflection {
    id: string;
    user_id: string;
    course_id: string;
    goal_id: string | null;
    type: ReflectionType;
    content: string;
    title?: string;
    ai_feedback?: string;
    chatSpace?: ChatSpace;
    created_at?: string;
    createdAt?: string;
    user?: User;
    goal?: LearningGoal;
    course?: Course;
    group?: Pick<Group, 'id' | 'name'>;
}

export interface CreateReflectionData {
    course_id: string;
    goal_id?: string;
    type: ReflectionType;
    content: string;
}

// ============ Reflection Template Types ============

export type TemplateCategory = 'Harian' | 'Mingguan' | 'Proyek' | 'Evaluasi Diri';

export interface ReflectionTemplate {
    id: number;
    user_id: string | null;
    title: string;
    description: string | null;
    content_template: string;
    category: string | null;
    is_global: boolean;
    created_at: string;
    updated_at: string;
}

export interface CreateTemplateData {
    title: string;
    description?: string;
    content_template: string;
    category?: string;
}

// ============ Reflection Analytics Types ============

export interface AnalyticsDataPoint {
    label: string;
    count: number;
    averageWords?: number;
    average?: number;
}


export interface StreakData {
    current: number;
    longest: number;
    hasReflectionToday: boolean;
}

export interface ReflectionAnalytics {
    frequency: AnalyticsDataPoint[];
    averageLength: AnalyticsDataPoint[];
    streak: StreakData;
    timeline: AnalyticsDataPoint[];
    totalReflections: number;
    period: string;
}

export type InteractionType = 'planning' | 'question' | 'social' | 'off-topic';
export type SenderType = 'user' | 'ai' | 'system';

export interface RagSource {
    file: string;
    page: number;
}

export interface ChatMessage {
    id: string;
    log_id: string;
    course_id: string;
    group_id: string;
    sender_id: string;
    sender_type: SenderType;
    content: string;
    created_at: string;
    interaction_type?: InteractionType;
    metadata?: {
        is_intervention?: boolean;
        is_silence_trigger?: boolean;
        rag_sources?: RagSource[];
    };
    sender?: User;
}

export interface SendMessageData {
    room: string;
    text: string;
    user_id: string;
}

export interface JoinRoomData {
    course_id: string;
    group_id: string;
}

// ============ Shared Page Props ============

export interface SharedData {
    name: string;
    auth: Auth;
    flash?: {
        success?: string;
        error?: string;
    };
    [key: string]: unknown;
}

// ============ API Response Types ============

export interface ApiResponse<T> {
    data: T;
    meta?: {
        current_page?: number;
        total_pages?: number;
        total_items?: number;
    };
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
}

// ============ Enrollment Types ============

export interface Enrollment {
    course_id: string;
    user_id: string;
    enrolled_at: string;
    course?: Course;
    user?: User;
}

export interface JoinCourseData {
    join_code: string;
}

// ============ AI Chat Types ============

export interface AiMessage {
    id: string;
    conversation_id?: string;
    role: 'user' | 'assistant';
    content: string;
    created_at: string;
}

export interface AiConversation {
    id: string;
    user_id: string;
    title: string;
    created_at: string;
    updated_at: string;
    messages?: AiMessage[];
}

// ============ Aktivitas Diskusi Types ============

export interface StudentActivity {
    student: {
        id: string;
        name: string;
        email: string;
    };
    total_messages: number;
    active_days: number;
    frequency: number;
    avg_messages_per_session: number;
    last_activity: string | null;
}

export interface ActivitySummary {
    total_students: number;
    total_messages: number;
    active_students: number;
}

// ============ Attendance Types ============

export type AttendanceStatus = 'present' | 'absent' | 'late' | 'excused';

export interface AttendanceSession {
    id: string;
    title: string;
    session_date: string;
    session_number: number | null;
    notes: string | null;
    total_students: number;
    present_count: number;
    absent_count: number;
    late_count: number;
    excused_count: number;
    marked_count: number;
    attendance_rate: number;
    created_at: string;
    course_id?: string;
    course?: Pick<Course, 'id' | 'name'>;
}

export interface AttendanceStudentRecord {
    student_id: string;
    student_name: string;
    student_email: string;
    status: AttendanceStatus;
    notes: string | null;
    marked_at: string | null;
}

export interface AttendanceStudentSummary {
    student_id: string;
    student_name: string;
    student_email: string;
    total_sessions: number;
    present: number;
    late: number;
    excused: number;
    absent: number;
    attendance_percentage: number;
}

// ============ Materials Types ============

export interface MaterialModule {
    id: string;
    course_id: string;
    title: string;
    sort_order: number;
    materials?: CourseMaterial[];
    created_at: string;
}

export interface CourseWeek {
    id: string;
    course_id: string;
    week_index: number;
    title: string;
    sort_order?: number;
    materials?: CourseMaterial[];
    created_at?: string;
}

export interface CourseMaterial {
    id: string;
    course_id: string;
    module_id: string | null;
    title: string;
    description: string | null;
    file_name: string;
    file_path: string;
    file_type: string | null;
    file_size: number;
    uploaded_by: string | null;
    view_count: number;
    sort_order: number;
    created_at: string;
    updated_at?: string;
}

export interface MaterialViewStats {
    total_views: number;
    unique_viewers: number;
    recent_views: { student_id: string; viewed_at: string }[];
}
