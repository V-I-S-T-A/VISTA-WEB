import { Image as ImageIcon } from "lucide-react";

/** Shared compact blue action; destructive and secondary variants stay explicit. */
export default function ActionButton({
  onClick,
  label = "VIEW",
  icon,
  variant = "primary",
  className = "",
  style = {},
  ...rest
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ui={variant}
      className={`vista-action-button ${className}`}
      style={style}
      {...rest}
    >
      {icon !== undefined ? (
        icon
      ) : (
        <ImageIcon
          style={{ width: "13px", height: "13px" }}
          aria-hidden="true"
        />
      )}
      {label}
    </button>
  );
}
