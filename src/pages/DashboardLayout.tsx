import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useUser } from "../components/context/UserContext";
import { StyledSideBar } from "../components/menu/styledSideBar";
import { StyledHeader } from "../components/header/steledHeader";
import "../App.css";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const navigate = useNavigate();
  const { user, isInitializing } = useUser();

  useEffect(() => {
    if (isInitializing) return;
    if (!user) {
      navigate("/auth");
    }
  }, [user, isInitializing, navigate]);

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
