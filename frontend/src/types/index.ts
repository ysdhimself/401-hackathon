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
  job_description: string;
  job_type: JobType;
  job_type_display: string;
  location: string;
  work_location_type: WorkLocationType;
  work_location_type_display: string;
  follow_up_date: string | null;
  needs_follow_up: boolean;
  is_overdue: boolean;
  master_resume: number | null;
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
  master_resume?: number | null;
}

// Master Resume types
export type SectionType = 'experience' | 'education' | 'skills' | 'projects' | 'certifications' | 'awards' | 'custom';

export interface ResumeEntry {
  id: number;
  title: string;
  organization: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  link: string;
  technologies: string;
  order: number;
  is_active: boolean;
}

export interface ResumeSection {
  id: number;
  section_type: SectionType;
  section_type_display: string;
  section_title: string;
  order: number;
  entries: ResumeEntry[];
}

export interface MasterResume {
  id: number;
  name: string;
  is_default: boolean;
  full_name: string;
  email: string;
  phone: string;
  location: string;
  linkedin_url: string;
  portfolio_url: string;
  github_url: string;
  summary: string;
  base_font_size: number;
  sections: ResumeSection[];
  created_at: string;
  updated_at: string;
}

export interface MasterResumeListItem {
  id: number;
  name: string;
  full_name: string;
  email: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  section_count: number;
}

export interface MasterResumeInput {
  name: string;
  is_default?: boolean;
  full_name: string;
  email: string;
  phone?: string;
  location?: string;
  linkedin_url?: string;
  portfolio_url?: string;
  github_url?: string;
  summary?: string;
  base_font_size?: number;
}

export interface ParsedResumeSectionEntry {
  title: string;
  organization: string;
  location: string;
  start_date: string;
  end_date: string;
  description: string;
  technologies: string;
  order: number;
}

export interface ParsedResumeSection {
  section_type: SectionType;
  section_title: string;
  entries: ParsedResumeSectionEntry[];
}

export interface ParsedResume {
  resume: Partial<MasterResumeInput> & { name?: string };
  sections: ParsedResumeSection[];
  warnings: string[];
  base_font_size: number;
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
