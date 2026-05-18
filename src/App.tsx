import { useEffect } from "react";
import { useNavigate } from "react-router";
import { checkAuth } from "./controllers/chechAuth";
import { StyledSideBar } from "./components/menu/styledSideBar";
import { StyledHeader } from "./components/header/steledHeader";
import "./App.css";

interface Course {
  id: number;
  title: string;
  description: string;
  instructor: string;
  students: number;
  status: "active" | "completed" | "new";
}

const mockCourses: Course[] = [
  {
    id: 1,
    title: "React для начинающих",
    description: "Полный курс по React с нуля до профессионала",
    instructor: "Иван Петров",
    students: 234,
    status: "active",
  },
  {
    id: 2,
    title: "TypeScript Advanced",
    description: "Продвинутые концепции TypeScript и типизация",
    instructor: "Мария Сидорова",
    students: 156,
    status: "active",
  },
  {
    id: 3,
    title: "Node.js для backend",
    description: "Создание полнофункциональных серверных приложений",
    instructor: "Алексей Козлов",
    students: 189,
    status: "new",
  },
  {
    id: 4,
    title: "CSS и современный дизайн",
    description: "Мастерство CSS3 и создание адаптивных интерфейсов",
    instructor: "Елена Воронина",
    students: 312,
    status: "completed",
  },
  {
    id: 5,
    title: "REST API разработка",
    description: "Проектирование и разработка REST API",
    instructor: "Виктор Смирнов",
    students: 178,
    status: "active",
  },
  {
    id: 6,
    title: "Тестирование приложений",
    description: "Unit тесты, интеграционные тесты и E2E тестирование",
    instructor: "Ольга Рыбакова",
    students: 142,
    status: "active",
  },
];

function App() {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndNavigate = async () => {
      const auth = await checkAuth();
      if (!auth) {
        navigate("/auth");
      }
    };
    checkAndNavigate();
  }, [navigate]);

  const handleEnrollCourse = (courseId: number) => {
    alert(`Вы записаны на курс #${courseId}!`);
  };

  return (
    <div className="app-layout">
      <StyledHeader />
      <div className="app-body">
        <StyledSideBar />
        <div className="app-content">
          <div className="content-wrapper">
            <div className="page-header">
              <h1 className="page-title">Образовательный Портал</h1>
              <p className="page-subtitle">
                Развивайте свои навыки с помощью качественного онлайн-обучения
              </p>
            </div>

            {/* Активные курсы */}
            <section className="courses-section">
              <h2 className="section-title">🎓 Рекомендуемые курсы</h2>
              <div className="courses-grid">
                {mockCourses.slice(0, 3).map((course) => (
                  <div key={course.id} className="course-card">
                    <div className="course-card-image">
                      {course.status === "new" && "⭐"}
                      {course.status === "active" && "📚"}
                      {course.status === "completed" && "✅"}
                    </div>
                    <div className="course-card-body">
                      <h3 className="course-card-title">{course.title}</h3>
                      <p className="course-card-description">
                        {course.description}
                      </p>
                      <div className="course-card-meta">
                        <span>👨‍🏫 {course.instructor}</span>
                        <span>👥 {course.students} студентов</span>
                      </div>
                      <div className="course-card-meta">
                        <span className="course-card-badge">
                          {course.status === "new"
                            ? "Новое"
                            : course.status === "active"
                              ? "Идет"
                              : "Завершено"}
                        </span>
                      </div>
                      <button
                        className="course-card-button"
                        onClick={() => handleEnrollCourse(course.id)}
                      >
                        Записаться
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Все курсы */}
            <section className="courses-section">
              <h2 className="section-title">📖 Все курсы</h2>
              <div className="courses-grid">
                {mockCourses.map((course) => (
                  <div key={course.id} className="course-card">
                    <div className="course-card-image">
                      {course.status === "new" && "⭐"}
                      {course.status === "active" && "📚"}
                      {course.status === "completed" && "✅"}
                    </div>
                    <div className="course-card-body">
                      <h3 className="course-card-title">{course.title}</h3>
                      <p className="course-card-description">
                        {course.description}
                      </p>
                      <div className="course-card-meta">
                        <span>👨‍🏫 {course.instructor}</span>
                        <span>👥 {course.students}</span>
                      </div>
                      <div className="course-card-meta">
                        <span className="course-card-badge">
                          {course.status === "new"
                            ? "Новое"
                            : course.status === "active"
                              ? "Идет"
                              : "Завершено"}
                        </span>
                      </div>
                      <button
                        className="course-card-button"
                        onClick={() => handleEnrollCourse(course.id)}
                      >
                        Записаться
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
