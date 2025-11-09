import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash, FaEllipsisV, FaKey } from "react-icons/fa";
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
  classe_name: string;
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
  const [showActionsMenu, setShowActionsMenu] = useState(false);

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
      console.log(res)
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
      setNewClassName("");
      fetchClasses();
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

  useEffect(() => {
  if (selectedUser && selectedUser.classe_id) {
    setEditForm(prev => ({ ...prev, classe_id: selectedUser.classe_id }));
  }
}, [selectedUser]);


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
      const iddd = selectedStudent.student_id;
      const userAddd = {
        id: iddd,
      };
      await deleteUser(userAddd);

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
    <div className="p-3 sm:p-4 md:p-6 bg-gradient-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-xl md:rounded-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 md:mb-6 gap-3">
        <div className="flex justify-between items-center w-full">
          <div className="flex-1 min-w-0">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-yellow-400 tracking-wide">
            O'quvchilar ro'yxati
          </h1>
          <p className="text-gray-400 mt-1 md:mt-2 text-xs sm:text-sm">
            Jami: {filteredStudents.length} ta o'quvchi
          </p>
          </div>
          <div className="md:hidden relative">
          <button
            onClick={() => setShowActionsMenu(!showActionsMenu)}
            className="px-4 py-2 bg-yellow-500 text-black rounded-md transition flex items-center gap-2"
          >
            <FaEllipsisV size={18} />
          </button>
          
          {showActionsMenu && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setShowActionsMenu(false)}
              />
              <div className="absolute right-0 mt-2 w-56 bg-[#212121] border border-yellow-500/50 rounded-lg shadow-xl z-20 overflow-hidden">
                <button
                  onClick={() => {
                    setShowModal(true);
                    setShowActionsMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-[#2a2a2a] transition flex items-center gap-3"
                >
                  <FaPlus size={12} />
                  <span>O'quvchi qo'shish</span>
                </button>
                <button
                  onClick={() => {
                    setShowClassModal(true);
                    setShowActionsMenu(false);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-gray-300 hover:bg-[#2a2a2a] transition flex items-center gap-3 border-t border-yellow-500/30"
                >
                  <FaPlus size={12} />
                  <span>Sinf qo'shish</span>
                </button>
                <div 
                  onClick={() => setShowActionsMenu(false)}
                  className="border-t border-yellow-500/30 hover:bg-[#2a2a2a]"
                >
                  <ImportButton onImported={(data) => console.log("Import:", data)} />
                </div>
              </div>
            </>
          )}
          </div>
        </div>
        

        

        {/* Desktop Actions - Always visible */}
        <div className="max-md:hidden flex w-full justify-end  items-center gap-5">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 max-md:rounded-none max-md:text-[13px] max-md:w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-md transition"
          >
            <FaPlus size={12} />
            <span>O'quvchi qo'shish</span>
          </button>
          <div>
            <ImportButton onImported={(data) => console.log("Import:", data)} />
          </div>
          <button
            onClick={() => setShowClassModal(true)}
            className="flex items-center gap-2 max-md:rounded-none max-md:text-[13px] max-md:w-full bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-md transition"
          >
            <FaPlus size={12} />
            <span>Sinf qo'shish</span>
          </button>
        </div>

        {/* Mobile Actions Menu */}
        
      </div>

      {/* Class Filter Cards */}
      <div className="mb-4 md:mb-6 flex gap-2 flex-wrap">
        <button
          onClick={() => {
            setSelectedClassName(null);
            setCurrentPage(1);
          }}
          className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
            selectedClassName === null
              ? "bg-[#2a2a2a] text-gray-100 border-2 border-yellow-500"
              : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222] border border-yellow-500/30"
          }`}
        >
          Hammasi ({students.length})
        </button>
        {uniqueClasses.map((className) => {
          const count = students.filter((s) => s.classe_name === className).length;
          return (
            <button
              key={className}
              onClick={() => {
                setSelectedClassName(className);
                setCurrentPage(1);
              }}
              className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-xs sm:text-sm transition-all ${
                selectedClassName === className
                  ? "bg-[#2a2a2a] text-gray-100 border-2 border-yellow-500"
                  : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222] border border-yellow-500/30"
              }`}
            >
              {className} ({count})
            </button>
          );
        })}
      </div>

      {/* Search Bar */}
      <div className="mb-4 md:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center bg-[#212121]/90 p-3 md:p-4 rounded-lg md:rounded-xl border border-yellow-500/30">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Ism yoki familiya bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-yellow-500/40 bg-[#2a2a2a] p-2 sm:p-2.5 text-xs sm:text-sm rounded-lg focus:outline-none focus:border-yellow-500 text-gray-100 placeholder-gray-500"
          />
        </div>

        {searchTerm && (
          <button
            onClick={() => {
              setSearchTerm("");
              setCurrentPage(1);
            }}
            className="px-3 sm:px-4 py-2 sm:py-2.5 text-xs sm:text-sm bg-[#2a2a2a] hover:bg-[#333] text-gray-300 rounded-lg transition border border-yellow-500/40 whitespace-nowrap"
          >
            Tozalash
          </button>
        )}
      </div>

      {/* Students Table - Desktop */}
      <div className="hidden md:block overflow-x-auto rounded-xl shadow-lg bg-[#212121]/90 backdrop-blur-md border border-gray-700">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Ma'lumot topilmadi
          </div>
        ) : (
          <table className="w-full border-collapse">
            <thead className="bg-[#2a2a2a] text-yellow-400 uppercase text-xs font-semibold">
              <tr className="bg-[#2a2a2a] text-yellow-400 uppercase text-xs font-semibold">
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  #
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Ism Familiya
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Login
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Sinf
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Ball
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium uppercase">
                  Jinsi
                </th>
                <th className="px-4 py-3 text-xs font-medium uppercase text-center">
                  Amallar
                </th>
              </tr>
            </thead>
            <tbody className="bg-[#1a1a1a] divide-y divide-yellow-500/20">
              {paginated.map((s, i) => (
                <tr 
                  key={s.student_id}
                  className="hover:bg-[#212121] transition-colors"
                >
                  <td className="px-4 py-3  text-sm text-gray-300">
                    {(currentPage - 1) * perPage + i + 1}
                  </td>
                  <td className="px-4 py-3  text-sm font-medium text-gray-100">
                    {s.first_name} {s.last_name}
                  </td>
                  <td className="px-4 py-3  text-sm text-gray-400">
                    {s.username}
                  </td>
                  <td className="px-4 py-3  text-sm text-gray-300">
                    {s.classe_name}
                  </td>
                  <td className="px-4 py-3  text-sm text-gray-300">
                    {s.ball}
                  </td>
                  <td className="px-4 py-3  text-sm text-gray-300">
                    {s.gender ? "Erkak" : "Ayol"}
                  </td>
                  <td className="px-4 py-3  text-sm flex justify-center">
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setEditForm({
                            id: s.student_id,
                            first_name: s.first_name,
                            last_name: s.last_name,
                            gender: s.gender,
                            classe_id: s.classe_id || 0,
                          });
                          setShowEditModal(true);
                        }}
                        className="px-3 py-1.5 text-yellow-400 hover:text-yellow-300 transition flex items-center gap-1.5 "
                        title="Tahrirlash"
                      >
                        <FaEdit size={12} />
                      </button>
                      
                      
                      <button
                        onClick={() => {
                          setSelectedStudent(s);
                          setShowDeleteModal(true);
                        }}
                        className="px-3 py-1.5 text-red-500 hover:text-red-400 transition flex items-center gap-1.5"
                        title="O'chirish"
                      >
                        <FaTrash size={12} />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(s);
                          setResetModal(true);
                        }}
                        className="bg-yellow-400 flex justify-center items-center gap-2 px-4 py-2 rounded-lg text-black font-bold text-sm hover:bg-yellow-300 transition"
                        title="Parolni tiklash"
                      >
                        <FaKey size={12} /> Parolni tiklash
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Students Cards - Mobile */}
      <div className="md:hidden space-y-3">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="w-12 h-12 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : paginated.length === 0 ? (
          <div className="text-center py-12 text-gray-400 text-sm">
            Ma'lumot topilmadi
          </div>
        ) : (
          paginated.map((s, i) => (
            <div
              key={s.student_id}
              className="bg-[#212121]/90 border border-yellow-500/30 rounded-lg p-3 sm:p-4 hover:border-yellow-500/50 transition-all"
            >
              <div className="flex flex-col gap-3">
                {/* Student Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3">
                    {/* Number Badge */}
                    <div className="flex-shrink-0 w-8 h-8 bg-[#2a2a2a] border border-yellow-500/50 rounded-full flex items-center justify-center">
                      <span className="text-gray-300 font-bold text-xs">
                        {(currentPage - 1) * perPage + i + 1}
                      </span>
                    </div>
                    
                    {/* Student Details */}
                    <div className="flex-1 ">
                        <h3 className="text-sm font-semibold text-gray-100 truncate capitalize">
                        {s.first_name} {s.last_name}
                      </h3>
                      <p className="text-xs text-gray-400 truncate">{s.username}</p>
                      
                      {/* Info Grid */}
                      <div className="mt-2 flex gap-4 text-xs">
                        <span className="px-2 py-1  text-black rounded border bg-yellow-500/80">
                          Sinf: {s.classe_name}
                        </span>
                        <span className="px-2 py-1 bg-[#2a2a2a] text-gray-300 rounded border border-yellow-500/40">
                          {s.gender ? "Erkak" : "Ayol"}
                        </span>
                        <span className="px-2 py-1  text-black rounded border bg-yellow-500/80">
                          Ball: {s.ball}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => {
                      setSelectedStudent(s);
                      setEditForm({
                        id: s.student_id,
                        first_name: s.first_name,
                        last_name: s.last_name,
                        gender: s.gender,
                        classe_id: s.classe_id || 0,
                      });
                      setShowEditModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg hover:bg-[#333] transition flex items-center justify-center gap-1.5 text-xs border border-yellow-500/40 hover:border-yellow-500"
                  >
                    <FaEdit size={12} />
                    <span>Tahrirlash</span>
                  </button>
                  
                  
                  <button
                    onClick={() => {
                      setSelectedStudent(s);
                      setShowDeleteModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg hover:bg-[#333] transition flex items-center justify-center gap-1.5 text-xs border border-yellow-500/40 hover:border-yellow-500"
                  >
                    <FaTrash size={12} />
                    <span>O'chirish</span>
                  </button>
                  <button
                    onClick={() => {
                      setSelectedUser(s);
                      setResetModal(true);
                    }}
                    className="flex-1 px-3 py-2 bg-[#2a2a2a] text-gray-300 rounded-lg hover:bg-[#333] transition flex items-center justify-center gap-1.5 text-xs border border-yellow-500/40 hover:border-yellow-500"
                  >
                    <FaKey size={12} />
                    <span>Parol</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center mt-6 gap-2 flex-wrap">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition ${
                currentPage === i + 1
                  ? "bg-[#2a2a2a] text-gray-100 border-2 border-yellow-500"
                  : "bg-[#1a1a1a] text-gray-400 hover:bg-[#222] border border-yellow-500/30"
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
          <div className="bg-[#1e1e1e] p-5 sm:p-6 rounded-xl md:rounded-2xl border border-yellow-500/50 w-full max-w-md">
            <h3 className="text-lg sm:text-xl font-bold text-yellow-400 mb-4">
              Yangi sinf yaratish
            </h3>
            <input
              type="text"
              placeholder="Sinf nomi..."
              value={newClassName}
              onChange={(e) => setNewClassName(e.target.value)}
              disabled={modalLoading}
              className="w-full bg-[#2a2a2a] border border-yellow-500/40 rounded-lg p-2.5 sm:p-3 text-xs sm:text-sm mb-4 focus:outline-none focus:border-yellow-500 text-gray-100 disabled:opacity-50"
            />
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowClassModal(false)}
                disabled={modalLoading}
                className="px-4 py-2 text-xs sm:text-sm bg-[#2a2a2a] border border-yellow-500/40 rounded-lg text-gray-300 hover:bg-[#333] disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleCreateClass}
                disabled={modalLoading}
                className="px-4 py-2 text-xs sm:text-sm bg-yellow-500 text-black rounded-lg font-medium hover:bg-yellow-400 disabled:opacity-50 flex items-center justify-center gap-2"
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
            <div className="space-y-2 sm:space-y-3">
              <p className="text-base sm:text-lg">
                F.I.O: {selectedUser?.first_name} {selectedUser?.last_name}
              </p>
              <p className="text-xs sm:text-sm">Login: {selectedUser?.username}</p>
              <input
                type="text"
                placeholder="Yangi parol"
                value={resetPasswordValue}
                onChange={(e) => setResetPasswordValue(e.target.value)}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 text-xs sm:text-sm rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
            </div>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-5">
              <button
                type="button"
                onClick={() => setResetModal(false)}
                disabled={modalLoading}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={modalLoading}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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
            <div className="space-y-2 sm:space-y-3">
              <input
                type="text"
                placeholder="Ism"
                value={addForm.first_name}
                onChange={(e) => setAddForm({ ...addForm, first_name: e.target.value })}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 text-xs sm:text-sm rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
              <input
                type="text"
                placeholder="Familiya"
                value={addForm.last_name}
                onChange={(e) => setAddForm({ ...addForm, last_name: e.target.value })}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 text-xs sm:text-sm rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
              <input
                type="password"
                placeholder="Parol"
                value={addForm.password}
                onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 text-xs sm:text-sm rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                <label className="text-gray-300 font-medium text-xs sm:text-sm">Jinsi:</label>
                <select
                  value={addForm.gender ? "true" : "false"}
                  onChange={(e) => setAddForm({ ...addForm, gender: e.target.value === "true" })}
                  disabled={modalLoading}
                  className="border border-gray-600 bg-[#2a2a2a] p-2 text-xs sm:text-sm rounded focus:border-yellow-400 disabled:opacity-50"
                >
                  <option value="true">Erkak</option>
                  <option value="false">Ayol</option>
                </select>
              </div>
              <div>
                <label className="text-gray-300 font-medium block mb-2 text-xs sm:text-sm">Sinfi:</label>
                <select
                  value={addForm.classe_id}
                  onChange={(e) => setAddForm({ ...addForm, classe_id: Number(e.target.value) })}
                  disabled={modalLoading}
                  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 text-xs sm:text-sm rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
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
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-5">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={modalLoading}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={modalLoading}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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
            <div className="space-y-2 sm:space-y-3">
              <input
                type="text"
                placeholder="Ism"
                value={editForm.first_name}
                onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 text-xs sm:text-sm rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
              <input
                type="text"
                placeholder="Familiya"
                value={editForm.last_name}
                onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                disabled={modalLoading}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 text-xs sm:text-sm rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
                required
              />
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 items-stretch sm:items-center">
                <label className="text-gray-300 font-medium text-xs sm:text-sm">Jinsi:</label>
                <select
                  value={editForm.gender ? "true" : "false"}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value === "true" })}
                  disabled={modalLoading}
                  className="border border-gray-600 bg-[#2a2a2a] p-2 text-xs sm:text-sm rounded focus:border-yellow-400 disabled:opacity-50"
                >
                  <option value="true">Erkak</option>
                  <option value="false">Ayol</option>
                </select>
              </div>
              <div>
                <label className="text-gray-300 font-medium block mb-2 text-xs sm:text-sm">Sinfi:</label>
                <select
  value={editForm.classe_id || ""}
  onChange={(e) =>
    setEditForm({
      ...editForm,
      classe_id: Number(e.target.value),
    })
  }
  disabled={modalLoading}
  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 text-xs sm:text-sm rounded focus:outline-none focus:border-yellow-400 disabled:opacity-50"
  required
>
  <option value="">Sinf ni tanlang</option>
  {classes.map((cls) => (
    <option key={cls.id} value={cls.id}>
      {cls.name}
    </option>
  ))}
</select>

              </div>
              <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3 mt-4 sm:mt-5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  disabled={modalLoading}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition disabled:opacity-50"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  disabled={modalLoading}
                  className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
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
            <p className="text-gray-300 mb-4 sm:mb-6 text-xs sm:text-sm">
              <span className="text-yellow-400 font-semibold">
                {selectedStudent?.first_name} {selectedStudent?.last_name}
              </span>{" "}
              ni o'chirmoqchimisiz?
            </p>
            <div className="flex flex-col sm:flex-row justify-end gap-2 sm:gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={modalLoading}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition disabled:opacity-50"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={modalLoading}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm rounded bg-red-500 hover:bg-red-400 text-white font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
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
    className="fixed inset-0 flex items-center justify-center bg-black/70 z-[9998] backdrop-blur-sm px-4"
    onClick={onClose}
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
      className="bg-[#212121]/95 text-gray-100 rounded-lg sm:rounded-xl shadow-2xl w-full max-w-md p-4 sm:p-5 md:p-6 border border-yellow-500/30"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-base sm:text-lg md:text-xl font-semibold mb-3 sm:mb-4 text-yellow-400">{title}</h2>
      {children}
    </motion.div>
  </motion.div>
);

export default MyStudents;