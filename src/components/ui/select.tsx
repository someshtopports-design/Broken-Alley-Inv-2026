"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

// ─── Select ───────────────────────────────────────────────────────────────────
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> { }

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className, children, ...props }, ref) => (
        <select
            ref={ref}
            className={cn(
                "flex h-10 w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm",
                "focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:border-transparent",
                "disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer",
                "appearance-none bg-no-repeat",
                "transition-all",
                className
            )}
            style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2371717a' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundPosition: "right 10px center",
                paddingRight: "2.5rem",
            }}
            {...props}
        >
            {children}
        </select>
    )
);
Select.displayName = "Select";

export { Select };
