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
import "./CoursePage.css";

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
        <div className="state">
          <p className="state__text">⏳ Загрузка курса...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !course) {
    return (
      <DashboardLayout>
        <div className="state">
          <p className="state__text">
            {error || "❌ Курс не найден"}
          </p>
          <button
            className="state__action"
            onClick={() => navigate("/catalog")}
          >
            Вернуться в каталог
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-toolbar">
        <button
          className="btn-back"
          onClick={() => navigate("/catalog")}
        >
          ← Вернуться в каталог
        </button>
      </div>

      <div className="page-header">
        <div className="course-detail__header-row">
          <span className="course-detail__icon">{getCategoryIcon(course.category)}</span>
          <h1 className="page-title page-title--inline">{course.title}</h1>
        </div>
        <p className="page-subtitle">{course.description}</p>
      </div>

      <div className="course-detail__layout">
        <div className="course-detail__main">
          {course.youtube_url && (
            <div className="course-detail__video">
              <iframe
                className="course-detail__video-frame"
                width="100%"
                height="100%"
                src={course.youtube_url}
                title={course.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          <div className="course-detail__section">
            <h2 className="course-detail__section-title">📚 Об этом курсе</h2>
            <div className="course-detail__info-grid">
              <div>
                <p className="course-detail__info-label">Преподаватель</p>
                <p className="course-detail__info-value">
                  👨‍🏫 {course.users_permissions_user?.username}
                </p>
              </div>
              <div>
                <p className="course-detail__info-label">Продолжительность</p>
                <p className="course-detail__info-value">
                  ⏱️ {course.duration} часов
                </p>
              </div>
              <div>
                <p className="course-detail__info-label">Категория</p>
                <p className="course-detail__info-value">
                  {getCategoryLabel(course.category)}
                </p>
              </div>
              <div>
                <p className="course-detail__info-label">Уровень</p>
                <p className="course-detail__info-value">
                  {getLevelLabel(course.level)}
                </p>
              </div>
            </div>
          </div>

          {course.content && (
            <div className="course-detail__section">
              <h2 className="course-detail__section-title">📋 Описание</h2>
              <p className="course-detail__text">
                {course.content}
              </p>
            </div>
          )}

          {course.topics && course.topics.length > 0 && (
            <div className="course-detail__section">
              <h2 className="course-detail__section-title course-detail__section-title--spaced">
                📖 {currentTopic ? currentTopic.title : "Темы курса"}
              </h2>

              {currentTopic && (
                <div className="course-detail__topic-content">
                  {currentTopic.content}
                </div>
              )}

              {isUserEnrolled && (
                <div className="course-detail__mark">
                  <button
                    onClick={handleMarkTopicComplete}
                    disabled={isCurrentTopicCompleted || savingProgress}
                  >
                    {isCurrentTopicCompleted ? "✅ Тема изучена" : "Отметить тему как изученную"}
                  </button>
                </div>
              )}

              <div className="course-detail__nav">
                <button
                  className="course-detail__nav-btn"
                  onClick={() => handleTopicSelect(Math.max(0, selectedTopicIndex - 1))}
                  disabled={selectedTopicIndex === 0}
                >
                  ← Предыдущая
                </button>

                <div className="course-detail__nav-info">
                  Тема {selectedTopicIndex + 1} из {course.topics.length}
                </div>

                <button
                  className="course-detail__nav-btn"
                  onClick={() =>
                    handleTopicSelect(
                      Math.min(course.topics!.length - 1, selectedTopicIndex + 1)
                    )
                  }
                  disabled={selectedTopicIndex === course.topics.length - 1}
                >
                  Следующая →
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="course-detail__sidebar">
          <div className="course-detail__card">
            {isUserEnrolled && totalTopics > 0 && (
              <div className="course-detail__progress">
                <ProgressBar completed={progress.completed} total={progress.total} />
              </div>
            )}

            {!isUserEnrolled && (
              <button
                className="course-detail__enroll-btn"
                onClick={handleEnrollCourse}
                disabled={enrolling}
              >
                {enrolling ? "Запись..." : "Записаться"}
              </button>
            )}

            {isUserEnrolled && enrollment?.enrollment_state === "active" && (
              <p className="course-detail__status">
                ✅ Вы записаны на курс
              </p>
            )}

            {isUserEnrolled && enrollment?.enrollment_state === "completed" && (
              <p className="course-detail__status course-detail__status--done">
                🎓 Курс завершён!
              </p>
            )}

            <div className="course-detail__meta">
              <p className="course-detail__meta-text">
                📅 Опубликовано:{" "}
                {new Date(course.publishedAt).toLocaleDateString("ru-RU")}
              </p>
            </div>

            {user &&
              (user.role.type === "admin" || isCourseAuthor) && (
                <button
                  className="course-detail__edit-btn"
                  onClick={() => navigate(`/course/${course.documentId}/edit`)}
                >
                  ✏️ Редактировать
                </button>
              )}

            {canViewStudents && (
              <button
                className="course-detail__students-btn"
                onClick={() => navigate(`/course/${course.documentId}/students`)}
              >
                👥 Прогресс студентов
              </button>
            )}
          </div>

          {course.topics && course.topics.length > 0 && (
            <div className="course-detail__topics">
              <h3 className="course-detail__topics-title">
                📚 Темы ({course.topics.length})
              </h3>

              <div className="course-detail__topics-list">
                {course.topics.map((topic, index) => {
                  const topicKey = getTopicKey(topic, index);
                  const isCompleted = completedTopics.includes(topicKey);
                  const isSelected = selectedTopicIndex === index;

                  return (
                    <button
                      key={topicKey}
                      className={
                        "course-detail__topic" +
                        (isSelected ? " course-detail__topic--active" : "")
                      }
                      onClick={() => handleTopicSelect(index)}
                    >
                      <div className="course-detail__topic-row">
                        <span className="course-detail__topic-icon">
                          {isCompleted ? "✅" : isSelected ? "▶" : "○"}
                        </span>
                        <span className="course-detail__topic-title">
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
