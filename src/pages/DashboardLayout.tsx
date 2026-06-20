import { useEffect } from "react";
import { useNavigate } from "react-router";
import { checkAuth } from "../controllers/chechAuth";
import { useUser } from "../components/context/UserContext";
import { StyledSideBar } from "../components/menu/styledSideBar";
import { StyledHeader } from "../components/header/steledHeader";
import "../App.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      navigate("/auth");
      return;
    }

    if (!user) {
      checkAuth().then((auth) => {
        if (!auth) navigate("/auth");
      });
    }
  }, [user, navigate]);

  return (
    <div className="app-layout">
      <StyledHeader />
      <div className="app-body">
        <StyledSideBar />
        <div className="app-content">
          <div className="content-wrapper">{children}</div>
        </div>
      </div>
    </div>
  );
}
