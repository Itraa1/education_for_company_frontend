import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "./DashboardLayout";
import { type CourseEnrollment } from "../types/enrollment";
import { getEnrollmentsByUser } from "../controllers/enrollService";
import { getCategoryLabel, getCategoryIcon } from "../controllers/courseService";
import { useUser } from "../components/context/UserContext";
import ProgressBar from "../components/progress/ProgressBar";

export default function CompletedCourses() {
  const navigate = useNavigate();
  const { user } = useUser();
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      try {
        setLoading(true);
        const data = await getEnrollmentsByUser(user.id, "completed");
        setEnrollments(data);
      } catch (err) {
        console.error("Failed to load completed courses:", err);
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Завершенные курсы</h1>
        <p className="page-subtitle">Курсы, которые вы успешно прошли</p>
      </div>

      {loading ? (
        <div className="state">
          <p className="state__text">⏳ Загрузка...</p>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="state">
          <p className="state__text">🎓 У вас пока нет завершённых курсов</p>
          <p className="state__hint">
            Изучите все темы курса, чтобы он появился здесь
          </p>
        </div>
      ) : (
        <section className="courses-section">
          <div className="courses-grid">
            {enrollments.map((enrollment) => {
              const course = enrollment.course;
              if (!course) return null;
              const totalTopics = course.topics?.length ?? 0;

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
                        <ProgressBar completed={totalTopics} total={totalTopics} />
                      </div>
                    )}
                    <div className="course-card-meta">
                      <span className="course-card-badge">
                        {getCategoryLabel(course.category)}
                      </span>
                    </div>
                    <div className="course-card-meta">
                      <span className="course-card-meta__note">
                        Завершён:{" "}
                        {enrollment.completed_at
                          ? new Date(enrollment.completed_at).toLocaleDateString("ru-RU")
                          : "—"}
                      </span>
                    </div>
                    <button
                      className="course-card-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/course/${course.documentId}`);
                      }}
                    >
                      Открыть курс
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </DashboardLayout>
  );
}
