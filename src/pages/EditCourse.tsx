import { useState, useEffect, useContext } from "react";
import { useNavigate, useParams } from "react-router";
import DashboardLayout from "./DashboardLayout";
import { type CourseInput, type Topic, type Course } from "../types/course";
import { updateCourse, fetchCourseByDocumentId } from "../controllers/courseService";
import { UserContext } from "../components/context/UserContext";

export default function EditCourse() {
  const navigate = useNavigate();
  const { documentId } = useParams();
  const userContext = useContext(UserContext);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);
  const [course, setCourse] = useState<Course | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState<CourseInput>({
    title: "",
    description: "",
    category: "programming",
    level: "beginner",
    duration: 1,
    youtube_url: "",
    content: "",
    topics: [],
  });

  useEffect(() => {
    const loadCourse = async () => {
      try {
        if (!documentId) {
          throw new Error("ID курса не найден");
        }

        setLoading(true);
        setError(null);

        const data = await fetchCourseByDocumentId(documentId);
        setCourse(data);

        // Проверка доступа: только автор и админ могут редактировать
        const isAuthor = userContext?.user?.id === data.users_permissions_user?.id;
        const isAdmin = userContext?.user?.role?.type === "admin";

        if (!isAuthor && !isAdmin) {
          throw new Error("У вас нет прав для редактирования этого курса");
        }

        setFormData({
          title: data.title,
          description: data.description,
          category: data.category,
          level: data.level,
          duration: data.duration,
          youtube_url: data.youtube_url || "",
          content: data.text || "",
          topics: data.topics || [],
        });

        if (data.topics && data.topics.length > 0 && data.topics[0].id) {
          setExpandedTopicId(data.topics[0].id);
        }
      } catch (err) {
        console.error("Failed to load course:", err);
        setError((err instanceof Error ? err.message : "Не удалось загрузить курс. Попробуйте позже."));
      } finally {
        setLoading(false);
      }
    };

    loadCourse();
  }, [documentId, userContext]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "duration" ? parseInt(value) || 0 : value,
    }));
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title,
    }));
  };

  const addTopic = () => {
    const newTopic: Topic = {
      id: `topic-${Date.now()}`,
      title: "",
      content: "",
    };
    setFormData((prev) => ({
      ...prev,
      topics: [...(prev.topics || []), newTopic],
    }));
    setExpandedTopicId(newTopic.id || null);
  };

  const removeTopic = (topicId: string | undefined) => {
    setFormData((prev) => ({
      ...prev,
      topics: (prev.topics || []).filter((t) => t.id !== topicId),
    }));
    if (expandedTopicId === topicId) {
      setExpandedTopicId(null);
    }
  };

  const updateTopic = (topicId: string | undefined, field: keyof Topic, value: string) => {
    setFormData((prev) => ({
      ...prev,
      topics: (prev.topics || []).map((t) =>
        t.id === topicId ? { ...t, [field]: value } : t
      ),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!formData.title.trim()) {
      setError("Название курса обязательно");
      return;
    }
    if (!formData.description.trim()) {
      setError("Описание курса обязательно");
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
    if (!formData.topics || formData.topics.length === 0) {
      setError("Добавьте минимум одну тему для курса");
      return;
    }
    if (formData.topics.some((t) => !t.title.trim() || !t.content.trim())) {
      setError("Все темы должны содержать название и текст");
      return;
    }

    try {
      setSubmitting(true);
      if (!documentId) {
        throw new Error("ID курса не найден");
      }
      await updateCourse(documentId, formData);
      alert("✅ Курс успешно обновлён!");
      navigate(`/course/${documentId}`);
    } catch (err) {
      console.error("Failed to update course:", err);
      setError("Не удалось обновить курс. Попробуйте позже.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "3rem 0", color: "var(--text-secondary)" }}>
          <p style={{ fontSize: "1.2rem" }}>⏳ Загрузка курса...</p>
        </div>
      </DashboardLayout>
    );
  }

  if (error && !course) {
    return (
      <DashboardLayout>
        <div style={{ textAlign: "center", padding: "3rem 0" }}>
          <p style={{ fontSize: "1.2rem", color: "var(--text-secondary)" }}>
            ❌ {error}
          </p>
          <button
            onClick={() => navigate("/catalog")}
            style={{
              marginTop: "1rem",
              padding: "0.75rem 1.5rem",
              backgroundColor: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "0.5rem",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Вернуться в каталог
          </button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="page-header">
        <h1 className="page-title">Редактирование курса</h1>
        <p className="page-subtitle">Обновите информацию о курсе</p>
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
             Ссылка на youtube видео
          </label>
          <input
            type="text"
            name="youtube_url"
            value={formData.youtube_url}
            onChange={handleChange}
            placeholder="Введите ссылку на видео"
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
            
          />
        </div>

        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
          
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

        {/* Темы курса */}
        <div style={{ marginBottom: "2rem", padding: "1.5rem", backgroundColor: "var(--bg-tertiary)", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
            <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600" }}>📚 Темы курса</h3>
            <button
              type="button"
              onClick={addTopic}
              style={{
                padding: "0.5rem 1rem",
                borderRadius: "6px",
                border: "none",
                backgroundColor: "#5eff00",
                color: "#1a1a2e",
                fontWeight: "600",
                cursor: "pointer",
                transition: "background-color 0.2s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#4de600")}
              onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#5eff00")}
            >
              + Добавить тему
            </button>
          </div>

          {formData.topics && formData.topics.length > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {formData.topics.map((topic, index) => (
                <div
                  key={topic.id}
                  style={{
                    border: "1px solid var(--border-color)",
                    borderRadius: "6px",
                    backgroundColor: "var(--bg-secondary)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    onClick={() =>
                      setExpandedTopicId(
                        expandedTopicId === topic.id ? null : (topic.id || null)
                      )
                    }
                    style={{
                      padding: "1rem",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      transition: "background-color 0.2s",
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor =
                        "rgba(255, 255, 255, 0.05)";
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    }}
                  >
                    <span style={{ fontWeight: "500" }}>
                      {topic.title || `Тема ${index + 1}`}
                    </span>
                    <span style={{ fontSize: "1.2rem" }}>
                      {expandedTopicId === topic.id ? "▼" : "▶"}
                    </span>
                  </div>

                  {expandedTopicId === topic.id && (
                    <div style={{ padding: "1rem", borderTop: "1px solid var(--border-color)" }}>
                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500" }}>
                          Название темы *
                        </label>
                        <input
                          type="text"
                          value={topic.title}
                          onChange={(e) =>
                            updateTopic(topic.id, "title", e.target.value)
                          }
                          placeholder="Введите название темы"
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "6px",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "0.95rem",
                            boxSizing: "border-box",
                          }}
                        />
                      </div>

                      <div style={{ marginBottom: "1rem" }}>
                        <label style={{ display: "block", marginBottom: "0.5rem", fontSize: "0.9rem", fontWeight: "500" }}>
                          Текст темы *
                        </label>
                        <textarea
                          value={topic.content}
                          onChange={(e) =>
                            updateTopic(topic.id, "content", e.target.value)
                          }
                          placeholder="Введите текст для этой темы"
                          rows={5}
                          style={{
                            width: "100%",
                            padding: "0.75rem",
                            borderRadius: "6px",
                            border: "1px solid var(--border-color)",
                            backgroundColor: "var(--bg-secondary)",
                            color: "var(--text-primary)",
                            fontSize: "0.95rem",
                            boxSizing: "border-box",
                            fontFamily: "monospace",
                            resize: "vertical",
                          }}
                        />
                      </div>

                      <button
                        type="button"
                        onClick={() => removeTopic(topic.id)}
                        style={{
                          padding: "0.5rem 1rem",
                          borderRadius: "6px",
                          border: "none",
                          backgroundColor: "#ff6b6b",
                          color: "white",
                          fontWeight: "500",
                          cursor: "pointer",
                          transition: "background-color 0.2s",
                        }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.backgroundColor = "#ff5252")
                        }
                        onMouseLeave={(e) =>
                          (e.currentTarget.style.backgroundColor = "#ff6b6b")
                        }
                      >
                        🗑️ Удалить тему
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p style={{ color: "var(--text-secondary)", textAlign: "center", margin: "1rem 0" }}>
              Пока нет тем. Нажмите кнопку выше, чтобы добавить первую тему.
            </p>
          )}
        </div>

        
        <div style={{ display: "flex", gap: "1rem", justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => navigate(`/course/${documentId}`)}
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
            disabled={submitting}
            style={{
              padding: "0.75rem 2rem",
              borderRadius: "8px",
              border: "none",
              backgroundColor: submitting ? "#5eff0080" : "#5eff00",
              color: "#1a1a2e",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              if (!submitting) {
                (e.target as HTMLButtonElement).style.backgroundColor = "#4de600";
              }
            }}
            onMouseLeave={(e) => {
              if (!submitting) {
                (e.target as HTMLButtonElement).style.backgroundColor = "#5eff00";
              }
            }}
          >
            {submitting ? "Сохранение..." : "✅ Сохранить изменения"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
