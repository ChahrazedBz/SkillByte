"use client";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useState } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const dashboardLink = user?.role === "instructor"
    ? "/dashboard/instructor"
    : "/dashboard";

  const profileLink = user?.role === "instructor"
    ? "/dashboard/instructor/profile"
    : "/dashboard/profile";

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="font-black text-2xl text-slate-900">
          Skill<span className="text-cyan-500">Byte</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/" className="hover:text-cyan-600 transition-colors">Home</Link>
          <Link href="/courses" className="hover:text-cyan-600 transition-colors">Courses</Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              {/* Avatar button */}
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 border border-slate-200 px-3 py-2 rounded-xl hover:bg-slate-50 transition-all"
              >
                <div className="w-7 h-7 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center text-white font-bold text-xs">
                  {user.first_name?.[0]?.toUpperCase() || "U"}
                </div>
                <span className="text-sm font-medium text-slate-700 hidden md:block">
                  {user.first_name || "Account"}
                </span>
                <span className="text-slate-400 text-xs">▾</span>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <>
                  {/* Click outside to close */}
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)}></div>

                  <div className="absolute right-0 top-12 w-56 bg-white rounded-2xl border border-slate-100 shadow-lg z-20 overflow-hidden">

                    {/* User info */}
                    <div className="px-4 py-3 border-b border-slate-100">
                      <p className="font-semibold text-slate-800 text-sm">
                        {user.first_name} {user.last_name}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">{user.email}</p>
                      <span className={`inline-block mt-1.5 text-xs px-2 py-0.5 rounded-full font-medium ${
                        user.role === "instructor"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-cyan-100 text-cyan-700"
                      }`}>
                        {user.role === "instructor" ? "👨‍🏫 Instructor" : "🎓 Student"}
                      </span>
                    </div>

                    {/* Links */}
                    <div className="py-1">
                      <Link href={dashboardLink}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-all">
                        📋 Dashboard
                      </Link>
                      <Link href={profileLink}
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-all">
                        👤 My Profile
                      </Link>
                      {user.role === "student" && (
                        <Link href="/dashboard"
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-600 hover:bg-slate-50 transition-all">
                          📚 My Courses
                        </Link>
                      )}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 py-1">
                      <button onClick={() => { logout(); setDropdownOpen(false); }}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-all">
                        🚪 Sign Out
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              <Link href="/login" className="text-sm text-slate-600 font-medium hover:text-cyan-600">
                Login
              </Link>
              <Link href="/register"
                className="bg-cyan-500 text-white text-sm font-semibold px-5 py-2 rounded-xl hover:bg-cyan-400 transition-all">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}