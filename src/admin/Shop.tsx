import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaPlus, FaEdit, FaTrash } from "react-icons/fa";
import { getProducts, createProduct, updateProduct, deleteProduct } from "../hooks/apis";
import { toast } from "sonner";
import { CenteredProgressLoader } from "../components/loading";

interface Product {
  id: number;
  name: string;
  desc: string;
  price: number | null;
  count: number;
  is_active: boolean;
  image: string | null;
  owner: number;
}

const Shop = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [loading ,setLoading] = useState(false)
  // ✅ Har bir modal uchun alohida state
  const [addForm, setAddForm] = useState({
    name: "",
    desc: "",
    price: null as number | null,
    count: 0,
    is_active: true,
    image: null as File | null,
  });

  const [editForm, setEditForm] = useState({
    id: 0,
    name: "",
    desc: "",
    price: null as number | null,
    count: 0,
    is_active: true,
    image: null as File | null,
  });

  const [currentPage, setCurrentPage] = useState(1);
  const perPage = 12;

  // 🛍️ Mahsulotlarni yuklash
  const fetchProducts = async () => {
    try {
      setLoading(true)
      const res = await getProducts();
      console.log(res.data)
      setProducts(res.data);
      setLoading(false)
    } catch (err) {
      setLoading(false)
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 📷 Rasm yuklash - yangilangan versiya
const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isEdit = false) => {
  const file = e.target.files?.[0];
  if (!file) return;

  // ✅ Fayl hajmini tekshirish (5MB = 5 * 1024 * 1024 bytes)
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (file.size > maxSize) {
    toast.error("Fayl hajmi 5MB dan oshmasligi kerak!");
    e.target.value = ""; // Input ni tozalash
    return;
  }

  // ✅ Fayl turini tekshirish
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    toast.error("Faqat rasm fayllari (JPG, PNG, GIF, WEBP) ruxsat etilgan!");
    e.target.value = "";
    return;
  }

  // ✅ Fayl nomini qisqartirish (30 belgi)
  let fileName = file.name;
  const fileExtension = fileName.split('.').pop();
  const nameWithoutExt = fileName.substring(0, fileName.lastIndexOf('.'));
  
  if (nameWithoutExt.length > 30) {
    fileName = nameWithoutExt.substring(0, 30) + '.' + fileExtension;
    toast.info("Fayl nomi 30 belgiga qisqartirildi");
  }

  // Yangi File obyekti yaratish (qisqartirilgan nom bilan)
  const renamedFile = new File([file], fileName, { type: file.type });

  if (isEdit) {
    setEditForm({ ...editForm, image: renamedFile });
  } else {
    setAddForm({ ...addForm, image: renamedFile });
  }
  
  // Preview uchun
  const reader = new FileReader();
  reader.onloadend = () => {
    setImagePreview(reader.result as string);
  };
  reader.readAsDataURL(file);
};

// ➕ Qo'shish - yangilangan versiya
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  // ✅ Validatsiya
  if (!addForm.name.trim()) {
    toast.error("Mahsulot nomini kiriting!");
    return;
  }

  if (!addForm.desc.trim()) {
    toast.error("Ta'rifni kiriting!");
    return;
  }

  try {
    setSubmitting(true);
    const formData = new FormData();
    formData.append("name", addForm.name);
    formData.append("desc", addForm.desc);
    formData.append("is_active", String(addForm.is_active));
    
    if (addForm.image) {
      formData.append("image", addForm.image);
    }

    await createProduct(formData);
    toast.success("Mahsulot muvaffaqiyatli qo'shildi!");
    setShowModal(false);
    setAddForm({
      name: "",
      desc: "",
      price: null,
      count: 0,
      is_active: true,
      image: null,
    });
    setImagePreview("");
    fetchProducts();
    setSubmitting(false);
  } catch (error: any) {
    setSubmitting(false);
    const errorMsg = error?.response?.data?.message || "Mahsulotni qo'shishda xatolik!";
    toast.error(errorMsg);
  }
};

// ✏️ Yangilash - yangilangan versiya
const handleUpdate = async (e: React.FormEvent) => {
  e.preventDefault();

  // ✅ Validatsiya
  if (!editForm.name.trim()) {
    toast.error("Mahsulot nomini kiriting!");
    return;
  }

  if (!editForm.desc.trim()) {
    toast.error("Ta'rifni kiriting!");
    return;
  }

  if (editForm.price !== null && editForm.price < 0) {
    toast.error("Narx manfiy bo'lishi mumkin emas!");
    return;
  }

  if (editForm.count < 0) {
    toast.error("Soni manfiy bo'lishi mumkin emas!");
    return;
  }

  try {
    setSubmitting(true);
    const formData = new FormData();
    formData.append("id", String(editForm.id));
    formData.append("name", editForm.name);
    formData.append("desc", editForm.desc);
    formData.append("is_active", String(editForm.is_active));
    
    if (editForm.price !== null) {
      formData.append("price", String(editForm.price));
    }
    
    formData.append("count", String(editForm.count));
    
    if (editForm.image) {
      formData.append("image", editForm.image);
    }
    
    await updateProduct(formData);
    toast.success("Mahsulot ma'lumotlari yangilandi!");
    setShowEditModal(false);
    setSelectedProduct(null);
    setImagePreview("");
    fetchProducts();
    setSubmitting(false);
  } catch (error: any) {
    setSubmitting(false);
    const errorMsg = error?.response?.data?.message || "Yangilashda xatolik!";
    toast.error(errorMsg);
  }
};

  // 🗑️ O'chirish
  const handleDelete = async () => {
    if (!selectedProduct) return;
    try {
      setSubmitting(true);
      await deleteProduct(selectedProduct.id);
      toast.success("Mahsulot o'chirildi!");
      setShowDeleteModal(false);
      setSelectedProduct(null);
      fetchProducts();
      setSubmitting(false);
    } catch {
      setSubmitting(false);
      toast.error("O'chirishda xatolik!");
    }
  };

  const totalPages = Math.ceil(products.length / perPage);
  const paginated = products.slice((currentPage - 1) * perPage, currentPage * perPage);

  return (
    <div className="p-6 bg-linear-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400 tracking-wide">
          Mahsulotlar do'koni
        </h1>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-md transition"
        >
          <FaPlus /> Mahsulot qo'shish
        </motion.button>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-6 beh">
        {loading ? (<div className="absolute left-[50%] translate-y-2.5"><CenteredProgressLoader/></div>) :  paginated.map((product, i) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-[#212121]/90 backdrop-blur-md border border-gray-700 rounded-xl overflow-hidden hover:border-yellow-500/50 transition shadow-lg"
          >
            {/* Image */}
            <div className="relative h-48 bg-[#1a1a1a] flex items-center justify-center overflow-hidden">
                <img
                  src={product.image || "/placeholder.png"}
                  alt={product.name}
                  onError={(e) => {
                  const target = e.currentTarget;

                  // 1. faqat agar hozirgi src fallback emas bo'lsa, o'zgartiramiz
                  if (!target.src.includes("placeholder.png")) {
                    target.src = "/placeholder.png";
                  }
                }}
                  className="w-full h-full object-cover"
                />
            
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-1 text-xs rounded-full font-semibold ${
                    product.is_active
                      ? "bg-green-500/20 text-green-400 border border-green-500"
                      : "bg-red-500/20 text-red-400 border border-red-500"
                  }`}
                >
                  {product.is_active ? "Faol" : "Nofaol"}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <h3 className="text-lg font-bold text-yellow-400 mb-2 truncate">
                {product.name}
              </h3>
              <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                {product.desc}
              </p>
              
              <div className="flex justify-between items-center mb-3">
                <div>
                  <p className="text-xs text-gray-500">Narxi:</p>
                  <p className="text-green-400 font-bold">
                    {product.price ? `${product.price.toLocaleString()} ball` : "Belgilanmagan"}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Soni:</p>
                  <p className="text-blue-400 font-bold">{product.count} dona</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-700">
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setEditForm({
                      id: product.id,
                      name: product.name,
                      desc: product.desc,
                      price: product.price,
                      count: product.count,
                      is_active: product.is_active,
                      image: null,
                    });
                    setImagePreview(product.image || "");
                    setShowEditModal(true);
                  }}
                  className="flex-1 bg-yellow-500/20 hover:bg-yellow-500/30 text-yellow-400 py-2 rounded transition flex items-center justify-center gap-2"
                >
                  <FaEdit /> Tahrirlash
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(product);
                    setShowDeleteModal(true);
                  }}
                  className="flex-1 bg-red-500/20 hover:bg-red-500/30 text-red-400 py-2 rounded transition flex items-center justify-center gap-2"
                >
                  <FaTrash /> O'chirish
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination */}
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

      {/* Qo'shish Modal */}
      <AnimatePresence>
        {showModal && (
          <ModalWrapper onClose={() => {
            setShowModal(false);
            setImagePreview("");
          }} title="✨ Yangi mahsulot qo'shish">
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              <input
                type="text"
                placeholder="Mahsulot nomi"
                value={addForm.name}
                onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                required
              />
              
              <textarea
                placeholder="Ta'rif"
                value={addForm.desc}
                onChange={(e) => setAddForm({ ...addForm, desc: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 min-h-[100px]"
                required
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active_add"
                  checked={addForm.is_active}
                  onChange={(e) => setAddForm({ ...addForm, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active_add" className="text-gray-300">
                  Faol mahsulot
                </label>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-2">Rasm yuklash:</label>
                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageChange(e, false)}
                  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded border border-yellow-500/30"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setImagePreview("");
                  }}
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
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`px-4 py-2 rounded font-semibold shadow-md transition ${
                    submitting
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
          <ModalWrapper onClose={() => {
            setShowEditModal(false);
            setImagePreview("");
          }} title="✏️ Mahsulotni tahrirlash">
            <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-2">
              <input
                type="text"
                placeholder="Mahsulot nomi"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
                required
              />
              
              <textarea
                placeholder="Ta'rif"
                value={editForm.desc}
                onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 min-h-[100px]"
                required
              />

              <input
                type="text"
                placeholder="ball"
                value={editForm.price || ""}
                onChange={(e) => setEditForm({ ...editForm, price: e.target.value ? Number(e.target.value) : null })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
              />

              <input
                type="text"
                placeholder="Soni"
                value={editForm.count}
                onChange={(e) => setEditForm({ ...editForm, count: Number(e.target.value) })}
                className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400"
              />

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active_edit"
                  checked={editForm.is_active}
                  onChange={(e) => setEditForm({ ...editForm, is_active: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="is_active_edit" className="text-gray-300">
                  Faol mahsulot
                </label>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-2">Rasm yuklash:</label>
                                <input
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                  onChange={(e) => handleImageChange(e, true)}
                  className="w-full border border-gray-600 bg-[#2a2a2a] p-2 rounded focus:outline-none focus:border-yellow-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-yellow-500 file:text-black hover:file:bg-yellow-400"
                />
                {imagePreview && (
                  <div className="mt-3">
                    <img
                      src={imagePreview}
                      alt="Preview"
                      className="w-full h-48 object-cover rounded border border-yellow-500/30"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setImagePreview("");
                  }}
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
                  type="button"
                  onClick={handleUpdate}
                  disabled={submitting}
                  className={`px-4 py-2 rounded font-semibold shadow-md transition ${
                    submitting
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
          <ModalWrapper onClose={() => setShowDeleteModal(false)} title="⚠️ Mahsulotni o'chirish">
            <p className="text-gray-300 mb-6">
              <span className="text-yellow-400 font-semibold">
                {selectedProduct?.name}
              </span>{" "}
              mahsulotini o'chirmoqchimisiz?
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowDeleteModal(false)}
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
                onClick={handleDelete}
                disabled={submitting}
                className={`px-4 py-2 rounded font-semibold transition ${
                  submitting
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

/* 🔧 Modal wrapper komponenti */
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

export default Shop;