import React, {
  useId,
  ReactNode,
  InputHTMLAttributes,
  TextareaHTMLAttributes,
} from "react";
import "../../../css/Input.css";

type InputProps = {
  as?: "input" | "textarea";
  id?: string;
  label?: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  className?: string;
  inputClassName?: string;
} & (
    | InputHTMLAttributes<HTMLInputElement>
    | TextareaHTMLAttributes<HTMLTextAreaElement>
  );

export default function Input({
  as = "input",
  id,
  label,
  required = false,
  error,
  helperText,
  leftIcon,
  rightIcon,
  onRightIconClick,
  className = "",
  inputClassName = "",
  ...rest
}: InputProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const helperId = `${inputId}-helper`;
  const errorId = `${inputId}-error`;



  const controlClasses = [
    "wn-field__control",
    leftIcon ? "wn-field__control--has-left-icon" : "",
    rightIcon ? "wn-field__control--has-right-icon" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const inputClasses = [
    "wn-input",
    as === "textarea" ? "wn-input--textarea" : "",
    inputClassName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={`wn-field ${error ? "wn-field--error" : ""} ${className}`.trim()}
    >
      {label && (
        <label htmlFor={inputId} className="wn-field__label">
          {label}
          {required && <span className="wn-field__required">*</span>}
        </label>
      )}

      <div className={controlClasses}>
        {leftIcon && (
          <span className="wn-field__icon wn-field__icon--left">
            {leftIcon}
          </span>
        )}

        {as === "textarea" ? (
          <textarea
            id={inputId}
            className={inputClasses}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperId}
            aria-required={required}
            {...(rest as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
          />
        ) : (
          <input
            id={inputId}
            className={inputClasses}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperId}
            aria-required={required}
            {...(rest as React.InputHTMLAttributes<HTMLInputElement>)}
          />
        )}

        {rightIcon && (
          <span
            className={`wn-field__icon wn-field__icon--right ${onRightIconClick ? "wn-field__icon--clickable" : ""
              }`.trim()}
            onClick={onRightIconClick}
            role={onRightIconClick ? "button" : undefined}
            tabIndex={onRightIconClick ? 0 : undefined}
          >
            {rightIcon}
          </span>
        )}
      </div>

      {error ? (
        <span
          id={errorId}
          className="wn-field__message wn-field__message--error"
          role="alert"
        >
          {error}
        </span>
      ) : (
        helperText && (
          <span
            id={helperId}
            className="wn-field__message wn-field__message--helper"
          >
            {helperText}
          </span>
        )
      )}
    </div>
  );
}