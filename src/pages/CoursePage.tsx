import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import DashboardLayout from "./DashboardLayout";
import { type Course } from "../types/course";
import { fetchCourseByDocumentId, getCategoryLabel, getLevelLabel, getCategoryIcon } from "../controllers/courseService";
import { enrollCourse, isEnrolled } from "../controllers/enrollService";
import { UserContext } from "../components/context/UserContext";

export default function CoursePage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isUserEnrolled, setIsUserEnrolled] = useState(false);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);

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
        setSelectedTopicIndex(0);
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

  const currentTopic = course?.topics && course.topics[selectedTopicIndex] ? course.topics[selectedTopicIndex] : null;

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

      {/* Основной контент с темами */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 300px",
        gap: "2rem",
        marginBottom: "2rem",
      }}>
        
        {/* Левая колонка - контент */}
        <div style={{ width: "100%" }}>
          
          {course.youtube_url && (
            <div style={{
              marginBottom: "2rem",
              backgroundColor: "var(--bg-secondary)",
              borderRadius: "0.5rem",
              overflow: "hidden",
              aspectRatio: "16/9",
              width: "100%",
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
            width: "100%",
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

          {/* Краткое описание курса */}
          {course.description && (
            <div style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "2rem",
              borderRadius: "0.5rem",
              marginBottom: "2rem",
              width: "100%",
            }}>
              <h2 style={{ marginTop: 0 }}>📋 Описание</h2>
              <p style={{ lineHeight: "1.6", color: "var(--text-primary)" }}>
                {course.description}
              </p>
            </div>
          )}

          {/* Темы курса - основной контент */}
          {course.topics && course.topics.length > 0 && (
            <div style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "2rem",
              borderRadius: "0.5rem",
              marginBottom: "2rem",
              width: "100%",
            }}>
              <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>
                📖 {currentTopic ? currentTopic.title : "Темы курса"}
              </h2>

              {currentTopic && (
                <div style={{
                  lineHeight: "1.6",
                  color: "var(--text-primary)",
                  whiteSpace: "pre-wrap",
                  wordWrap: "break-word",
                  width: "100%",
                }}>
                  {currentTopic.content}
                </div>
              )}

              {/* Навигация между темами */}
              <div style={{
                display: "flex",
                justifyContent: "space-between",
                gap: "1rem",
                marginTop: "2rem",
                paddingTop: "2rem",
                borderTop: "1px solid var(--border-color)",
                width: "100%",
              }}>
                <button
                  onClick={() => setSelectedTopicIndex(Math.max(0, selectedTopicIndex - 1))}
                  disabled={selectedTopicIndex === 0}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: selectedTopicIndex === 0 ? "var(--text-secondary)" : "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: selectedTopicIndex === 0 ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    opacity: selectedTopicIndex === 0 ? 0.5 : 1,
                  }}
                >
                  ← Предыдущая
                </button>

                <div style={{
                  display: "flex",
                  alignItems: "center",
                  color: "var(--text-secondary)",
                  fontSize: "0.95rem",
                }}>
                  Тема {selectedTopicIndex + 1} из {course.topics.length}
                </div>

                <button
                  onClick={() => setSelectedTopicIndex(Math.min(course.topics!.length - 1, selectedTopicIndex + 1))}
                  disabled={selectedTopicIndex === course.topics.length - 1}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor: selectedTopicIndex === course.topics.length - 1 ? "var(--text-secondary)" : "var(--primary)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: selectedTopicIndex === course.topics.length - 1 ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    opacity: selectedTopicIndex === course.topics.length - 1 ? 0.5 : 1,
                  }}
                >
                  Следующая →
                </button>
              </div>
            </div>
          )}

          {/* Полное описание */}
          {course.text && (
            <div style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "2rem",
              borderRadius: "0.5rem",
              lineHeight: "1.6",
              width: "100%",
            }}>
              <h2 style={{ marginTop: 0 }}>📝 Введение</h2>
              <p>{course.text}</p>
            </div>
          )}
        </div>

        {/* Правая колонка - панель с темами и кнопкой записи */}
        <div style={{
          position: "sticky",
          top: "2rem",
          height: "fit-content",
        }}>
          {/* Кнопка записи */}
          <div style={{
            backgroundColor: "var(--bg-secondary)",
            padding: "2rem",
            borderRadius: "0.5rem",
            marginBottom: "2rem",
          }}>
            <div style={{
              backgroundColor: "var(--primary)",
              color: "white",
              padding: "1rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              textAlign: "center",
            }}>
              <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>Готовы начать?</p>
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
              {isUserEnrolled ? "✅ Вы записаны" : "Записаться"}
            </button>

            {isUserEnrolled && (
              <p style={{
                textAlign: "center",
                color: "var(--text-secondary)",
                marginTop: "1rem",
                fontSize: "0.9rem",
              }}>
                Спасибо! 🎉
              </p>
            )}

            {/* Дополнительная информация */}
            <div style={{
              marginTop: "2rem",
              paddingTop: "2rem",
              borderTop: "1px solid var(--border-color)",
            }}>
              <p style={{ color: "var(--text-secondary)", fontSize: "0.85rem", margin: 0, marginBottom: "0.5rem" }}>
                📅 Опубликовано: {new Date(course.publishedAt).toLocaleDateString("ru-RU")}
              </p>
            </div>

            {/* Кнопка Edit - видна только авторам и администраторам */}
            {userContext && userContext.user && (
              (userContext.user.role.type === "admin" || 
               (course.users_permissions_user && userContext.user.id === course.users_permissions_user.id)) && (
                <button
                  onClick={() => navigate(`/course/${course.documentId}/edit`)}
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "var(--accent)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.opacity = "0.85";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.opacity = "1";
                  }}
                >
                  ✏️ Редактировать
                </button>
              )
            )}
          </div>

          {/* Список тем */}
          {course.topics && course.topics.length > 0 && (
            <div style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "1.5rem",
              borderRadius: "0.5rem",
            }}>
              <h3 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1rem", fontWeight: "600" }}>
                📚 Темы ({course.topics.length})
              </h3>

              <div style={{
                display: "flex",
                flexDirection: "column",
                gap: "0.5rem",
              }}>
                {course.topics.map((topic, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedTopicIndex(index)}
                    style={{
                      padding: "0.75rem",
                      backgroundColor: selectedTopicIndex === index ? "var(--primary)" : "var(--bg-tertiary)",
                      color: selectedTopicIndex === index ? "white" : "var(--text-primary)",
                      border: "1px solid var(--border-color)",
                      borderRadius: "0.5rem",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "0.9rem",
                      fontWeight: selectedTopicIndex === index ? "600" : "400",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      if (selectedTopicIndex !== index) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-hover)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (selectedTopicIndex !== index) {
                        (e.currentTarget as HTMLButtonElement).style.backgroundColor = "var(--bg-tertiary)";
                      }
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                      <span style={{ marginTop: "0.1rem", minWidth: "1.2rem" }}>
                        {selectedTopicIndex === index ? "▶" : "○"}
                      </span>
                      <span style={{ 
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                      }}>
                        {topic.title}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
