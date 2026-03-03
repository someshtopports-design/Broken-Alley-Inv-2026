"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    LayoutDashboard,
    PackageSearch,
    Users,
    ClipboardList,
    X,
    Menu,
} from "lucide-react";
import React from "react";

const NAV_ITEMS = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/operations", label: "Operations", icon: ClipboardList },
    { href: "/customers", label: "Customers", icon: Users },
];

function NavLink({
    href,
    label,
    icon: Icon,
    active,
    onClick,
}: {
    href: string;
    label: string;
    icon: React.ElementType;
    active: boolean;
    onClick?: () => void;
}) {
    return (
        <Link
            href={href}
            onClick={onClick}
            className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-150",
                active
                    ? "bg-zinc-900 text-white shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
            )}
        >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span>{label}</span>
        </Link>
    );
}

export function Sidebar() {
    const pathname = usePathname();
    const [mobileOpen, setMobileOpen] = React.useState(false);

    return (
        <>
            {/* Mobile top bar */}
            <header className="lg:hidden fixed top-0 left-0 right-0 z-40 flex items-center justify-between h-14 px-4 bg-white border-b border-zinc-200">
                <div className="flex items-center gap-2.5">
                    <PackageSearch className="w-5 h-5 text-zinc-900" />
                    <span className="font-semibold text-sm tracking-tight">
                        BROKEN ALLEY
                    </span>
                </div>
                <button
                    onClick={() => setMobileOpen(!mobileOpen)}
                    className="p-2 rounded-lg hover:bg-zinc-100 transition-colors"
                    aria-label="Toggle menu"
                >
                    {mobileOpen ? (
                        <X className="w-5 h-5 text-zinc-700" />
                    ) : (
                        <Menu className="w-5 h-5 text-zinc-700" />
                    )}
                </button>
            </header>

            {/* Mobile drawer backdrop */}
            {mobileOpen && (
                <div
                    className="lg:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <aside
                className={cn(
                    "lg:hidden fixed top-14 left-0 bottom-0 z-40 w-72 bg-white border-r border-zinc-200 transition-transform duration-300",
                    mobileOpen ? "translate-x-0" : "-translate-x-full"
                )}
            >
                <nav className="p-4 flex flex-col gap-1 mt-4">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.href}
                            {...item}
                            active={pathname === item.href}
                            onClick={() => setMobileOpen(false)}
                        />
                    ))}
                </nav>
            </aside>

            {/* Desktop sidebar */}
            <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-60 bg-white border-r border-zinc-200 z-30">
                {/* Logo */}
                <div className="flex items-center gap-2.5 px-6 h-16 border-b border-zinc-100">
                    <PackageSearch className="w-5 h-5 text-zinc-900" />
                    <span className="font-semibold text-sm tracking-tight">
                        BROKEN ALLEY
                    </span>
                </div>

                <nav className="p-4 flex flex-col gap-1 mt-2 flex-1">
                    {NAV_ITEMS.map((item) => (
                        <NavLink
                            key={item.href}
                            {...item}
                            active={pathname === item.href}
                        />
                    ))}
                </nav>

                <div className="p-4 border-t border-zinc-100">
                    <p className="text-xs text-zinc-400 text-center">
                        Inventory System v1.0
                    </p>
                </div>
            </aside>
        </>
    );
}
