import { useState } from "react";
import "./Auth.css";

export default function Auth() {
  const [selectedAuth, setSelectedAuth] = useState(true);

  const signIn = (
    <form className="sign-in-form">
      <div>
        <label className="auth-element">Email:</label>
        <input className="auth-element" type="text" name="name"></input>
      </div>

      <div>
        <label className="auth-element">Пароль:</label>
        <input className="auth-element" type="password"></input>
      </div>

      <input type="submit" value="Вход" />
    </form>
  );

  const signUp = (
    <form
      className="sign-up-form"
      onSubmit={(event) => {
        event.preventDefault();
      }}
    >
      <div>
        <label className="auth-element">Имя пользователя:</label>
        <input className="auth-element" type="text" name="name"></input>
      </div>

      <div>
        <label className="auth-element">Email:</label>
        <input className="auth-element" type="email" name="email"></input>
      </div>

      <div>
        <label className="auth-element">Пароль:</label>
        <input className="auth-element" type="password"></input>
      </div>

      <div>
        <label className="auth-element">Подтвердите пароль:</label>
        <input className="auth-element" type="password"></input>
      </div>

      <input type="submit" value="Регистрация" />
    </form>
  );

  return (
    <>
      <div className="auth">
        <div className="auth-switch">
          <label
            className={"auth-switch-button " + (selectedAuth ? "active" : "")}
            onClick={() => setSelectedAuth(true)}
          >
            Вход
          </label>
          <label
            className={"auth-switch-button " + (selectedAuth ? "" : "active")}
            onClick={() => setSelectedAuth(false)}
          >
            Регистрация
          </label>
        </div>
      </div>

      {selectedAuth ? signIn : signUp}
    </>
  );
}
