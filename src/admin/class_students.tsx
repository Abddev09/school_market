import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { 
  createUser, 
  createGrade, 
  getMyStudents, 
} from "../hooks/apis";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  gender: boolean;
  username: string;
  classe_id: number;
}

interface Class {
  id: number;
  name: string;
  teacher: number;
  teacher_detail?: any;
}

const ClassStudents = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const classId = Number(id);

  const [currentClass, setCurrentClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [gradeInputs, setGradeInputs] = useState<{ [key: number]: string }>({});
  const [garde , setGrade] = useState(0)
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    password: "",
    gender: true,
  });

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  const fetchClassAndStudents = async () => {
    try {
      const classesRes = await getMyStudents();
      const foundClass = classesRes.data.find((cls: Class) => cls.id === classId);
      
      if (!foundClass) {
        toast.error("Sinf topilmadi!");
        navigate("/dashboard/teacher");
        return;
      }
      
      setCurrentClass(foundClass);

      const studentsRes = await getMyStudents();
      const classStudents = studentsRes.data.filter(
        (student: Student) => student.classe_id === classId
      );
      setStudents(classStudents);
    } catch (err) {
      toast.error("Ma'lumotlarni yuklashda xatolik!");
      console.error(err);
    }
  };

  const handleCreateStudent = async () => {
    if (!newStudent.first_name || !newStudent.last_name || !newStudent.password) {
      return toast.error("Barcha maydonlarni to'ldiring!");
    }

    try {
      const res = await createUser({
        ...newStudent,
        classe_id: classId,
        role: 3,
      });
      
      setStudents([...students, res.data]);
      toast.success("Yangi o'quvchi qo'shildi!");
      setShowStudentModal(false);
      setNewStudent({ first_name: "", last_name: "", password: "", gender: true });
    } catch (err) {
      toast.error("O'quvchini yaratishda xatolik!");
      console.error(err);
    }
  };

  const handleGradeInputChange = (studentId: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setGradeInputs(prev => {
      const updated = { ...prev };
      if (numericValue === "") {
        delete updated[studentId];
      } else {
        updated[studentId] = numericValue;
      }
      return updated;
    });
  };

  const handleGiveGrade = async (studentId: number) => {
    const gradeValue = gradeInputs[studentId];
    
    if (!gradeValue || gradeValue.trim() === "") {
      toast.error("Avval baho kiriting!");
      return;
    }

    const grade = parseInt(gradeValue);
    
    if (isNaN(grade) || grade < 1 || grade > 10) {
      toast.error("Bahoni 1 dan 10 gacha kiriting!");
      return;
    }

    setLoading(prev => ({ ...prev, [studentId]: true }));

    try {
      await createGrade({
        student: studentId,
        ball: grade,
      });
      
      toast.success(`${grade} ball baho qo'yildi!`);
      
      // Input ni tozalash
      setGradeInputs(prev => {
        const updated = { ...prev };
        delete updated[studentId];
        return updated;
      });
    } catch (error) {
      console.error("Baho qo'yishda xatolik:", error);
      toast.error("Baho qo'yishda xatolik!");
    } finally {
      setLoading(prev => ({ ...prev, [studentId]: false }));
    }
  };

  useEffect(() => {
    fetchClassAndStudents();
  }, [classId]);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.username.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  const totalPages = Math.ceil(filteredStudents.length / perPage);
  const paginated = filteredStudents.slice((currentPage - 1) * perPage, currentPage * perPage);

  if (!currentClass) {
    return (
      <div className="p-6 bg-gradient-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/teacher")}
            className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition flex items-center gap-2"
          >
            ← Orqaga
          </button>
          <div>
            <h1 className="text-3xl font-bold text-yellow-400">{currentClass.name} sinfi</h1>
            <p className="text-gray-400 mt-1">Jami: {students.length} ta o'quvchi</p>
          </div>
        </div>
        <button
          onClick={() => setShowStudentModal(true)}
          className="px-5 py-3 bg-yellow-600 hover:bg-yellow-500 text-white rounded-lg font-medium transition shadow-lg"
        >
          + O'quvchi qo'shish
        </button>
      </div>

      {/* Qidiruv */}
      <div className="mb-6 flex gap-4 items-center bg-[#212121]/90 p-4 rounded-xl border border-gray-700">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Ism, familiya yoki login bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-600 bg-[#2a2a2a] p-3 rounded-lg focus:outline-none focus:border-yellow-400 text-gray-100 placeholder-gray-500"
          />
        </div>

        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition border border-red-500/30 whitespace-nowrap"
          >
            Tozalash
          </button>
        )}
      </div>

      {/* Jadval */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-[#212121]/90 backdrop-blur-md border border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#2a2a2a] text-yellow-400 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3">T/r</th>
              <th className="p-3">Ism</th>
              <th className="p-3">Familiya</th>
              <th className="p-3">Login</th>
              <th className="p-3">Baho (1-10)</th>
              <th className="p-3 text-center">Amal</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-gray-400">
                  {searchTerm ? "Qidiruv bo'yicha natija topilmadi" : "Bu sinfda hali o'quvchi yo'q"}
                </td>
              </tr>
            ) : (
              paginated.map((student, i) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-700 hover:bg-yellow-400/10 transition"
                >
                  <td className="p-3 text-gray-300">{(currentPage - 1) * perPage + i + 1}</td>
                  <td className="p-3 text-gray-100 font-medium">{student.first_name}</td>
                  <td className="p-3 text-gray-100 font-medium">{student.last_name}</td>
                  <td className="p-3 text-gray-400">{student.username}</td>
                  <td className="p-3">
                    <input
                      key={`grade-${student.id}`}
                      type="text"
                      inputMode="numeric"
                      placeholder="1-10"
                      value={gradeInputs[student.id] || ""}
                      onChange={(e) => handleGradeInputChange(student.id, e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleGiveGrade(student.id);
                        }
                      }}
                      disabled={loading[student.id]}
                      className="w-20 bg-[#2a2a2a] border border-gray-600 rounded-lg p-2 text-center focus:outline-none focus:border-yellow-400 text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                      maxLength={2}
                    />
                  </td>
                  <td className="p-3 text-center">
                    <button
                      onClick={() => handleGiveGrade(student.id)}
                      disabled={loading[student.id] || !gradeInputs[student.id]}
                      className="px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 mx-auto"
                    >
                      {loading[student.id] ? (
                        <>
                          <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                          Yuklanmoqda...
                        </>
                      ) : (
                        "Baholash"
                      )}
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition ${
                currentPage === i + 1
                  ? "bg-yellow-500 text-black"
                  : "bg-[#2a2a2a] text-gray-300 hover:bg-yellow-400/20"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* O'quvchi qo'shish modali */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-700 w-[90%] max-w-lg">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Yangi o'quvchi qo'shish</h3>

            <div className="grid grid-cols-2 gap-4">
              <input
                placeholder="Ism"
                value={newStudent.first_name}
                onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                className="bg-[#2a2a2a] border border-gray-600 rounded-lg p-3 text-gray-100 focus:outline-none focus:border-yellow-400"
              />
              <input
                placeholder="Familiya"
                value={newStudent.last_name}
                onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                className="bg-[#2a2a2a] border border-gray-600 rounded-lg p-3 text-gray-100 focus:outline-none focus:border-yellow-400"
              />
              <input
                placeholder="Parol"
                type="password"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                className="bg-[#2a2a2a] col-span-2 border border-gray-600 rounded-lg p-3 text-gray-100 focus:outline-none focus:border-yellow-400"
              />
              <select
                value={newStudent.gender ? "1" : "0"}
                onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value === "1" })}
                className="col-span-2 bg-[#2a2a2a] border border-gray-600 rounded-lg p-3 text-gray-100 focus:outline-none focus:border-yellow-400"
              >
                <option value="1">Erkak</option>
                <option value="0">Ayol</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => {
                  setShowStudentModal(false);
                  setNewStudent({ first_name: "", last_name: "", password: "", gender: true });
                }}
                className="px-4 py-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCreateStudent}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 transition"
              >
                Qo'shish
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClassStudents;