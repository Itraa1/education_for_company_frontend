import { useState } from "react";
import { useNavigate } from "react-router";
import DashboardLayout from "./DashboardLayout";
import { type CourseInput, type Topic } from "../types/course";
import { createCourse } from "../controllers/courseService";
import { useToast } from "../components/toast/ToastProvider";
import "./CourseForm.css";

export default function CreateCourse() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedTopicId, setExpandedTopicId] = useState<string | null>(null);

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
      setLoading(true);
      await createCourse(formData);
      showToast("Курс успешно создан!", "success");
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

      <form onSubmit={handleSubmit} className="course-form">
        {/* Название */}
        <div className="course-form__group">
          <label className="course-form__label">
            📝 Название курса *
          </label>
          <input
            type="text"
            name="title"
            className="course-form__control"
            value={formData.title}
            onChange={handleTitleChange}
            placeholder="Введите название курса"
            required
          />
        </div>

        <div className="course-form__group">
          <label className="course-form__label">
             Описание курса (краткое) *
          </label>
          <textarea
            name="description"
            className="course-form__control course-form__control--textarea"
            value={formData.description}
            onChange={handleChange}
            placeholder="Введите краткое описание курса"
            rows={3}
            required
          />
        </div>

        <div className="course-form__group">
          <label className="course-form__label">
             Основной текст курса *
          </label>
          <textarea
            name="content"
            className="course-form__control course-form__control--code"
            value={formData.content}
            onChange={handleChange}
            placeholder="Введите основной текст курса (может содержать markdown)"
            rows={6}
            required
          />
        </div>

        {/* Инструктор */}
        <div className="course-form__group">
          <label className="course-form__label">
             Ссылка на youtube видео
          </label>
          <input
            type="text"
            name="youtube_url"
            className="course-form__control"
            value={formData.youtube_url}
            onChange={handleChange}
            placeholder="Введите имя инструктора"
          />
        </div>

        <div className="course-form__row">
          <div>
            <label className="course-form__label">
              🏷️ Категория *
            </label>
            <select
              name="category"
              className="course-form__control"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="programming"> Программирование</option>
              <option value="design"> Дизайн</option>
              <option value="business"> Бизнес</option>
            </select>
          </div>

          <div>
            <label className="course-form__label">
              📊 Уровень *
            </label>
            <select
              name="level"
              className="course-form__control"
              value={formData.level}
              onChange={handleChange}
            >
              <option value="beginner">Начинающий</option>
              <option value="intermediate">Продвинутый</option>
              <option value="advanced">Эксперт</option>
            </select>
          </div>
        </div>

        {/* Продолжительность */}
        <div className="course-form__group course-form__group--lg">
          <label className="course-form__label">
            ⏱️ Продолжительность (часов) *
          </label>
          <input
            type="number"
            name="duration"
            className="course-form__control"
            value={formData.duration}
            onChange={handleChange}
            min="1"
            max="1000"
            required
          />
        </div>

        {/* Темы курса */}
        <div className="course-form__topics">
          <div className="course-form__topics-head">
            <h3 className="course-form__topics-title">📚 Темы курса</h3>
            <button
              type="button"
              className="course-form__add-btn"
              onClick={addTopic}
            >
              + Добавить тему
            </button>
          </div>

          {formData.topics && formData.topics.length > 0 ? (
            <div className="course-form__topics-list">
              {formData.topics.map((topic, index) => (
                <div key={topic.id} className="course-form__topic">
                  <div
                    className="course-form__topic-head"
                    onClick={() =>
                      setExpandedTopicId(
                        expandedTopicId === topic.id ? null : (topic.id || null)
                      )
                    }
                  >
                    <span className="course-form__topic-name">
                      {topic.title || `Тема ${index + 1}`}
                    </span>
                    <span className="course-form__topic-toggle">
                      {expandedTopicId === topic.id ? "▼" : "▶"}
                    </span>
                  </div>

                  {expandedTopicId === topic.id && (
                    <div className="course-form__topic-body">
                      <div className="course-form__field">
                        <label className="course-form__field-label">
                          Название темы *
                        </label>
                        <input
                          type="text"
                          className="course-form__field-control"
                          value={topic.title}
                          onChange={(e) =>
                            updateTopic(topic.id, "title", e.target.value)
                          }
                          placeholder="Введите название темы"
                        />
                      </div>

                      <div className="course-form__field">
                        <label className="course-form__field-label">
                          Текст темы *
                        </label>
                        <textarea
                          className="course-form__field-control course-form__field-control--code"
                          value={topic.content}
                          onChange={(e) =>
                            updateTopic(topic.id, "content", e.target.value)
                          }
                          placeholder="Введите текст для этой темы"
                          rows={5}
                        />
                      </div>

                      <button
                        type="button"
                        className="course-form__remove-btn"
                        onClick={() => removeTopic(topic.id)}
                      >
                        🗑️ Удалить тему
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="course-form__empty">
              Пока нет тем. Нажмите кнопку выше, чтобы добавить первую тему.
            </p>
          )}
        </div>

        <div className="course-form__actions">
          <button
            type="button"
            className="course-form__cancel-btn"
            onClick={() => navigate("/catalog")}
          >
            Отмена
          </button>
          <button
            type="submit"
            className="course-form__submit-btn"
            disabled={loading}
          >
            {loading ? "Создание..." : "✅ Создать курс"}
          </button>
        </div>
      </form>
    </DashboardLayout>
  );
}
