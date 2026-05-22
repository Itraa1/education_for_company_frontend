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
    // const checkAndNavigate = async () => {
    checkAuth().then(auth => {
      console.log(auth);

      if (!auth) {
        navigate("/auth");
      }
    });


    // checkAndNavigate();
  }, [navigate]);

  const handleCoursesClick = (documentId: string) => {
    navigate(`/course/${documentId}`);
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
                  <div 
                    key={course.id} 
                    className="course-card"
                    onClick={() => handleCoursesClick(course.id.toString())}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCoursesClick(course.id.toString());
                        }}
                      >
                        Подробнее →
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
                  <div 
                    key={course.id} 
                    className="course-card"
                    onClick={() => handleCoursesClick(course.id.toString())}
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
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCoursesClick(course.id.toString());
                        }}
                      >
                        Подробнее →
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
