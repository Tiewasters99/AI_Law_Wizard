"use client";

import * as React from "react";
import { cn } from "@/lib/frontend/utils";

interface CollapsibleProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
  className?: string;
}

interface CollapsibleTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
}

interface CollapsibleContentProps {
  children: React.ReactNode;
  className?: string;
}

const Collapsible = React.forwardRef<HTMLDivElement, CollapsibleProps>(
  ({ open, onOpenChange, children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn(className)} {...props}>
        {React.Children.map(children, child => {
          if (React.isValidElement(child)) {
            return React.cloneElement(child, {
              open,
              onOpenChange,
            } as any);
          }
          return child;
        })}
      </div>
    );
  }
);

Collapsible.displayName = "Collapsible";

const CollapsibleTrigger = React.forwardRef<
  HTMLButtonElement,
  CollapsibleTriggerProps
>(({ asChild, children, className, ...props }, ref) => {
  const { open, onOpenChange, ...rest } = (props as any) || {};

  const handleClick = () => {
    onOpenChange?.(!open);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ...(children.props || {}),
      onClick: handleClick,
      className: cn(className, (children.props as any)?.className),
    } as any);
  }

  return (
    <button
      ref={ref}
      type="button"
      onClick={handleClick}
      className={cn("", className)}
    >
      {children}
    </button>
  );
});

CollapsibleTrigger.displayName = "CollapsibleTrigger";

const CollapsibleContent = React.forwardRef<
  HTMLDivElement,
  CollapsibleContentProps
>(({ children, className, ...props }, ref) => {
  // Extract open from props (passed from Collapsible parent)
  const { open, onOpenChange: _ignored, ...restProps } = (props as any) || {};

  if (!open) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "overflow-hidden transition-all data-[state=open]:animate-in data-[state=closed]:animate-out",
        className
      )}
      {...restProps}
    >
      {children}
    </div>
  );
});

CollapsibleContent.displayName = "CollapsibleContent";

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
