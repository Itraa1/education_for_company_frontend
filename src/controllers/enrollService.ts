import { type Course } from "../types/course";

const ENROLLED_COURSES_KEY = "enrolled_courses";

export function enrollCourse(course: Course): void {
  try {
    const enrolled = getEnrolledCourses();
    
    // Проверяем, не записан ли пользователь уже на этот курс
    const isAlreadyEnrolled = enrolled.some(c => c.id === course.id);
    if (isAlreadyEnrolled) {
      return;
    }

    enrolled.push(course);
    localStorage.setItem(ENROLLED_COURSES_KEY, JSON.stringify(enrolled));
  } catch (error) {
    console.error("Error enrolling course:", error);
    throw error;
  }
}

export function getEnrolledCourses(): Course[] {
  try {
    const data = localStorage.getItem(ENROLLED_COURSES_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error getting enrolled courses:", error);
    return [];
  }
}

export function unenrollCourse(courseId: number): void {
  try {
    const enrolled = getEnrolledCourses();
    const filtered = enrolled.filter(c => c.id !== courseId);
    localStorage.setItem(ENROLLED_COURSES_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error("Error unenrolling course:", error);
    throw error;
  }
}

export function isEnrolled(courseId: number): boolean {
  const enrolled = getEnrolledCourses();
  return enrolled.some(c => c.id === courseId);
}
