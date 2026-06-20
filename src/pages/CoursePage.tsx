import { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router";
import DashboardLayout from "./DashboardLayout";
import { type Course } from "../types/course";
import {
  type CourseEnrollment,
  getTopicKey,
  calcProgress,
  normalizeCompletedTopics,
} from "../types/enrollment";
import {
  fetchCourseByDocumentId,
  getCategoryLabel,
  getLevelLabel,
  getCategoryIcon,
} from "../controllers/courseService";
import {
  enrollCourse,
  getEnrollmentByCourse,
  updateEnrollmentProgress,
} from "../controllers/enrollService";
import { UserContext } from "../components/context/UserContext";
import { useToast } from "../components/toast/ToastProvider";
import ProgressBar from "../components/progress/ProgressBar";

export default function CoursePage() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const userContext = useContext(UserContext);
  const user = userContext?.user;
  const { showToast } = useToast();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollment, setEnrollment] = useState<CourseEnrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [savingProgress, setSavingProgress] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedTopicIndex, setSelectedTopicIndex] = useState(0);

  const isUserEnrolled =
    enrollment !== null && enrollment.enrollment_state !== "dropped";

  const isCourseAuthor =
    user && course?.users_permissions_user?.id === user.id;

  const canViewStudents =
    user &&
    (user.role.name === "Admin" ||
      (user.role.name === "Author" && isCourseAuthor));

  const completedTopics = normalizeCompletedTopics(enrollment?.completed_topics);
  const totalTopics = course?.topics?.length ?? 0;
  const progress = calcProgress(completedTopics, totalTopics);

  useEffect(() => {
    if (!documentId) return;

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCourseByDocumentId(documentId);
        setCourse(data);
      } catch (err) {
        console.error("Failed to load course:", err);
        setError("Не удалось загрузить курс. Попробуйте позже.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [documentId]);

  useEffect(() => {
    if (!course || !user) {
      setEnrollment(null);
      return;
    }

    const loadEnrollment = async () => {
      try {
        const existing = await getEnrollmentByCourse(course.id, user.id);
        setEnrollment(existing);

        if (
          existing &&
          existing.enrollment_state !== "dropped" &&
          existing.last_topic_index != null &&
          course.topics &&
          existing.last_topic_index < course.topics.length
        ) {
          setSelectedTopicIndex(existing.last_topic_index);
        }
      } catch (err) {
        console.error("Failed to load enrollment:", err);
        setEnrollment(null);
      }
    };

    loadEnrollment();
  }, [course, user]);

  const handleEnrollCourse = async () => {
    if (!course || !user) return;

    try {
      setEnrolling(true);
      const created = await enrollCourse(course, user.id);
      setEnrollment(created);
      showToast(`Вы записаны на курс: ${course.title}!`, "success");
    } catch (err) {
      console.error("Failed to enroll course:", err);
      showToast("Не удалось записаться на курс. Попробуйте позже.", "error");
    } finally {
      setEnrolling(false);
    }
  };

  const saveProgress = async (
    updatedCompleted: string[],
    topicIndex: number,
    allComplete: boolean
  ) => {
    if (!enrollment) return;

    try {
      setSavingProgress(true);
      const updated = await updateEnrollmentProgress(enrollment.documentId, {
        completed_topics: updatedCompleted,
        last_topic_index: topicIndex,
        enrollment_state: allComplete ? "completed" : "active",
        completed_at: allComplete ? new Date().toISOString() : null,
      });
      setEnrollment(updated);

      if (allComplete) {
        showToast("Поздравляем! Вы завершили курс! 🎉", "success");
      }
    } catch (err) {
      console.error("Failed to save progress:", err);
      showToast("Не удалось сохранить прогресс.", "error");
    } finally {
      setSavingProgress(false);
    }
  };

  const handleMarkTopicComplete = async () => {
    if (!course?.topics || !enrollment || !isUserEnrolled) return;

    const topic = course.topics[selectedTopicIndex];
    const topicKey = getTopicKey(topic, selectedTopicIndex);

    if (completedTopics.includes(topicKey)) return;

    const updatedCompleted = [...completedTopics, topicKey];
    const allComplete =
      totalTopics > 0 && updatedCompleted.length >= totalTopics;

    await saveProgress(updatedCompleted, selectedTopicIndex, allComplete);

    if (!allComplete && selectedTopicIndex < course.topics.length - 1) {
      setSelectedTopicIndex(selectedTopicIndex + 1);
    }
  };

  const handleTopicSelect = async (index: number) => {
    setSelectedTopicIndex(index);

    if (!enrollment || !isUserEnrolled || enrollment.last_topic_index === index) return;

    try {
      const updated = await updateEnrollmentProgress(enrollment.documentId, {
        completed_topics: completedTopics,
        last_topic_index: index,
        enrollment_state: enrollment.enrollment_state,
        completed_at: enrollment.completed_at,
      });
      setEnrollment(updated);
    } catch (err) {
      console.error("Failed to save last topic index:", err);
    }
  };

  const currentTopic =
    course?.topics && course.topics[selectedTopicIndex]
      ? course.topics[selectedTopicIndex]
      : null;

  const isCurrentTopicCompleted =
    currentTopic !== null &&
    completedTopics.includes(getTopicKey(currentTopic, selectedTopicIndex));

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
            style={{ marginTop: "1rem" }}
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
            color: "var(--primary-color)",
            border: "1px solid var(--primary-color)",
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 300px",
          gap: "2rem",
          marginBottom: "2rem",
        }}
      >
        <div style={{ width: "100%" }}>
          {course.youtube_url && (
            <div
              style={{
                marginBottom: "2rem",
                backgroundColor: "var(--bg-secondary)",
                borderRadius: "0.5rem",
                overflow: "hidden",
                aspectRatio: "16/9",
                width: "100%",
              }}
            >
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

          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "2rem",
              borderRadius: "0.5rem",
              marginBottom: "2rem",
              width: "100%",
            }}
          >
            <h2 style={{ marginTop: 0 }}>📚 Об этом курсе</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "2rem",
                marginBottom: "2rem",
              }}
            >
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

          {course.description && (
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                padding: "2rem",
                borderRadius: "0.5rem",
                marginBottom: "2rem",
                width: "100%",
              }}
            >
              <h2 style={{ marginTop: 0 }}>📋 Описание</h2>
              <p style={{ lineHeight: "1.6", color: "var(--text-primary)" }}>
                {course.description}
              </p>
            </div>
          )}

          {course.topics && course.topics.length > 0 && (
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                padding: "2rem",
                borderRadius: "0.5rem",
                marginBottom: "2rem",
                width: "100%",
              }}
            >
              <h2 style={{ marginTop: 0, marginBottom: "1.5rem" }}>
                📖 {currentTopic ? currentTopic.title : "Темы курса"}
              </h2>

              {currentTopic && (
                <div
                  style={{
                    lineHeight: "1.6",
                    color: "var(--text-primary)",
                    whiteSpace: "pre-wrap",
                    wordWrap: "break-word",
                    width: "100%",
                  }}
                >
                  {currentTopic.content}
                </div>
              )}

              {isUserEnrolled && (
                <div style={{ marginTop: "1.5rem" }}>
                  <button
                    onClick={handleMarkTopicComplete}
                    disabled={isCurrentTopicCompleted || savingProgress}
                    style={{
                      opacity: isCurrentTopicCompleted || savingProgress ? 0.6 : 1,
                      cursor: isCurrentTopicCompleted || savingProgress ? "not-allowed" : "pointer",
                    }}
                  >
                    {isCurrentTopicCompleted ? "✅ Тема изучена" : "Отметить тему как изученную"}
                  </button>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "1rem",
                  marginTop: "2rem",
                  paddingTop: "2rem",
                  borderTop: "1px solid var(--border-color)",
                  width: "100%",
                }}
              >
                <button
                  onClick={() => handleTopicSelect(Math.max(0, selectedTopicIndex - 1))}
                  disabled={selectedTopicIndex === 0}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor:
                      selectedTopicIndex === 0 ? "var(--text-secondary)" : "var(--primary-color)",
                    color: "var(--bg-dark)",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: selectedTopicIndex === 0 ? "not-allowed" : "pointer",
                    fontWeight: "600",
                    opacity: selectedTopicIndex === 0 ? 0.5 : 1,
                  }}
                >
                  ← Предыдущая
                </button>

                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    color: "var(--text-secondary)",
                    fontSize: "0.95rem",
                  }}
                >
                  Тема {selectedTopicIndex + 1} из {course.topics.length}
                </div>

                <button
                  onClick={() =>
                    handleTopicSelect(
                      Math.min(course.topics!.length - 1, selectedTopicIndex + 1)
                    )
                  }
                  disabled={selectedTopicIndex === course.topics.length - 1}
                  style={{
                    padding: "0.75rem 1.5rem",
                    backgroundColor:
                      selectedTopicIndex === course.topics.length - 1
                        ? "var(--text-secondary)"
                        : "var(--primary-color)",
                    color: "var(--bg-dark)",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor:
                      selectedTopicIndex === course.topics.length - 1
                        ? "not-allowed"
                        : "pointer",
                    fontWeight: "600",
                    opacity: selectedTopicIndex === course.topics.length - 1 ? 0.5 : 1,
                  }}
                >
                  Следующая →
                </button>
              </div>
            </div>
          )}

          {course.text && (
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                padding: "2rem",
                borderRadius: "0.5rem",
                lineHeight: "1.6",
                width: "100%",
              }}
            >
              <h2 style={{ marginTop: 0 }}>📝 Введение</h2>
              <p>{course.text}</p>
            </div>
          )}
        </div>

        <div
          style={{
            position: "sticky",
            top: "2rem",
            height: "fit-content",
          }}
        >
          <div
            style={{
              backgroundColor: "var(--bg-secondary)",
              padding: "2rem",
              borderRadius: "0.5rem",
              marginBottom: "2rem",
            }}
          >
            {isUserEnrolled && totalTopics > 0 && (
              <div style={{ marginBottom: "1.5rem" }}>
                <ProgressBar completed={progress.completed} total={progress.total} />
              </div>
            )}

            {!isUserEnrolled && (
              <>
                <div
                  style={{
                    backgroundColor: "var(--primary-color)",
                    color: "var(--bg-dark)",
                    padding: "1rem",
                    borderRadius: "0.5rem",
                    marginBottom: "1rem",
                    textAlign: "center",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>Готовы начать?</p>
                </div>

                <button
                  onClick={handleEnrollCourse}
                  disabled={enrolling}
                  style={{
                    width: "100%",
                    padding: "1rem",
                    opacity: enrolling ? 0.6 : 1,
                    cursor: enrolling ? "not-allowed" : "pointer",
                  }}
                >
                  {enrolling ? "Запись..." : "Записаться"}
                </button>
              </>
            )}

            {isUserEnrolled && enrollment?.enrollment_state === "active" && (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--text-secondary)",
                  fontSize: "0.9rem",
                  margin: 0,
                }}
              >
                ✅ Вы записаны на курс
              </p>
            )}

            {isUserEnrolled && enrollment?.enrollment_state === "completed" && (
              <p
                style={{
                  textAlign: "center",
                  color: "var(--primary-color)",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  margin: 0,
                }}
              >
                🎓 Курс завершён!
              </p>
            )}

            <div
              style={{
                marginTop: "2rem",
                paddingTop: "2rem",
                borderTop: "1px solid var(--border-color)",
              }}
            >
              <p
                style={{
                  color: "var(--text-secondary)",
                  fontSize: "0.85rem",
                  margin: 0,
                  marginBottom: "0.5rem",
                }}
              >
                📅 Опубликовано:{" "}
                {new Date(course.publishedAt).toLocaleDateString("ru-RU")}
              </p>
            </div>

            {user &&
              (user.role.type === "admin" || isCourseAuthor) && (
                <button
                  onClick={() => navigate(`/course/${course.documentId}/edit`)}
                  style={{
                    width: "100%",
                    marginTop: "1rem",
                    padding: "0.75rem",
                    backgroundColor: "var(--accent-color)",
                    color: "white",
                    border: "none",
                    borderRadius: "0.5rem",
                    cursor: "pointer",
                    fontSize: "0.95rem",
                    fontWeight: "600",
                  }}
                >
                  ✏️ Редактировать
                </button>
              )}

            {canViewStudents && (
              <button
                onClick={() => navigate(`/course/${course.documentId}/students`)}
                style={{
                  width: "100%",
                  marginTop: "0.75rem",
                  padding: "0.75rem",
                  backgroundColor: "transparent",
                  color: "var(--secondary-color)",
                  border: "1px solid var(--secondary-color)",
                  borderRadius: "0.5rem",
                  cursor: "pointer",
                  fontSize: "0.95rem",
                  fontWeight: "600",
                }}
              >
                👥 Прогресс студентов
              </button>
            )}
          </div>

          {course.topics && course.topics.length > 0 && (
            <div
              style={{
                backgroundColor: "var(--bg-secondary)",
                padding: "1.5rem",
                borderRadius: "0.5rem",
              }}
            >
              <h3
                style={{
                  marginTop: 0,
                  marginBottom: "1rem",
                  fontSize: "1rem",
                  fontWeight: "600",
                }}
              >
                📚 Темы ({course.topics.length})
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                {course.topics.map((topic, index) => {
                  const topicKey = getTopicKey(topic, index);
                  const isCompleted = completedTopics.includes(topicKey);
                  const isSelected = selectedTopicIndex === index;

                  return (
                    <button
                      key={topicKey}
                      onClick={() => handleTopicSelect(index)}
                      style={{
                        padding: "0.75rem",
                        backgroundColor: isSelected
                          ? "var(--primary-color)"
                          : "var(--bg-tertiary)",
                        color: isSelected ? "var(--bg-dark)" : "var(--text-primary)",
                        border: "1px solid var(--border-color)",
                        borderRadius: "0.5rem",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: "0.9rem",
                        fontWeight: isSelected ? "600" : "400",
                        transition: "all 0.2s ease",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem" }}>
                        <span style={{ marginTop: "0.1rem", minWidth: "1.2rem" }}>
                          {isCompleted ? "✅" : isSelected ? "▶" : "○"}
                        </span>
                        <span
                          style={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {topic.title}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
