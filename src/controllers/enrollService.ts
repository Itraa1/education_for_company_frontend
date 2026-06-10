import { authentificatedRequest } from "./api/axiosInstance";
import type { Course } from "../types/course";
import type {
  CourseEnrollment,
  EnrollmentState,
  EnrollmentsResponse,
  EnrollmentResponse,
} from "../types/enrollment";
import { normalizeCompletedTopics } from "../types/enrollment";

function getAuthClient() {
  const token = localStorage.getItem("auth_token");
  if (!token) {
    throw new Error("Токен не найден. Пожалуйста, авторизуйтесь.");
  }
  return authentificatedRequest(token);
}

function normalizeEnrollment(enrollment: CourseEnrollment): CourseEnrollment {
  return {
    ...enrollment,
    completed_topics: normalizeCompletedTopics(enrollment.completed_topics),
  };
}

export async function getEnrollmentByCourse(
  courseId: number,
  userId: number
): Promise<CourseEnrollment | null> {
  try {
    const client = getAuthClient();
    const response = await client.get<EnrollmentsResponse>(
      `/api/course-enrollments?filters[user][id][$eq]=${userId}&filters[course][id][$eq]=${courseId}&populate=*`
    );
    const enrollment = response.data.data[0];
    return enrollment ? normalizeEnrollment(enrollment) : null;
  } catch (error) {
    console.error("Error fetching enrollment:", error);
    return null;
  }
}

export async function isEnrolled(courseId: number, userId: number): Promise<boolean> {
  const enrollment = await getEnrollmentByCourse(courseId, userId);
  return enrollment !== null && enrollment.enrollment_state !== "dropped";
}

export async function getEnrolledCourseIds(userId: number): Promise<Set<number>> {
  const enrollments = await getEnrollmentsByUser(userId);
  return new Set(
    enrollments
      .filter((e) => e.enrollment_state !== "dropped" && e.course)
      .map((e) => e.course!.id)
  );
}

export async function getEnrollmentsByUser(
  userId: number,
  state?: EnrollmentState
): Promise<CourseEnrollment[]> {
  try {
    const client = getAuthClient();
    let url = `/api/course-enrollments?filters[user][id][$eq]=${userId}&populate=*&sort[0]=enrolled_at:desc`;
    if (state) {
      url += `&filters[enrollment_state][$eq]=${state}`;
    }
    const response = await client.get<EnrollmentsResponse>(url);
    return response.data.data.map(normalizeEnrollment);
  } catch (error) {
    console.error("Error fetching user enrollments:", error);
    return [];
  }
}

export async function getEnrollmentsByCourse(courseId: number): Promise<CourseEnrollment[]> {
  try {
    const client = getAuthClient();
    const response = await client.get<EnrollmentsResponse>(
      `/api/course-enrollments?filters[course][id][$eq]=${courseId}&populate=*&sort[0]=enrolled_at:desc`
    );
    return response.data.data
      .map(normalizeEnrollment)
      .filter((e) => e.enrollment_state !== "dropped");
  } catch (error) {
    console.error("Error fetching course enrollments:", error);
    return [];
  }
}

export async function enrollCourse(course: Course, userId: number): Promise<CourseEnrollment> {
  const client = getAuthClient();
  const existing = await getEnrollmentByCourse(course.id, userId);

  if (existing && existing.enrollment_state !== "dropped") {
    return existing;
  }

  if (existing && existing.enrollment_state === "dropped") {
    const response = await client.put<EnrollmentResponse>(
      `/api/course-enrollments/${existing.documentId}`,
      {
        data: {
          enrollment_state: "active",
          enrolled_at: new Date().toISOString(),
          completed_topics: [],
          last_topic_index: 0,
          completed_at: null,
        },
      }
    );
    return normalizeEnrollment(response.data.data);
  }

  const response = await client.post<EnrollmentResponse>("/api/course-enrollments", {
    data: {
      course: course.id,
      user: userId,
      enrollment_state: "active",
      enrolled_at: new Date().toISOString(),
      completed_topics: [],
      last_topic_index: 0,
    },
  });
  return normalizeEnrollment(response.data.data);
}

export async function unenrollCourse(enrollmentDocumentId: string): Promise<void> {
  const client = getAuthClient();
  await client.put(`/api/course-enrollments/${enrollmentDocumentId}`, {
    data: {
      enrollment_state: "dropped",
    },
  });
}

export async function updateEnrollmentProgress(
  enrollmentDocumentId: string,
  data: {
    completed_topics: string[];
    last_topic_index: number;
    enrollment_state: EnrollmentState;
    completed_at?: string | null;
  }
): Promise<CourseEnrollment> {
  const client = getAuthClient();
  const response = await client.put<EnrollmentResponse>(
    `/api/course-enrollments/${enrollmentDocumentId}`,
    { data }
  );
  return normalizeEnrollment(response.data.data);
}
