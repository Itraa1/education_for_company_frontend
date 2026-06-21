import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import DashboardLayout from "./DashboardLayout";
import { type Course } from "../types/course";
import { type CourseEnrollment } from "../types/enrollment";
import { calcProgress } from "../types/enrollment";
import { fetchCourseByDocumentId } from "../controllers/courseService";
import { getEnrollmentsByCourse } from "../controllers/enrollService";
import { useUser } from "../components/context/UserContext";
import ProgressBar from "../components/progress/ProgressBar";

function isAuthorOrAdmin(roleName?: string) {
  return roleName === "Admin" || roleName === "Author";
}

function canViewStudents(userId: number, roleName: string | undefined, course: Course) {
  if (roleName === "Admin") return true;
  if (roleName === "Author" && course.users_permissions_user?.id === userId) return true;
  return false;
}

const STATE_LABELS: Record<string, string> = {
  active: "В процессе",
  completed: "Завершён",
  dropped: "Отписан",
};

export default function CourseStudents() {
  const { documentId } = useParams();
  const navigate = useNavigate();
  const { user } = useUser();
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !documentId) return;

    if (!isAuthorOrAdmin(user.role.name)) {
      navigate("/catalog");
      return;
    }

    const load = async () => {
      try {
        setLoading(true);
        setError(null);
        const courseData = await fetchCourseByDocumentId(documentId);

        if (!canViewStudents(user.id, user.role.name, courseData)) {
          navigate("/my-courses");
          return;
        }

        setCourse(courseData);
        const data = await getEnrollmentsByCourse(courseData.id);
        setEnrollments(data);
      } catch (err) {
        console.error("Failed to load course students:", err);
        setError("Не удалось загрузить данные о студентах.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user, documentId, navigate]);

  const totalTopics = course?.topics?.length ?? 0;

  return (
    <DashboardLayout>
      <div className="page-toolbar">
        <button
          className="btn-back"
          onClick={() => navigate("/my-courses")}
        >
          ← Назад к моим курсам
        </button>
      </div>

      <div className="page-header">
        <h1 className="page-title">Прогресс студентов</h1>
        <p className="page-subtitle">
          {course ? `Курс: ${course.title}` : "Загрузка..."}
        </p>
      </div>

      {error && <div className="error-message">⚠️ {error}</div>}

      {loading ? (
        <div className="state">
          <p className="state__text">⏳ Загрузка...</p>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="state">
          <p className="state__text">👥 Пока никто не записан на этот курс</p>
        </div>
      ) : (
        <div className="students-table-wrapper">
          <table className="students-table">
            <thead>
              <tr>
                <th>Студент</th>
                <th>Прогресс</th>
                <th>Статус</th>
                <th>Дата записи</th>
                <th>Завершён</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.map((enrollment) => {
                const progress = calcProgress(enrollment.completed_topics, totalTopics);
                return (
                  <tr key={enrollment.documentId}>
                    <td>
                      <strong>{enrollment.user?.username ?? "—"}</strong>
                      <div className="students-table__email">{enrollment.user?.email}</div>
                    </td>
                    <td className="students-table__progress">
                      <ProgressBar
                        completed={progress.completed}
                        total={progress.total}
                        label={`${progress.completed} / ${progress.total} тем`}
                      />
                    </td>
                    <td>
                      <span className={`students-table__badge students-table__badge--${enrollment.enrollment_state}`}>
                        {STATE_LABELS[enrollment.enrollment_state] ?? enrollment.enrollment_state}
                      </span>
                    </td>
                    <td>
                      {new Date(enrollment.enrolled_at).toLocaleDateString("ru-RU")}
                    </td>
                    <td>
                      {enrollment.completed_at
                        ? new Date(enrollment.completed_at).toLocaleDateString("ru-RU")
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
