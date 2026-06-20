import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { checkAuth } from "./controllers/chechAuth";
import { useUser } from "./components/context/UserContext";
import { StyledSideBar } from "./components/menu/styledSideBar";
import { StyledHeader } from "./components/header/steledHeader";
import { type Course } from "./types/course";
import { fetchCourses, getCategoryIcon } from "./controllers/courseService";
import "./App.css";

function App() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/auth");
      return;
    }
    if (!user) {
      checkAuth().then((auth) => {
        if (!auth) navigate("/auth");
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCourses();
        
        // Сортируем по дате создания (новые первыми)
        const sortedCourses = [...data].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });
        
        setCourses(sortedCourses);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Не удалось загрузить курсы");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleCoursesClick = (documentId: string) => {
    navigate(`/course/${documentId}`);
  };

  return (
    <div className="app-layout">
      <StyledHeader />
      <div className="app-body">
        <StyledSideBar />
        <div className="app-content">
          <div className="content-wrapper">
            <div className="page-header">
              <h1 className="page-title">Образовательный Портал</h1>
              <p className="page-subtitle">
                Развивайте свои навыки с помощью качественного онлайн-обучения
              </p>
            </div>

            {/* Новые курсы */}
            <section className="courses-section">
              <h2 className="section-title">⭐ Новые курсы</h2>
              {loading ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
                  <p style={{ fontSize: "1.2rem" }}>⏳ Загрузка курсов...</p>
                </div>
              ) : error ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
                  <p style={{ fontSize: "1.2rem" }}>⚠️ {error}</p>
                </div>
              ) : courses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
                  <p style={{ fontSize: "1.2rem" }}>📚 Курсы не найдены</p>
                </div>
              ) : (
                <div className="courses-grid">
                  {courses.slice(0, 3).map((course) => (
                    <div
                      key={course.documentId}
                      className="course-card course-card--clickable"
                      onClick={() => handleCoursesClick(course.documentId)}
                    >
                      <div className="course-card-image">
                        {getCategoryIcon(course.category)}
                      </div>
                      <div className="course-card-body">
                        <h3 className="course-card-title">{course.title}</h3>
                        <p className="course-card-description">
                          {course.description.substring(0, 100)}...
                        </p>
                        <div className="course-card-meta">
                          <span>👨‍🏫 {course.users_permissions_user?.username}</span>
                          <span>⏱️ {course.duration} часов</span>
                        </div>
                        <div className="course-card-meta">
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            📅 {new Date(course.createdAt).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                        <button
                          className="course-card-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCoursesClick(course.documentId);
                          }}
                        >
                          Подробнее →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Все курсы */}
            <section className="courses-section">
              <h2 className="section-title">📖 Все курсы</h2>
              {loading ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
                  <p style={{ fontSize: "1.2rem" }}>⏳ Загрузка курсов...</p>
                </div>
              ) : courses.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
                  <p style={{ fontSize: "1.2rem" }}>📚 Курсы не найдены</p>
                </div>
              ) : (
                <div className="courses-grid">
                  {courses.map((course) => (
                    <div
                      key={course.documentId}
                      className="course-card course-card--clickable"
                      onClick={() => handleCoursesClick(course.documentId)}
                    >
                      <div className="course-card-image">
                        {getCategoryIcon(course.category)}
                      </div>
                      <div className="course-card-body">
                        <h3 className="course-card-title">{course.title}</h3>
                        <p className="course-card-description">
                          {course.description.substring(0, 100)}...
                        </p>
                        <div className="course-card-meta">
                          <span>👨‍🏫 {course.users_permissions_user?.username}</span>
                          <span>⏱️ {course.duration} часов</span>
                        </div>
                        <div className="course-card-meta">
                          <span style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                            📅 {new Date(course.createdAt).toLocaleDateString("ru-RU")}
                          </span>
                        </div>
                        <button
                          className="course-card-button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCoursesClick(course.documentId);
                          }}
                        >
                          Подробнее →
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
