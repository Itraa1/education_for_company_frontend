import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "./DashboardLayout";
import { type Course } from "../types/course";
import {
  fetchCoursesByUser,
  getCategoryLabel,
  getLevelLabel,
  getCategoryIcon,
} from "../controllers/courseService";
import { useUser } from "../components/context/UserContext";

function isAuthorOrAdmin(roleName?: string) {
  return roleName === "Admin" || roleName === "Author";
}

export default function MyCourses() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    if (!isAuthorOrAdmin(user.role.name)) {
      navigate("/catalog");
      return;
    }

    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCoursesByUser(user.id);
        setCourses(data);
      } catch (err) {
        console.error("Failed to load user courses:", err);
        setError("Не удалось загрузить ваши курсы. Попробуйте позже.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [user, navigate]);

  const handleCourseClick = (documentId: string) => {
    navigate(`/course/${documentId}`);
  };

  const handleEditClick = (e: React.MouseEvent, documentId: string) => {
    e.stopPropagation();
    navigate(`/course/${documentId}/edit`);
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Мои курсы</h1>
        <p className="page-subtitle">Курсы, которые вы создали</p>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: "1.2rem" }}>⏳ Загрузка курсов...</p>
        </div>
      ) : courses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: "1.2rem" }}>📚 У вас пока нет созданных курсов</p>
          <p style={{ fontSize: "0.95rem", marginTop: "0.5rem" }}>Создайте первый курс, чтобы он появился здесь</p>
          <button
            onClick={() => navigate("/create")}
            style={{ marginTop: "1.5rem" }}
          >
            Создать курс
          </button>
        </div>
      ) : (
        <section className="courses-section">
          <div className="courses-grid">
            {courses.map((course) => (
              <div
                key={course.documentId}
                className="course-card"
                onClick={() => handleCourseClick(course.documentId)}
                style={{ cursor: "pointer" }}
              >
                <div className="course-card-image">
                  {getCategoryIcon(course.category)}
                </div>
                <div className="course-card-body">
                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-description">
                    {course.description.substring(0, 150)}...
                  </p>
                  <div className="course-card-meta">
                    <span>⏱️ {course.duration} часов</span>
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      📅 {new Date(course.createdAt).toLocaleDateString("ru-RU")}
                    </span>
                  </div>
                  <div className="course-card-meta">
                    <span className="course-card-badge" style={{ backgroundColor: "#5eff00" }}>
                      {getCategoryLabel(course.category)}
                    </span>
                  </div>
                  <div className="course-card-meta">
                    <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                      Уровень: {getLevelLabel(course.level)}
                    </span>
                  </div>
                  <button
                    className="course-card-button"
                    onClick={(e) => handleEditClick(e, course.documentId)}
                  >
                    ✏️ Редактировать
                  </button>
                  <button
                    className="course-card-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/course/${course.documentId}/students`);
                    }}
                    style={{
                      marginTop: "0.5rem",
                      backgroundColor: "transparent",
                      color: "var(--secondary-color)",
                      border: "1px solid var(--secondary-color)",
                    }}
                  >
                    👥 Прогресс студентов
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}
