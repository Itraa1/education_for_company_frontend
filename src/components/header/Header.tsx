import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router";
import {
  StyledProfileIconContainer,
  StyledProfileOcin,
  StyledProfileMenu,
  StyledProfileMenuInfo,
  StyledProfileMenuAvatar,
  StyledProfileMenuName,
  StyledProfileMenuRow,
  StyledProfileMenuLabel,
  StyledProfileMenuValue,
  StyledProfileMenuItem,
} from "./steledHeader";
import { useUser } from "../context/UserContext";
import { useMobileMenu } from "../menu/MobileMenuContext";
import { resetAuthCache } from "../../controllers/chechAuth";

type Props = {
  className?: string;
};

const ROLE_LABELS: Record<string, string> = {
  Admin: "Администратор",
  Author: "Автор",
  Authenticated: "Студент",
};

function getRoleLabel(roleName?: string) {
  if (!roleName) return "—";
  return ROLE_LABELS[roleName] ?? roleName;
}

function getInitials(username?: string) {
  if (!username) return "?";
  return username.charAt(0).toUpperCase();
}

export default function Header(props: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { user, logout } = useUser();
  const { toggle: toggleMobileMenu } = useMobileMenu();

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
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("auth_token");
    resetAuthCache();
    logout();
    setIsMenuOpen(false);
    navigate("/auth");
  };

  return (
    <header className={props.className}>
      <button
        type="button"
        className="burger"
        onClick={toggleMobileMenu}
        aria-label="Открыть меню"
      >
        <span className="burger__line" />
        <span className="burger__line" />
        <span className="burger__line" />
      </button>
      <h2 onClick={() => navigate("/")} className="header-title">
        EDUCATION
      </h2>
      <div ref={menuRef} className="profile-menu">
        <StyledProfileIconContainer onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <StyledProfileOcin />
        </StyledProfileIconContainer>
        {isMenuOpen && (
          <StyledProfileMenu>
            {user ? (
              <StyledProfileMenuInfo>
                <StyledProfileMenuAvatar>
                  {getInitials(user.username)}
                </StyledProfileMenuAvatar>
                <StyledProfileMenuName>{user.username}</StyledProfileMenuName>
                <StyledProfileMenuRow>
                  <StyledProfileMenuLabel>Email</StyledProfileMenuLabel>
                  <StyledProfileMenuValue>{user.email}</StyledProfileMenuValue>
                </StyledProfileMenuRow>
                <StyledProfileMenuRow>
                  <StyledProfileMenuLabel>Роль</StyledProfileMenuLabel>
                  <StyledProfileMenuValue>
                    {getRoleLabel(user.role?.name)}
                  </StyledProfileMenuValue>
                </StyledProfileMenuRow>
              </StyledProfileMenuInfo>
            ) : (
              <StyledProfileMenuInfo>
                <StyledProfileMenuName>Загрузка...</StyledProfileMenuName>
              </StyledProfileMenuInfo>
            )}
            <StyledProfileMenuItem onClick={handleLogout}>
              🚪 Выйти
            </StyledProfileMenuItem>
          </StyledProfileMenu>
        )}
      </div>
    </header>
  );
}
