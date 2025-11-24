
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaFileExcel } from "react-icons/fa";
import { createUser, deleteUser, updateUser, getClasses, updatePassword, getStudentsByClass } from "../hooks/apis";
import { toast } from "sonner";
import ImportButton from "../components/Import";
import { CenteredProgressLoader } from "../components/loading";
import Pagination from "../components/Pagination";
import * as XLSX from 'xlsx';

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  role: number;
  gender: boolean;
  ball: number;
  classe_id: number;
  classe: Class;
  password: string | number;
  classe_name: string;
}

interface Class {
  id: number;
  name: string;
  teacher_id: number;
}

const Students = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetModal, setResetModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    password: "",
    role: 3,
    gender: true,
    classe_id: 0,
  });

  const [editForm, setEditForm] = useState({
    id: 0,
    first_name: "",
    last_name: "",
    gender: true,
    classe_id: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(1);
  const perPage = 40;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, setFilterClass] = useState<number>(0);

  // Backend dan ma'lumotlarni olish (class filter bilan)
  const fetchStudents = async (page = 1, classId = 0) => {
    try {
      setLoading(true);
      const res = await getStudentsByClass(page, classId);
      const data = res.data;
      const onlyStudents = data.results
      setStudents(onlyStudents);
      setTotalCount(data.count);
      setTotalPages(Math.ceil(data.count / perPage));
      setCurrentPage(page);
    } catch (err) {
      toast.error("O'quvchilarni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data.results || res.data);
    } catch (err) {
      toast.error("Sinflarni yuklashda xatolik!");
    }
  };

  useEffect(() => {
    fetchStudents(1, filterClass);
    fetchClasses();
  }, []);

  // Class filter o'zgarganda backenddan yangi ma'lumot olish
  useEffect(() => {
    fetchStudents(1, filterClass);
  }, [filterClass]);

  // Excel eksport funksiyasi
  const handleExportToExcel = () => {
    try {
      if (!students || students.length === 0)
        return toast.warning("Eksport qilish uchun o'quvchi topilmadi!");

      // Sinf bo'yicha guruhlash
      const groupedByClass = students.reduce((groups, student) => {
        const className = student.classe_name || "Noma'lum sinf";
        if (!groups[className]) groups[className] = [];
        groups[className].push(student);
        return groups;
      }, {} as Record<string, User[]>);

      const workbook = XLSX.utils.book_new();

      // 🔹 1) Umumiy "Barcha o'quvchilar" sahifasi
      const allData = students.map((student, index) => ({
        "№": index + 1,
        "Ism": student.first_name,
        "Familiya": student.last_name,
        "Login": student.username,
        "Sinf": student.classe_name
      }));
      const allSheet = XLSX.utils.json_to_sheet(allData);
      allSheet["!cols"] = [
        { wch: 5 },
        { wch: 20 },
        { wch: 20 },
        { wch: 25 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(workbook, allSheet, "Barcha o'quvchilar");

      // 🔹 2) Har bir sinf uchun alohida sahifa
      Object.entries(groupedByClass).forEach(([className, students]) => {
        const exportData = students.map((student, index) => ({
          "№": index + 1,
          "Ism": student.first_name,
          "Familiya": student.last_name,
          "Login": student.username,
          "Sinf": student.classe_name,
        }));

        const worksheet = XLSX.utils.json_to_sheet(exportData);
        worksheet["!cols"] = [
          { wch: 5 },
          { wch: 20 },
          { wch: 20 },
          { wch: 25 },
          { wch: 15 },
        ];
        XLSX.utils.book_append_sheet(workbook, worksheet, className);
      });

      const fileName = `Oquvchilar_${new Date().toLocaleDateString("uz-UZ")}.xlsx`;
      XLSX.writeFile(workbook, fileName);

      toast.success("Excel fayl muvaffaqiyatli yaratildi!");
    } catch (error) {
      console.error("Excel eksport xatosi:", error);
      toast.error("Excel faylni yaratishda xatolik!");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (addForm.classe_id === 0) {
      toast.error("Sinfni tanlang!");
      return;
    }

    try {
      setSubmitting(true);
      await createUser(addForm);
      toast.success("O'quvchi muvaffaqiyatli qo'shildi!");
      setShowModal(false);
      setAddForm({
        first_name: "",
        last_name: "",
        password: "",
        role: 3,
        gender: true,
        classe_id: 0,
      });
      fetchStudents(currentPage, filterClass);
      setSubmitting(false);
    } catch {
      setSubmitting(false);
      toast.error("O'quvchini qo'shishda xatolik!");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editForm.classe_id === 0) {
      toast.error("Sinfni tanlang!");
      return;
    }

    try {
      setSubmitting(true);
      const updateData = {
        id: editForm.id,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        role: 3,
        gender: editForm.gender,
        classe_id: editForm.classe_id,
      };
      await updateUser(updateData);
      toast.success("O'quvchi ma'lumotlari yangilandi!");
      setShowEditModal(false);
      setSelectedStudent(null);
      fetchStudents(currentPage, filterClass);
      setSubmitting(false);
    } catch (error) {
      setSubmitting(false);
      console.error("Update xatosi:", error);
      toast.error("Yangilashda xatolik!");
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    try {
      setSubmitting(true);
      await deleteUser(selectedStudent);
      toast.success("O'quvchi o'chirildi!");
      setShowDeleteModal(false);
      setSelectedStudent(null);
      fetchStudents(currentPage, filterClass);
      setSubmitting(false);
    } catch {
      setSubmitting(false);
      toast.error("O'chirishda xatolik!");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    if (!resetPasswordValue.trim()) {
      toast.error("Yangi parolni kiriting!");
      return;
    }

    try {
      setSubmitting(true);
      await updatePassword(selectedUser.id, resetPasswordValue);
      toast.success("Parol muvaffaqiyatli tiklandi!");
      setResetModal(false);
      setSelectedUser(null);
      setResetPasswordValue("");
      setSubmitting(false);
    } catch (error) {
      setSubmitting(false);
      console.error("Parolni tiklash xatosi:", error);
      toast.error("Parolni tiklashda xatolik!");
    }
  };

  const getClassName = (classId: number) => {
    const foundClass = classes.find(c => c.id === classId);
    return foundClass ? foundClass.name : "Sinf topilmadi";
  };

  // Frontend qidiruv (faqat ism-familiya uchun, class filter backend orqali)
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesSearch;
  });

  // Sahifani o'zgartirish
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    fetchStudents(page, filterClass);
  };

  const startIndex = (currentPage - 1) * perPage;

  return (
    <div className="p-6 bg-linear-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400 tracking-wide">
            O'quvchilar ro'yxati
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Jami: {totalCount} ta o'quvchi
          </p>
        </div>
        <div className="flex gap-5 items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleExportToExcel}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-md transition"
          >
            <FaFileExcel size={12} />
            Excel yuklash
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-md transition"
          >
            <FaPlus /> O'quvchi qo'shish
          </motion.button>
          <ImportButton onImported={(data) => {
            console.log(":", data);
            fetchStudents(currentPage, filterClass);
          }} />
        </div>
      </div>

      <div className="mb-6 flex gap-4 items-center bg-[#212121]/90 p-4 rounded-xl border border-gray-700">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Ism yoki familiya bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
            }}
            className="w-full border border-gray-600 bg-[#2a2a2a] p-3 rounded-lg focus:outline-none focus:border-yellow-400 text-gray-100 placeholder-gray-500"
          />
        </div>

        <div className="relative w-42">
          <select
            value={filterClass}
            onChange={(e) => {
              setFilterClass(Number(e.target.value));
            }}
            className="w-full px-4 pr-10 border border-gray-600 bg-[#2a2a2a] p-3 rounded-lg focus:outline-none focus:border-yellow-400 text-gray-100 appearance-none"
          >
            <option value={0}>Barcha sinflar</option>
            {classes.map((cls) => (
              <option key={cls.id} value={cls.id}>
                {cls.name}
              </option>
            ))}
          </select>

          <svg
            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {(searchTerm || filterClass !== 0) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterClass(0);
            }}
            className="px-4 py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition border border-red-500/30 whitespace-nowrap"
          >
            Tozalash
          </button>
        )}
      </div>

      <div className="rounded-xl shadow-lg bg-[#212121]/90 backdrop-blur-md border border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#2a2a2a] text-yellow-400 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3">T/r</th>
              <th className="p-3">Username</th>
              <th className="p-3">Ism</th>
              <th className="p-3">Familiya</th>
              <th className="p-3">Ball</th>
              <th className="p-3">Jinsi</th>
              <th className="p-3">Sinfi</th>
              <th className="p-3 text-center">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-8 text-center">
                  <CenteredProgressLoader />
                </td>
              </tr>
            ) : filteredStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              filteredStudents.map((s, i) => (
                <motion.tr
                  key={s.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-700 hover:bg-yellow-400/10 transition"
                >
                  <td className="p-3 text-gray-300">{startIndex + i + 1}</td>
                  <td className="p-3 text-gray-300">{s.username}</td>
                  <td className="p-3 text-gray-100">{s.first_name}</td>
                  <td className="p-3 text-gray-100">{s.last_name}</td>
                  <td className="p-3 text-gray-100">{s.ball}</td>
                  <td className="p-3 text-gray-400">{s.gender ? "Erkak" : "Ayol"}</td>
                  <td className="p-3 text-yellow-400 font-semibold">
                    {s.classe ? getClassName(s.classe.id) : "Sinf yo'q"}
                  </td>
                  <td className="p-3 flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedStudent(s);
                        setEditForm({
                          id: s.id,
                          first_name: s.first_name,
                          last_name: s.last_name,
                          gender: s.gender,
                          classe_id: s.classe?.id || 0,
                        });
                        setShowEditModal(true);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedStudent(s);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-500 hover:text-red-400 transition"
                    >
                      <FaTrash />
                    </button>
                    <button
                      className="bg-yellow-400 px-4 py-2 rounded-lg text-black font-bold text-sm hover:bg-yellow-300 transition"
                      onClick={() => {
                        setSelectedUser(s);
                        setResetModal(true);
                      }}
                    >
                      Parolni tiklash
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
      {/* Parolni tiklash Modal */}
      <AnimatePresence>
        {resetModal && (
          <ModalWrapper onClose={() => setResetModal(false)} title="Student parolini tiklash">
            <div className="space-y-3">
              <p className="text-lg">F.I.O: {selectedUser?.first_name} {selectedUser?.last_name}</p>
              <p>Login: {selectedUser?.username}</p>
              <input
                type="text"
                placeholder="Yangi parol"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                required
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setResetModal(false)}
                disabled={submitting}
                className={`px-4 py-2 rounded border border-gray-600 transition ${submitting
                    ? 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                    : 'bg-[#2a2a2a] hover:bg-[#333] text-gray-100'
                  }`}
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={submitting}
                className={`px-4 py-2 rounded font-semibold shadow-md transition ${submitting
                    ? 'bg-[#3a3a3a] text-gray-600 cursor-not-allowed'
                    : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                  }`}
              >
                {submitting ? "Yuklanmoqda..." : "Tiklash"}
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Qo'shish Modal */}
      <AnimatePresence>
        {showModal && (
          <ModalWrapper onClose={() => setShowModal(false)} title="✨ Yangi o'quvchi qo'shish">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Ism"
                value={addForm.first_name}
                onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                required
              />
              <input
                type="text"
                placeholder="Familiya"
                value={addForm.last_name}
                onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                required
              />
              <input
                type="password"
                placeholder="Parol"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                required
              />
              <div className="flex gap-3 items-center">
                <label className="text-gray-300 font-medium">Jinsi:</label>
                <select
                  value={addForm.gender ? "true" : "false"}
                  onChange={(e) => setAddForm({ ...addForm, gender: e.target.value === "true" })}
                  className="border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:border-yellow-400"
                >
                  <option value="true">Erkak</option>
                  <option value="false">Ayol</option>
                </select>
              </div>
              <div>
                <label className="text-gray-300 font-medium block mb-2">Sinfi:</label>
                <select
                  value={addForm.classe_id}
                  onChange={(e) => setAddForm({ ...addForm, classe_id: Number(e.target.value) })}
                  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                  required
                >
                  <option value={0}>Sinfni tanlang</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={submitting}
                  className={`px-4 py-2 rounded border border-gray-600 transition ${submitting
                      ? 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                      : 'bg-[#2a2a2a] hover:bg-[#333] text-gray-100'
                    }`}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`px-4 py-2 rounded font-semibold shadow-md transition ${submitting
                      ? 'bg-[#3a3a3a] text-gray-600 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    }`}
                >
                  {submitting ? "Yuklanmoqda..." : "Saqlash"}
                </button>
              </div>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Tahrirlash Modal */}
      <AnimatePresence>
        {showEditModal && (
          <ModalWrapper onClose={() => setShowEditModal(false)} title="✏️ O'quvchini tahrirlash">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Ism"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                required
              />
              <input
                type="text"
                placeholder="Familiya"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                required
              />
              <div className="flex gap-3 items-center">
                <label className="text-gray-300 font-medium">Jinsi:</label>
                <select
                  value={editForm.gender ? "true" : "false"}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value === "true" })}
                  className="border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:border-yellow-400"
                >
                  <option value="true">Erkak</option>
                  <option value="false">Ayol</option>
                </select>
              </div>
              <div>
                <label className="text-gray-300 font-medium block mb-2">Sinfi:</label>
                <select
                  value={editForm.classe_id}
                  onChange={(e) => setEditForm({ ...editForm, classe_id: Number(e.target.value) })}
                  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                  required
                >
                  <option value={0}>Sinfni tanlang</option>
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={submitting}
                  className={`px-4 py-2 rounded border border-gray-600 transition ${submitting
                      ? 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                      : 'bg-[#2a2a2a] hover:bg-[#333] text-gray-100'
                    }`}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={submitting}
                  className={`px-4 py-2 rounded font-semibold shadow-md transition ${submitting
                      ? 'bg-[#3a3a3a] text-gray-600 cursor-not-allowed'
                      : 'bg-yellow-500 hover:bg-yellow-400 text-black'
                    }`}
                >
                  {submitting ? "Yuklanmoqda..." : "Saqlash"}
                </button>
              </div>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* O'chirish Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <ModalWrapper onClose={() => setShowDeleteModal(false)} title="⚠️ O'quvchini o'chirish">
            <p className="text-gray-300 mb-6">
              <span className="text-yellow-400 font-semibold">
                {selectedStudent?.first_name} {selectedStudent?.last_name}
              </span>{" "}
              ni o'chirmoqchimisiz?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={submitting}
                className={`px-4 py-2 rounded border border-gray-600 transition ${submitting
                    ? 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed'
                    : 'bg-[#2a2a2a] hover:bg-[#333] text-gray-100'
                  }`}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className={`px-4 py-2 rounded font-semibold transition ${submitting
                    ? 'bg-[#3a3a3a] text-gray-600 cursor-not-allowed'
                    : 'bg-red-500 hover:bg-red-400 text-white'
                  }`}
              >
                {submitting ? "Yuklanmoqda..." : "O'chirish"}
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
};

const ModalWrapper = ({
  children,
  onClose,
  title,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="bg-[#212121]/95 text-gray-100 rounded-xl shadow-2xl w-full max-w-md p-6 border border-yellow-500/30"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-semibold mb-4 text-yellow-400">{title}</h2>
      {children}
    </motion.div>
  </motion.div>
);

export default Students;