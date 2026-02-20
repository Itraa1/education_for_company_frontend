import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function SignUP() {
  const [isSubmiting, setIsSubmiting] = useState(false);
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
  }

  function handleFormSubmit(event: React.SubmitEvent) {
    event.preventDefault();
    setIsSubmiting(true);
    if (formData.password !== formData.confirmedPassword) {
      alert("Пароли не совпадают");
      setIsSubmiting(false);
      return;
    }

    axiosInstance
      .post("/api/auth/local/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
      })
      .catch((error) => {
        console.log("Полная ошибка:", error);
        console.log("Ответ сервера:", error.response);
        console.log("Данные ошибки:", error.response?.data);
        console.log("Статус:", error.response?.status);
        console.log("Заголовки:", error.response?.headers);
      })
      .then((res) => console.log(res));

    setIsSubmiting(false);
  }

  return (
    <>
      <form className="sign-up-form" onSubmit={handleFormSubmit}>
        <div>
          <label className="auth-element">Имя пользователя:</label>
          <input
            className="auth-element"
            type="text"
            name="username"
            onChange={changingValueForm}
            value={formData.username}
            required
          ></input>
        </div>

        <div>
          <label className="auth-element">Email:</label>
          <input
            className="auth-element"
            type="email"
            name="email"
            onChange={changingValueForm}
            value={formData.email}
            required
          ></input>
        </div>

        <div>
          <label className="auth-element">Пароль:</label>
          <input
            className="auth-element"
            name="password"
            type="password"
            onChange={changingValueForm}
            value={formData.password}
            required
          ></input>
        </div>

        <div>
          <label className="auth-element">Подтвердите пароль:</label>
          <input
            className="auth-element"
            name="confirmedPassword"
            type="password"
            onChange={changingValueForm}
            value={formData.confirmedPassword}
            required
          ></input>
        </div>

        <input
          type="submit"
          value={isSubmiting ? "Регистрация..." : "Регистрация"}
          disabled={isSubmiting}
        />
      </form>
    </>
  );
}
