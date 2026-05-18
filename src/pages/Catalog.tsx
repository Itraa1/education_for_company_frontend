import { useEffect, useState } from "react";
import DashboardLayout from "./DashboardLayout";
import { type Course } from "../types/course";
import { fetchCourses, getCategoryLabel, getLevelLabel, getCategoryIcon } from "../controllers/courseService";
import { enrollCourse, isEnrolled } from "../controllers/enrollService";

export default function Catalog() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCourses();
        setCourses(data);
        
        // Обновляем список записанных курсов
        const enrolled = new Set<number>();
        data.forEach(course => {
          if (isEnrolled(course.id)) {
            enrolled.add(course.id);
          }
        });
        setEnrolledIds(enrolled);
      } catch (err) {
        console.error("Failed to load courses:", err);
        setError("Не удалось загрузить курсы. Попробуйте позже.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  const handleEnrollCourse = (course: Course) => {
    try {
      enrollCourse(course);
      setEnrolledIds(prev => new Set([...prev, course.id]));
      alert(`✅ Вы записаны на курс: ${course.title}!`);
    } catch (err) {
      console.error("Failed to enroll course:", err);
      alert("❌ Не удалось записаться на курс. Попробуйте позже.");
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Каталог курсов</h1>
        <p className="page-subtitle">Выберите интересующий вас курс</p>
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
          <p style={{ fontSize: "1.2rem" }}>📚 Курсы не найдены</p>
        </div>
      ) : (
        <section className="courses-section">
          <div className="courses-grid">
            {courses.map((course) => (
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
                    <span>👨‍🏫 {course.instructor}</span>
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
                    onClick={() => handleEnrollCourse(course)}
                    disabled={enrolledIds.has(course.id)}
                    style={{
                      opacity: enrolledIds.has(course.id) ? 0.6 : 1,
                      cursor: enrolledIds.has(course.id) ? "not-allowed" : "pointer",
                    }}
                  >
                    {enrolledIds.has(course.id) ? "✅ Записан" : "Записаться"}
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
