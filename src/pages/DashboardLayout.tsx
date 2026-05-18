import { useEffect } from "react";
import { useNavigate } from "react-router";
import { checkAuth } from "../controllers/chechAuth";
import { StyledSideBar } from "../components/menu/styledSideBar";
import { StyledHeader } from "../components/header/steledHeader";
import "../App.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();

  useEffect(() => {
    const checkAndNavigate = async () => {
      const auth = await checkAuth();
      if (!auth) {
        navigate("/auth");
      }
    };
    checkAndNavigate();
  }, [navigate]);

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
