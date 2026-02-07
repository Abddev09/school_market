import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowLeft, FaUser,FaSchool, FaGraduationCap, FaEdit, FaTrash, FaKey } from "react-icons/fa";
import { getOneUsers, getMyStudents, getClassesByTeacher, updateUser, deleteUser, updatePassword, getClasses } from "../hooks/apis";
import { toast } from "sonner";
import { CenteredProgressLoader } from "../components/loading";

interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  role: number;
  gender: boolean;
  ball: number;
  classe_id: string;
  classe?: {
    id: number;
    name: string;
    teacher_id: number;
  };
  classe_name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

interface Class {
  id: number;
  name: string;
  teacher: number;
}

interface TeacherClass {
    id: number;
    classe_id: number;
    classe_name: string;
    teacher_id: number;
}

const UserProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [teacherClasses, setTeacherClasses] = useState<TeacherClass[]>([]);
  const [allClasses, setAllClasses] = useState<Class[]>([]);

  const roleString = localStorage.getItem("role");
  const currentUserRole = roleString ? Number(atob(roleString)) : 0;

  // Edit modal states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({ first_name: "", last_name: "" });

  // Password modal states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [newPassword, setNewPassword] = useState("");

  // Delete modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Class reassignment modal states
  const [showClassModal, setShowClassModal] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<number | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchUser = async () => {
    if (!id) {
      setError("User ID not provided");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await getOneUsers(Number(id));
      const userData = res.data;
      // Role-based access control
      // Admin (role 1) can view anyone
      // Teacher (role 2) can view only students from their own classes
      if (currentUserRole === 2) {
        // Teacher - check if student is in their class
        if (userData.role === 3) {
          // It's a student - check if in teacher's class
          const myStudentsRes = await getMyStudents(1);
          const myStudents = myStudentsRes.data.results || myStudentsRes.data;
          const isInMyClass = myStudents.some((s: any) => s.student_id === userData.id || s.id === userData.id);

          if (!isInMyClass) {
            setError("Sizning klassizga tegishli emas");
            setLoading(false);
            return;
          }
        } else {
          // Teacher trying to view non-student
          setError("Siz boshqa foydalanuvchilarni ko'ra olmaysiz");
          setLoading(false);
          return;
        }
      }

      setUser(userData);
      setEditForm({
        first_name: userData.first_name,
        last_name: userData.last_name,
      });

      // If viewing a teacher, fetch their classes
      if (userData.role === 2 && currentUserRole === 0) {
        try {
          const classesRes = await getClassesByTeacher(userData.id);
          const classesData = classesRes.data.results || classesRes.data;
          setTeacherClasses(Array.isArray(classesData) ? classesData : []);
        } catch (err) {
          console.error("Error fetching teacher classes:", err);
        }
      }

      // Fetch all classes for reassignment modal (admin only)
      if (currentUserRole === 0) {
        try {
          const allClassesRes = await getClasses(1);
          const allClassesData = allClassesRes.data.results || allClassesRes.data;
          setAllClasses(Array.isArray(allClassesData) ? allClassesData : []);
        } catch (err) {
          console.error("Error fetching classes:", err);
        }
      }

      setError(null);
    } catch (err) {
      console.error(err);
      setError("Foydalanuvchini yuklashda xatolik");
      toast.error("Foydalanuvchini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [id]);

  const getRoleLabel = (role: number) => {
    switch (role) {
      case 1:
        return "Admin";
      case 2:
        return "Ustoz";
      case 3:
        return "O'quvchi";
      default:
        return "Noma'lum";
    }
  };

  const getRoleBadgeColor = (role: number) => {
    switch (role) {
      case 1:
        return "bg-indigo-500/20 text-indigo-300";
      case 2:
        return "bg-yellow-500/20 text-yellow-300";
      case 3:
        return "bg-green-500/20 text-green-300";
      default:
        return "bg-gray-500/20 text-gray-300";
    }
  };

  const handleEditUser = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await updateUser({
        id: user.id,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
      });
      toast.success("Foydalanuvchi yangilandi");
      setShowEditModal(false);
      setUser({
        ...user,
        first_name: editForm.first_name,
        last_name: editForm.last_name,
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Yangilashda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    if (!user || !newPassword.trim()) {
      toast.error("Parol bo'sh bo'lishi mumkin emas");
      return;
    }
    setIsSubmitting(true);
    try {
      await updatePassword(user.id, newPassword);
      toast.success("Parol o'zgartirildi");
      setShowPasswordModal(false);
      setNewPassword("");
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Parol o'zgartirishda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    setIsSubmitting(true);
    try {
      await deleteUser({ id: user.id });
      toast.success("Foydalanuvchi o'chirildi");
      navigate(-1);
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "O'chirishda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReassignClass = async () => {
    if (!user || !selectedClassId) {
      toast.error("Sinf tanlanmadi");
      return;
    }
    setIsSubmitting(true);
    try {
      await updateUser({
        id: user.id,
        classe_id: selectedClassId,
      });
      toast.success("Sinf o'zgartirildi");
      setShowClassModal(false);
      setUser({
        ...user,
        classe: {
          teacher_id: user.classe?.teacher_id || 0,
          id: selectedClassId,
          name: allClasses.find((c) => c.id === selectedClassId)?.name || user.classe?.name || "Sinf topilmadi",
        },
      });
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || "Sinf o'zgartirishda xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-linear-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl flex items-center justify-center">
        <CenteredProgressLoader />
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="p-6 bg-linear-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg"
        >
          <FaArrowLeft /> Orqaga
        </motion.button>
        <div className="text-center text-red-400 text-lg">{error || "Foydalanuvchi topilmadi"}</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-linear-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-6 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg"
      >
        <FaArrowLeft /> Orqaga
      </motion.button>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {/* Profile Card */}
        <div className="md:col-span-1 relative">
          <div className="bg-[#212121]/90 backdrop-blur-md border border-gray-700 rounded-xl p-6 sticky top-6 h-full">
            <div className="flex flex-col justify-between h-full  items-center text-center">
              <div className="w-24 h-24 bg-linear-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center mb-4">
                <FaUser className="text-3xl text-black" />
              </div>
              <h1 className="text-2xl font-bold text-yellow-400 mb-2">
                {user.first_name} {user.last_name} <br />
              <span className="text-lg text-gray-400 mb-4">{user.username}</span>
              </h1>
              <span className={`px-4 py-2 absolute top-5 right-5 rounded-full text-sm font-semibold mb-4 ${getRoleBadgeColor(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>

              {/* Admin action buttons */}
              {currentUserRole === 0 && (
                <div className="flex flex-col gap-2 w-full">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowEditModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm transition"
                    title="Tahrirlash"
                  >
                    <FaEdit /> Tahrirlash
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowPasswordModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg text-sm transition"
                    title="Parol O'zgartirish"
                  >
                    <FaKey /> Parol O'zgartirish
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg text-sm transition"
                    title="O'chirish"
                  >
                    <FaTrash /> O'chirish
                  </motion.button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Details */}
        <div className="md:col-span-2 space-y-4">
          {/* Basic Info */}
          <div className="bg-[#212121]/90 backdrop-blur-md border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
              <FaUser /> Asosiy Ma'lumotlar
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-gray-400 text-sm">Ism</label>
                <p className="text-gray-100 font-medium">{user.first_name}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Familiya</label>
                <p className="text-gray-100 font-medium">{user.last_name}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Username</label>
                <p className="text-gray-100 font-medium">{user.username}</p>
              </div>
              <div>
                <label className="text-gray-400 text-sm">Jinsi</label>
                <p className="text-gray-100 font-medium">{user.gender ? "Erkak" : "Ayol"}</p>
              </div>
              
            </div>
          </div>

          {/* Teacher's Classes Section */}
          {user.role === 2 && teacherClasses.length > 0 && currentUserRole === 0 && (
            <div className="bg-[#212121]/90 backdrop-blur-md border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <FaSchool /> Ustozning Sinflari
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teacherClasses.map((cls) => (
                  <motion.button
                    key={cls.classe_id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate(`/students?class=${cls.classe_id}`)}
                    className="block w-full text-left px-4 py-3 bg-[#2a2a2a]/50 border border-yellow-500/30 hover:border-yellow-500 hover:bg-[#2a2a2a] rounded-lg transition"
                  >
                    <p className="text-yellow-400 hover:text-yellow-300 font-medium text-sm">{cls.classe_name}</p>
                  </motion.button>
                ))}
              </div>
            </div>
          )}

          {/* Role-Specific Info for Students */}
          {user.role === 3 && (
            <div className="bg-[#212121]/90 backdrop-blur-md border border-gray-700 rounded-xl p-6">
              <h2 className="text-xl font-bold text-yellow-400 mb-4 flex items-center gap-2">
                <FaGraduationCap /> O'quvchi Ma'lumotlari
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-gray-400 text-sm flex items-center gap-2">
                    <FaSchool /> Sinfi
                  </label>
                  <div className="flex justify-start items-center gap-4">
                    <a href={`/students?class=${user.classe?.id}`} className="text-yellow-500 hover:text-yellow-400  font-bold underline">{user.classe_name || user.classe?.name || "Sinf topilmadi"}</a>
                  {currentUserRole === 0 && (
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setShowClassModal(true)}
                      className="mt-2 px-3 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded text-sm"
                    >
                      Sinf O'zgartirish
                    </motion.button>
                  )}
                </div>
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Ball</label>
                  <p className="text-gray-100 font-medium">{user.ball ?? 0}</p>
                </div>
              </div>
            </div>
          )}

          {/* Additional Info */}
          <div className="bg-[#212121]/90 backdrop-blur-md border border-gray-700 rounded-xl p-6">
            <h2 className="text-xl font-bold text-yellow-400 mb-4">Qoʻshimcha Ma'lumotlar</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Foydalanuvchi ID:</span>
                <span className="text-gray-100 font-medium">{user.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Rol:</span>
                <span className="text-gray-100 font-medium">{getRoleLabel(user.role)}</span>
              </div>
              {user.classe_id && (
                <div className="flex justify-between">
                  <span className="text-gray-400">Sinf ID:</span>
                  <span className="text-gray-100 font-medium">{user.classe_id}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowEditModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#212121] border border-gray-700 rounded-xl p-6 max-w-md w-full"
            >
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Foydalanuvchini Tahrirlash</h3>
              <div className="space-y-3">
                {user.username === "sakura" && (
                  <div>
                    <label className="text-gray-400 text-sm">Username</label>
                    <input
                      type="text"
                      value={user.username}
                      disabled
                      className="w-full px-3 py-2 bg-[#1a1a1a] border border-gray-700 rounded-lg text-gray-500 cursor-not-allowed focus:outline-none"
                    />
                  </div>
                )}
                <div>
                  <label className="text-gray-400 text-sm">Ism</label>
                  <input
                    type="text"
                    value={editForm.first_name}
                    onChange={(e) => setEditForm({ ...editForm, first_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-500"
                  />
                </div>
                <div>
                  <label className="text-gray-400 text-sm">Familiya</label>
                  <input
                    type="text"
                    value={editForm.last_name}
                    onChange={(e) => setEditForm({ ...editForm, last_name: e.target.value })}
                    className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-500"
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold rounded-lg transition"
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleEditUser}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg disabled:opacity-50 transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saqlanmoqda..." : "Saqlash"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Password Modal */}
      <AnimatePresence>
        {showPasswordModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowPasswordModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#212121] border border-gray-700 rounded-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Parol O'zgartirish</h3>
              <div>
                <label className="text-gray-400 text-sm">Yangi Parol</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-[#2a2a2a] border border-gray-600 rounded-lg text-gray-100 focus:outline-none focus:border-yellow-500"
                  placeholder="Yangi parolni kiriting"
                />
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowPasswordModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold rounded-lg transition"
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleChangePassword}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg disabled:opacity-50 transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "O'zgartirilmoqda..." : "O'zgartirish"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDeleteModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#212121] border border-gray-700 rounded-xl p-6 max-w-sm w-full"
            >
              <h3 className="text-xl font-bold text-red-400 mb-2">Foydalanuvchini O'chirish</h3>
              <p className="text-gray-300 mb-4">
                Haqiqatan ham {user?.first_name} {user?.last_name} ni o'chirmoqchisiz? Bu amalni qaytarib bo'lmaydi.
              </p>
              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold rounded-lg transition"
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeleteUser}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold rounded-lg disabled:opacity-50 transition"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "O'chirilmoqda..." : "O'chirish"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Class Reassignment Modal */}
      <AnimatePresence>
        {showClassModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowClassModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-[#212121] border border-gray-700 rounded-xl p-6 max-w-sm w-full max-h-96 overflow-y-auto"
            >
              <h3 className="text-xl font-bold text-yellow-400 mb-4">Sinf O'zgartirish</h3>
              <div className="space-y-2">
                {allClasses.map((cls) => (
                  <motion.button
                    key={cls.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setSelectedClassId(cls.id)}
                    className={`w-full px-4 py-2 rounded-lg text-left transition ${
                      selectedClassId === cls.id
                        ? "bg-yellow-500 text-black font-semibold"
                        : "bg-[#2a2a2a] text-gray-100 border border-gray-600 hover:border-yellow-500"
                    }`}
                  >
                    {cls.name}
                  </motion.button>
                ))}
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowClassModal(false)}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-100 font-semibold rounded-lg transition"
                  disabled={isSubmitting}
                >
                  Bekor qilish
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleReassignClass}
                  className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold rounded-lg disabled:opacity-50 transition"
                  disabled={isSubmitting || !selectedClassId}
                >
                  {isSubmitting ? "O'zgartirilmoqda..." : "O'zgartirish"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default UserProfile;
