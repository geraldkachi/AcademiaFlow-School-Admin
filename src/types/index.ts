// // ─── Auth ───────────────────────────────────────────────
// export interface LoginRequest { email: string; password: string; remember_me?: boolean }
// export interface ForgotPasswordRequest { email: string }
// export interface VerifyCodeRequest { email: string; code: string }
// export interface ResetPasswordRequest { email: string; code: string; password: string; password_confirmation: string }
// export interface AuthUser {
//   id: string; name: string; email: string; staff_id: string;
//   school: { name: string; logo?: string }; avatar?: string; role: 'teacher'
// }
// export interface AuthResponse { token: string; user: AuthUser }

// // ─── Dashboard ──────────────────────────────────────────
// export interface DashboardStats {
//   total_students: number; total_classes: number;
//   pending_grades: number; upcoming_exams: number; academic_session: string;
// }
// export interface MyClass {
//   id: string; name: string; subject: string; section: string; students: number; role?: string;
// }
// export interface UpcomingExam {
//   id: string; title: string; subject: string; type: 'online' | 'hall_based';
//   date: string; time: string; duration: number; students: number; class_name: string;
// }
// export interface Activity {
//   id: string; title: string; description: string; time: string;
//   type: 'success' | 'info' | 'warning' | 'error';
// }
// export interface Notification {
//   id: string; title: string; message: string; type: string; read: boolean; created_at: string;
//   recipients: string; recipients_count: number; read_count?: number;
// }

// // ─── Classes ────────────────────────────────────────────
// export interface ClassItem {
//   id: string; name: string; subject: string; section: string; students: number;
// }
// export interface ClassStudent {
//   id: string; name: string; email: string;
// }
// export interface ClassScheduleItem {
//   id: string; title: string; date: string; duration: number; type: string;
// }

// // ─── Question Bank ──────────────────────────────────────
// export interface Question {
//   id: string; type: 'MCQ' | 'TrueFalse' | 'ShortAnswer';
//   subject: string; topic: string; text: string; marks: number;
//   options?: string[]; correct_answer?: string; used_in_exam?: boolean;
// }
// export interface AddQuestionPayload {
//   subject: string; topic: string; type: string; marks: number;
//   text: string; options?: string[]; correct_answer?: string;
// }

// // ─── Exams ──────────────────────────────────────────────
// export interface Exam {
//   id: string; title: string; subject: string; class_name: string; mode: 'online' | 'hall_based';
//   section: string; schedule: string; duration: number; status: 'scheduled' | 'pending_review' | 'completed' | 'rejected';
//   total_marks?: number; pass_mark?: number; access_code?: string; questions?: number;
// }
// export interface CreateExamStep1 {
//   title: string; subject: string; class_name: string;
//   sections: string[]; duration: number; pass_mark: number; instructions: string;
// }
// export interface CreateExamStep2 {
//   mode: 'hall_based' | 'online';
//   exam_center?: string; hall?: string; exam_date?: string; start_time?: string;
//   ip_range?: string; early_login?: string; seat_assignment?: 'auto' | 'manual'; csv_file?: File | null;
// }
// export interface CreateExamQuestion {
//   id: string; type: string; text: string; marks: number;
//   options?: string[]; correct_answer?: string;
// }
// export interface CreateExamSecurity {
//   token_validation: boolean; allow_early_login: boolean;
//   auto_submit: boolean; randomize_order: boolean;
//   disable_copy_paste: boolean; enforce_fullscreen: boolean;
// }

// // ─── Assignments ────────────────────────────────────────
// export interface Assignment {
//   id: string; title: string; subject: string; class_name: string; teacher: string;
//   description: string; deadline: string;
//   status: 'active' | 'submitted' | 'graded'; attachment?: string;
// }

// // ─── Results ────────────────────────────────────────────
// export interface ResultItem {
//   id: string; student: string; student_id: string; class_name: string;
//   score: number; grade: string; position: string; status: string;
// }

// // ─── Settings ───────────────────────────────────────────
// export interface TeacherProfile {
//   name: string; email: string; staff_id: string; subject: string; gender: string;
//   dob: string; nationality: string; phone: string; address: string;
// }
// export interface NotificationSettings {
//   new_exam_scheduled: boolean; result_published: boolean;
//   new_assignment: boolean; assignment_graded: boolean;
//   deadlines_reminder: boolean; deadline_lead_time: string; school_announcements: boolean;
// }
// export interface Preferences { language: string; timezone: string; date_format: string; font_size: string }


// ─── Auth / Onboarding ──────────────────────────────────
export interface AdminUser {
  id: string; name: string; email: string; staff_id: string;
  school: { name: string; logo?: string }; avatar?: string; role: 'admin';
}
export interface AuthResponse { token: string; user: AdminUser }
export interface OnboardingData {
  school: { name: string; institution_type: string; ownership: string; address: string; city: string; state: string; zip: string; country: string };
  documents: { cac?: File | null; proprietor_id?: File | null; proof_of_address?: File | null };
  admin: { first_name: string; last_name: string; email: string; phone: string; password: string; confirm_password: string };
  academic: { academic_year: string; students: string; teachers: string; classes: string; terms: string };
  plan: { billing: 'monthly' | 'annual'; selected: string };
}

// ─── Dashboard ──────────────────────────────────────────
export interface DashboardStats { students: number; teachers: number; pending_exams: number; upcoming_exams: number; academic_session: string }
export interface UpcomingExam { id: string; title: string; subject: string; type: 'online'|'hall_based'; date: string; time: string; duration: number; students: number; class_name: string }
export interface RecentResult { id: string; title: string; class_name: string; type: string; avg_score: number; pass_rate: number; students: number }
export interface Activity { id: string; title: string; description: string; time: string; type: 'success'|'info'|'warning'|'error' }
export interface Notification { id: string; title: string; message: string; type: string; read: boolean; created_at: string; recipients: string; recipients_count: number; read_count?: number }

// ─── Students ───────────────────────────────────────────
export interface Student {
  id: string; name: string; email: string; student_id: string;
  class_name: string; section: string; guardian: string; guardian_relation: string;
  status: 'active'|'inactive'; enrolled: string; avatar?: string;
}
export interface StudentProfile {
  id: string; name: string; email: string; student_id: string; class_name: string; section: string;
  session: string; status: 'active'|'inactive'; avatar?: string;
  gender: string; dob: string; nationality: string; blood_group: string;
  religion: string; enrolment_date: string; phone: string; address: string;
  guardian: { name: string; relationship: string; occupation: string; phone: string; email: string };
  academic: { student_id: string; class: string; section: string; session: string; current_term: string; class_teacher: string };
  term_summary: { avg_score: string; best_subject: string; assignments_graded: string; class_position: string };
  subject_performance: { subject: string; score: number }[];
  recent_activities: { title: string; description: string; time: string; type: string }[];
  documents: { id: string; name: string; uploaded: string; status: 'uploaded'|'not_uploaded' }[];
  exam_results: { date: string; exam: string; subject: string; score: string; grade: string; position: string }[];
  assignments: { id: string; title: string; subject: string; teacher: string; description: string; deadline: string; status: string; attachment?: string; submitted?: string }[];
}
export interface AddStudentData {
  personal: { photo?: File|null; first_name: string; last_name: string; dob: string; gender: string; blood_group: string; nationality: string; religion: string; phone: string; address: string };
  enrollment: { academic_session: string; class: string; section: string; admission_date: string; student_id: string };
  guardian: { full_name: string; relationship: string; occupation: string; phone: string; email: string };
  account: { email: string; password_method: 'auto'|'manual'; initial_password?: string };
}

// ─── Staffs ─────────────────────────────────────────────
export interface Staff { id: string; name: string; email: string; staff_id: string; role: string; subject: string; status: 'active'|'inactive'; joined: string }

// ─── Academics ──────────────────────────────────────────
export interface AcademicClass { id: string; name: string; section: string; students: number; teacher: string; subject: string }

// ─── Exams ──────────────────────────────────────────────
export interface Exam { id: string; title: string; subject: string; class_name: string; mode: 'online'|'hall_based'; section: string; schedule: string; duration: number; status: 'scheduled'|'pending_review'|'completed'|'rejected' }

// ─── Notifications ──────────────────────────────────────
export interface NotifSetting { new_exam_scheduled: boolean; result_published: boolean; new_assignment: boolean; assignment_graded: boolean; deadlines_reminder: boolean; deadline_lead_time: string; school_announcements: boolean }
export interface Preferences { language: string; timezone: string; date_format: string; font_size: string }
