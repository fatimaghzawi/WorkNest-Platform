import React, { HTMLAttributes } from "react";
import "../../../css/Loader.css";

type SpinnerSize = "sm" | "md" | "lg";

interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  size?: SpinnerSize;
  color?: string;
  className?: string;
}


export function Spinner({
  size = "md",
  color,
  className = "",
  ...rest
}: SpinnerProps) {
  const style = color ? { color } : undefined;

  return (
    <span
      className={`wn-spinner wn-spinner--${size} ${className}`.trim()}
      style={style}
      role="status"
      aria-hidden="true"
      {...rest}
    />
  );
}

interface LoaderProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  label?: React.ReactNode;
  className?: string;
}

export function Loader({
  size = "md",
  label,
  className = "",
  ...rest
}: LoaderProps) {
  return (
    <div className={`wn-loader ${className}`.trim()} {...rest}>
      <Spinner size={size} />
      {label && <span className="wn-loader__label">{label}</span>}
    </div>
  );
}

/**
 * BlockLoader — centers a Loader within its container.
 */
export function BlockLoader({
  size = "lg",
  label = "Loading...",
  className = "",
  ...rest
}: LoaderProps) {
  return (
    <div className={`wn-block-loader ${className}`.trim()} {...rest}>
      <Loader size={size} label={label} />
    </div>
  );
}

interface LoaderOverlayProps
  extends HTMLAttributes<HTMLDivElement> {
  label?: React.ReactNode;
  fullscreen?: boolean;
  className?: string;
}


export function LoaderOverlay({
  label = "Loading...",
  fullscreen = false,
  className = "",
  ...rest
}: LoaderOverlayProps) {
  return (
    <div
      className={[
        "wn-loader-overlay",
        fullscreen ? "wn-loader-overlay--fullscreen" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      <Loader size="lg" label={label} />
    </div>
  );
}

export default Loader;