import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { getUsers } from "../hooks/apis"; // API: barcha userlarni olish uchun

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  classe: any;
  ball: number; // ball
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
        console.log(allStudents)
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

  if (!currentUser) return <div className="text-center text-gray-400 mt-10">Yuklanmoqda...</div>;

  const top10 = students.slice(0, 10);
  const myRank = students.findIndex((s) => s.id === currentUser.id) + 1;

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Profil ma’lumotlari */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#1a1a1a] border border-yellow-400/20 rounded-2xl shadow-[0_0_20px_rgba(212,175,55,0.1)] p-6 text-center mb-10"
      >
        <h1 className="text-2xl font-bold text-yellow-300 mb-2 capitalize">
          {currentUser.first_name} {currentUser.last_name}
        </h1>
        <p className="text-gray-400 text-sm mb-2">
  Sinfi: <span className="text-yellow-300">{currentUser.classe?.name}</span>
</p>

        <p className="text-gray-400 text-sm">
          Umumiy ball:{" "}
          <span className="text-yellow-300 font-semibold">{currentUser.ball}</span>
        </p>
      </motion.div>

      {/* Reyting jadvali */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-[#111] border border-yellow-400/10 rounded-2xl overflow-hidden shadow-[0_0_15px_rgba(212,175,55,0.05)]"
      >
        <div className="bg-gradient-to-r from-yellow-400 to-yellow-300 text-black text-center font-semibold py-3">
          🔥 Top 10 Reyting
        </div>

        <div className="divide-y divide-white/5">
          {top10.map((s, index) => (
            <div
              key={s.id}
              className={`flex justify-between items-center px-5 py-3 ${
                s.id === currentUser.id
                  ? "bg-yellow-400/10 border-l-4 border-yellow-400"
                  : "hover:bg-white/5"
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-yellow-300 font-semibold w-6 text-center">
                  {index + 1}.
                </span>
                <span>{s.first_name}</span>
              </div>
              <span className="text-yellow-300 font-medium">{s.ball}</span>
            </div>
          ))}

          {/* Agar user top10da bo‘lmasa */}
          {myRank > 10 && (
            <>
              <div className="text-center text-gray-500 py-2">...</div>
              <div className="flex justify-between items-center px-5 py-3 bg-yellow-400/10 border-l-4 border-yellow-400">
                <div className="flex items-center gap-3">
                  <span className="text-yellow-300 font-semibold w-6 text-center">
                    {myRank}.
                  </span>
                  <span>{currentUser.first_name}</span>
                </div>
                <span className="text-yellow-300 font-medium">{currentUser.ball}</span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;
