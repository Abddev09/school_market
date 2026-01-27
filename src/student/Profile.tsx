import { useEffect, useRef, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { toast } from "sonner";
import { getStudentUsers } from "../hooks/apis";
import { User, Trophy, Award } from "lucide-react";
import humofront from "../assets/humocard.jpg"
import humobehind from "../assets/behindhumo.jpg"
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
  const [isFlipped, setIsFlipped] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const autoRotateY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 150 };
  const springRotateX = useSpring(rotateX, springConfig);
  const springRotateY = useSpring(rotateY, springConfig);
  const springAutoRotateY = useSpring(autoRotateY, springConfig);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getStudentUsers();
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

  useEffect(() => {
    const interval = setInterval(() => {
      autoRotateY.set(autoRotateY.get() + 360);
    }, 20000);
    return () => clearInterval(interval);
  }, []);


  // Mouse harakati
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    rotateY.set((x - 0.5) * 30);
    rotateX.set((0.5 - y) * 30);
  };

  const handleMouseLeave = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const handleClick = () => {
    setIsFlipped(!isFlipped);
  };

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
    <div className="max-w-3xl mx-auto py-6 px-4">
      <div 
        ref={containerRef}
        className="relative w-full h-[230px] sm:h-[350px] md:h-[350px] lg:h-[410px] mb-8"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        style={{ perspective: '2000px' }}
      >
       

        {/* 3D Karta */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          className="w-full h-full relative cursor-pointer"
          style={{
            transformStyle: 'preserve-3d',
          }}
          animate={{
             opacity: 1, y: 0,
            rotateY: (isFlipped ? 180 : 0) + springRotateY.get() + springAutoRotateY.get(),
            rotateX: springRotateX.get()
          }}
          transition={{ duration: 0.6 }}
        >
          {/* OLD TOMONI - humocard.jpg */}
          <div 
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(0deg) translateZ(20px)'
            }}
          >
            <div className="relative w-full h-full">
              {/* Background Image */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${humofront})`,
                  backgroundSize: "contain",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />

              {/* Content */}
              <div className="relative z-10 h-full flex items-end p-6 sm:p-8 md:px-22 max-md:pl-10">
                <div className="capitalize">
                  <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-extrabold text-amber-400">
                    {currentUser.ball || 0}{" "}
                    <span className="lowercase text-xl sm:text-2xl md:text-3xl">ball</span>
                  </h1>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-5 italic">
                    {currentUser.first_name} {currentUser.last_name}
                  </h2>
                 
                </div>
              </div>
            </div>
          </div>

          {/* ORQA TOMONI - behindcard.jpg */}
          <div 
            className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl"
            style={{ 
              backfaceVisibility: 'hidden',
              transform: 'rotateY(180deg) translateZ(20px)'
            }}
          >
            <div className="relative w-full h-full">
              {/* Background Image */}
              <div
                className="absolute inset-0"
                style={{
                  backgroundImage: `url(${humobehind})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
              />
            </div>
          </div>
        </motion.div>

      
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 md:grid-cols-3 gap-4 mb-8">
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
        <div className="bg-linear-to-r from-yellow-400 to-yellow-300 text-black text-center font-semibold py-4 px-6">
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
                      ? "bg-linear-to-br from-yellow-400 to-yellow-600 text-black"
                      : index === 1
                      ? "bg-linear-to-br from-gray-300 to-gray-400 text-black"
                      : index === 2
                      ? "bg-linear-to-br from-orange-400 to-orange-600 text-black"
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