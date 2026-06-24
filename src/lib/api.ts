// =============================================================================
// Client-side API utilities
// =============================================================================

const API_BASE = "/api";

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public data?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new ApiError(
      data.error || "An error occurred",
      response.status,
      data
    );
  }

  return data as T;
}

// =============================================================================
// Auth APIs
// =============================================================================

export async function registerUser(body: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<{ message: string; userId: string; verifyUrl?: string }>(
    "/auth/register",
    { method: "POST", body: JSON.stringify(body) }
  );
}

export async function requestOtp(body: {
  email: string;
  purpose: "signup" | "login";
  name?: string;
}) {
  return apiFetch<{ message: string; delivered: boolean }>(
    "/auth/request-otp",
    { method: "POST", body: JSON.stringify(body) }
  );
}

export async function verifyEmail(token: string, email: string) {
  return apiFetch<{ message: string }>(
    `/auth/verify-email?token=${token}&email=${email}`
  );
}

// =============================================================================
// Profile APIs
// =============================================================================

export async function getProfile() {
  return apiFetch<{
    data: {
      id: string;
      phone: string | null;
      college: string | null;
      courseEnrolled: string | null;
      graduationYear: number | null;
      stream: string | null;
      resumeUrl: string | null;
      linkedinUrl: string | null;
      githubUrl: string | null;
      bio: string | null;
      skills: string | null;
      education: string | null;
    } | null;
  }>("/profile");
}

export async function updateProfile(body: {
  phone: string;
  college: string;
  courseEnrolled: string;
  graduationYear: number;
  stream: string;
  resumeUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  bio?: string;
  skills?: string;
  education?: string;
}) {
  return apiFetch("/profile", {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export async function uploadProfileAvatar(image: string) {
  return apiFetch<{ data: { image: string | null } }>("/profile/avatar", {
    method: "POST",
    body: JSON.stringify({ image }),
  });
}

// =============================================================================
// Learning APIs
// =============================================================================

export type PracticeQuestion = {
  id: string;
  title: string;
  difficulty: string;
  leetcodeUrl: string;
  orderIndex: number;
  progress: { completed: boolean; completedAt: string | null }[];
};

export type CourseModule = {
  id: string;
  section: string;
  title: string;
  description: string | null;
  lectureCount: number;
  orderIndex: number;
  questions: PracticeQuestion[];
  progress: { completed: boolean; completedAt: string | null }[];
};

export type LearningCourse = {
  id: string;
  slug: string;
  title: string;
  description: string;
  modules: CourseModule[];
};

export type CourseEnrollment = {
  id: string;
  status: string;
  enrolledAt: string;
  course: LearningCourse;
};

export type LearningNotification = {
  id: string;
  title: string;
  message: string;
  audience: string;
  type:
    | "CLASS_UPDATE"
    | "ASSIGNMENT"
    | "CLASS_REMINDER"
    | "PDF_RESOURCE"
    | "RESOURCE"
    | "LIVE_CLASS"
    | "PLACEMENT_UPDATE"
    | "INTERVIEW_UPDATE"
    | "ANNOUNCEMENT";
  pdfUrl: string | null;
  classLink: string | null;
  resourceUrl: string | null;
  scheduledAt: string | null;
  expiresAt: string | null;
  createdAt: string;
  read: boolean;
  targetUser: { name: string | null; email: string | null } | null;
  course: { title: string; slug: string } | null;
  batch: { name: string; schedule: string | null; meetingLink: string | null } | null;
};

export type LearningBatch = {
  id: string;
  name: string;
  schedule: string | null;
  meetingLink: string | null;
  instructorName: string | null;
  startDate: string | null;
  endDate: string | null;
  course: { title: string; slug: string };
};

export type LearningProfile = {
  phone: string | null;
  college: string | null;
  courseEnrolled: string | null;
  resumeUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  bio: string | null;
  skills: string | null;
  education: string | null;
};

export async function fetchLearning() {
  return apiFetch<{
    data: {
      enrollments: CourseEnrollment[];
      notifications: LearningNotification[];
      batches: LearningBatch[];
      profile: LearningProfile | null;
      unreadCount: number;
      courses: {
        id: string;
        slug: string;
        title: string;
        description: string;
        _count: { modules: number };
      }[];
    };
  }>("/learning");
}

export async function markNotificationRead(notificationId: string) {
  return apiFetch("/learning/notifications/read", {
    method: "POST",
    body: JSON.stringify({ notificationId }),
  });
}

export async function updateModuleProgress(body: {
  moduleId: string;
  completed: boolean;
}) {
  return apiFetch("/learning/progress", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function updateQuestionProgress(body: {
  questionId: string;
  completed: boolean;
}) {
  return apiFetch("/learning/progress", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// =============================================================================
// Companies APIs
// =============================================================================

import type {
  Company,
  PlacementProgram,
  Internship,
  FAQ,
  ApiListResponse,
} from "@/types/drupal";

export async function fetchCompanies(params?: Record<string, string>) {
  const query = params
    ? "?" + new URLSearchParams(params).toString()
    : "";
  return apiFetch<ApiListResponse<Company>>(`/companies${query}`);
}

export async function fetchCompany(slug: string) {
  return apiFetch<{
    data: Company & {
      programs: PlacementProgram[];
      internships: Internship[];
    };
  }>(`/companies/${slug}`);
}

// =============================================================================
// Programs APIs
// =============================================================================

export async function fetchPrograms(params?: Record<string, string>) {
  const query = params
    ? "?" + new URLSearchParams(params).toString()
    : "";
  return apiFetch<ApiListResponse<PlacementProgram>>(`/programs${query}`);
}

export async function fetchProgram(id: string) {
  return apiFetch<{ data: PlacementProgram }>(`/programs/${id}`);
}

// =============================================================================
// Internships APIs
// =============================================================================

export async function fetchInternships(params?: Record<string, string>) {
  const query = params
    ? "?" + new URLSearchParams(params).toString()
    : "";
  return apiFetch<ApiListResponse<Internship>>(`/internships${query}`);
}

// =============================================================================
// FAQs APIs
// =============================================================================

export async function fetchFaqs(category?: string) {
  const query = category ? `?category=${category}` : "";
  return apiFetch<ApiListResponse<FAQ>>(`/faqs${query}`);
}

// =============================================================================
// Saved Companies APIs
// =============================================================================

export async function fetchSavedCompanies() {
  return apiFetch<{
    data: { id: string; drupalCompanyId: string; savedAt: string }[];
  }>("/saved-companies");
}

export async function toggleSaveCompany(companyId: string) {
  return apiFetch<{ saved: boolean }>("/saved-companies", {
    method: "POST",
    body: JSON.stringify({ companyId }),
  });
}

// =============================================================================
// Applications APIs
// =============================================================================

export async function fetchApplications() {
  return apiFetch<{
    data: {
      id: string;
      drupalProgramId: string | null;
      drupalInternshipId: string | null;
      status: string;
      appliedAt: string;
    }[];
  }>("/applications");
}

export async function submitApplication(body: {
  programId?: string;
  internshipId?: string;
}) {
  return apiFetch("/applications", {
    method: "POST",
    body: JSON.stringify(body),
  });
}
