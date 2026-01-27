import { motion, AnimatePresence } from "framer-motion";
import ReactDOM from "react-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LogoutModal = () => {
  const [visible, setVisible] = useState(false);
  const navigate = useNavigate();

  // 🔄 Boshqa komponentlardan signal olish uchun
  useEffect(() => {
    // Har joydan `window.showLogout()` chaqirsa bo‘ladi
    window.showLogout = () => setVisible(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("id");
    setVisible(false);
    navigate("/login");
  };

  // Agar ko‘rsatilmayotgan bo‘lsa, hech narsa render qilmaymiz
  if (!visible) return null;

  // 🔥 Portal orqali body ichiga joylaymiz
  return ReactDOM.createPortal(
    <AnimatePresence>
      {visible && (
        <motion.div
          key="logout-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-999"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-[#1e1e1e] border border-gray-700 rounded-2xl p-6 w-[90%] max-w-sm text-center shadow-2xl"
          >
            <h2 className="text-lg font-semibold text-yellow-300 mb-3">
              Chiqishni tasdiqlaysizmi?
            </h2>
            <p className="text-gray-400 mb-6 text-sm">
              Agar “Ha” ni bossangiz, tizimdan chiqasiz va sessiya tugaydi.
            </p>

            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-linear-to-r from-yellow-400 to-yellow-300 text-black font-semibold py-2 px-6 rounded-lg hover:scale-[1.03] transition-transform"
              >
                Ha
              </button>
              <button
                onClick={() => setVisible(false)}
                className="bg-gray-700 text-gray-200 font-medium py-2 px-6 rounded-lg hover:bg-gray-600"
              >
                Yo‘q
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default LogoutModal;
