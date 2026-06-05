import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "./DashboardLayout";
import { type Course } from "../types/course";
import { fetchCourses, searchCourses, getCategoryLabel, getLevelLabel, getCategoryIcon } from "../controllers/courseService";
import { enrollCourse, isEnrolled } from "../controllers/enrollService";

export default function Catalog() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolledIds, setEnrolledIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const debounceTimerRef = useRef<number | null>(null);

  
  useEffect(() => {
    const loadCourses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchCourses();
        setCourses(data);
        
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

  
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(async () => {
      try {
        setLoading(true);
        setError(null);

        if (value.trim() === "") {
          const data = await fetchCourses();
          setCourses(data);
        } else {
          const data = await searchCourses(value);
          setCourses(data);
        }
      } catch (err) {
        console.error("Search failed:", err);
        setError("Ошибка при поиске. Попробуйте еще раз.");
        setCourses([]);
      } finally {
        setLoading(false);
      }
    }, 400);
  };

  const handleCourseClick = (documentId: string) => {
    navigate(`/course/${documentId}`);
  };

  const handleEnrollCourse = (e: React.MouseEvent, course: Course) => {
    e.stopPropagation();
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

      {/* Поисковая строка */}
      <div style={{ marginBottom: "2rem" }}>
        <input
          type="text"
          placeholder="🔍 Поиск курсов по названию..."
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          style={{
            width: "100%",
            padding: "0.75rem 1rem",
            fontSize: "1rem",
            border: "2px solid var(--border-color)",
            borderRadius: "0.5rem",
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            transition: "border-color 0.3s",
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "var(--primary)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "var(--border-color)";
          }}
        />
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
              <div 
                key={course.documentId} 
                className="course-card"
                onClick={() => handleCourseClick(course.documentId)}
                style={{ cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-4px)";
                  e.currentTarget.style.boxShadow = "0 8px 16px rgba(0, 0, 0, 0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "";
                }}
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
                    onClick={(e) => handleEnrollCourse(e, course)}
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
