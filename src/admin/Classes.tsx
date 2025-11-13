import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { getClasses, createClass, updateClass, deleteClass, getTeacherAll } from "../hooks/apis";
import { toast } from "sonner";
import { CenteredProgressLoader } from "../components/loading";

interface Teacher {
  id: number;
  first_name: string;
  last_name: string;
  role: number;
}

interface Class {
  id: number;
  name: string;
  teacher: number;
  teacher_detail?: Teacher;
}

const Classes = () => {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [addForm, setAddForm] = useState({
    name: "",
    teacher: 0,
  });

  const [editForm, setEditForm] = useState({
    id: 0,
    name: "",
    teacher: 0,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  const fetchClasses = async () => {
    try {
      setLoading(true);
      const res = await getClasses();
      setClasses(res.data);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await getTeacherAll();
      const teachersList = res.data.filter((u: Teacher) => u.role === 2);
      setTeachers(teachersList);
      setLoading(false);
    } catch (err) {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClasses();
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (addForm.teacher === 0) {
      toast.error("Ustozni tanlang!");
      return;
    }

    try {
      setModalLoading(true);
      await createClass(addForm);
      toast.success("Sinf muvaffaqiyatli qo'shildi!");
      setShowModal(false);
      setAddForm({
        name: "",
        teacher: 0,
      });
      fetchClasses();
    } catch {
      toast.error("Sinfni qo'shishda xatolik!");
    } finally {
      setModalLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editForm.teacher === 0) {
      toast.error("Ustozni tanlang!");
      return;
    }

    try {
      setModalLoading(true);
      await updateClass(editForm);
      toast.success("Sinf ma'lumotlari yangilandi!");
      setShowEditModal(false);
      setSelectedClass(null);
      fetchClasses();
    } catch (error) {
      console.error("Update xatosi:", error);
      toast.error("Yangilashda xatolik!");
    } finally {
      setModalLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedClass) return;
    try {
      setModalLoading(true);
      await deleteClass(selectedClass.id);
      toast.success("Sinf o'chirildi!");
      setShowDeleteModal(false);
      setSelectedClass(null);
      fetchClasses();
    } catch {
      toast.error("O'chirishda xatolik!");
    } finally {
      setModalLoading(false);
    }
  };

  const getTeacherName = (teacherId: number) => {
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? `${teacher.first_name} ${teacher.last_name}` : "Ustoz topilmadi";
  };

  const totalPages = Math.ceil(classes.length / perPage);
  const paginated = classes.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-6 bg-linear-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400 tracking-wide">
          Sinflar ro'yxati
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-md transition"
        >
          <FaPlus /> Sinf qo'shish
        </motion.button>
      </div>

      <div className="overflow-x-auto rounded-xl shadow-lg bg-[#212121]/90 backdrop-blur-md border border-gray-700">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#2a2a2a] text-yellow-400 uppercase text-xs font-semibold">
            <tr>
              <th className="p-3">T/r</th>
              <th className="p-3">Sinf nomi</th>
              <th className="p-3">Sinf rahbari</th>
              <th className="p-3 text-center">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4}>
                  <CenteredProgressLoader/> 
                </td>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">
                  Ma'lumot topilmadi
                </td>
              </tr>
            ) : (
              paginated.map((c, i) => (
                <motion.tr
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-700 hover:bg-yellow-400/10 transition"
                >
                  <td className="p-3 text-gray-300">{i+1}</td>
                  <td className="p-3 text-gray-100 font-semibold">{c.name}</td>
                  <td className="p-3 text-gray-400">{getTeacherName(c.teacher)}</td>
                  <td className="p-3 flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedClass(c);
                        setEditForm({
                          id: c.id,
                          name: c.name,
                          teacher: c.teacher,
                        });
                        setShowEditModal(true);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 transition"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedClass(c);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-500 hover:text-red-400 transition"
                    >
                      <FaTrash />
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

      {/* Qo'shish modali */}
      <AnimatePresence>
        {showModal && (
          <ModalWrapper onClose={() => setShowModal(false)} title="✨ Yangi sinf qo'shish">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Sinf nomi (masalan: 10-A)"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                required
                disabled={modalLoading}
              />
              
              <div>
                <label className="text-gray-300 font-medium block mb-2">Sinf rahbari:</label>
                <select
                  value={addForm.teacher || ""}
                  onChange={(e) => setAddForm({ ...addForm, teacher: Number(e.target.value) })}
                  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                  required
                  disabled={modalLoading}
                >
                  <option value="">Ustozni tanlang</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition"
                  disabled={modalLoading}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={modalLoading}
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
          <ModalWrapper onClose={() => setShowEditModal(false)} title="✏️ Sinfni tahrirlash">
            <div className="space-y-3">
              <input
                type="text"
                placeholder="Sinf nomi"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                required
                disabled={modalLoading}
              />
              
              <div>
                <label className="text-gray-300 font-medium block mb-2">Sinf rahbari:</label>
                <select
                  value={editForm.teacher || ""}
                  onChange={(e) => setEditForm({ ...editForm, teacher: Number(e.target.value) })}
                  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                  required
                  disabled={modalLoading}
                >
                  <option value="">Ustozni tanlang</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.first_name} {teacher.last_name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition"
                  disabled={modalLoading}
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={modalLoading}
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
          <ModalWrapper onClose={() => setShowDeleteModal(false)} title="⚠️ Sinfni o'chirish">
            <p className="text-gray-300 mb-6">
              <span className="text-yellow-400 font-semibold">
                {selectedClass?.name}
              </span>{" "}
              sinfini o'chirmoqchimisiz?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition"
                disabled={modalLoading}
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-400 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                disabled={modalLoading}
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

export default Classes;