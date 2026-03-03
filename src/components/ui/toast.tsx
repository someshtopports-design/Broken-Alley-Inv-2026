"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface ToastContextValue {
    toast: (opts: { title: string; description?: string; variant?: "default" | "destructive" }) => void;
}

const ToastContext = React.createContext<ToastContextValue | null>(null);

interface Toast {
    id: string;
    title: string;
    description?: string;
    variant?: "default" | "destructive";
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
    const [toasts, setToasts] = React.useState<Toast[]>([]);

    const toast = React.useCallback(
        (opts: { title: string; description?: string; variant?: "default" | "destructive" }) => {
            const id = Math.random().toString(36).slice(2);
            setToasts((prev) => [...prev, { id, ...opts }]);
            setTimeout(() => {
                setToasts((prev) => prev.filter((t) => t.id !== id));
            }, 4000);
        },
        []
    );

    return (
        <ToastContext.Provider value={{ toast }}>
            {children}
            <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 max-w-[calc(100vw-2rem)]">
                {toasts.map((t) => (
                    <div
                        key={t.id}
                        className={cn(
                            "rounded-xl border px-4 py-3 shadow-lg transition-all animate-in slide-in-from-bottom-2",
                            t.variant === "destructive"
                                ? "bg-red-50 border-red-200 text-red-900"
                                : "bg-zinc-900 border-zinc-700 text-white"
                        )}
                    >
                        <p className="font-semibold text-sm">{t.title}</p>
                        {t.description && (
                            <p className={cn("text-xs mt-0.5", t.variant === "destructive" ? "text-red-700" : "text-zinc-300")}>
                                {t.description}
                            </p>
                        )}
                    </div>
                ))}
            </div>
        </ToastContext.Provider>
    );
}

export function useToast() {
    const ctx = React.useContext(ToastContext);
    if (!ctx) throw new Error("useToast must be used within ToastProvider");
    return ctx;
}
