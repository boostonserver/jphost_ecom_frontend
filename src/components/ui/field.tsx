import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface FieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  /**
   * Guidance shown UNDER the control; hidden once an error replaces it.
   *
   * Below rather than between the label and the input, and the reason is
   * layout rather than taste: a hint above the control pushes that control
   * down, so two fields side by side in a grid stop lining up the moment only
   * one of them has guidance. Below, every label and every input sits on the
   * same line whatever the hints say.
   */
  hint?: string;
  icon?: React.ReactNode;
  /**
   * Classes for the field's WRAPPER, not its input.
   *
   * `className` goes to the <input>, which is right for sizing a control and
   * wrong for laying one out: a grid modifier like `sm:col-span-2` applied to
   * the input does nothing, because the grid item is this wrapper. Two props
   * because the two are genuinely different targets.
   */
  wrapperClassName?: string;
}

export function Field({
  label,
  error,
  hint,
  icon,
  id,
  className,
  wrapperClassName,
  ...props
}: FieldProps) {
  const inputId = id ?? props.name ?? label.toLowerCase().replace(/\s+/g, "-");
  const errorId = `${inputId}-error`;
  const hintId = `${inputId}-hint`;

  return (
    <div className={cn("space-y-1.5", wrapperClassName)}>
      <label
        htmlFor={inputId}
        className="flex items-center gap-1 text-sm font-medium"
      >
        {label}
        {props.required && (
          <span className="text-destructive" aria-hidden>
            *
          </span>
        )}
      </label>

      <Input
        id={inputId}
        icon={icon}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : hint ? hintId : undefined}
        className={className}
        {...props}
      />

      {/* An error replaces the hint rather than joining it: two lines of
          small text under one control is noise, and the error is the one
          that needs reading. */}
      {error ? (
        <p id={errorId} className="text-destructive text-sm">
          {error}
        </p>
      ) : hint ? (
        <p id={hintId} className="text-muted-foreground text-xs">
          {hint}
        </p>
      ) : null}
    </div>
  );
}

// Re-exported so the auth and account screens keep their existing import.
export { FormAlert } from "@/components/ui/alert";
