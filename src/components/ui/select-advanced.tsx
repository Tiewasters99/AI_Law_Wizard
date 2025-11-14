"use client";

import * as React from "react";
import { cn } from "@/lib/frontend/utils";
import { ChevronDown } from "lucide-react";

interface SelectContextType {
  value: string;
  onValueChange: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
}

const SelectContext = React.createContext<SelectContextType | undefined>(undefined);

const useSelect = () => {
  const context = React.useContext(SelectContext);
  if (!context) {
    throw new Error("useSelect must be used within a Select");
  }
  return context;
};

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

const Select = ({ value, onValueChange, children }: SelectProps) => {
  const [open, setOpen] = React.useState(false);

  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative">{children}</div>
    </SelectContext.Provider>
  );
};

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect();

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        onClick={() => setOpen(!open)}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    );
  }
);

SelectTrigger.displayName = "SelectTrigger";

interface SelectValueProps {
  placeholder?: string;
}

const SelectValue = ({ placeholder }: SelectValueProps) => {
  const { value } = useSelect();
  return <span>{value || placeholder}</span>;
};

interface SelectContentProps {
  children: React.ReactNode;
  className?: string;
}

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, ...props }, ref) => {
    const { open, setOpen } = useSelect();

    React.useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        const target = event.target as Element;
        if (!target.closest('[data-select]')) {
          setOpen(false);
        }
      };

      if (open) {
        document.addEventListener("click", handleClickOutside);
        return () => document.removeEventListener("click", handleClickOutside);
      }
    }, [open, setOpen]);

    if (!open) return null;

    return (
      <div
        ref={ref}
        data-select
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover text-popover-foreground p-1 shadow-lg",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SelectContent.displayName = "SelectContent";

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
}

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, value, children, disabled, ...props }, ref) => {
    const { value: selectedValue, onValueChange, setOpen } = useSelect();

    const handleClick = () => {
      if (!disabled) {
        onValueChange(value);
        setOpen(false);
      }
    };

    return (
      <div
        ref={ref}
        className={cn(
          "relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          disabled
            ? "cursor-not-allowed opacity-50 pointer-events-none"
            : "hover:bg-accent focus:bg-accent",
          selectedValue === value && !disabled && "bg-accent",
          className
        )}
        onClick={handleClick}
        {...props}
      >
        {children}
      </div>
    );
  }
);

SelectItem.displayName = "SelectItem";

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
};
