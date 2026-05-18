import { useNavigate, useLocation } from "react-router";
import { StyledSideButton } from "./styledSideBar";

type Props = {
  className?: string;
};

type MenuItemType = "catalog" | "active" | "completed" | "create";

export default function SideBar(props: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems: Array<{
    id: MenuItemType;
    name: string;
    icon: string;
    path: string;
  }> = [
    { id: "catalog", name: "Каталог курсов", icon: "📚", path: "/catalog" },
    { id: "active", name: "Активные курсы", icon: "📖", path: "/active" },
    { id: "completed", name: "Завершенные курсы", icon: "✅", path: "/completed" },
    { id: "create", name: "Создать курс", icon: "➕", path: "/create" },
  ];

  const getActiveMenu = (): MenuItemType => {
    const pathMap: Record<string, MenuItemType> = {
      "/catalog": "catalog",
      "/active": "active",
      "/completed": "completed",
      "/create": "create",
    };
    return pathMap[location.pathname] || "catalog";
  };

  return (
    <div className={props.className}>
      {menuItems.map((item) => (
        <StyledSideButton
          key={item.id}
          buttonName={item.name}
          icon={item.icon}
          active={getActiveMenu() === item.id}
          onClick={() => navigate(item.path)}
        />
      ))}
    </div>
  );
}
