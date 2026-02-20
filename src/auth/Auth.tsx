import { useState } from "react";
import SignUP from "./SignUp";
import SignIn from "./SignIn";
import "./Auth.css";

export default function Auth() {
  const [selectedAuth, setSelectedAuth] = useState(true);


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

      {selectedAuth ? <SignIn/> : <SignUP/>}
    </>
  );
}
