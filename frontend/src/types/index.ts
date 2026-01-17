// Application types matching Django models

export type ApplicationStatus =
  | 'applied'
  | 'phone_screen'
  | 'interview'
  | 'technical'
  | 'onsite'
  | 'offered'
  | 'accepted'
  | 'rejected'
  | 'withdrawn';

export type JobType = 'full_time' | 'part_time' | 'contract' | 'internship' | 'freelance';

export type WorkLocationType = 'remote' | 'onsite' | 'hybrid';

export interface ApplicationNote {
  id: number;
  content: string;
  created_at: string;
}

export interface JobApplicationListItem {
  id: number;
  company_name: string;
  position_title: string;
  status: ApplicationStatus;
  status_display: string;
  date_applied: string;
  job_type: JobType;
  job_type_display: string;
  location: string;
  work_location_type: WorkLocationType;
  work_location_type_display: string;
  follow_up_date: string | null;
  needs_follow_up: boolean;
  is_overdue: boolean;
}

export interface JobApplication extends JobApplicationListItem {
  job_description: string;
  job_url: string;
  salary_min: string | null;
  salary_max: string | null;
  salary_range: string | null;
  contact_name: string;
  contact_email: string;
  contact_phone: string;
  reminder_days_before: number;
  notes: string;
  resume_version: string;
  cover_letter_sent: boolean;
  application_notes: ApplicationNote[];
  created_at: string;
  updated_at: string;
}

export interface JobApplicationInput {
  company_name: string;
  position_title: string;
  status?: ApplicationStatus;
  date_applied?: string;
  job_type?: JobType;
  job_description?: string;
  job_url?: string;
  location?: string;
  work_location_type?: WorkLocationType;
  salary_min?: string | null;
  salary_max?: string | null;
  contact_name?: string;
  contact_email?: string;
  contact_phone?: string;
  follow_up_date?: string | null;
  reminder_days_before?: number;
  notes?: string;
  resume_version?: string;
  cover_letter_sent?: boolean;
}

export interface DashboardStats {
  total_applications: number;
  applied_count: number;
  interviewing_count: number;
  offers_count: number;
  status_counts: Record<string, number>;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApplicationFilters {
  search?: string;
  status?: ApplicationStatus | '';
  job_type?: JobType | '';
  work_location_type?: WorkLocationType | '';
  date_from?: string;
  date_to?: string;
  page?: number;
}

// Gmail types
export interface GmailAccount {
  id: number;
  email: string;
  created_at: string;
}

export interface EmailMessage {
  id: number;
  gmail_message_id: string;
  thread_id: string;
  subject: string;
  sender: string;
  snippet: string;
  received_at: string;
}

export interface GmailStatus {
  connected: boolean;
  account?: GmailAccount;
}

// UI types
export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

// Status display configuration
export const STATUS_OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'applied', label: 'Applied' },
  { value: 'phone_screen', label: 'Phone Screen' },
  { value: 'interview', label: 'Interview' },
  { value: 'technical', label: 'Technical Interview' },
  { value: 'onsite', label: 'On-site Interview' },
  { value: 'offered', label: 'Offered' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export const JOB_TYPE_OPTIONS: { value: JobType; label: string }[] = [
  { value: 'full_time', label: 'Full-time' },
  { value: 'part_time', label: 'Part-time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'freelance', label: 'Freelance' },
];

export const WORK_LOCATION_OPTIONS: { value: WorkLocationType; label: string }[] = [
  { value: 'remote', label: 'Remote' },
  { value: 'onsite', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];
