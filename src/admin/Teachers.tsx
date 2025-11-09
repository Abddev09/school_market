import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { createUser, deleteUser, getUsers, updatePassword, updateUser } from "../hooks/apis";
import { toast } from "sonner";
import { CenteredProgressLoader } from "../components/loading";

interface User {
  id: number;
  username:string;
  first_name: string;
  last_name: string;
  role: number;
  gender: boolean;
  classe: number;
  password: string | number;
}

const Teachers = () => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<User | null>(null);
   const [selectedUser,setSelectedUser] = useState<User | null>(null)
    const [resetPassword,setResetPassword] = useState("")
    const [resetModal,setResetModal] = useState(false)
    const [loading,setLoading] = useState(false)
      const [submitting, setSubmitting] = useState(false);

  // ✅ Har bir modal uchun alohida state
  const [addForm, setAddForm] = useState({
    first_name: "",
    last_name: "",
    password: "",
    role: 2,
    gender: true,
  });

  const [editForm, setEditForm] = useState({
    id: 0,
    first_name: "",
    last_name: "",
    role: 2,
    gender: true,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 20;

  const fetchTeachers = async () => {
    try {
      setLoading(true);
      const res = await getUsers();
      const data = res.data.filter((u: User) => u.role === 2);
      setTeachers(data);
      setLoading(false)
    } catch (err) {
            setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  // ➕ Qo'shish
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await createUser(addForm);
      toast.success("Ustoz muvaffaqiyatli qo'shildi!");
      setShowModal(false);
      // ✅ Formani tozalash
      setAddForm({
        first_name: "",
        last_name: "",
        password: "",
        role: 2,
        gender: true,
      });
      fetchTeachers();
        setSubmitting(true);
    } catch {
          setSubmitting(false);
      toast.error("Ustozni qo'shishda xatolik!");
    }
  };

  // ✏️ Yangilash
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTeacher) return;

    try {
        setSubmitting(true);

      // ✅ editForm dan ma'lumotlarni yuborish
      const updateData = {
        id: editForm.id,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
        role: 2,
        gender: editForm.gender,
      };

      await updateUser(updateData);
      toast.success("Ustoz ma'lumotlari yangilandi!");
      
      // ✅ Modallarni yopish
      setShowEditModal(false);
      setSelectedTeacher(null);
      
      // ✅ Listni yangilash
      fetchTeachers();
          setSubmitting(false);

    } catch (error) {
          setSubmitting(false);
      console.error("Update xatosi:", error);
      toast.error("Yangilashda xatolik!");
    }
  };

  // 🗑️ O'chirish
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

  // 🔐 Parolni tiklash
    const handleResetPassword = async () => {
      if (!selectedUser) return;
      
      if (!resetPassword.trim()) {
        toast.error("Yangi parolni kiriting!");
        return;
      }

      try {
      setSubmitting(true);

        await updatePassword(selectedUser.id,resetPassword);
        
        toast.success("Parol muvaffaqiyatli tiklandi!");
        setResetModal(false);
        setSelectedUser(null);
        setResetPassword("");
        setSubmitting(false)
      } catch (error) {
            setSubmitting(false);
        console.error("Parolni tiklash xatosi:", error);
        toast.error("Parolni tiklashda xatolik!");
      }
    };
  

    // 🔍 Search va filter state'lari
  const [searchTerm, setSearchTerm] = useState("");
  const [filterClass, ] = useState<number>(0);

  // 🔍 Filter va search
  const filteredStudents = teachers.filter((student) => {
    const matchesSearch = 
      student.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.last_name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesClass = filterClass === 0 || student.classe === filterClass;
    
    return matchesSearch && matchesClass;
  });

  const totalPages = Math.ceil(filteredStudents.length / perPage);
  const paginated = filteredStudents.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-6 bg-gradient-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400 tracking-wide">
          Ustozlar ro'yxati  <span className="">: {teachers.length}</span>
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-md transition"
        >
          <FaPlus /> Ustoz qo'shish
        </motion.button>
      </div>
      {/* 🔍 Search va Filter */}
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
        
    


        {/* Clear filters button */}
        {(searchTerm) && (
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

      
           {/* Table */}
      <div className="overflow-x-auto rounded-xl shadow-lg bg-[#212121]/90 backdrop-blur-md border border-gray-700 overflow-scroll">
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
            {!loading ?  paginated.map((t, i) => (
              <motion.tr
                key={t.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="border-b border-gray-700 hover:bg-yellow-400/10 transition"
              >
                <td className="p-3 text-gray-300">{i+1}</td>
                <td className="p-3 text-gray-300">{t.username}</td>
                <td className="p-3 text-gray-100">{t.first_name}</td>
                <td className="p-3 text-gray-100">{t.last_name}</td>
                <td className="p-3 text-gray-400">{t.gender ? "Erkak" : "Ayol"}</td>
                <td className="p-3 flex justify-center gap-4">
                  <button
                    onClick={() => {
                      setSelectedTeacher(t);
                      // ✅ Edit formani to'ldirish
                      setEditForm({
                        id: t.id,
                        first_name: t.first_name,
                        last_name: t.last_name,
                        role: 2,
                        gender: t.gender,
                      });
                      setShowEditModal(true);
                    }}
                    className="text-yellow-400 hover:text-yellow-300 transition"
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={() => {
                      setSelectedTeacher(t);
                      setShowDeleteModal(true);
                    }}
                    className="text-red-500 hover:text-red-400 transition"
                  >
                    <FaTrash />
                  </button>
                  <button
                    className="bg-yellow-400 px-4 py-2 rounded-lg text-black font-bold text-md"
                    onClick={()=>{
                      setSelectedUser(t);
                      setResetModal(true);

                    }}
                  >
                    Parolni tiklash
                  </button>
                </td>
              </motion.tr>
            )) : <tr>
              <th colSpan={6}>
                <CenteredProgressLoader/>
                </th>
              </tr>}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
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

       {/*  Parolni reset qilish  */}
            <AnimatePresence>
              {resetModal && (
                <ModalWrapper onClose={()=> setResetModal(false)} title="O'qituvchi parolini tiklash">
                    <div className="space-y-3">
                      <p className="text-lg">F.I.O: {selectedUser?.first_name} {selectedUser?.last_name}</p>
                      <p>Login:  {selectedUser?.username}</p>
                      <input 
                      type="text"
                      placeholder="Yangi parol"
                      value={resetPassword}
                      onChange={(e) => setResetPassword(e.target.value )}
                      className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                      required
                      />
                    </div>
                    <div className="flex justify-end gap-3 mt-5">
                      <button
                        type="button"
                        onClick={() => setResetModal(false)}
                        className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition"
                      >
                        Bekor qilish
                      </button>
                      <button
                        disabled={submitting}
                        type="button"
                        onClick={handleResetPassword}
                        className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md"
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
              <ModalActions onClose={() => setShowModal(false)} submitting={submitting}/>
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
              <ModalActions onClose={() => setShowEditModal(false)} submitting={submitting}/>
            </form>
          </ModalWrapper>
        )}
      </AnimatePresence>

      {/* O'chirish Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <ModalWrapper onClose={() => setShowDeleteModal(false)} title="⚠️ Ustozni o'chirish">
            <p className="text-gray-300 mb-6">
              <span className="text-yellow-400 font-semibold">
                {selectedTeacher?.first_name} {selectedTeacher?.last_name}
              </span>{" "}
              ni o'chirmoqchimisiz?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-400 text-white font-semibold"
              >
                O'chirish
              </button>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>
    </div>
  );
};

/* 🔧 Qisqa komponentlar */
const ModalWrapper = ({
  children,
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
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="bg-[#212121]/95 text-gray-100 rounded-xl shadow-2xl w-full max-w-md p-6 border border-yellow-500/30"
    >
      <h2 className="text-xl font-semibold mb-4 text-yellow-400">{title}</h2>
      {children}
    </motion.div>
  </motion.div>
);

const ModalActions = ({ onClose, submitting }: { onClose: () => void; submitting: boolean }) => (
  <div className="flex justify-end gap-3 mt-5">
    <button
      type="button"
      onClick={onClose}
      disabled={submitting}
      className={`px-4 py-2 rounded border border-gray-600 transition ${
        submitting 
          ? 'bg-[#1a1a1a] text-gray-600 cursor-not-allowed' 
          : 'bg-[#2a2a2a] hover:bg-[#333] text-gray-100'
      }`}
    >
      Bekor qilish
    </button>
    <button
      disabled={submitting}
      type="submit"
      className={`px-4 py-2 rounded font-semibold shadow-md transition ${
        submitting
          ? 'bg-[#3a3a3a] text-gray-600 cursor-not-allowed'
          : 'bg-yellow-500 hover:bg-yellow-400 text-black'
      }`}
    >
      {submitting ? "Yuklanmoqda..." : "Saqlash"}
    </button>
  </div>
);

export default Teachers;