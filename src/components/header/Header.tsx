import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import { StyledProfileIconContainer, StyledProfileOcin, StyledProfileMenu, StyledProfileMenuItem } from "./steledHeader";

type Props = {
  className?: string;
};

export default function Header(props: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Закрытие меню при клике вне компонента
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    // Очищаем токены и данные сессии
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");

    // Закрываем меню
    setIsMenuOpen(false);

    // Перенаправляем на страницу входа
    navigate("/auth");
  };

  return (
    <header className={props.className}>
      <h2 onClick={() => navigate("/")} className="header-title">EDUCATION</h2>
      <div ref={menuRef} style={{ position: "relative" }}>
        <StyledProfileIconContainer onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <StyledProfileOcin />
        </StyledProfileIconContainer>
        {isMenuOpen && (
          <StyledProfileMenu>
            <StyledProfileMenuItem onClick={handleLogout}>
              🚪 Выйти
            </StyledProfileMenuItem>
          </StyledProfileMenu>
        )}
      </div>
    </header>
  );
}
