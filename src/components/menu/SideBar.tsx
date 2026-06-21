import { useNavigate, useLocation } from "react-router";
import { StyledSideButton } from "./styledSideBar";
import { useUser } from "../context/UserContext";
import { useMobileMenu } from "./MobileMenuContext";

type Props = {
  className?: string;
};

type MenuItemType = "catalog" | "active" | "completed" | "my-courses" | "create";

export default function SideBar(props: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useUser();
  const { isOpen, close } = useMobileMenu();

  const handleNavigate = (path: string) => {
    navigate(path);
    close();
  };



  const menuItems: Array<{
    id: MenuItemType;
    name: string;
    icon: string;
    path: string;
  }> = [
      { id: "catalog", name: "Каталог курсов", icon: "", path: "/catalog" },
      { id: "active", name: "Активные курсы", icon: "", path: "/active" },
      { id: "completed", name: "Завершенные курсы", icon: "", path: "/completed" },
      { id: "my-courses", name: "Мои курсы", icon: "", path: "/my-courses" },
      { id: "create", name: "Создать курс", icon: "", path: "/create" },
    ];

  const getActiveMenu = (): MenuItemType | null => {
    const pathMap: Record<string, MenuItemType> = {
      "/catalog": "catalog",
      "/active": "active",
      "/completed": "completed",
      "/my-courses": "my-courses",
      "/create": "create",
    };
    return pathMap[location.pathname] ?? null;
  };

  return (
    <>
      {isOpen && (
        <div
          className="sidebar-backdrop"
          onClick={close}
          aria-hidden="true"
        />
      )}
      <nav className={props.className + (isOpen ? " sidebar--open" : "")}>
        {menuItems.map((item) => {
          if (
            (item.id === "create" || item.id === "my-courses") &&
            user?.role.name !== "Admin" &&
            user?.role.name !== "Author"
          ) {
            return null;
          }
          return (
            <StyledSideButton
              key={item.id}
              buttonName={item.name}
              icon={item.icon}
              active={getActiveMenu() === item.id}
              onClick={() => handleNavigate(item.path)}
            />
          );
        })}
      </nav>
    </>
  );
}
