import type { Course, Topic, Users_permissions_user } from "./course";

export type EnrollmentState = "active" | "completed" | "dropped";

export interface CourseEnrollment {
  id: number;
  documentId: string;
  enrollment_state: EnrollmentState;
  enrolled_at: string;
  completed_topics: string[] | null;
  last_topic_index?: number | null;
  completed_at?: string | null;
  user?: Users_permissions_user;
  course?: Course;
}

export interface EnrollmentsResponse {
  data: CourseEnrollment[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export interface EnrollmentResponse {
  data: CourseEnrollment;
}

export function getTopicKey(topic: Topic, index: number): string {
  return topic.id != null ? String(topic.id) : String(index);
}

export function normalizeCompletedTopics(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String);
}

export function calcProgress(completedTopics: unknown, totalTopics: number) {
  const completed = normalizeCompletedTopics(completedTopics).length;
  const total = totalTopics;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { completed, total, percent };
}
