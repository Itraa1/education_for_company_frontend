export type CourseCategory = "programming" | "design" | "business";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface Course {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: number;
  instructor: string;
  text: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface CourseInput {
  title: string;
  slug: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: number;
  instructor: string;
  text: string;
}

export interface CoursesResponse {
  data: Course[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}
