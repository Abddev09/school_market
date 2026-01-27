import { useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaShoppingBag,
  FaHeart,
  FaShoppingCart,
  FaClipboardList,
  FaUser,
  FaBars,
  FaTimes,
} from "react-icons/fa";

interface Props {
  pageTitle: string;
}

const StudentNavbar: React.FC<Props> = ({ pageTitle }) => {
  const [menuOpen, setMenuOpen] = useState(false);
const navigate = useNavigate();
  const { pathname } = useLocation();

  // 🔒 Login yoki Home sahifasi bo‘lsa navbarni umuman ko‘rsatmaymiz
  if (pathname === "/login" || pathname === "/") {
    return <></>; // yoki `null` — ikkalasi ham to‘g‘ri
  }
  const navItems = [
    { path: "/market", label: "Bozor", icon: <FaShoppingBag /> },
    { path: "/my-favourite", label: "Sevimlilar", icon: <FaHeart /> },
    { path: "/my-cart", label: "Savatcha", icon: <FaShoppingCart /> },
    { path: "/my-orders", label: "Buyurtmalar", icon: <FaClipboardList /> },
    { path: "/my-profile", label: "Profil", icon: <FaUser /> },
  ];

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {/* 🟡 Top Navbar */}
      <div className="fixed top-0 left-0 w-full h-16 bg-[#111]/90 backdrop-blur-md flex items-center justify-between px-5 sm:px-10 border-b border-yellow-400/20 z-40 shadow-[0_4px_15px_rgba(212,175,55,0.1)]">
        <div className="flex items-center gap-3">
          <img
            src="/logo.png"
            alt="logo"
            className="h-10 w-10 rounded-full border border-yellow-400/30 shadow-[0_0_10px_rgba(212,175,55,0.5)]"
          />
          <h1 className="text-lg sm:text-xl font-bold text-yellow-300">{pageTitle}</h1>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setMenuOpen(true)}
          className="md:hidden text-yellow-300 hover:text-yellow-400 transition-all"
        >
          <FaBars size={22} />
        </button>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-yellow-400 to-yellow-300 text-black shadow-md"
                    : "text-gray-300 hover:text-yellow-300 hover:bg-white/5"
                }`
              }
            >
              {item.icon}
              {item.label}
            </NavLink>
          ))}

          <button
            onClick={handleLogout}
            className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-semibold px-4 py-2 rounded-lg hover:scale-[1.03] transition-transform"
          >
            Chiqish
          </button>
        </div>
      </div>

      {/* 📱 Mobile Slide Menu */}
      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
            />
            <motion.div
              className="fixed top-0 right-0 h-full w-64 bg-[#1b1b1b] border-l border-yellow-400/20 shadow-[0_0_20px_rgba(212,175,55,0.2)] z-50 flex flex-col"
              initial={{ x: 300 }}
              animate={{ x: 0 }}
              exit={{ x: 300 }}
              transition={{ type: "spring", stiffness: 120 }}
            >
              <div className="flex items-center justify-between px-4 py-4 border-b border-yellow-400/10">
                <h2 className="text-yellow-300 font-semibold text-lg">Menyu</h2>
                <button
                  onClick={() => setMenuOpen(false)}
                  className="text-yellow-400 hover:text-yellow-300"
                >
                  <FaTimes size={20} />
                </button>
              </div>

              <nav className="flex-1 flex flex-col gap-2 p-4">
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition-all border ${
                        isActive
                          ? "bg-gradient-to-r from-yellow-400 to-yellow-300 text-black border-yellow-400"
                          : "border-white/10 text-gray-300 hover:border-yellow-400/40 hover:bg-white/5 hover:text-yellow-300"
                      }`
                    }
                  >
                    <span className="text-yellow-300">{item.icon}</span>
                    {item.label}
                  </NavLink>
                ))}
              </nav>

              <div className="p-4 border-t border-yellow-400/10">
                <button
                  onClick={handleLogout}
                  className="w-full py-2 rounded-lg font-semibold bg-gradient-to-r from-yellow-400 to-yellow-300 text-black hover:scale-[1.03] transition-transform"
                >
                  Chiqish
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default StudentNavbar;
