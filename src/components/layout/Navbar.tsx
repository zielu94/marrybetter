"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "./Logo";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-surface-1/80 backdrop-blur-xl border-b border-border sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Logo */}
          <Link href="/" className="flex-shrink-0">
            <Logo size="md" />
          </Link>

          {/* Center: Nav links */}
          <div className="hidden md:flex items-center gap-8">
            <Link
              href="#funktionen"
              className="text-[13px] font-medium text-text-muted hover:text-text transition-colors"
            >
              Funktionen
            </Link>
            <Link
              href="/pricing"
              className="text-[13px] font-medium text-text-muted hover:text-text transition-colors"
            >
              Preise
            </Link>
            <Link
              href="#bewertungen"
              className="text-[13px] font-medium text-text-muted hover:text-text transition-colors"
            >
              Bewertungen
            </Link>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-[13px] font-medium text-text-muted hover:text-text transition-colors"
            >
              Anmelden
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center px-4 py-2 rounded-full bg-text text-surface-1 text-[13px] font-medium hover:opacity-90 transition-colors"
            >
              Kostenlos starten
            </Link>
          </div>

          {/* Mobile hamburger */}
          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center justify-center p-1.5 rounded-lg text-text-faint hover:text-text-muted hover:bg-black/5 transition-colors"
            >
              <span className="sr-only">Menu</span>
              {!mobileMenuOpen ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <div className="px-4 pt-3 pb-3 space-y-1">
            <Link href="#funktionen" className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              Funktionen
            </Link>
            <Link href="/pricing" className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              Preise
            </Link>
            <Link href="#bewertungen" className="block px-3 py-2 rounded-lg text-sm text-text-muted hover:text-text hover:bg-surface-2 transition-colors">
              Bewertungen
            </Link>
          </div>
          <div className="px-4 pb-4 pt-2 border-t border-border space-y-2">
            <Link href="/login" className="block px-3 py-2 text-sm text-text-muted hover:text-text transition-colors">
              Anmelden
            </Link>
            <Link
              href="/register"
              className="block text-center px-4 py-2.5 rounded-full bg-text text-surface-1 text-sm font-medium hover:opacity-90 transition-colors"
            >
              Kostenlos starten
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
