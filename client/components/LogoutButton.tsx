"use client";

import { LogOut } from "lucide-react";

export default function LogoutButton() {
    const handleLogout = async () => {
        try {
            const response = await fetch("/api/auth/logout", {
                method: "POST",
            });

            if (!response.ok) {
                throw new Error("Logout failed");
            }

            window.location.href = "/dashboard/citizen";
        } catch (error) {
            console.error("Logout error:", error);
        }
    };

    return (
        <button
            type="button"
            onClick={handleLogout}
            className="flex items-center space-x-1.5 bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 text-red-300 px-3.5 py-2 rounded-xl text-xs font-medium transition shadow-sm"
        >
            <LogOut className="w-3.5 h-3.5" />

            <span className="hidden md:inline">
                Logout
            </span>
        </button>
    );
}