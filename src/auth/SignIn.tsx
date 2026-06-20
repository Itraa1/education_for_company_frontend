import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { publicRequest } from "../controllers/api/axiosInstance";

export default function SignIn() {
  const [isSubmiting, setIsSubmiting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [userInformation, setUserInformation] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {}, [navigate]);

  function changingValueForm(event: React.ChangeEvent<HTMLInputElement>) {
    const name = event.target.name;
    const value = event.target.value;

    setUserInformation((prevState) => ({
      ...prevState,
      [name]: value,
    }));
    setError("");
  }

  function handleFormSubmitSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setIsSubmiting(true);
    setError("");

    if (
      !userInformation.email.trim() ||
      /\s/.test(userInformation.email.trim())
    ) {
      setError("Введите корректный email");
      setIsSubmiting(false);
      return;
    }

    if (!userInformation.password) {
      setError("Введите пароль");
      setIsSubmiting(false);
      return;
    }

    publicRequest
      .post("/api/auth/local", {
        identifier: userInformation.email,
        password: userInformation.password,
      })
      .then((res) => {
        localStorage.setItem("auth_token", res!.data.jwt);
        navigate("/");
      })
      .catch((error) => {
        console.log("Полная ошибка:", error);
        if (error.response?.status === 400) {
          setError("Неверные учетные данные");
        } else {
          setError("Ошибка подключения. Попробуйте позже");
        }
      })
      .finally(() => {
        setIsSubmiting(false);
      });
  }

  return (
    <form className="sign-in-form" onSubmit={handleFormSubmitSignIn}>
      {error && <div className="error-message">⚠️ {error}</div>}

      <div className="form-group">
        <label className="form-label">Email</label>
        <input
          className="auth-element"
          type="email"
          name="email"
          placeholder="example@company.com"
          autoComplete="username"
          value={userInformation.email}
          onChange={changingValueForm}
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
          autoComplete="current-password"
          value={userInformation.password}
          onChange={changingValueForm}
          required
        />
      </div>

      <button
        className="auth-element-submit-button"
        type="submit"
        disabled={isSubmiting}
      >
        {isSubmiting ? "⏳ Вход..." : "Войти"}
      </button>

      <div className="auth-footer">
        Забыли пароль? <a href="#">Восстановить</a>
      </div>
    </form>
  );
}
