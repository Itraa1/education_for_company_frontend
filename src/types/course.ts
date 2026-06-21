export type CourseCategory = "programming" | "design" | "business";
export type CourseLevel = "beginner" | "intermediate" | "advanced";

export interface Users_permissions_user {
  id: number;
  documentId: string;
  username: string;
  email: string;
  provider: string;
  confirmed: boolean;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface Topic {
  id?: string;
  title: string;
  content: string;
}

export interface Course {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: number;
  users_permissions_user: Users_permissions_user;
  content: string;
  topics?: Topic[];
  youtube_url?: string;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
}

export interface CourseInput {
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  duration: number;
  youtube_url: string;
  content: string;
  topics?: Topic[];
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
