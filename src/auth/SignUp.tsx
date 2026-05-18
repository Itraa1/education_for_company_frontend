import { useState } from "react";
import { useNavigate } from "react-router";
import { publicRequest } from "../controllers/api/axiosInstance";

export default function SignUP() {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmedPassword: "",
  });

  function changingValueForm(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.name;
    const value = event.target.value;

    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setError("");
  }

  function handleFormSubmitRegistr(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmiting(true);
    setError("");

    if (!formData.username.trim()) {
      setError("Введите имя пользователя");
      setIsSubmiting(false);
      return;
    }

    if (!formData.email.trim()) {
      setError("Введите email");
      setIsSubmiting(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Пароль должен быть не менее 6 символов");
      setIsSubmiting(false);
      return;
    }

    if (formData.password !== formData.confirmedPassword) {
      setError("Пароли не совпадают");
      setIsSubmiting(false);
      return;
    }

    publicRequest
      .post("/api/auth/local/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
      .then((res) => {
        localStorage.setItem("auth_token", res!.data.jwt);
        navigate("/");
      })
      .catch((error) => {
        console.log("Полная ошибка:", error);
        if (error.response?.status === 400) {
          setError("Этот email уже зарегистрирован");
        } else {
          setError("Ошибка регистрации. Попробуйте позже");
        }
      })
      .finally(() => {
        setIsSubmiting(false);
      });
  }

  return (
    <form className="sign-up-form" onSubmit={handleFormSubmitRegistr}>
      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="form-group">
        <label className="form-label">Имя пользователя</label>
        <input
          className="auth-element"
          type="text"
          name="username"
          placeholder="ваше_имя"
          onChange={changingValueForm}
          value={formData.username}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          className="auth-element"
          type="email"
          name="email"
          placeholder="example@company.com"
          onChange={changingValueForm}
          value={formData.email}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Пароль</label>
        <input
          className="auth-element"
          name="password"
          type="password"
          placeholder="••••••••"
          onChange={changingValueForm}
          value={formData.password}
          required
        />
      </div>

      <div className="form-group">
        <label className="form-label">Подтвердите пароль</label>
        <input
          className="auth-element"
          name="confirmedPassword"
          type="password"
          placeholder="••••••••"
          onChange={changingValueForm}
          value={formData.confirmedPassword}
          required
        />
      </div>

      <button
        className="auth-element-submit-button"
        type="submit"
        disabled={isSubmiting}
      >
        {isSubmiting ? "⏳ Регистрация..." : "Зарегистрироваться"}
      </button>

      <div className="auth-footer">
        Есть аккаунт? <a href="#" onClick={() => window.location.reload()}>Войти</a>
      </div>
    </form>
  );
}
