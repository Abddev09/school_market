import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { deleteCart, createOrder, getMyCart, getOneUsers } from "../hooks/apis";
import { toast } from "sonner";
import { Trash2, ShoppingBag, AlertCircle } from "lucide-react";

interface CartItem {
  id: number;
  product_detail: {
    id: number;
    title: string;
    price: number;
    image: string;
  };
  student: number;
}

const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  
  useEffect(() => {
    fetchCart();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const id = localStorage.getItem("id");
      const res = await getOneUsers(id); 
      setBalance(res.data.ball || 0); 
    } catch {
      setBalance(0);
    }
  };

  const fetchCart = async () => {
    try {
      const res = await getMyCart();
      console.log(res.data);
      setCart(res.data);
      // Barchasi default tarzda tanlanadi
      setSelectedItems(res.data.map((item: CartItem) => item.id));
    } catch {
      toast.error("Savatni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await deleteCart(id);
      setCart((prev) => prev.filter((item) => item.id !== id));
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
      toast.success("Mahsulot savatdan olib tashlandi!");
    } catch {
      toast.error("Olib tashlashda xatolik!");
    }
  };

  const handleToggleSelection = (id: number) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cart.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.id));
    }
  };

  const handleOrder = async () => {

    const today = new Date();

  // 2️⃣ Ruxsat berilgan sana — 25 May 2026
  const allowedDate = new Date(2026, 4, 25); // Eslatma: 4 = May (0-based index)

  // 3️⃣ Faqat sana qismini solishtiramiz (soatni emas)
  const isSameDay =
    today.getFullYear() === allowedDate.getFullYear() &&
    today.getMonth() === allowedDate.getMonth() &&
    today.getDate() === allowedDate.getDate();

  // 4️⃣ Agar bugun 25 May 2026 bo‘lmasa — warning chiqsin
  if (!isSameDay) {
    toast.warning("⚠️ Bugun buyurtma berib bo‘lmaydi! Faqat 25-May 2026 kuni mumkin!");
    return;
  }

    // Agar balans 0 bo'lsa
    if (balance === 0) {
      toast.error("❌ Ballaringiz yetarli emas! Hozirgi balans: 0", {
        description: "Ballaringizni to'ldirib, qayta urinib ko'ring",
        duration: 4000
      });
      return;
    }

    // Agar hech narsa tanlanmagan bo'lsa
    if (selectedItems.length === 0) {
      toast.warning("⚠️ Buyurtma berish uchun kamida bitta mahsulot tanlang!");
      return;
    }



    // Tanlangan mahsulotlar va ularning umumiy narxi
    const selectedProducts = cart.filter((item) => selectedItems.includes(item.id));
    const totalPrice = getTotalPrice();

    // Agar balans yetarli bo'lmasa
    if (balance < totalPrice) {
      toast.error("💸 Ballaringiz yetarli emas!", {
        description: `Kerakli: ${totalPrice} ball, Mavjud: ${balance} ball. Kamida ${totalPrice - balance} ball qo'shing.`,
        duration: 5000
      });
      return;
    }

    try {
      // Har bir product uchun alohida so'rov yuboramiz
      const productIds = selectedProducts.map((item) => item.product_detail.id);
      
      let successCount = 0;
      let failedProducts = [];

      for (const productId of productIds) {
        try {
          await createOrder({ product: productId });
          successCount++;
        } catch (err) {
          const failedProduct = selectedProducts.find(p => p.product_detail.id === productId);
          if (failedProduct) {
            failedProducts.push(failedProduct.product_detail.title);
          }
        }
      }

      // Natijalarni ko'rsatish
      if (successCount === productIds.length) {
        toast.success("✅ Buyurtma muvaffaqiyatli berildi!", {
          description: `${successCount} ta mahsulot uchun buyurtma yaratildi`,
          duration: 4000
        });
        
        // Buyurtma berilgan mahsulotlarni savatdan o'chirish
        setCart((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        
        // Balansni yangilash
        fetchProfile();
      } else if (successCount > 0) {
        toast.warning("⚠️ Qisman buyurtma berildi", {
          description: `${successCount} ta mahsulot muvaffaqiyatli. Muvaffaqiyatsiz: ${failedProducts.join(", ")}`,
          duration: 5000
        });
        
        // Faqat muvaffaqiyatli buyurtma berilgan mahsulotlarni o'chirish
        const successfulIds = selectedProducts
          .filter(p => !failedProducts.includes(p.product_detail.title))
          .map(p => p.id);
        
        setCart((prev) => prev.filter((item) => !successfulIds.includes(item.id)));
        setSelectedItems((prev) => prev.filter(id => !successfulIds.includes(id)));
        
        fetchProfile();
      } else {
        toast.error("❌ Buyurtma berishda xatolik yuz berdi!", {
          description: "Iltimos, qaytadan urinib ko'ring",
          duration: 4000
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("❌ Buyurtma berishda xatolik yuz berdi!", {
        description: "Iltimos, qaytadan urinib ko'ring",
        duration: 4000
      });
    }
  };

  const getTotalPrice = () => {
    return cart
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.product_detail.price, 0);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh] text-gray-400 text-lg">
        Yuklanmoqda...
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400"
      >
        <p className="text-lg">Savat bo'sh</p>
        <p className="text-sm text-gray-500">Mahsulot qo'shganingda shu yerda ko'rinadi</p>
      </motion.div>
    );
  }

  const totalPrice = getTotalPrice();
  const isBalanceSufficient = balance >= totalPrice;

  return (
    <div className="p-6 min-h-screen bg-[#0f0f0f] text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#ffcc00]">Savatcha</h1>
        
        <button
          onClick={handleSelectAll}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:bg-[#2a2a2a] transition text-sm"
        >
          {selectedItems.length === cart.length ? "Hammasini bekor qilish" : "Hammasini tanlash"}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {cart.map((item) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`bg-[#1a1a1a] rounded-2xl border-2 shadow-md p-4 flex flex-col transition-all ${
              selectedItems.includes(item.id)
                ? "border-[#ffcc00]"
                : "border-[#2a2a2a]"
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <input
                type="checkbox"
                checked={selectedItems.includes(item.id)}
                onChange={() => handleToggleSelection(item.id)}
                className="w-5 h-5 accent-[#ffcc00] cursor-pointer"
              />
            </div>

            <img
              src={item.product_detail.image}
              alt={item.product_detail.title}
              onError={(e) => {
                const target = e.currentTarget;

                // 1. faqat agar hozirgi src fallback emas bo‘lsa, o‘zgartiramiz
                if (!target.src.includes("placeholder.png")) {
                  target.src = "/placeholder.png";
                }
              }}
              className="rounded-xl w-full h-40 object-cover mb-3"
            />
            <h2 className="text-lg font-medium text-[#ffcc00]">
              {item.product_detail.title}
            </h2>
            <p className="text-gray-400 mb-4">
              Narxi: <span className="text-gray-200">{item.product_detail.price} ball</span>
            </p>

            <button
              onClick={() => handleDelete(item.id)}
              className="mt-auto flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-500 text-white font-medium py-2 rounded-xl transition"
            >
              <Trash2 size={18} />
              O'chirish
            </button>
          </motion.div>
        ))}
      </div>

      {/* BUYURTMA BERISH */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 shadow-md">
        {/* Ogohlantirish - Agar balans yetarli bo'lmasa */}
        {selectedItems.length > 0 && !isBalanceSufficient && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-3">
            <AlertCircle size={20} className="text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="text-red-400 font-medium">Ballaringiz yetarli emas!</p>
              <p className="text-gray-400 mt-1">
                Kerakli: <span className="text-red-400 font-semibold">{totalPrice} ball</span> | 
                Mavjud: <span className="text-yellow-400 font-semibold">{balance} ball</span> | 
                Kamomad: <span className="text-red-400 font-semibold">{totalPrice - balance} ball</span>
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-400 text-sm">Tanlangan mahsulotlar:</p>
            <p className="text-xl font-semibold text-[#ffcc00]">
              {selectedItems.length} ta / Jami: {totalPrice} ball
            </p>
          </div>
          <div>
            <p className="text-gray-400 text-sm">Sizning ballaringiz:</p>
            <p className={`text-xl font-semibold ${isBalanceSufficient ? "text-[#ffcc00]" : "text-red-400"}`}>
              {balance} ball
            </p>
          </div>
        </div>

        <button
          onClick={handleOrder}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
            balance === 0 || selectedItems.length === 0 || !isBalanceSufficient
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-400 to-yellow-300 text-black hover:scale-[1.02]"
          }`}
          disabled={balance === 0 || selectedItems.length === 0 || !isBalanceSufficient}
        >
          <ShoppingBag size={20} />
          Buyurtma berish ({selectedItems.length} ta mahsulot)
        </button>
      </div>
    </div>
  );
};

export default Cart;