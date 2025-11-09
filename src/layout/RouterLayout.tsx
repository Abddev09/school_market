// ========== DASHBOARD LAYOUT.TSX ==========
import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import { FaBars, FaTimes } from "react-icons/fa";
import LogoutModal from "../components/LogoutModal";

interface DashboardLayoutProps {
  isPublic?: boolean;          // login, home va 404 sahifa uchun
  children?: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ isPublic,children }) => {
  const location = useLocation();
  const isHome = location.pathname === "/login" || location.pathname === "/";

  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (isHome || isPublic) {
    return <main className="flex-1 overflow-y-hidden">{children ?? <Outlet />}</main>;
  }

  return (
    <div className="min-h-screen flex bg-linear-to-b from-[black]/70 to-[#090909] text-gray-100">
      {/* Mobile Menu Button */}
      {/* Mobile Menu Button */}
{!isHome && (
  <div className="fixed bg-linear-to-b from-[black]/50 to-[#090909] py-1 px-5 backdrop-blur-2xl top-0 left-0 z-50 md:hidden w-full flex justify-between items-center">
    <div className="px-6 max-md:px-4 py-6 max-md:py-4 border-b border-white/5">
      <div className="flex items-center gap-3 max-md:gap-2">
        <img
          src="/logo.png"
          alt="logo"
          className="h-12 max-md:h-10 rounded-full drop-shadow-[0_0_12px_rgba(212,175,55,0.5)]"
        />
        <div>
          <h1 className="text-xl max-md:text-lg font-bold tracking-wide text-white">
            255-Maktab
          </h1>
          <p className="text-xs max-md:text-[10px] text-gray-400">School Market</p>
        </div>
      </div>
    </div>
    <button
      onClick={() => setSidebarOpen((s) => !s)}
      aria-label="Toggle menu"
      className="p-3 max-md:p-2.5 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition"
    >
      {sidebarOpen ? (
        <FaTimes className="text-yellow-400 text-xl max-md:text-lg" />
      ) : (
        <FaBars className="text-yellow-400 text-xl max-md:text-lg" />
      )}
    </button>
  </div>
)}

      {/* Sidebar */}
      {!isHome && (
        <>
          {/* Mobile Overlay */}
          <div
            className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
              sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
            }`}
            onClick={() => setSidebarOpen(false)}
          />

          {/* Sidebar Container */}
          <aside
            className={`fixed md:sticky top-0 left-0 h-screen z-50 w-64 max-md:w-[260px] transition-transform duration-300 md:translate-x-0 ${
              sidebarOpen ? "translate-x-0" : "-translate-x-full"
            }`}
          >
            <Navbar onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </>
      )}

      {/* Main Content */}
      <div className="flex flex-col flex-1 transition-all duration-300 ">
        <LogoutModal />
        <main
          className={`flex-1 overflow-y-auto ${
            location.pathname === "/login" || location.pathname === "/"
              ? ""
              : "p-6 max-md:p-4 max-md:pt-22"
          }`}
        >
         {children ?? <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;