"use client";

import { useState } from "react";
import { useSidebar } from "./Sidebar";
import { logout } from "@/actions/auth.actions";

interface TopbarProps {
  userName?: string | null;
  partnerName?: string | null;
  weddingDate?: Date | null;
  userImage?: string | null;
}

export default function Topbar({
  userName,
  partnerName,
  weddingDate,
  userImage,
}: TopbarProps) {
  const { setMobileOpen } = useSidebar();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  const weddingName =
    userName && partnerName
      ? `${userName.split(" ")[0]} & ${partnerName.split(" ")[0]}`
      : "Deine Hochzeit";

  const handleLogout = async () => {
    await logout();
  };

  return (
    <div className="h-14 bg-surface-1/80 backdrop-blur-xl border-b border-border flex items-center justify-between px-4 sm:px-6">
      <div className="flex items-center gap-3">
        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(true)}
          className="lg:hidden p-1.5 rounded-lg hover:bg-surface-2 text-text-faint hover:text-text-muted transition-colors"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        <div>
          <h1 className="text-[15px] font-semibold text-text tracking-tight">{weddingName}</h1>
          {weddingDate && (
            <p className="text-xs text-text-faint">
              {new Date(weddingDate).toLocaleDateString("de-DE", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
        </div>
      </div>

      <div className="relative">
        <button
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors overflow-hidden"
        >
          {userImage ? (
            <img src={userImage} alt="Profil" className="w-full h-full object-cover" />
          ) : (
            initials
          )}
        </button>

        {dropdownOpen && (
          <>
            <div
              className="fixed inset-0 z-10"
              onClick={() => setDropdownOpen(false)}
            ></div>
            <div className="absolute right-0 mt-2 w-48 bg-surface-1/95 backdrop-blur-xl rounded-xl shadow-lg border border-border py-1 z-20">
              <div className="px-4 py-2.5 border-b border-border">
                <p className="text-[13px] font-medium text-text">{userName}</p>
              </div>
              <form action={handleLogout}>
                <button
                  type="submit"
                  className="w-full text-left px-4 py-2 text-[13px] text-text-muted hover:bg-surface-2 hover:text-text flex items-center gap-2 transition-colors"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Abmelden
                </button>
              </form>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
