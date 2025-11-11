import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { FaPlus, FaEllipsisV, FaTimes } from "react-icons/fa";
import { createClass, createGrade, createUser, getMyStudents, getOneUsers } from "../hooks/apis";
import ImportButton from "../components/Import";
import { Check } from "lucide-react";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
  gender: boolean;
  username: string;
  classe: Class;
  student_id: number;
  classe_name: string;
}

interface Class {
  id: number;
  name: string;
  teacher: number;
}

const Teacher = () => {
  const [myClass, setMyClass] = useState<Class | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [gradeInputs, setGradeInputs] = useState<{ [key: number]: string }>({});
  const [showClassModal, setShowClassModal] = useState(false);
  const [showStudentModal, setShowStudentModal] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [teacherDetail, setTeacher] = useState<Student | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null);
  const [newStudent, setNewStudent] = useState({
    first_name: "",
    last_name: "",
    password: "",
    gender: true,
  });

  const currentTeacherId = Number(localStorage.getItem("id"));

  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 40;

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return toast.error("Sinf nomini kiriting!");

    try {
      const res = await createClass({ name: newClassName, teacher: currentTeacherId });
      setMyClass(res.data);
      toast.success("Sinf yaratildi!");
      setShowClassModal(false);
    } catch (err) {
      toast.error("Sinf yaratishda xatolik!");
    }
  };

  const fetchTeacherDetails = async () => {
    try {
      const res = await getOneUsers(currentTeacherId);
      setTeacher(res.data);
    } catch (err) {
      toast.error("Teacherni olishda xatolik yuz berdi!!!");
    }
  };

  const handleCreateStudent = async () => {
    if (!myClass) return toast.error("Avval sinf yarating!");
    if (!newStudent.first_name || !newStudent.last_name)
      return toast.error("Barcha maydonlarni to'ldiring!");

    try {
      const res = await createUser({
        ...newStudent,
        classe_id: myClass.id,
        role: 3,
      });
      setStudents([...students, res.data]);
      toast.success("Yangi o'quvchi qo'shildi!");
      setShowStudentModal(false);
      setNewStudent({ first_name: "", last_name: "", password: "", gender: true });
    } catch (err) {
      toast.error("O'quvchini yaratishda xatolik!");
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await getMyStudents();
      const students = res.data;
      setMyClass(res.data);
      setStudents(students);
      console.log(res);
    } catch (err) {
      toast.error("O'quvchilarni yuklashda xatolik!");
    }
  };

  useEffect(() => {
    fetchTeacherDetails();
    fetchStudents();
  }, []);

  const handleGradeInputChange = (studentId: number, value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setGradeInputs((prev) => ({ ...prev, [studentId]: numericValue }));
  };

  const handleGiveGrade = async (studentId: number) => {
    const grade = parseInt(gradeInputs[studentId] || "0");

    if (!grade || grade < 1 || grade > 10) {
      toast.error("Bahoni 1 dan 10 gacha kiriting!");
      return;
    }

    setLoading((prev) => ({ ...prev, [studentId]: true }));

    try {
      const data = {
        student: studentId,
        ball: grade,
      };
      await createGrade(data);

      toast.success(`${grade} ball baho qo'yildi!`);
      setGradeInputs((prev) => ({ ...prev, [studentId]: "" }));
    } catch (error) {
      console.error("Baho qo'yishda xatolik:", error);
      toast.error("Baho qo'yishda xatolik!");
    } finally {
      setLoading((prev) => ({ ...prev, [studentId]: false }));
    }
  };

  const uniqueClasses = Array.from(new Set(students.map((s) => s.classe_name))).filter(Boolean);

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = selectedClassName ? student.classe_name === selectedClassName : true;

    return matchesSearch && matchesClass;
  });

  const totalPages = Math.ceil(filteredStudents.length / perPage);
  const paginated = filteredStudents.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-6 max-md:p-4 max-md:w-[92vw] bg-linear-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl max-md:rounded-xl">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 max-md:mb-4 gap-4">
        <div className="flex-1">
          <h1 className="text-3xl max-md:text-xl font-bold text-yellow-400 tracking-wide mb-2 max-md:mb-1">
            {teacherDetail ? (
              <p className="text-lg max-md:text-base text-gray-300">
                Sinf rahbari: {teacherDetail.first_name} {teacherDetail.last_name}
              </p>
            ) : (
              <p className="max-md:text-base">Yuklanmoqda...</p>
            )}
          </h1>
          <p className="text-gray-400 max-md:text-sm">Jami: {students.length} ta o'quvchi</p>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden max-md:hidden relative">
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="p-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition"
          >
            {showMobileMenu ? <FaTimes size={20} /> : <FaEllipsisV size={20} />}
          </button>

          {/* Mobile Dropdown Menu */}
          <AnimatePresence>
            {showMobileMenu && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute right-0 top-14 bg-[#1e1e1e] border border-gray-700 rounded-xl shadow-2xl z-50 min-w-[200px] overflow-hidden"
              >
                <button
                  onClick={() => {
                    setShowStudentModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-500/10 text-left text-sm transition border-b border-gray-700"
                >
                  <FaPlus className="text-yellow-400" />
                  <span>O'quvchi qo'shish</span>
                </button>
                <button
                  onClick={() => {
                    setShowClassModal(true);
                    setShowMobileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow-500/10 text-left text-sm transition border-b border-gray-700"
                >
                  <FaPlus className="text-yellow-400" />
                  <span>Sinf qo'shish</span>
                </button>
                <div className="px-4 py-3 hover:bg-yellow-500/10">
                  <ImportButton onImported={(data) => console.log("Import:", data)} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Class Filter Cards */}
      <div className="mb-6 max-md:mb-4 flex gap-3 max-md:gap-2 flex-wrap">
        {uniqueClasses.map((className) => {
          const count = students.filter((s) => s.classe_name === className).length;
          return (
            <motion.button
              key={className}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedClassName(className);
                setCurrentPage(1);
              }}
              className={`px-6 max-md:px-4 py-3 max-md:py-2 rounded-xl max-md:rounded-lg font-semibold max-md:text-sm transition-all ${
                selectedClassName === className
                  ? "bg-yellow-500 text-black shadow-lg"
                  : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] border border-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{className}</span>
                <span className="ml-1 text-sm max-md:text-xs opacity-80">({count})</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="mb-6 max-md:mb-4 flex max-md:flex-col gap-4 max-md:gap-3 items-center bg-[#212121]/90 p-4 max-md:p-3 rounded-xl max-md:rounded-lg border border-gray-700">
        <div className="flex-1 max-md:w-full">
          <input
            type="text"
            placeholder="Ism, familiya yoki login bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-600 bg-[#2a2a2a] p-3 max-md:p-2.5 max-md:text-sm rounded-lg focus:outline-none focus:border-yellow-400 text-gray-100 placeholder-gray-500"
          />
        </div>

        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="px-4 max-md:px-3 py-3 max-md:py-2.5 max-md:text-sm bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition border border-red-500/30 whitespace-nowrap max-md:w-full"
          >
            Tozalash
          </button>
        )}
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-[#212121]/90 backdrop-blur-md border border-gray-700">
        <table className="w-full text-left text-sm min-w-[640px] max-md:min-w-[400px]">
          <thead className="bg-[#2a2a2a] text-yellow-400 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3 max-md:p-2 max-md:text-[10px] w-[10%] max-md:w-[20px]">T/r</th>
              <th className="p-3 max-md:p-2 max-md:text-[10px] w-[20%] max-md:w-[80px]">Ism</th>
              <th className="p-3 max-md:p-2 max-md:text-[10px] w-[30%] max-md:w-[100px]">Familiya</th>
              <th className="p-3 max-md:p-2 max-md:text-[10px] w-[40%] max-md:w-auto text-start">Baho</th>
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 max-md:p-6 text-center text-gray-400 max-md:text-sm">
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              paginated.map((student, i) => (
                <motion.tr
                  key={student.student_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-700 hover:bg-yellow-400/10 transition"
                >
                  <td className="p-3 max-md:p-2 text-gray-300 max-md:text-[11px]">{i + 1}</td>
                  <td className="p-3 max-md:p-2 text-gray-100 font-medium max-md:text-[11px] truncate" title={student.first_name}>
                    {student.first_name}
                  </td>
                  <td className="p-3 max-md:p-2 text-gray-100 font-medium max-md:text-[11px] truncate" title={student.last_name}>
                    {student.last_name}
                  </td>
                  <td className="-ml-10  p-3 max-md:p-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleGiveGrade(student.student_id);
                      }}
                      className="flex items-center gap-2 max-md:gap-1"
                    >
                      <input
                        type="text"
                        inputMode="numeric"
                        placeholder="1-10"
                        value={gradeInputs[student.student_id] || ""}
                        onChange={(e) => handleGradeInputChange(student.student_id, e.target.value)}
                        disabled={loading[student.student_id]}
                        className="w-16 max-md:w-12 bg-[#2a2a2a] border border-gray-600 rounded-lg p-2 max-md:p-1 text-center text-sm max-md:text-[11px] focus:outline-none focus:border-yellow-400 text-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        maxLength={2}
                      />
                      <button
                        type="submit"
                        disabled={loading[student.student_id] || !gradeInputs[student.student_id]}
                        className="px-3 max-md:px-2 py-2 max-md:py-1 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-xs max-md:text-[10px] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 max-md:gap-1 whitespace-nowrap"
                      >
                        {loading[student.student_id] ? (
                          <>
                            <div className="w-3 h-3 max-md:w-2.5 max-md:h-2.5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                            <span className="max-md:hidden">Yuklanmoqda</span>
                          </>
                        ) : (
                          <>
                            <span className="hidden md:inline">Baholash</span>
                            <Check className="inline md:hidden w-3 h-3 text-black" />
                          </>
                        )}
                      </button>
                    </form>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 max-md:mt-4 gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 max-md:px-2.5 py-1 max-md:py-1 rounded-md text-sm max-md:text-xs font-medium transition ${
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

      {/* Sinf yaratish modali */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1e1e1e] p-6 max-md:p-5 rounded-2xl max-md:rounded-xl border border-gray-700 w-[90%] max-w-md">
            <h3 className="text-xl max-md:text-lg font-bold text-yellow-400 mb-4 max-md:mb-3">
              Yangi sinf yaratish
            </h3>
            <input
              type="text"
              placeholder="Sinf nomi..."
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg p-3 max-md:p-2.5 max-md:text-sm mb-4 max-md:mb-3 focus:outline-none focus:border-yellow-400 text-gray-100"
            />
            <div className="flex max-md:flex-col justify-end gap-3 max-md:gap-2">
              <button
                onClick={() => setShowClassModal(false)}
                className="px-4 max-md:px-3 py-2 max-md:py-2 max-md:text-sm bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 max-md:w-full"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCreateClass}
                className="px-4 max-md:px-3 py-2 max-md:py-2 max-md:text-sm bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 max-md:w-full"
              >
                Yaratish
              </button>
            </div>
          </div>
        </div>
      )}

      {/* O'quvchi qo'shish modali */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
          <div className="bg-[#1e1e1e] p-6 max-md:p-5 rounded-2xl max-md:rounded-xl border border-gray-700 w-[90%] max-w-lg">
            <h3 className="text-xl max-md:text-lg font-bold text-yellow-400 mb-4 max-md:mb-3">
              Yangi o'quvchi qo'shish
            </h3>

            <div className="grid grid-cols-2 max-md:grid-cols-1 gap-4 max-md:gap-3">
              <input
                placeholder="Ism"
                value={newStudent.first_name}
                onChange={(e) => setNewStudent({ ...newStudent, first_name: e.target.value })}
                className="bg-[#2a2a2a] border border-gray-600 rounded-lg p-3 max-md:p-2.5 max-md:text-sm text-gray-100"
              />
              <input
                placeholder="Familiya"
                value={newStudent.last_name}
                onChange={(e) => setNewStudent({ ...newStudent, last_name: e.target.value })}
                className="bg-[#2a2a2a] border border-gray-600 rounded-lg p-3 max-md:p-2.5 max-md:text-sm text-gray-100"
              />
              <input
                placeholder="Parol"
                type="password"
                value={newStudent.password}
                onChange={(e) => setNewStudent({ ...newStudent, password: e.target.value })}
                className="bg-[#2a2a2a] col-span-2 max-md:col-span-1 border border-gray-600 rounded-lg p-3 max-md:p-2.5 max-md:text-sm text-gray-100"
              />
              <select
                value={newStudent.gender ? "1" : "0"}
                onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value === "1" })}
                className="col-span-2 max-md:col-span-1 bg-[#2a2a2a] border border-gray-600 rounded-lg p-3 max-md:p-2.5 max-md:text-sm text-gray-100"
              >
                <option value="1">Erkak</option>
                <option value="0">Ayol</option>
              </select>
            </div>

            <div className="flex max-md:flex-col justify-end gap-3 max-md:gap-2 mt-5 max-md:mt-4">
              <button
                onClick={() => setShowStudentModal(false)}
                className="px-4 max-md:px-3 py-2 max-md:py-2 max-md:text-sm bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 max-md:w-full"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCreateStudent}
                className="px-4 max-md:px-3 py-2 max-md:py-2 max-md:text-sm bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 max-md:w-full"
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

export default Teacher;