import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import Auth from "./auth/Auth";
import App from "./App.tsx";
import Catalog from "./pages/Catalog";
import CoursePage from "./pages/CoursePage";
import ActiveCourses from "./pages/ActiveCourses";
import CompletedCourses from "./pages/CompletedCourses";
import CreateCourse from "./pages/CreateCourse";
import EditCourse from "./pages/EditCourse";
import MyCourses from "./pages/MyCourses";
import CourseStudents from "./pages/CourseStudents";
import { UserProvider } from "./components/context/UserProvider.tsx";
import { ToastProvider } from "./components/toast/ToastProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ToastProvider>
      <UserProvider>
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/course/:documentId" element={<CoursePage />} />
          <Route path="/course/:documentId/edit" element={<EditCourse />} />
          <Route path="/course/:documentId/students" element={<CourseStudents />} />
          <Route path="/active" element={<ActiveCourses />} />
          <Route path="/completed" element={<CompletedCourses />} />
          <Route path="/create" element={<CreateCourse />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
        </BrowserRouter>
      </UserProvider>
    </ToastProvider>
  </StrictMode>,
);
