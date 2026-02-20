import { useState } from "react";
import axiosInstance from "../api/axiosInstance";

export default function SignIn() {
  const [userInformation, setUserInformation] = useState({
    email: "",
    password: "",
  });

  function changingValueForm(event:React.ChangeEvent){
    
  }
  return (
    <>
      <form
        className="sign-in-form"
        onSubmit={(event) => {
          event.preventDefault();
        }}
      >
        <div>
          <label className="auth-element">Email:</label>
          <input className="auth-element" type="text" name="email"></input>
        </div>

        <div>
          <label className="auth-element">Пароль:</label>
          <input className="auth-element" name="password" type="password"></input>
        </div>

        <input type="submit" value="Вход" />
      </form>
    </>
  );
}
