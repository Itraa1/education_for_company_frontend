import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { publicRequest } from "../controllers/api/axiosInstance";
import { checkAuth } from "../controllers/chechAuth";

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
      .then(async (res) => {
        localStorage.setItem("auth_token", res!.data.jwt);
        const ok = await checkAuth(true);
        if (ok) {
          navigate("/");
        } else {
          setError("Не удалось загрузить профиль. Попробуйте ещё раз.");
        }
      })
      .catch((error) => {
        console.log("Полная ошибка:", error);
        console.log("Ответ сервера:", error.response?.data);

        const serverMessage: string | undefined =
          error.response?.data?.error?.message;

        if (error.response?.status === 400) {
          const messageMap: Record<string, string> = {
            "Invalid identifier or password": "Неверный email или пароль",
            "Your account email is not confirmed":
              "Email не подтверждён. Проверьте почту.",
            "Your account has been blocked by an administrator":
              "Аккаунт заблокирован администратором",
          };
          setError(
            (serverMessage && messageMap[serverMessage]) ||
              serverMessage ||
              "Неверные учетные данные"
          );
        } else if (!error.response) {
          setError("Нет связи с сервером. Проверьте, запущен ли бэкенд.");
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

      
    </form>
  );
}
