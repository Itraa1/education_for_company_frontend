import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { type Course } from "../types/course";
import { getEnrolledCourses, unenrollCourse } from "../controllers/enrollService";
import { getCategoryLabel, getLevelLabel, getCategoryIcon } from "../controllers/courseService";

export default function ActiveCourses() {
  const [enrolledCourses, setEnrolledCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCourses = async () => {
      const courses = await Promise.resolve(getEnrolledCourses());
      setEnrolledCourses(courses);
      setLoading(false);
    };

    loadCourses();
  }, []);

  const handleUnenrollCourse = (courseId: number, courseTitle: string) => {
    if (window.confirm(`Вы уверены, что хотите удалить курс "${courseTitle}" из активных?`)) {
      unenrollCourse(courseId);
      setEnrolledCourses(prev => prev.filter(c => c.id !== courseId));
      alert(` Вы удалены с курса: ${courseTitle}`);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Активные курсы</h1>
        <p className="page-subtitle">Курсы, в которых вы участвуете в данный момент</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: "1.2rem" }}>⏳ Загрузка...</p>
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: "1.2rem" }}>📚 Вы еще не записаны ни на один курс</p>
          <p style={{ fontSize: "0.95rem", marginTop: "0.5rem" }}>Перейдите в каталог и выберите курс</p>
        </div>
      ) : (
        <section className="courses-section">
          <div className="courses-grid">
            {enrolledCourses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-card-image">
                  {getCategoryIcon(course.category)}
                </div>
                <div className="course-card-body">
                  <h3 className="course-card-title">{course.title}</h3>
                  <p className="course-card-description">
                    {course.description.substring(0, 150)}...
                  </p>
                  <div className="course-card-meta">
                    <span>👨‍🏫 {course?.users_permissions_user?.username}</span>
                    <span>⏱️ {course.duration} часов</span>
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
                    onClick={() => handleUnenrollCourse(course.id, course.title)}
                    style={{
                      backgroundColor: "#ff6b9d",
                    }}
                  >
                    Удалить курс
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
