import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "./DashboardLayout";
import { type CourseEnrollment } from "../types/enrollment";
import { calcProgress } from "../types/enrollment";
import { getEnrollmentsByUser, unenrollCourse } from "../controllers/enrollService";
import { getCategoryLabel, getLevelLabel, getCategoryIcon } from "../controllers/courseService";
import { useToast } from "../components/toast/ToastProvider";
import { useUser } from "../components/context/UserContext";
import ConfirmDialog from "../components/confirm/ConfirmDialog";
import ProgressBar from "../components/progress/ProgressBar";

interface PendingUnenroll {
  documentId: string;
  courseTitle: string;
}

export default function ActiveCourses() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [pendingUnenroll, setPendingUnenroll] = useState<PendingUnenroll | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!user) return;

    const loadCourses = async () => {
      try {
        setLoading(true);
        const data = await getEnrollmentsByUser(user.id, "active");
        setEnrollments(data);
      } catch (err) {
        console.error("Failed to load active courses:", err);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, [user]);

  const handleUnenrollCourse = (documentId: string, courseTitle: string) => {
    setPendingUnenroll({ documentId, courseTitle });
  };

  const handleConfirmUnenroll = async () => {
    if (!pendingUnenroll) return;
    try {
      await unenrollCourse(pendingUnenroll.documentId);
      setEnrollments((prev) =>
        prev.filter((e) => e.documentId !== pendingUnenroll.documentId)
      );
      showToast(`Вы удалены с курса: ${pendingUnenroll.courseTitle}`, "success");
    } catch (err) {
      console.error("Failed to unenroll:", err);
      showToast("Не удалось отписаться от курса.", "error");
    } finally {
      setPendingUnenroll(null);
    }
  };

  const handleCancelUnenroll = () => {
    setPendingUnenroll(null);
  };

  return (
    <>
      <ConfirmDialog
        isOpen={pendingUnenroll !== null}
        title="Удалить курс из активных?"
        message={`Вы уверены, что хотите удалить курс «${pendingUnenroll?.courseTitle}» из активных?`}
        confirmLabel="Удалить"
        cancelLabel="Отмена"
        onConfirm={handleConfirmUnenroll}
        onCancel={handleCancelUnenroll}
      />
      <DashboardLayout>
        <div className="page-header">
          <h1 className="page-title">Активные курсы</h1>
          <p className="page-subtitle">Курсы, в которых вы участвуете в данный момент</p>
        </div>

        {loading ? (
          <div className="state">
            <p className="state__text">⏳ Загрузка...</p>
          </div>
        ) : enrollments.length === 0 ? (
          <div className="state">
            <p className="state__text">📚 Вы еще не записаны ни на один курс</p>
            <p className="state__hint">Перейдите в каталог и выберите курс</p>
          </div>
        ) : (
          <section className="courses-section">
            <div className="courses-grid">
              {enrollments.map((enrollment) => {
                const course = enrollment.course;
                if (!course) return null;
                const totalTopics = course.topics?.length ?? 0;
                const progress = calcProgress(enrollment.completed_topics, totalTopics);

                return (
                  <div
                    key={enrollment.documentId}
                    className="course-card course-card--clickable"
                    onClick={() => navigate(`/course/${course.documentId}`)}
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
                        <span>👨‍🏫 {course.users_permissions_user?.username}</span>
                        <span>⏱️ {course.duration} часов</span>
                      </div>
                      {totalTopics > 0 && (
                        <div className="course-card-meta course-card-meta--block">
                          <ProgressBar completed={progress.completed} total={progress.total} />
                        </div>
                      )}
                      <div className="course-card-meta">
                        <span className="course-card-badge">
                          {getCategoryLabel(course.category)}
                        </span>
                      </div>
                      <div className="course-card-meta">
                        <span className="course-card-meta__note">
                          Уровень: {getLevelLabel(course.level)}
                        </span>
                      </div>
                      <button
                        className="course-card-button course-card-button--danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleUnenrollCourse(enrollment.documentId, course.title);
                        }}
                      >
                        Удалить курс
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </DashboardLayout>
    </>
  );
}
