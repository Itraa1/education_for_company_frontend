import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router";
import "./index.css";
import Auth from "./auth/Auth";
import App from "./App.tsx";
import Catalog from "./pages/Catalog";
import ActiveCourses from "./pages/ActiveCourses";
import CompletedCourses from "./pages/CompletedCourses";
import CreateCourse from "./pages/CreateCourse";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/catalog" element={<Catalog />} />
        <Route path="/active" element={<ActiveCourses />} />
        <Route path="/completed" element={<CompletedCourses />} />
        <Route path="/create" element={<CreateCourse />} />
        <Route path="/auth" element={<Auth />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
