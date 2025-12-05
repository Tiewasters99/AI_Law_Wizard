"use client";

import * as React from "react";
import { cn } from "@/lib/frontend/utils";

interface DropdownMenuProps {
  children: React.ReactNode;
}

interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuLabelProps extends React.HTMLAttributes<HTMLDivElement> {}

interface DropdownMenuSeparatorProps
  extends React.HTMLAttributes<HTMLDivElement> {}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false);

  const handleClickOutside = React.useCallback((event: MouseEvent) => {
    const target = event.target as Element;
    if (!target.closest("[data-dropdown-menu]")) {
      setIsOpen(false);
    }
  }, []);

  React.useEffect(() => {
    if (isOpen) {
      document.addEventListener("click", handleClickOutside);
      return () => document.removeEventListener("click", handleClickOutside);
    }
  }, [isOpen, handleClickOutside]);

  return (
    <div className="relative inline-block" data-dropdown-menu>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
          } as any);
        }
        return child;
      })}
    </div>
  );
};

const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ className, children, asChild, onClick, ...props }, ref) => {
  const { isOpen, setIsOpen, ...restProps } = (props as any) || {};

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    setIsOpen?.(!isOpen);
    onClick?.(e);
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
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50",
        className
      )}
      onClick={handleClick}
      {...restProps}
    >
      {children}
    </button>
  );
});

DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ className, children, align = "end", ...props }, ref) => {
  const { isOpen, ...restProps } = (props as any) || {};

  if (!isOpen) return null;

  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 min-w-[8rem] rounded-md border bg-popover text-popover-foreground p-1 shadow-lg",
        align === "end" ? "right-0" : "left-0",
        "top-full mt-1",
        className
      )}
      onClick={e => e.stopPropagation()}
      {...restProps}
    >
      {children}
    </div>
  );
});

DropdownMenuContent.displayName = "DropdownMenuContent";

const DropdownMenuItem = React.forwardRef<
  HTMLDivElement,
  DropdownMenuItemProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex cursor-pointer items-center rounded-sm px-2 py-1.5 text-sm hover:bg-accent focus:bg-accent",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

DropdownMenuItem.displayName = "DropdownMenuItem";

const DropdownMenuLabel = React.forwardRef<
  HTMLDivElement,
  DropdownMenuLabelProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

DropdownMenuLabel.displayName = "DropdownMenuLabel";

const DropdownMenuSeparator = React.forwardRef<
  HTMLDivElement,
  DropdownMenuSeparatorProps
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
});

DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};
