import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import DashboardLayout from "./DashboardLayout";
import { type Course } from "../types/course";
import { fetchCourseByDocumentId, getCategoryLabel, getLevelLabel, getCategoryIcon } from "../controllers/courseService";
import { enrollCourse, isEnrolled } from "../controllers/enrollService";

export default function CoursePage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);

  useEffect(() => {
    const loadCourse = async () => {
      try {
        if (!documentId) {
          throw new Error("ID курса не найден");
        }

        setLoading(true);
        setError(null);
        const data = await fetchCourseByDocumentId(documentId);
        setCourse(data);
        setIsUserEnrolled(isEnrolled(data.id));
      } catch (err) {
        console.error("Failed to load course:", err);
        setError("Не удалось загрузить курс. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [documentId]);

  const handleEnrollCourse = () => {
    if (!course) return;

    try {
      enrollCourse(course);
      setIsUserEnrolled(true);
      alert(`✅ Вы записаны на курс: ${course.title}!`);
    } catch (err) {
      console.error("Failed to enroll course:", err);
      alert("❌ Не удалось записаться на курс. Попробуйте позже.");
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: "1.2rem" }}>⏳ Загрузка курса...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}>
            {error || "❌ Курс не найден"}
          </p>
          <button
            onClick={() => navigate("/catalog")}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Вернуться в каталог
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={{ marginBottom: "2rem" }}>
        <button
          onClick={() => navigate("/catalog")}
          style={{
            padding: "0.5rem 1rem",
            backgroundColor: "transparent",
            color: "var(--primary)",
            border: "1px solid var(--primary)",
            borderRadius: "0.5rem",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          ← Вернуться в каталог
        </button>
      </div>

      <div className="page-header">
        <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1rem" }}>
          <span style={{ fontSize: "2rem" }}>{getCategoryIcon(course.category)}</span>
          <h1 className="page-title" style={{ margin: 0 }}>{course.title}</h1>
        </div>
        <p className="page-subtitle">{course.description}</p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "2rem",
        marginBottom: "2rem",
      }}>
        {/* Основное содержание */}
        <div>
          {/* Видео если есть */}
          {course.youtube_url && (
            <div style={{
              marginBottom: "2rem",
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "0.5rem",
              overflow: "hidden",
              aspectRatio: "16/9",
            }}>
              <iframe
                width="100%"
                height="100%"
                src={course.youtube_url}
                title={course.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ display: "block" }}
              />
            </div>
          )}

          {/* Информация о курсе */}
          <div style={{
            backgroundColor: "var(--bg-secondary)",
            padding: "2rem",
            borderRadius: "0.5rem",
            marginBottom: "2rem",
          }}>
            <h2 style={{ marginTop: 0 }}>📚 Об этом курсе</h2>
            <div style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "2rem",
              marginBottom: "2rem",
            }}>
              <div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Преподаватель</p>
                <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                  👨‍🏫 {course.users_permissions_user?.username}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Продолжительность</p>
                <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                  ⏱️ {course.duration} часов
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Категория</p>
                <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                  {getCategoryLabel(course.category)}
                </p>
              </div>
              <div>
                <p style={{ color: "var(--text-secondary)", marginBottom: "0.5rem" }}>Уровень</p>
                <p style={{ fontSize: "1.1rem", fontWeight: "600" }}>
                  {getLevelLabel(course.level)}
                </p>
              </div>
            </div>
          </div>

          {/* Полное описание */}
          {course.text && (
            <div style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "2rem",
              borderRadius: "0.5rem",
              lineHeight: "1.6",
            }}>
              <h2 style={{ marginTop: 0 }}>📖 Полное описание</h2>
              <p>{course.text}</p>
            </div>
          )}
        </div>

        {/* Боковая панель */}
        <div style={{
          backgroundColor: "var(--bg-secondary)",
          padding: "2rem",
          borderRadius: "0.5rem",
          height: "fit-content",
          position: "sticky",
          top: "2rem",
        }}>
          <div style={{
            backgroundColor: "var(--primary)",
            color: "white",
            padding: "1rem",
            borderRadius: "0.5rem",
            marginBottom: "1rem",
            textAlign: "center",
          }}>
            <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>Готовы начать обучение?</p>
          </div>

          <button
            onClick={handleEnrollCourse}
            disabled={isUserEnrolled}
            style={{
              width: "100%",
              padding: "1rem",
              backgroundColor: isUserEnrolled ? "var(--text-secondary)" : "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: isUserEnrolled ? "not-allowed" : "pointer",
              fontSize: "1rem",
              fontWeight: "600",
              transition: "all 0.3s ease",
              opacity: isUserEnrolled ? 0.6 : 1,
            }}
          >
            {isUserEnrolled ? "✅ Вы записаны" : "Записаться на курс"}
          </button>

          {isUserEnrolled && (
            <p style={{
              textAlign: "center",
              color: "var(--text-secondary)",
              marginTop: "1rem",
              fontSize: "0.9rem",
            }}>
              Спасибо за регистрацию! 🎉
            </p>
          )}

          {/* Дополнительная информация */}
          <div style={{
            marginTop: "2rem",
            paddingTop: "2rem",
            borderTop: "1px solid var(--border-color)",
          }}>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", margin: 0 }}>
              📅 Опубликовано: {new Date(course.publishedAt).toLocaleDateString("ru-RU")}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
