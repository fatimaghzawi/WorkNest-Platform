import React, { ElementType, ReactNode } from "react";
import { Link } from "react-router-dom";
import { Spinner } from "../Loader/index";
import "../../../css/Button.css";

const isInternalLink = (href: string) => href.startsWith("/") && !href.startsWith("//");

interface ButtonProps {
  as?: ElementType;
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  loading?: boolean;
  loadingText?: string;
  disabled?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  className?: string;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  [key: string]: any;
}

export default function Button({
  as,
  variant = "primary",
  size = "md",
  fullWidth = false,
  loading = false,
  loadingText,
  disabled = false,
  leftIcon,
  rightIcon,
  className = "",
  children,
  type = "button",
  href,
  to,
  ...rest
}: ButtonProps) {
  const linkTarget = href || to;
  const isAnchor = Boolean(href && !to);
  let Component: ElementType = as ?? (to ? Link : isAnchor ? "a" : "button");

  const isDisabled = disabled || loading;
  const linkProps =
    Component === Link
      ? { to: linkTarget }
      : Component === "a"
        ? { href: linkTarget }
        : {};

  const classes = [
    "wn-btn",
    `wn-btn--${variant}`,
    `wn-btn--${size}`,
    fullWidth ? "wn-btn--full-width" : "",
    loading ? "wn-btn--loading" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Component
      className={classes}
      disabled={Component === "button" ? isDisabled : undefined}
      aria-disabled={isDisabled}
      aria-busy={loading}
      type={Component === "button" ? type : undefined}
      {...linkProps}
      {...rest}
    >
      {loading ? (
        <>
          <Spinner />
          {loadingText || children}
        </>
      ) : (
        <>
          {leftIcon}
          {children}
          {rightIcon}
        </>
      )}
    </Component>
  );
}