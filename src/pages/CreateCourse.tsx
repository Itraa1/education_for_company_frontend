import { useState } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "./DashboardLayout";
import { type CourseCategory, type CourseLevel, type CourseInput } from "../types/course";
import { createCourse } from "../controllers/courseService";

export default function CreateCourse() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<CourseInput>({
    title: "",
    description: "",
    category: "programming",
    level: "beginner",
    duration: 1,
    instructor: "",
    content: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? parseInt(value) || 0 : value,
    }));
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Валидация
    if (!formData.title.trim()) {
      setError("Название курса обязательно");
      return;
    }
    // if (!formData.slug.trim()) {
    //   setError("URL курса обязателен");
    //   return;
    // }
    if (!formData.description.trim()) {
      setError("Описание курса обязательно");
      return;
    }
    if (!formData.instructor.trim()) {
      setError("Имя инструктора обязательно");
      return;
    }
    if (!formData.content.trim()) {
      setError("Текст курса обязателен");
      return;
    }
    if (formData.duration <= 0) {
      setError("Продолжительность должна быть больше 0");
      return;
    }

    try {
      setLoading(true);
      await createCourse(formData);
      alert("✅ Курс успешно создан!");
      navigate("/catalog");
    } catch (err) {
      console.error("Failed to create course:", err);
      setError("Не удалось создать курс. Попробуйте позже.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Создание нового курса</h1>
        <p className="page-subtitle">Заполните все поля для создания курса</p>
      </div>

      {error && (
        <div className="error-message">
          ⚠️ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ maxWidth: "800px", margin: "2rem auto" }}>
        {/* Название */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            📝 Название курса *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Введите название курса"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
            required
          />
        </div>

        {/* URL курса */}
        {/* <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
             URL курса (автоматически генерируется) *
          </label>
          <input
            type="text"
            name="slug"
            value={formData.slug}
            readOnly
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-secondary)",
              fontSize: "1rem",
              boxSizing: "border-box",
              cursor: "not-allowed",
            }}
          />
        </div> */}

        {/* Описание */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
             Описание курса (краткое) *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Введите краткое описание курса"
            rows={3}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              boxSizing: "border-box",
              fontFamily: "inherit",
              resize: "vertical",
            }}
            required
          />
        </div>

        {/* Текст курса */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
             Основной текст курса *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            placeholder="Введите основной текст курса (может содержать markdown)"
            rows={6}
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              boxSizing: "border-box",
              fontFamily: "monospace",
              resize: "vertical",
            }}
            required
          />
        </div>

        {/* Инструктор */}
        <div style={{ marginBottom: "1.5rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
             Имя Автора *
          </label>
          <input
            type="text"
            name="instructor"
            value={formData.instructor}
            onChange={handleChange}
            placeholder="Введите имя инструктора"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
            required
          />
        </div>

        {/* Категория и Уровень в одной строке */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          {/* Категория */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              🏷️ Категория *
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            >
              <option value="programming"> Программирование</option>
              <option value="design"> Дизайн</option>
              <option value="business"> Бизнес</option>
            </select>
          </div>

          {/* Уровень */}
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
              📊 Уровень *
            </label>
            <select
              name="level"
              value={formData.level}
              onChange={handleChange}
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                backgroundColor: "var(--bg-tertiary)",
                color: "var(--text-primary)",
                fontSize: "1rem",
                boxSizing: "border-box",
              }}
            >
              <option value="beginner">Начинающий</option>
              <option value="intermediate">Продвинутый</option>
              <option value="advanced">Эксперт</option>
            </select>
          </div>
        </div>

        {/* Продолжительность */}
        <div style={{ marginBottom: "2rem" }}>
          <label style={{ display: "block", marginBottom: "0.5rem", fontWeight: "500" }}>
            ⏱️ Продолжительность (часов) *
          </label>
          <input
            type="number"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            max="1000"
            style={{
              width: "100%",
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              boxSizing: "border-box",
            }}
            required
          />
        </div>

        {/* Кнопки */}
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => navigate("/catalog")}
            style={{
              padding: "0.75rem 1.5rem",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              backgroundColor: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              fontSize: "1rem",
              cursor: "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "var(--bg-hover)";
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = "var(--bg-tertiary)";
            }}
          >
            Отмена
          </button>
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "0.75rem 2rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: loading ? "#5eff0080" : "#5eff00",
              color: "#1a1a2e",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.backgroundColor = "#4de600";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                (e.target as HTMLButtonElement).style.backgroundColor = "#5eff00";
              }
            }}
          >
            {loading ? "Создание..." : "✅ Создать курс"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
