import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { createUser, deleteUser, updateUser, getClasses, updatePassword, getMyStudents, createClass } from "../hooks/apis";
import { toast } from "sonner";
import ImportButton from "../components/Import";

interface User {
  student_id: number;
  first_name: string;
  last_name: string;
  username: string;
  role: number;
  gender: boolean;
  ball: number;
  classe_id: number;
  classe: Class;
  password: string | number;
  classe_name:string;
}

interface Class {
  id: number;
  name: string;
  teacher_id: number;
}

const MyStudents = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState("");
  const [resetModal, setResetModal] = useState(false);
  const [newClassName, setNewClassName] = useState("");
  const [showClassModal, setShowClassModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [selectedClassName, setSelectedClassName] = useState<string | null>(null);

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
  const perPage = 20;

  const [searchTerm, setSearchTerm] = useState("");
  const teacher_id = Number(localStorage.getItem("id"));

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await getMyStudents();
      const studentss = res.data;
      setStudents(studentss);
      setLoading(false);
    } catch (err) {
      setLoading(false);
      toast.error("O'quvchilarni yuklashda xatolik!");
    }
  };

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return toast.error("Sinf nomini kiriting!");

    try {
      setModalLoading(true);
      await createClass({ name: newClassName, teacher: teacher_id });
      toast.success("Sinf yaratildi!");
      setShowClassModal(false);
      window.location.reload();
    } catch (err) {
      toast.error("Sinf yaratishda xatolik!");
    } finally {
      setModalLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const res = await getClasses();
      setClasses(res.data);
      console.log(res)
    } catch (err) {
      toast.error("Sinflarni yuklashda xatolik!");
    }
  };

  useEffect(() => {
    fetchStudents();
    fetchClasses();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (addForm.classe_id === 0) {
      toast.error("Sinfni tanlang!");
      return;
    }

    try {
      setModalLoading(true);
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
      fetchStudents();
    } catch {
      toast.error("O'quvchini qo'shishda xatolik!");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editForm.classe_id === 0) {
      toast.error("Sinfni tanlang!");
      return;
    }

    try {
      setModalLoading(true);
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
      fetchStudents();
    } catch (error) {
      console.error("Update xatosi:", error);
      toast.error("Yangilashda xatolik!");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedStudent) return;
    try {
      setModalLoading(true);
      const iddd= selectedStudent.student_id
      const userAddd = {
        id:iddd
      }
      const res =await deleteUser(userAddd);

      console.log(res)
      toast.success("O'quvchi o'chirildi!");
      setShowDeleteModal(false);
      setSelectedStudent(null);
      fetchStudents();
    } catch {
      toast.error("O'chirishda xatolik!");
    } finally {
      setModalLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    if (!resetPasswordValue.trim()) {
      toast.error("Yangi parolni kiriting!");
      return;
    }

    try {
      setModalLoading(true);
      await updatePassword(selectedUser.student_id, resetPasswordValue);
      toast.success("Parol muvaffaqiyatli tiklandi!");
      setResetModal(false);
      setSelectedUser(null);
      setResetPasswordValue("");
    } catch (error) {
      console.error("Parolni tiklash xatosi:", error);
      toast.error("Parolni tiklashda xatolik!");
    } finally {
      setModalLoading(false);
    }
  };

  // Unique class names
  const uniqueClasses = Array.from(new Set(students.map(s => s.classe_name))).filter(Boolean);

  // Filter by selected class and search
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
    <div className="p-6 bg-gradient-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-yellow-400 tracking-wide">
            O'quvchilar ro'yxati
          </h1>
          <p className="text-gray-400 mt-2">
            Jami: {filteredStudents.length} ta o'quvchi
          </p>
        </div>
        <div className="flex gap-3 items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-md transition"
          >
            <FaPlus /> O'quvchi qo'shish
          </motion.button>
          <ImportButton onImported={(data) => console.log("Import qilinganlar:", data)} />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowClassModal(true)}
            className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-md transition"
          >
            <FaPlus /> Sinf qo'shish
          </motion.button>
        </div>
      </div>

      {/* Class Filter Cards */}
      <div className="mb-6 flex gap-3 flex-wrap">
        

        {uniqueClasses.map((className) => {
          const count = students.filter(s => s.classe_name === className).length;
          return (
            <motion.button
              key={className}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedClassName(className);
                setCurrentPage(1);
              }}
              className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                selectedClassName === className
                  ? "bg-yellow-500 text-black shadow-lg"
                  : "bg-[#2a2a2a] text-gray-300 hover:bg-[#333] border border-gray-700"
              }`}
            >
              <div className="flex items-center gap-2">
                <span>{className}</span>
                <span className="ml-1 text-sm opacity-80">({count})</span>
              </div>
            </motion.button>
          );
        })}
      </div>

      <div className="mb-6 flex gap-4 items-center bg-[#212121]/90 p-4 rounded-xl border border-gray-700">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Ism yoki familiya bo'yicha qidirish..."
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

      <div className="overflow-x-auto rounded-xl shadow-lg bg-[#212121]/90 backdrop-blur-md border border-gray-700">
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
                  <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              paginated.map((s, i) => (
                <motion.tr
                  key={s.student_id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-700 hover:bg-yellow-400/10 transition"
                >
                  <td className="p-3 text-gray-300">{i + 1}</td>
                  <td className="p-3 text-gray-300">{s.username}</td>
                  <td className="p-3 text-gray-100">{s.first_name}</td>
                  <td className="p-3 text-gray-100">{s.last_name}</td>
                  <td className="p-3 text-gray-100">{s.ball}</td>
                  <td className="p-3 text-gray-400">{s.gender ? "Erkak" : "Ayol"}</td>
                  <td className="p-3 text-yellow-400 font-semibold">
                    {s.classe_name}
                  </td>
                  <td className="p-3 flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedStudent(s);
                        setEditForm({
                          id: s.student_id,
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

      {/* Sinf yaratish modali */}
      {showClassModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-[#1e1e1e] p-6 rounded-2xl border border-gray-700 w-[90%] max-w-md">
            <h3 className="text-xl font-bold text-yellow-400 mb-4">Yangi sinf yaratish</h3>
            <input
              type="text"
              placeholder="Sinf nomi..."
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              disabled={modalLoading}
              className="w-full bg-[#2a2a2a] border border-gray-600 rounded-lg p-3 mb-4 focus:outline-none focus:border-yellow-400 text-gray-100 disabled:opacity-50"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowClassModal(false)}
                disabled={modalLoading}
                className="px-4 py-2 bg-gray-700 rounded-lg text-gray-300 hover:bg-gray-600 disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCreateClass}
                disabled={modalLoading}
                className="px-4 py-2 bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 disabled:opacity-50 flex items-center gap-2"
              >
                {modalLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Yaratilmoqda...
                  </>
                ) : (
                  "Yaratish"
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parolni tiklash modali */}
      <AnimatePresence>
        {resetModal && (
          <ModalWrapper onClose={() => setResetModal(false)} title="Student parolini tiklash">
            <div className="space-y-3">
              <p className="text-lg">
                F.I.O: {selectedUser?.first_name} {selectedUser?.last_name}
              </p>
              <p>Login: {selectedUser?.username}</p>
              <input
                type="text"
                placeholder="Yangi parol"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setResetModal(false)}
                disabled={modalLoading}
                className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={modalLoading}
                className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md disabled:opacity-50 flex items-center gap-2"
              >
                {modalLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    Tiklanmoqda...
                  </>
                ) : (
                  "Tiklash"
                )}
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Qo'shish modali */}
      <AnimatePresence>
        {showModal && (
          <ModalWrapper onClose={() => setShowModal(false)} title="✨ Yangi o'quvchi qo'shish">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Ism"
                value={addForm.first_name}
                onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
              <input
                type="text"
                placeholder="Familiya"
                value={addForm.last_name}
                onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
              <input
                type="password"
                placeholder="Parol"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
              <div className="flex gap-3 items-center">
                <label className="text-gray-300 font-medium">Jinsi:</label>
                <select
                  value={addForm.gender ? "true" : "false"}
                  onChange={(e) => setAddForm({ ...addForm, gender: e.target.value === "true" })}
                  disabled={modalLoading}
                  className="border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:border-yellow-400 disabled:opacity-50"
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
                  disabled={modalLoading}
                  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
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
                  disabled={modalLoading}
                  className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={modalLoading}
                  className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {modalLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Saqlanmoqda...
                    </>
                  ) : (
                    "Saqlash"
                  )}
                </button>
              </div>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Tahrirlash modali */}
      <AnimatePresence>
        {showEditModal && (
          <ModalWrapper onClose={() => setShowEditModal(false)} title="✏️ O'quvchini tahrirlash">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Ism"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
              <input
                type="text"
                placeholder="Familiya"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
              <div className="flex gap-3 items-center">
                <label className="text-gray-300 font-medium">Jinsi:</label>
                <select
                  value={editForm.gender ? "true" : "false"}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value === "true" })}
                  disabled={modalLoading}
                  className="border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:border-yellow-400 disabled:opacity-50"
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
                  disabled={modalLoading}
                  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
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
                  disabled={modalLoading}
                  className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={modalLoading}
                  className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md disabled:opacity-50 flex items-center gap-2"
                >
                  {modalLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                      Yangilanmoqda...
                    </>
                  ) : (
                    "Saqlash"
                  )}
                </button>
              </div>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* O'chirish modali */}
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
                disabled={modalLoading}
                className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={modalLoading}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-400 text-white font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {modalLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    O'chirilmoqda...
                  </>
                ) : (
                  "O'chirish"
                )}
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

export default MyStudents;