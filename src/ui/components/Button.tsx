import Link from "next/link";
import styles from "./Button.module.scss";

type ButtonProps = {
  label: string;
  href?: string;
  variant?: "primary" | "ghost";
  onClick?: () => void;
};

export function Button({
  label,
  href,
  variant = "primary",
  onClick,
}: ButtonProps) {
  const className =
    variant === "primary" ? styles.primaryButton : styles.ghostButton;

  if (href) {
    return (
      <Link className={className} href={href}>
        {label}
      </Link>
    );
  }

  return (
    <button className={className} type="button" onClick={onClick}>
      {label}
    </button>
  );
}
