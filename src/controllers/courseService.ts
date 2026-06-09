import type { Course, CourseInput, CoursesResponse } from "../types/course";
import { authentificatedRequest } from "./api/axiosInstance";

export async function fetchCourses(): Promise<Course[]> {
  try {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Токен не найден. Пожалуйста, авторизуйтесь.");
    }

    const axiosInstance = authentificatedRequest(token);
    const response = await axiosInstance.get<CoursesResponse>("/api/courses?populate=*");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
    throw error;
  }
}

export async function fetchCourseByDocumentId(documentId: string): Promise<Course> {
  try {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Токен не найден. Пожалуйста, авторизуйтесь.");
    }

    const axiosInstance = authentificatedRequest(token);
    const response = await axiosInstance.get<{ data: Course }>(
      `/api/courses/${documentId}?populate=*`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error fetching course:", error);
    throw error;
  }
}

export async function searchCourses(query: string): Promise<Course[]> {
  try {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Токен не найден. Пожалуйста, авторизуйтесь.");
    }

    const axiosInstance = authentificatedRequest(token);
    const encodedQuery = encodeURIComponent(query);
    const response = await axiosInstance.get<CoursesResponse>(
      `/api/courses?populate=*&filters[title][$containsi]=${encodedQuery}`
    );
    return response.data.data;
  } catch (error) {
    console.error("Error searching courses:", error);
    throw error;
  }
}

export function getCategoryLabel(category: string): string {
  const labels: Record<string, string> = {
    programming: " Программирование",
    design: " Дизайн",
    business: " Бизнес",
  };
  return labels[category] || category;
}

export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    beginner: "Начинающий",
    intermediate: "Продвинутый",
    advanced: "Эксперт",
  };
  return labels[level] || level;
}

export function getCategoryIcon(category: string): string {
  const icons: Record<string, string> = {
    programming: "💻",
    design: "🎨",
    business: "📊",
  };
  return icons[category] || "📚";
}

export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    beginner: "#5eff00",
    intermediate: "#00d4ff",
    advanced: "#ff6b9d",
  };
  return colors[level] || "#5eff00";
}

export async function createCourse(courseData: CourseInput) {
  try {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Токен не найден. Пожалуйста, авторизуйтесь.");
    }

    const dataToSend = {
      ...courseData,
      topics: courseData.topics?.map((topic) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = topic;
        return rest;
      }),
    };

    const axiosInstance = await authentificatedRequest(token);
    const response = await axiosInstance.post(
      "/api/courses",
      {
        "data": dataToSend,
      },
    );
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
}

export async function updateCourse(documentId: string, courseData: CourseInput) {
  try {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Токен не найден. Пожалуйста, авторизуйтесь.");
    }

    const dataToSend = {
      ...courseData,
      topics: courseData.topics?.map((topic) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...rest } = topic;
        return rest;
      }),
    };

    const axiosInstance = await authentificatedRequest(token);
    const response = await axiosInstance.put(
      `/api/courses/${documentId}`,
      {
        "data": dataToSend,
      },
    );
    console.log(response.data);
    return response.data.data;
  } catch (error) {
    console.error("Error updating course:", error);
    throw error;
  }
}
