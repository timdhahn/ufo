import Link from "next/link";
import styles from "./Button.module.scss";

type ButtonProps = {
  label: string;
  href?: string;
  variant?: "primary" | "ghost";
};

export function Button({ label, href, variant = "primary" }: ButtonProps) {
  const className =
    variant === "primary" ? styles.primaryButton : styles.ghostButton;

  if (href) {
    return (
      <Link className={className} href={href}>
        {label}
      </Link>
    );
  }

  return <button className={className}>{label}</button>;
}
