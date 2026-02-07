import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaKey, FaSearch } from "react-icons/fa";
import { createUser, deleteUser, getTeacherAll, updatePassword, updateUser } from "../hooks/apis";
import { toast } from "sonner";
import { CenteredProgressLoader } from "../components/loading";
import Pagination from "../components/Pagination";

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  role: number;
  gender: boolean;
  classe: number;
  password: string | number;
}

const Teachers = () => {
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [resetPassword, setResetPassword] = useState("");
  const [resetModal, setResetModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 40;

  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    password: "",
    role: 2,
    gender: true,
  });

  const [editForm, setEditForm] = useState({
    id: 0,
    first_name: "",
    username: "",
    last_name: "",
    role: 2,
    gender: true,
  });

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await getTeacherAll();
      const data = res.data;
      setTeachers(data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createUser(addForm);
      toast.success("Ustoz muvaffaqiyatli qo'shildi!");
      setShowModal(false);
      setAddForm({
        first_name: "",
        username: "",
        last_name: "",
        password: "",
        role: 2,
        gender: true,
      });
      fetchTeachers();
      setSubmitting(false);
    } catch {
      setSubmitting(false);
      toast.error("Ustozni qo'shishda xatolik!");
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    try {
      setSubmitting(true);
      const updateData = {
        id: editForm.id,
        username: editForm.username,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        role: 2,
        gender: editForm.gender,
      };

      await updateUser(updateData);
      toast.success("Ustoz ma'lumotlari yangilandi!");
      setShowEditModal(false);
      setSelectedTeacher(null);
      fetchTeachers();
      setSubmitting(false);
    } catch (error) {
      setSubmitting(false);
      console.error("Update xatosi:", error);
      toast.error("Yangilashda xatolik!");
    }
  };

  const handleDelete = async () => {
    if (!selectedTeacher) return;
    try {
      setSubmitting(true);
      await deleteUser(selectedTeacher);
      toast.success("Ustoz o'chirildi!");
      setShowDeleteModal(false);
      setSelectedTeacher(null);
      fetchTeachers();
      setSubmitting(false);
    } catch {
      setSubmitting(false);
      toast.error("O'chirishda xatolik!");
    }
  };

  const handleResetPassword = async () => {
    if (!selectedUser) return;

    if (!resetPassword.trim()) {
      toast.error("Yangi parolni kiriting!");
      return;
    }

    try {
      setSubmitting(true);
      await updatePassword(selectedUser.id, resetPassword);
      toast.success("Parol muvaffaqiyatli tiklandi!");
      setResetModal(false);
      setSelectedUser(null);
      setResetPassword("");
      setSubmitting(false);
    } catch (error) {
      setSubmitting(false);
      console.error("Parolni tiklash xatosi:", error);
      toast.error("Parolni tiklashda xatolik!");
    }
  };

  const filteredStudents = teachers.filter((student) => {
    const matchesSearch =
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass = filterClass === 0 || student.classe === filterClass;

    return matchesSearch && matchesClass;
  });

  const totalPages = Math.ceil(filteredStudents.length / perPage);
  const paginated = filteredStudents.slice((currentPage - 1) * perPage, currentPage * perPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const startIndex = (currentPage - 1) * perPage;

  return (
    <div className="p-3 sm:p-4 md:p-6 bg-linear-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 tracking-wide">
          Ustozlar ro'yxati: <span className="text-lg sm:text-xl md:text-2xl">{teachers.length}</span>
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-3 sm:px-4 py-2 rounded-lg shadow-md transition text-sm sm:text-base w-full sm:w-auto justify-center"
        >
          <FaPlus /> Ustoz qo'shish
        </motion.button>
      </div>

      {/* Search va Filter */}
      <div className="mb-6 flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center bg-[#212121]/90 p-3 sm:p-4 rounded-xl border border-gray-700">
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Ism yoki familiya bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            onKeyDown={(e) => e.key === "Enter" && setCurrentPage(1)}
            className="w-full border border-gray-600 bg-[#2a2a2a] p-2 sm:p-3 rounded-lg focus:outline-none focus:border-yellow-400 text-gray-100 placeholder-gray-500 text-sm sm:text-base pr-12"
          />

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setCurrentPage(1)}
            aria-label="Qidirish"
            className={`absolute right-2 p-2 rounded-md transition ${searchTerm.trim() ? "bg-yellow-500 text-black" : "bg-gray-700 text-gray-400 cursor-not-allowed"}`}
            disabled={!searchTerm.trim()}
          >
            <FaSearch />
          </motion.button>
        </div>

        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 sm:py-3 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition border border-red-500/30 whitespace-nowrap text-sm sm:text-base"
          >
            Tozalash
          </button>
        )}
      </div>

      {/* Table - Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg bg-[#212121]/90 backdrop-blur-md border border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#2a2a2a] text-yellow-400 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3">T/r</th>
              <th className="p-3">Username</th>
              <th className="p-3">Ism</th>
              <th className="p-3">Familiya</th>
              <th className="p-3">Jinsi</th>
              <th className="p-3 text-center">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {!loading ? (
              paginated.map((t, i) => (
                <motion.tr
                  key={t.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-700 hover:bg-yellow-400/10 transition"
                >
                  <td className="p-3 text-gray-300">{startIndex + i + 1}</td>
                  <td className="p-3 text-gray-300">
                    <button
                      onClick={() => navigate(`/user/${t.id}`)}
                      className="text-yellow-400 hover:text-yellow-300 hover:underline transition"
                    >
                      {t.username}
                    </button>
                  </td>
                  <td className="p-3 text-gray-100">{t.first_name}</td>
                  <td className="p-3 text-gray-100">{t.last_name}</td>
                  <td className="p-3 text-gray-400">{t.gender ? "Erkak" : "Ayol"}</td>
                  <td className="p-3">
                    <div className="flex justify-center gap-3 flex-wrap">
                      <button
                        onClick={() => {
                          setSelectedTeacher(t);
                          setEditForm({
                            id: t.id,
                            username: t.username,
                            first_name: t.first_name,
                            last_name: t.last_name,
                            role: 2,
                            gender: t.gender,
                          });
                          setShowEditModal(true);
                        }}
                        className="text-yellow-400 hover:text-yellow-300 transition text-lg"
                        title="Tahrirlash"
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedTeacher(t);
                          setShowDeleteModal(true);
                        }}
                        className="text-red-500 hover:text-red-400 transition text-lg"
                        title="O'chirish"
                      >
                        <FaTrash />
                      </button>
                      <button
                        className="bg-yellow-400 hover:bg-yellow-300 px-3 py-1.5 rounded-lg text-black font-bold text-xs transition"
                        onClick={() => {
                          setSelectedUser(t);
                          setResetModal(true);
                        }}
                        title="Parolni tiklash"
                      >
                        <FaKey className="inline mr-1" />
                        Parol
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            ) : (
              <tr>
                <td colSpan={6}>
                  <CenteredProgressLoader />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards - Mobile/Tablet */}
      <div className="md:hidden space-y-3">
        {!loading ? (
          paginated.length > 0 ? (
            paginated.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-[#212121]/90 backdrop-blur-md border border-gray-700 rounded-xl p-4 shadow-lg"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="text-yellow-400 font-semibold text-sm mb-1">
                      #{startIndex + i + 1}
                    </div>
                    <h3 className="text-base sm:text-lg font-bold text-gray-100">
                      {t.first_name} {t.last_name}
                    </h3>
                    <button
                      onClick={() => navigate(`/user/${t.id}`)}
                      className="text-xs sm:text-sm text-yellow-400 hover:text-yellow-300 hover:underline transition mt-1"
                    >
                      @{t.username}
                    </button>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setSelectedTeacher(t);
                        setEditForm({
                          id: t.id,
                          username: t.username,
                          first_name: t.first_name,
                          last_name: t.last_name,
                          role: 2,
                          gender: t.gender,
                        });
                        setShowEditModal(true);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 transition p-2"
                      title="Tahrirlash"
                    >
                      <FaEdit className="text-lg" />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedTeacher(t);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-500 hover:text-red-400 transition p-2"
                      title="O'chirish"
                    >
                      <FaTrash className="text-lg" />
                    </button>
                  </div>
                </div>

                <div className="border-t border-gray-700 pt-3 mt-3">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs sm:text-sm text-gray-400">Jinsi:</span>
                    <span className="text-xs sm:text-sm text-gray-200 font-medium">
                      {t.gender ? "Erkak" : "Ayol"}
                    </span>
                  </div>

                  <button
                    className="w-full bg-yellow-400 hover:bg-yellow-300 py-2 rounded-lg text-black font-bold text-sm transition flex items-center justify-center gap-2"
                    onClick={() => {
                      setSelectedUser(t);
                      setResetModal(true);
                    }}
                  >
                    <FaKey />
                    Parolni tiklash
                  </button>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-400">
              <p>Hech qanday ustoz topilmadi</p>
            </div>
          )
        ) : (
          <CenteredProgressLoader />
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination totalPages={totalPages} currentPage={currentPage} onPageChange={handlePageChange} />
        </div>
      )}

      {/* Parolni reset qilish Modal */}
      <AnimatePresence>
        {resetModal && (
          <ModalWrapper onClose={() => setResetModal(false)} title="Parolni tiklash">
            <div className="space-y-3">
              <div className="bg-[#2a2a2a]/50 p-3 rounded-lg border border-gray-700">
                <p className="text-sm sm:text-base text-gray-300 mb-1">
                  <span className="text-yellow-400 font-semibold">
                    {selectedUser?.first_name} {selectedUser?.last_name}
                  </span>
                </p>
                <p className="text-xs sm:text-sm text-gray-400">Login: {selectedUser?.username}</p>
              </div>
              <input
                type="text"
                placeholder="Yangi parol"
                value={resetPassword}
                onChange={(e) => setResetPassword(e.target.value)}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 sm:p-3 rounded focus:outline-none focus:border-yellow-400 text-sm sm:text-base"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5">
              <button
                type="button"
                onClick={() => setResetModal(false)}
                className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition text-sm sm:text-base order-2 sm:order-1"
              >
                Bekor qilish
              </button>
              <button
                disabled={submitting}
                type="button"
                onClick={handleResetPassword}
                className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md text-sm sm:text-base order-1 sm:order-2"
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
          <ModalWrapper onClose={() => setShowModal(false)} title="✨ Yangi ustoz qo'shish">
            <form onSubmit={handleSubmit} className="space-y-3">
              <input
                type="text"
                placeholder="Ism"
                value={addForm.first_name}
                onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 sm:p-3 rounded focus:outline-none focus:border-yellow-400 text-sm sm:text-base"
                required
              />
              <input
                type="text"
                placeholder="Familiya"
                value={addForm.last_name}
                onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 sm:p-3 rounded focus:outline-none focus:border-yellow-400 text-sm sm:text-base"
                required
              />
              <input
                type="password"
                placeholder="Parol"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 sm:p-3 rounded focus:outline-none focus:border-yellow-400 text-sm sm:text-base"
                required
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
                <label className="text-gray-300 font-medium text-sm sm:text-base">Jinsi:</label>
                <select
                  value={addForm.gender ? "true" : "false"}
                  onChange={(e) => setAddForm({ ...addForm, gender: e.target.value === "true" })}
                  className="w-full sm:w-auto border border-gray-600 bg-[#2a2a2a] p-2 sm:p-2.5 rounded focus:border-yellow-400 text-sm sm:text-base"
                >
                  <option value="true">Erkak</option>
                  <option value="false">Ayol</option>
                </select>
              </div>
              <ModalActions onClose={() => setShowModal(false)} submitting={submitting} />
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* Tahrirlash Modal */}
      <AnimatePresence>
        {showEditModal && (
          <ModalWrapper onClose={() => setShowEditModal(false)} title="✏️ Ustozni tahrirlash">
            <form onSubmit={handleUpdate} className="space-y-3">
              <input
                type="text"
                placeholder="Username"
                value={editForm.username}
                onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 sm:p-3 rounded focus:outline-none focus:border-yellow-400 text-sm sm:text-base"
                required
              />
              <input
                type="text"
                placeholder="Ism"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 sm:p-3 rounded focus:outline-none focus:border-yellow-400 text-sm sm:text-base"
                required
              />
              <input
                type="text"
                placeholder="Familiya"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 sm:p-3 rounded focus:outline-none focus:border-yellow-400 text-sm sm:text-base"
                required
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-start sm:items-center">
                <label className="text-gray-300 font-medium text-sm sm:text-base">Jinsi:</label>
                <select
                  value={editForm.gender ? "true" : "false"}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value === "true" })}
                  className="w-full sm:w-auto border border-gray-600 bg-[#2a2a2a] p-2 sm:p-2.5 rounded focus:border-yellow-400 text-sm sm:text-base"
                >
                  <option value="true">Erkak</option>
                  <option value="false">Ayol</option>
                </select>
              </div>
              <ModalActions onClose={() => setShowEditModal(false)} submitting={submitting} />
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* O'chirish Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <ModalWrapper onClose={() => setShowDeleteModal(false)} title="⚠️ Ustozni o'chirish">
            <div className="bg-[#2a2a2a]/50 p-4 rounded-lg border border-gray-700 mb-6">
              <p className="text-gray-300 text-sm sm:text-base">
                <span className="text-yellow-400 font-semibold">
                  {selectedTeacher?.first_name} {selectedTeacher?.last_name}
                </span>{" "}
                ni o'chirmoqchimisiz?
              </p>
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={submitting}
                className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition text-sm sm:text-base order-2 sm:order-1"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={submitting}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-400 text-white font-semibold text-sm sm:text-base order-1 sm:order-2"
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

/* Modal Components */
const ModalWrapper = ({
  children,
  title,
  onClose,
}: {
  children: React.ReactNode;
  onClose: () => void;
  title: string;
}) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
    className="fixed inset-0 flex items-center justify-center bg-black/70 z-50 backdrop-blur-sm p-4"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-[#212121]/95 text-gray-100 rounded-xl shadow-2xl w-full max-w-md p-4 sm:p-6 border border-yellow-500/30 max-h-[90vh] overflow-y-auto"
    >
      <h2 className="text-lg sm:text-xl font-semibold mb-4 text-yellow-400">{title}</h2>
      {children}
    </motion.div>
  </motion.div>
);

const ModalActions = ({ onClose, submitting }: { onClose: () => void; submitting: boolean }) => (
  <div className="flex flex-col sm:flex-row justify-end gap-3 mt-5">
    <button
      type="button"
      onClick={onClose}
      disabled={submitting}
      className={`px-4 py-2 rounded border border-gray-600 transition text-sm sm:text-base order-2 sm:order-1 ${
        submitting ? "bg-[#1a1a1a] text-gray-600 cursor-not-allowed" : "bg-[#2a2a2a] hover:bg-[#333] text-gray-100"
      }`}
    >
      Bekor qilish
    </button>
    <button
      disabled={submitting}
      type="submit"
      className={`px-4 py-2 rounded font-semibold shadow-md transition text-sm sm:text-base order-1 sm:order-2 ${
        submitting ? "bg-[#3a3a3a] text-gray-600 cursor-not-allowed" : "bg-yellow-500 hover:bg-yellow-400 text-black"
      }`}
    >
      {submitting ? "Yuklanmoqda..." : "Saqlash"}
    </button>
  </div>
);

export default Teachers;