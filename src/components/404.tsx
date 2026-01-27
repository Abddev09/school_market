import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Home } from "lucide-react";
import HelemtProviders from "./HelmetProvide";

const NotFound = () => {
  const navigate = useNavigate();

  return (
    <HelemtProviders>

    <div className="fixed inset-0 flex items-center justify-center  bg-black/80">
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-10 text-center flex flex-col justify-center items-center text-white w-[90%] max-w-md"
      >
        <h1 className="text-6xl font-bold mb-4 text-yellow-400">404</h1>
        <h2 className="text-2xl font-semibold mb-2">Sahifa topilmadi</h2>
        <p className="text-gray-300 mb-6">
          Siz izlagan sahifa mavjud emas yoki o‘chirib tashlangan.
        </p>

        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 px-6 py-2 rounded-full font-bold bg-yellow-500 hover:bg-yellow-600 transition-all duration-300"
        >
          <Home size={18} />
          Asosiy sahifaga qaytish
        </button>
      </motion.div>
    </div>
    </HelemtProviders>
  );
};

export default NotFound;
