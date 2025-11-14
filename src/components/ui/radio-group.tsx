"use client";

import * as React from "react";
import { cn } from "@/lib/frontend/utils";

interface RadioGroupProps {
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children?: React.ReactNode;
}

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
}>({});

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className, value, onValueChange, children, ...props }, ref) => {
    return (
      <RadioGroupContext.Provider value={{ value, onValueChange }}>
        <div
          ref={ref}
          className={cn("grid gap-2", className)}
          role="radiogroup"
          {...props}
        >
          {children}
        </div>
      </RadioGroupContext.Provider>
    );
  }
);
RadioGroup.displayName = "RadioGroup";

interface RadioGroupItemProps {
  value: string;
  id?: string;
  className?: string;
  disabled?: boolean;
}

const RadioGroupItem = React.forwardRef<
  HTMLButtonElement,
  RadioGroupItemProps
>(({ className, value, id, disabled, ...props }, ref) => {
  const context = React.useContext(RadioGroupContext);
  const isChecked = context.value === value;

  const handleClick = () => {
    if (!disabled && context.onValueChange) {
      context.onValueChange(value);
    }
  };

  return (
    <button
      ref={ref}
      type="button"
      role="radio"
      aria-checked={isChecked}
      aria-labelledby={id ? `${id}-label` : undefined}
      data-state={isChecked ? "checked" : "unchecked"}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "relative aspect-square h-4 w-4 rounded-full border-2 text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
        isChecked
          ? "bg-primary border-primary"
          : "bg-background border-input hover:border-primary/70",
        className
      )}
      {...props}
    >
      {isChecked && (
        <span className="absolute inset-0 flex items-center justify-center">
          <span className="h-2 w-2 rounded-full bg-primary-foreground" />
        </span>
      )}
    </button>
  );
});
RadioGroupItem.displayName = "RadioGroupItem";

export { RadioGroup, RadioGroupItem };

