import React, { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/navbar";
import { FaBars, FaTimes } from "react-icons/fa";
import LogoutModal from "../components/LogoutModal";

const DashboardLayout: React.FC = () => {
  const location = useLocation();
  const isHome = location.pathname === "/login" || location.pathname === "/";

  const [sidebarOpen, setSidebarOpen] = useState(false);
  if(isHome){
    return <>
    <main className={`flex-1 overflow-y-hidden ${location.pathname === "/login" || location.pathname === "/" ? "" : "p-6"} `}>
            <Outlet />
          </main>
    </>;
  }
  else{

    return (
      <div className="min-h-screen flex bg-gradient-to-b from-[black]/70 to-[#090909] text-gray-100">
        {/* Mobile top bar when sidebar hidden */}
        <div className="fixed top-4 left-4 z-50 md:hidden">
          <button
            onClick={() => setSidebarOpen((s) => !s)}
            aria-label="Toggle menu"
            className="p-3 rounded-lg bg-white/5 backdrop-blur-sm border border-white/5 hover:bg-white/10 transition"
          >
            {sidebarOpen ? <FaTimes className="text-yellow-400" /> : <FaBars className="text-yellow-400" />}
          </button>
        </div>
  
        {/* Sidebar: hide on home/login; responsive */}
        {!isHome && (
          <>
            {/* overlay for mobile */}
            <div
              className={`fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300 ${
                sidebarOpen ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
              onClick={() => setSidebarOpen(false)}
            />
  
           
              <div className="h-full sticky top-0 left-0">
                <Navbar onNavigate={() => setSidebarOpen(false)} />
              </div>
          </>
        )}
  
        {/* Main content area */}
        <div className={`flex flex-col flex-1 transition-all duration-300 ${!isHome ? "" : ""}`}>
          
        <LogoutModal/>
          <main className={`flex-1 overflow-y-hidden ${location.pathname === "/login" || location.pathname === "/" ? "" : "p-6"} `}>
            <Outlet />
          </main>
        </div>
      </div>
    );
  }
};

export default DashboardLayout;
