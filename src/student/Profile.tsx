import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getUsers } from "../hooks/apis";
import { User, Trophy, Award, TrendingUp } from "lucide-react";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  classe: any;
  ball: number;
}

const Profile = () => {
  const [students, setStudents] = useState<Student[]>([]);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getUsers();
        const allStudents: Student[] = res.data.filter((u: any) => u.role === 3);
        const sorted = allStudents.sort((a, b) => b.ball - a.ball);
        setStudents(sorted);

        const id = Number(localStorage.getItem("id"));
        const me = sorted.find((s) => s.id === id);
        if (me) setCurrentUser(me);
      } catch (err) {
        toast.error("Foydalanuvchilarni olishda xatolik");
      }
    };
    fetchData();
  }, []);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-400">
          <div className="w-16 h-16 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  const top10 = students.slice(0, 10);
  const myRank = students.findIndex((s) => s.id === currentUser.id) + 1;

  return (
    <div className="max-w-4xl mx-auto py-6 px-4">
      {/* Custom Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative mb-8 overflow-hidden rounded-3xl bg-gradient-to-br from-yellow-400 via-yellow-300 to-yellow-200 p-[2px] shadow-2xl"
      >
        <div className="relative bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] rounded-3xl p-6 overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(255,204,0,0.1) 35px, rgba(255,204,0,0.1) 70px)`
            }}></div>
          </div>

          {/* Content */}
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-6">
            {/* Left Side - Avatar & Info */}
            <div className="flex items-center gap-4 flex-1">
              {/* Avatar with HUMO logo style */}
              <div className="relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-yellow-400 to-yellow-600 p-[3px] shadow-lg">
                  <div className="w-full h-full rounded-2xl bg-[#1a1a1a] flex items-center justify-center">
                    <User className="text-yellow-400" size={40} />
                  </div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg">
                  <Award size={16} className="text-black" />
                </div>
              </div>

              {/* Name & Info */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-white mb-1">
                  {currentUser.first_name} {currentUser.last_name}
                </h2>
                <p className="text-yellow-400 text-sm font-medium mb-1">
                  {currentUser.classe?.name || "Sinf noma'lum"}
                </p>
                <p className="text-gray-400 text-xs italic">
                  "255-maktab" hududida amal qiladi
                </p>
              </div>
            </div>

            {/* Right Side - Balance & HUMO Logo */}
            <div className="flex items-center gap-4 md:border-l border-yellow-400/20 md:pl-6">
              {/* Balance */}
              <div className="text-right">
                <p className="text-gray-400 text-xs uppercase tracking-wider mb-1">
                  Ball
                </p>
                <p className="text-3xl font-bold text-yellow-400">
                  {currentUser.ball.toLocaleString()}
                </p>
              </div>

              {/* HUMO Logo Style */}
              <div className="relative">
                <svg width="60" height="60" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Outer Circle */}
                  <circle cx="30" cy="30" r="28" stroke="url(#gradient)" strokeWidth="2" />
                  
                  {/* HUMO Text */}
                  <text 
                    x="30" 
                    y="25" 
                    textAnchor="middle" 
                    fill="#FCD34D" 
                    fontSize="12" 
                    fontWeight="bold"
                    fontFamily="Arial, sans-serif"
                  >
                    255
                  </text>
                  
                  {/* MARKET Text */}
                  <text 
                    x="30" 
                    y="38" 
                    textAnchor="middle" 
                    fill="#FCD34D" 
                    fontSize="8" 
                    fontFamily="Arial, sans-serif"
                  >
                    MARKET
                  </text>
                  
                  {/* Gradient Definition */}
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#FCD34D" />
                      <stop offset="100%" stopColor="#F59E0B" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Card Number Style Bottom */}
          <div className="relative z-10 mt-4 pt-4 border-t border-yellow-400/10 flex justify-between items-center text-xs text-gray-500">
            <span className="font-mono tracking-wider">
              ID: {currentUser.id.toString().padStart(8, '0')}
            </span>
            <span className="flex items-center gap-1">
              <TrendingUp size={14} />
              Reyting: #{myRank}
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#1a1a1a] border border-yellow-400/20 rounded-2xl p-4 text-center"
        >
          <Trophy className="mx-auto mb-2 text-yellow-400" size={28} />
          <p className="text-gray-400 text-sm mb-1">Reyting</p>
          <p className="text-2xl font-bold text-yellow-400">#{myRank}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-[#1a1a1a] border border-yellow-400/20 rounded-2xl p-4 text-center"
        >
          <Award className="mx-auto mb-2 text-yellow-400" size={28} />
          <p className="text-gray-400 text-sm mb-1">Ballarim</p>
          <p className="text-2xl font-bold text-yellow-400">{currentUser.ball}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-[#1a1a1a] border border-yellow-400/20 rounded-2xl p-4 text-center"
        >
          <User className="mx-auto mb-2 text-yellow-400" size={28} />
          <p className="text-gray-400 text-sm mb-1">Sinf</p>
          <p className="text-2xl font-bold text-yellow-400">
            {currentUser.classe?.name || "?"}
          </p>
        </motion.div>
      </div>

      {/* Reyting jadvali */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="bg-[#111] border border-yellow-400/10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.05)]"
      >
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-black text-center font-semibold py-4 px-6">
          <div className="flex items-center justify-center gap-2">
            <Trophy size={20} />
            <span className="text-lg">Top 10 Reyting</span>
          </div>
        </div>

        <div className="divide-y divide-white/5">
          {top10.map((s, index) => (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className={`flex justify-between items-center px-6 py-4 transition-all ${
                s.id === currentUser.id
                  ? "bg-yellow-400/10 border-l-4 border-yellow-400"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-4">
                <span
                  className={`font-bold w-8 h-8 flex items-center justify-center rounded-lg ${
                    index === 0
                      ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
                      : index === 1
                      ? "bg-gradient-to-br from-gray-300 to-gray-400 text-black"
                      : index === 2
                      ? "bg-gradient-to-br from-orange-400 to-orange-600 text-black"
                      : "bg-gray-700 text-gray-300"
                  }`}
                >
                  {index + 1}
                </span>
                <div>
                  <p className="font-medium text-white">{s.first_name} {s.last_name}</p>
                  <p className="text-xs text-gray-400">{s.classe?.name || "Sinf yo'q"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-yellow-400 font-bold text-lg">{s.ball}</p>
                <p className="text-xs text-gray-500">ball</p>
              </div>
            </motion.div>
          ))}

          {/* Agar user top10da bo'lmasa */}
          {myRank > 10 && (
            <>
              <div className="text-center text-gray-500 py-3 text-sm">
                • • •
              </div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex justify-between items-center px-6 py-4 bg-yellow-400/10 border-l-4 border-yellow-400"
              >
                <div className="flex items-center gap-4">
                  <span className="font-bold w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 text-gray-300">
                    {myRank}
                  </span>
                  <div>
                    <p className="font-medium text-white">
                      {currentUser.first_name} {currentUser.last_name}
                    </p>
                    <p className="text-xs text-gray-400">{currentUser.classe?.name || "Sinf yo'q"}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-yellow-400 font-bold text-lg">{currentUser.ball}</p>
                  <p className="text-xs text-gray-500">ball</p>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;