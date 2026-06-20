import { useState } from "react";
import SignUP from "./SignUp";
import SignIn from "./SignIn";
import "./Auth.css";

export default function Auth() {
  const [selectedAuth, setSelectedAuth] = useState(true);

  return (
    <div className="auth-container">
      <div className="auth-wrapper">
        <div className="auth-header">
          <div className="auth-logo">📚</div>
          <h1 className="auth-title">Education</h1>
          <p className="auth-subtitle">Обучение для вашей компании</p>
        </div>

        <div className="auth">
          <div className="auth-switch">
            <button
              className={"auth-switch-button " + (selectedAuth ? "active" : "")}
              onClick={() => setSelectedAuth(true)}
            >
              Вход
            </button>
            <button
              className={"auth-switch-button " + (selectedAuth ? "" : "active")}
              onClick={() => setSelectedAuth(false)}
            >
              Регистрация
            </button>
          </div>

          {selectedAuth ? <SignIn /> : <SignUP />}
        </div>
      </div>
    </div>
  );
}
