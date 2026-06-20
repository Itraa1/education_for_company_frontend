type Props = {
  buttonName: string;
  icon?: string;
  className?: string;
  active?: boolean;
  onClick?: () => void;
};

export default function SideButton(props: Props) {
  return (
    <div 
      className={props.className + (props.active ? " active" : "")}
      onClick={props.onClick}
    >
      {props.icon && <span className="icon">{props.icon}</span>}
      <span>{props.buttonName}</span>
    </div>
  );
}
