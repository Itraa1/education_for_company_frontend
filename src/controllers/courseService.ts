import type { Course, CourseInput, CoursesResponse } from "../types/course";
import { authentificatedRequest } from "./api/axiosInstance";

export async function fetchCourses(): Promise<Course[]> {
  try {
    const token = localStorage.getItem("auth_token");

    if (!token) {
      throw new Error("Токен не найден. Пожалуйста, авторизуйтесь.");
    }

    const axiosInstance = authentificatedRequest(token);
    const response = await axiosInstance.get<CoursesResponse>("/api/courses");
    return response.data.data;
  } catch (error) {
    console.error("Error fetching courses:", error);
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
    const axiosInstance = await authentificatedRequest(token);
    const response = await axiosInstance.post(
      "/api/courses",
      {
        "data": courseData,
      },
    );
    return response.data.data;
  } catch (error) {
    console.error("Error creating course:", error);
    throw error;
  }
}
