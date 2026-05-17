
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTrash, FaClock, FaCheckCircle, FaTimes } from "react-icons/fa";
import { toast } from "sonner";
import { deleteOrder, getOrders, getStudentUsers, updateOrder } from "../hooks/apis";
import { CenteredProgressLoader } from "../components/loading";
import Pagination from "../components/Pagination";
import { useNavigate } from "react-router-dom";

interface Student {
  id: number;
  first_name: string;
  last_name: string;
}

interface Product {
  id: number;
  name: string;
  price: number;
  image?: string;
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
  const [deleteLoading, setDeleteLoading] = useState(false);
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
      // If admin changed status to '2' (delivered) and previously wasn't '2', set receipt_date to now
      const payload: any = { ...editForm };
      if (selectedOrder && editForm.status === "2" && selectedOrder.status !== "2") {
        payload.receipt_date = new Date().toISOString();
      }

      await updateOrder(payload);
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
      setDeleteLoading(true);
      await deleteOrder(selectedOrder.id);
      toast.success("Buyurtma o'chirildi!");
      setShowDeleteModal(false);
      setSelectedOrder(null);
      fetchOrders();
    } catch {
      toast.error("O'chirishda xatolik!");
    } finally {
      setDeleteLoading(false);
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

  const navigate = useNavigate();

  

  const filteredOrders = orders.filter((order) => {
    const studentName = getStudentName(order.student).toLowerCase();
    const productName = order.product_detail.name.toLowerCase();
    const orderCode = order.code.toString();
    const matchesSearch = 
      studentName.includes(searchTerm.toLowerCase()) ||
      productName.includes(searchTerm.toLowerCase()) ||
      orderCode.includes(searchTerm);
    
    const matchesStatus = filterStatus === "" || order.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  // Sort: "Kutishda" (status "1") first, then "Yakunlandi" (status "2")
  const sortedOrders = [...filteredOrders].sort((a, b) => {
    if (a.status === b.status) return 0;
    return a.status === "1" ? -1 : 1;
  });

  const totalPages = Math.ceil(totalCount / perPage);
  const paginated = sortedOrders.slice((currentPage - 1) * perPage, currentPage * perPage);
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    // Bu yerda fetchBooks(page) yoki filter logic bo‘ladi
  };

  

  const deliverOrder = async (order: Order) => {
    try {
      setLoading(true);
      const payload: any = { id: order.id, status: "2", receipt_date: new Date().toISOString() };
      await updateOrder(payload);
      toast.success("Buyurtma yetkazildi sifatida belgilandi");
      fetchOrders();
    } catch (err) {
      console.error(err);
      toast.error("Buyurtmani topshirishda xatolik");
    } finally {
      setLoading(false);
    }
  };

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

      <div>
        {loading ? (
          <div className="rounded-xl p-6 bg-[#212121]/90 border border-gray-700">
            <CenteredProgressLoader />
          </div>
        ) : paginated.length === 0 ? (
          <div className="rounded-xl p-6 bg-[#212121]/90 border border-gray-700 text-center text-gray-400">
            Buyurtmalar mavjud emas
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {paginated.map((order, i) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.02 }}
                className="bg-gradient-to-b from-[#161616] to-[#0f0f0f] border border-gray-700 rounded-2xl p-5 shadow-2xl hover:scale-[1.02] transition-transform duration-200 ring-1 ring-transparent hover:ring-yellow-500/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs text-gray-400">Buyurtma #</p>
                    <h3 className="text-lg font-semibold text-yellow-400">{order.code}</h3>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                <div className="mt-4 flex gap-4 items-center">
                  <div className="w-20 h-20 bg-[#0f0f0f] border border-gray-700 rounded-lg flex items-center justify-center text-yellow-400 font-bold text-sm overflow-hidden flex-shrink-0">
                    {order.product_detail.image ? (
                      <img 
                        src={order.product_detail.image} 
                        alt={order.product_detail.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : null}
                    <div className={order.product_detail.image ? 'hidden' : ''}>
                      {order.product_detail.name.split(" ")[0]?.slice(0,2).toUpperCase()}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => navigate(`/product/${order.product_detail.id}`)}
                        className="text-lg font-semibold text-gray-100 truncate hover:underline"
                      >
                        {order.product_detail.name}
                      </button>
                      <div className="text-yellow-400 font-bold">{order.product_detail.price} ball</div>
                    </div>

                    <div className="text-sm text-gray-400 mt-1 truncate">Buyurtma sanasi: <span className="text-gray-200">{formatDate(order.date)}</span></div>

                    <div className="text-sm text-gray-400 mt-2">O'quvchi: <button onClick={() => navigate(`/user/${order.student}`)} className="text-gray-100 font-medium hover:underline">{getStudentName(order.student)}</button></div>
                  </div>
                </div>

                <div className="mt-4 flex justify-end items-center gap-2">
                  <button
                    onClick={() => { setSelectedOrder(order); setShowDeleteModal(true); }}
                    className="px-3 py-1 flex items-center justify-center gap-2 rounded bg-red-500 text-white font-semibold"
                    title="O'chirish"
                  >
                    <FaTrash />
                    Bekor qilish 
                  </button>
                  <button
                    onClick={() => deliverOrder(order)}
                    className="px-3 py-1 rounded bg-green-500 text-white font-semibold flex items-center gap-2 text-base"
                    title="Buyurtmani topshirish"
                  >
                    <FaCheckCircle />
                    Topshirish
                  </button>
                 

                </div>
                  
                  

                 
              </motion.div>
            ))}
          </div>
        )}
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
              <div className="text-sm text-gray-400">Olib ketish sanasi admin tomonidan holat "Yakunlandi" qilinsa avtomatik qo'yiladi.</div>

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
                disabled={deleteLoading}
                className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Bekor qilish
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteLoading}
                className="px-4 py-2 rounded bg-red-500 hover:bg-red-400 text-white font-semibold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {deleteLoading ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      className="inline-block"
                    >
                      <FaClock className="text-sm" />
                    </motion.div>
                    O'chirilmoqda...
                  </>
                ) : (
                  <>O'chirish</>
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
      className="bg-[#141414]/95 text-gray-100 rounded-2xl shadow-2xl w-full max-w-3xl p-6 border border-yellow-500/20"
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex items-start justify-between mb-4">
        <h2 className="text-xl font-semibold text-yellow-400">{title}</h2>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-200 p-2 rounded-full">
          <FaTimes />
        </button>
      </div>
      {children}
    </motion.div>
  </motion.div>
);

export default Orders;