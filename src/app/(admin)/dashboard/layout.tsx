"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  MessageSquare,
  Star,
  Image as ImageIcon,
  Images,
  Briefcase,
  CalendarDays,
  LogOut,
  Menu,
  X,
  User,
  Globe,
} from "lucide-react";

interface NavLink {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navLinks: NavLink[] = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { name: "Inquiries", href: "/dashboard/inquiries", icon: MessageSquare },
  { name: "Testimonials", href: "/dashboard/testimonials", icon: Star },
  { name: "Portfolio", href: "/dashboard/portfolio", icon: ImageIcon },
  { name: "Services", href: "/dashboard/services", icon: Briefcase },
  { name: "Site Assets", href: "/dashboard/assets", icon: Images },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const handleSignOut = () => {
    signOut({ callbackUrl: "/login" });
  };

  // Find active nav item or default to Overview
  const activeLink = navLinks.find((link) => link.href === pathname) || {
    name: "Dashboard",
    href: "/dashboard",
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white flex font-sans">
      {/* --- MOBILE SIDEBAR OVERLAY --- */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* --- LEFT SIDEBAR (FIXED) --- */}
      <aside
        className={`fixed inset-y-0 left-0 bg-[#111110]/95 backdrop-blur-lg md:bg-[#111110]/85 border-r border-amber-500/5 flex flex-col justify-between z-50 transition-all duration-300 ${
          isOpen ? "translate-x-0 w-[260px]" : "-translate-x-full"
        } md:translate-x-0 md:w-[76px] lg:w-[260px]`}
      >
        <div>
          {/* Logo & Header */}
          <div className="p-6 border-b border-amber-500/5 flex items-center justify-between md:px-3 lg:px-6 md:justify-center lg:justify-between">
            <div className="md:hidden lg:block">
              <h2 className="text-base lg:text-lg font-serif tracking-widest font-semibold text-white whitespace-nowrap">LENS OF SHUBH</h2>
              <span className="text-[9px] lg:text-[10px] font-mono tracking-[0.25em] text-[#C9A84C] uppercase mt-1 block">Admin Panel</span>
            </div>
            {/* Tablet small brand icon */}
            <div className="hidden md:block lg:hidden font-serif text-lg font-bold text-[#C9A84C]">
              LS
            </div>
            {/* Close mobile menu */}
            <button
              onClick={() => setIsOpen(false)}
              className="md:hidden text-gray-400 hover:text-white transition-all cursor-pointer w-11 h-11 flex items-center justify-center rounded-full hover:bg-[#1A1A19]"
              aria-label="Close menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
 
          {/* Navigation Links */}
          <nav className="p-4 md:px-2 lg:p-4 flex flex-col gap-1.5">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsOpen(false)}
                  className={`relative group flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-all duration-200 border-l-2 md:justify-center lg:justify-start ${
                    isActive
                      ? "bg-[#C9A84C]/5 text-[#C9A84C] border-[#C9A84C] font-semibold"
                      : "text-gray-400 border-transparent hover:bg-[#151514] hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="md:hidden lg:block">{link.name}</span>
                  
                  {/* Tablet Floating Tooltip */}
                  <span className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-black border border-amber-500/10 rounded-lg text-[10px] font-mono uppercase tracking-wider text-[#C9A84C] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden md:block lg:hidden shadow-xl">
                    {link.name}
                  </span>
                </Link>
              );
            })}

            {/* Separation gap */}
            <div className="my-1.5 border-t border-amber-500/5 md:hidden lg:block" />

            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="relative group flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-[#C9A84C] border border-[#C9A84C]/10 bg-[#C9A84C]/5 hover:bg-[#C9A84C]/10 hover:text-white transition-all duration-200 md:justify-center lg:justify-start"
            >
              <Globe className="w-4 h-4 shrink-0" />
              <span className="md:hidden lg:block">View Live Site</span>
              
              {/* Tablet Floating Tooltip */}
              <span className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-black border border-amber-500/10 rounded-lg text-[10px] font-mono uppercase tracking-wider text-[#C9A84C] opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden md:block lg:hidden shadow-xl">
                View Live Site
              </span>
            </a>
          </nav>
        </div>

        {/* Sidebar Footer (User profile & Logout) */}
        <div className="p-4 md:px-2 lg:p-4 border-t border-amber-500/5 flex flex-col gap-3">
          {/* User Profile Card */}
          <div className="block md:hidden lg:block px-3 py-2 bg-[#1A1A19]/50 border border-amber-500/5 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] font-bold text-xs shrink-0 select-none">
              S
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-semibold text-white truncate">Shubham Singh</span>
              <span className="text-[9px] font-mono text-gray-500 uppercase tracking-wider mt-0.5">Administrator</span>
            </div>
          </div>

          <button
            onClick={handleSignOut}
            className="w-full relative group flex items-center gap-3 px-4 py-3 rounded-lg text-sm text-gray-400 hover:bg-red-500/5 hover:text-red-400 border-l-2 border-transparent transition-all duration-200 cursor-pointer md:justify-center lg:justify-start"
            suppressHydrationWarning
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span className="md:hidden lg:block">Logout</span>
            
            {/* Tablet Floating Tooltip */}
            <span className="absolute left-full ml-2.5 px-2.5 py-1.5 bg-black border border-amber-500/10 rounded-lg text-[10px] font-mono uppercase tracking-wider text-red-400 opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-50 hidden md:block lg:hidden shadow-xl">
              Logout
            </span>
          </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT CONTAINER --- */}
      <div className="flex-1 md:pl-[76px] lg:pl-[260px] flex flex-col min-h-screen">
        {/* Top Header */}
        <header className="sticky top-0 bg-[#070706]/95 border-b border-amber-500/5 h-16 px-4 md:px-8 flex items-center justify-between z-30 backdrop-blur-md">
          <div className="flex items-center gap-4">
            {/* Hamburger button for mobile */}
            <button
              onClick={() => setIsOpen(true)}
              className="md:hidden text-gray-400 hover:text-white transition-colors cursor-pointer w-11 h-11 flex items-center justify-center"
              aria-label="Open menu"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-baseline gap-1.5">
              <span className="hidden md:inline font-serif tracking-widest text-[#C9A84C] text-xs font-semibold uppercase">LENS OF SHUBH</span>
              <span className="hidden md:inline text-gray-700 text-xs font-mono">/</span>
              <h1 className="text-sm md:text-base font-serif font-medium text-white tracking-wide">
                {activeLink.name}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 text-sm text-gray-400">
              <User className="w-4 h-4 text-[#C9A84C]" />
              <span>Welcome, <strong className="text-white font-medium">Shubham</strong></span>
            </div>

            {/* View Live Site Button */}
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-mono uppercase tracking-wider text-[#C9A84C] hover:text-white border border-[#C9A84C]/30 hover:border-white rounded-lg px-3 py-1.5 transition-all cursor-pointer bg-[#C9A84C]/5 hover:bg-transparent"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">View Site</span>
            </a>

            {/* Full button for larger viewports */}
            <button
              onClick={handleSignOut}
              className="hidden md:block text-xs font-mono uppercase tracking-wider text-gray-400 hover:text-red-400 border border-[#262624] hover:border-red-500/30 rounded-lg px-3 py-1.5 transition-all cursor-pointer"
              suppressHydrationWarning
            >
              Sign Out
            </button>
            {/* Icon only for mobile viewports */}
            <button
              onClick={handleSignOut}
              className="md:hidden p-2 text-gray-400 hover:text-red-400 border border-[#262624] hover:border-red-500/30 rounded-lg transition-all cursor-pointer"
              title="Sign Out"
              suppressHydrationWarning
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8 max-w-6xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
