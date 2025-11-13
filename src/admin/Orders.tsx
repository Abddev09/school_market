
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEdit, FaTrash, FaClock, FaCheckCircle } from "react-icons/fa";
import { toast } from "sonner";
import { deleteOrder, getOrders, getStudentUsers, updateOrder } from "../hooks/apis";
import { CenteredProgressLoader } from "../components/loading";
import Pagination from "../components/Pagination";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
}

interface Order {
  id: number;
  student: number;
  product: number;
  date: string;
  receipt_date: string;
  code: number;
  status: "1" | "2";
  student_detail?: Student;
  product_detail: Product;
}


const Orders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [editForm, setEditForm] = useState({
    id: 0,
    status: "1" as "1" | "2",
    receipt_date: "",
  });

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 40;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("");

  const fetchOrders = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await getOrders(page);
      console.log(res)
      // DRF pagination javobini parse qilish
      if (res.data.results) {
        setOrders(res.data.results);
        setTotalCount(res.data.count);
      } else {
        // Agar pagination bo'lmasa (oddiy array)
        setOrders(res.data);
        setTotalCount(res.data.length);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error("Buyurtmalarni yuklashda xatolik");
    }
  };

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const res = await getStudentUsers();
      const studentsList = res.data.filter((u: any) => u.role === 3);
      setStudents(studentsList);
      
      setLoading(false)
    } catch (err) {
      setLoading(false)
      console.log("O'quvchilarni yuklashda xatolik!");
    }
  };


  useEffect(() => {
    fetchOrders();
    fetchStudents();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await updateOrder(editForm);
      toast.success("Buyurtma yangilandi!");
      setShowEditModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Update xatosi:", error);
      toast.error("Yangilashda xatolik!");
    }
  };

  const handleDelete = async () => {
    if (!selectedOrder) return;
    try {
      await deleteOrder(selectedOrder.id);
      toast.success("Buyurtma o'chirildi!");
      setShowDeleteModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      toast.error("O'chirishda xatolik!");
    }
  };

  const getStudentName = (studentId: number) => {
    const student = students.find(s => s.id === studentId);
    return student ? `${student.first_name} ${student.last_name}` : "Noma'lum";
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uz-UZ', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: "1" | "2") => {
    if (status === "1") {
      return (
        <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-500/20 text-yellow-400 text-xs font-semibold border border-yellow-500/30">
          <FaClock /> Kutishda
        </span>
      );
    }
    return (
      <span className="flex items-center gap-1 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-semibold border border-green-500/30">
        <FaCheckCircle /> Yakunlandi
      </span>
    );
  };

  const filteredOrders = orders.filter((order) => {
    const studentName = getStudentName(order.student).toLowerCase();
    const productName = order.product_detail.name.toLowerCase();
    const matchesSearch = 
      studentName.includes(searchTerm.toLowerCase()) ||
      productName.includes(searchTerm.toLowerCase());
    
    const matchesStatus = filterStatus === "" || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(totalCount / perPage);
  const paginated = filteredOrders.slice((currentPage - 1) * perPage, currentPage * perPage);
  const handlePageChange = (page: number) => {
    console.log("Hozirgi sahifa:", page);
    setCurrentPage(page);
    // Bu yerda fetchBooks(page) yoki filter logic bo‘ladi
  };
  const startIndex = (currentPage - 1) * perPage;

  return (
    <div className="p-6 bg-linear-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400 tracking-wide">
          Buyurtmalar ro'yxati
        </h1>
        <div className="flex gap-4 items-center">
          <div className="text-sm text-gray-400">
            Jami: <span className="text-yellow-400 font-semibold">{orders.length}</span> ta buyurtma
          </div>
        </div>
      </div>

      <div className="mb-6 flex gap-4 items-center bg-[#212121]/90 p-4 rounded-xl border border-gray-700">
        <div className="flex-1">
          <input
            type="text"
            placeholder="O'quvchi yoki mahsulot nomi bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-600 bg-[#2a2a2a] p-3 rounded-lg focus:outline-none focus:border-yellow-400 text-gray-100 placeholder-gray-500"
          />
        </div>
        
        <div className="relative w-48">
          <select
            value={filterStatus}
            onChange={(e) => {
              setFilterStatus(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 pr-10 border border-gray-600 bg-[#2a2a2a] p-3 rounded-lg focus:outline-none focus:border-yellow-400 text-gray-100 appearance-none"
          >
            <option value="">Barcha holatlar</option>
            <option value="1">Kutishda</option>
            <option value="2">Yakunlandi</option>
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

        {(searchTerm || filterStatus) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterStatus("");
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
              <th className="p-3">Buyurtma raqami</th>
              <th className="p-3">O'quvchi</th>
              <th className="p-3">Mahsulot</th>
              <th className="p-3">Buyurtma sanasi</th>
              <th className="p-3">Olib ketish sanasi</th>
              <th className="p-3">Holat</th>
              <th className="p-3 text-center">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (<tr>
              <th colSpan={8}> 
                <CenteredProgressLoader/>
              </th>
            </tr>) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
                  Buyurtmalar mavjud emas
                </td>
              </tr>
            ) : (
              paginated.map((order, i) => (
                <motion.tr
                  key={order.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-700 hover:bg-yellow-400/10 transition"
                >
                  <td className="p-3 text-gray-300">{startIndex +i+1}</td>
                  <td className="p-3 text-gray-300">{order?.code}</td>
                  <td className="p-3 text-gray-100">{getStudentName(order.student)}</td>
                  <td className="p-3 text-gray-100">{order.product_detail.name}</td>
                  <td className="p-3 text-gray-400 text-xs">{formatDate(order.date)}</td>
                  <td className="p-3 text-gray-400 text-xs">{formatDate(order.receipt_date)}</td>
                  <td className="p-3">{getStatusBadge(order.status)}</td>
                  <td className="p-3 flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setEditForm({
                          id: order.id,
                          status: order.status,
                          receipt_date: order.receipt_date,
                        });
                        setShowEditModal(true);
                      }}
                      className="text-yellow-400 hover:text-yellow-300 transition"
                      title="Tahrirlash"
                    >
                      <FaEdit />
                    </button>
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setShowDeleteModal(true);
                      }}
                      className="text-red-500 hover:text-red-400 transition"
                      title="O'chirish"
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
  <div className="mt-6">
    <Pagination
      totalPages={totalPages} 
      currentPage={currentPage} 
      onPageChange={handlePageChange} 
    />
  </div>
)}

      <AnimatePresence>
        {showEditModal && (
          <ModalWrapper onClose={() => setShowEditModal(false)} title="✏️ Buyurtmani tahrirlash">
            <div className="space-y-4">
              <div>
                <label className="text-gray-300 font-medium block mb-2">O'quvchi:</label>
                <input
                  type="text"
                  value={selectedOrder ? getStudentName(selectedOrder.student) : ""}
                  disabled
                  className="w-full border border-gray-600 bg-[#1a1a1a] p-2 rounded text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-2">Mahsulot:</label>
                <input
                  type="text"
                  value={selectedOrder ? selectedOrder.product_detail.name : ""}
                  disabled
                  className="w-full border border-gray-600 bg-[#1a1a1a] p-2 rounded text-gray-400 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-2">Holat:</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value as "1" | "2" })}
                  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                >
                  <option value="1">Kutishda</option>
                  <option value="2">Yakunlandi</option>
                </select>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-2">Olib ketish sanasi:</label>
                <input
                  type="datetime-local"
                  value={editForm.receipt_date ? new Date(editForm.receipt_date).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setEditForm({ ...editForm, receipt_date: e.target.value })}
                  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                />
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition"
                >
                  Bekor qilish
                </button>
                <button
                  type="button"
                  onClick={handleUpdate}
                  className="px-4 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold shadow-md"
                >
                  Saqlash
                </button>
              </div>
            </div>
          </ModalWrapper>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showDeleteModal && (
          <ModalWrapper onClose={() => setShowDeleteModal(false)} title="⚠️ Buyurtmani o'chirish">
            <p className="text-gray-300 mb-6">
              <span className="text-yellow-400 font-semibold">
                #{selectedOrder?.id}
              </span>{" "}
              buyurtmani o'chirmoqchimisiz?
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

export default Orders;