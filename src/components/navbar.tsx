// ========== NAVBAR.TSX ==========
import React, { useState, useMemo } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  FaUserGraduate,
  FaUsers,
  FaChalkboardTeacher,
  FaShoppingBag,
  FaBookOpen,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  onNavigate?: () => void;
};

const Navbar: React.FC<Props> = ({ onNavigate }) => {
  const [showLogout, setShowLogout] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const isHome = location.pathname === "/login" || location.pathname === "/";
  
  const storedRole = localStorage.getItem("role");
  let role: string | null = null;

  try {
    if (storedRole) role = atob(storedRole);
  } catch (e) {
    console.error("Role decode xatolik:", e);
  }

  const navItems = useMemo(() => {
    const base = [
      { path: "/classes", label: "Sinflar", icon: <FaUserGraduate size={18} /> },
      { path: "/students", label: "O'quvchilar", icon: <FaUsers size={18} /> },
      { path: "/teachers", label: "Ustozlar", icon: <FaChalkboardTeacher size={18} /> },
      { path: "/shop", label: "Shop-255", icon: <FaShoppingBag size={18} /> },
      { path: "/orders", label: "Buyurtmalar", icon: <FaBookOpen size={18} /> },
    ];

    if (role === "2") {
      return [
        { path: "/dashboard/teacher", label: "Baholash", icon: <FaUserGraduate size={18} /> },
        { path: "/my-students", label: "Mening o'quvchilarim", icon: <FaUsers size={18} /> },
      ];
    }

    return [...base];
  }, [role]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    navigate("/login");
  };

  // Global modal trigger
  React.useEffect(() => {
    (window as any).showLogout = () => setShowLogout(true);
  }, []);

  if (isHome) {
    return <></>;
  }

  return (
    <div className="sticky top-0 left-0 h-full">
      <div className="h-screen z-30 w-full">
        <div className="flex flex-col h-full text-gray-200 bg-[#111]/90 backdrop-blur-sm border-r border-white/10">
          {/* Brand */}
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

          {/* Links */}
          <nav className="flex-1 overflow-auto px-3 max-md:px-2 py-6 max-md:py-4 space-y-2 max-md:space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end
                onClick={() => onNavigate?.()}
                className={({ isActive }) =>
                  `group flex items-center gap-3 max-md:gap-2 w-full px-4 max-md:px-3 py-3 max-md:py-2.5 rounded-lg transition-colors duration-200 ${
                    isActive
                      ? "bg-gradient-to-r from-yellow-400 to-yellow-300 text-black shadow-[0_6px_20px_rgba(212,175,55,0.16)] font-semibold"
                      : "text-gray-300 hover:bg-white/5 hover:text-yellow-300"
                  }`
                }
              >
                <span className="p-2 max-md:p-1.5 rounded-md flex items-center justify-center group-hover:bg-white/5">
                  {item.icon}
                </span>
                <span className="flex-1 text-sm max-md:text-xs">{item.label}</span>
              </NavLink>
            ))}
          </nav>

          {/* Footer */}
          <div className="px-4 max-md:px-3 py-4 max-md:py-3 border-t border-white/5">
            <button
              onClick={() => (window as any).showLogout()}
              className="w-full flex items-center justify-center gap-2 py-2 max-md:py-1.5 rounded-md bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-semibold text-sm max-md:text-xs shadow hover:scale-[1.02] transition-transform"
            >
              Chiqish
            </button>

            <div className="text-xs max-md:text-[10px] text-gray-500 text-center mt-3 max-md:mt-2">
              © 2025 255-Maktab
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showLogout && (
          <motion.div
            key="logout-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] px-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="bg-[#1e1e1e] border border-gray-700 rounded-2xl max-md:rounded-xl p-6 max-md:p-5 w-[90%] max-w-sm text-center shadow-2xl"
            >
              <h2 className="text-lg max-md:text-base font-semibold text-yellow-300 mb-3 max-md:mb-2">
                Chiqishni tasdiqlaysizmi?
              </h2>
              <p className="text-gray-400 mb-6 max-md:mb-4 text-sm max-md:text-xs">
                Agar "Ha" ni bossangiz, tizimdan chiqasiz va sessiya tugaydi.
              </p>

              <div className="flex justify-center gap-4 max-md:gap-3">
                <button
                  onClick={handleLogout}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-semibold py-2 max-md:py-1.5 px-6 max-md:px-5 text-sm max-md:text-xs rounded-lg hover:scale-[1.03] transition-transform"
                >
                  Ha
                </button>
                <button
                  onClick={() => setShowLogout(false)}
                  className="bg-gray-700 text-gray-200 font-medium py-2 max-md:py-1.5 px-6 max-md:px-5 text-sm max-md:text-xs rounded-lg hover:bg-gray-600"
                >
                  Yo'q
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Navbar;