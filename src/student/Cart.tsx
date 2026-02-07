import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Trash2, ShoppingBag, AlertCircle, Loader2 } from "lucide-react";
import { createOrder, deleteCart, getMyCart, getOneUsers } from "../hooks/apis";
import { cache } from "../utils/cache";

interface ProductDetail {
  id: number;
  name: string;
  price: number;
  image: string;
  count: number; // Qoldiq soni
}

interface CartItem {
  id: number;
  product_detail: ProductDetail;
  student: number;
}


const Cart = () => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState<number>(0);
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isOrdering, setIsOrdering] = useState(false);
  
  useEffect(() => {
    fetchCart();
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const id = cache.getId() || "1";
      const res = await getOneUsers(id); 
      setBalance(res.data.ball || 0); 
    } catch {
      setBalance(0);
    }
  };

  const fetchCart = async () => {
    try {
      setLoading(true);
      const res = await getMyCart();
      // Handle both paginated and direct array responses
      const cartData = res.data.results || res.data;
      const cartArray = Array.isArray(cartData) ? cartData : [];
      setCart(cartArray);
      
      // Faqat mavjud (count > 0) mahsulotlarni default tanlash
      const availableItems = cartArray
        .filter((item: CartItem) => item.product_detail.count > 0)
        .map((item: CartItem) => item.id);
      
      setSelectedItems(availableItems);
    } catch {
      toast.error("Savatni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      setDeletingId(id);
      await deleteCart(id);
      setCart((prev) => prev.filter((item) => item.id !== id));
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
      toast.success("Mahsulot savatdan olib tashlandi!");
    } catch {
      toast.error("Olib tashlashda xatolik!");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleSelection = (id: number, count: number) => {
    // Faqat mavjud mahsulotlarni tanlash mumkin
    if (count === 0) {
      toast.warning("Bu mahsulot qolmagan!");
      return;
    }
    
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    // Faqat mavjud mahsulotlarni tanlash
    const availableItems = cart
      .filter((item) => item.product_detail.count > 0)
      .map((item) => item.id);
    
    if (selectedItems.length === availableItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(availableItems);
    }
  };

  const handleOrder = async () => {
    const today = new Date();
    const allowedDate = new Date(2026, 4, 20);

    const isSameDay =
      today.getFullYear() === allowedDate.getFullYear() &&
      today.getMonth() === allowedDate.getMonth() &&
      today.getDate() === allowedDate.getDate();

    if (!isSameDay) {
      toast.warning("⚠️ Bugun buyurtma berib bo'lmaydi! Faqat 2026-yil 20-May kuni xarid qilish mumkin!");
      return;
    }

    if (balance === 0) {
      toast.error("❌ Ballaringiz yetarli emas! Hozirgi balans: 0", {
        description: "Ballaringizni to'ldirib, qayta urinib ko'ring",
        duration: 4000
      });
      return;
    }

    if (selectedItems.length === 0) {
      toast.warning("⚠️ Buyurtma berish uchun kamida bitta mahsulot tanlang!");
      return;
    }

    const selectedProducts = cart.filter((item) => selectedItems.includes(item.id));
    
    // Qolmagan mahsulotlarni tekshirish
    const unavailableProducts = selectedProducts.filter(
      (item) => item.product_detail.count === 0
    );
    
    if (unavailableProducts.length > 0) {
      toast.error("❌ Tanlangan mahsulotlar ichida qolmagan mahsulotlar bor!", {
        description: "Iltimos, faqat mavjud mahsulotlarni tanlang",
        duration: 4000
      });
      return;
    }

    const totalPrice = getTotalPrice();

    if (balance < totalPrice) {
      toast.error("💸 Ballaringiz yetarli emas!", {
        description: `Kerakli: ${totalPrice} ball, Mavjud: ${balance} ball. Kamida ${totalPrice - balance} ball qo'shing.`,
        duration: 5000
      });
      return;
    }

    try {
      setIsOrdering(true);
      const productIds = selectedProducts.map((item) => item.product_detail.id);
      
      let successCount = 0;
      let failedProducts: string[] = [];

      for (const productId of productIds) {
        try {
          await createOrder({ product: productId });
          successCount++;
        } catch (err) {
          const failedProduct = selectedProducts.find(p => p.product_detail.id === productId);
          if (failedProduct) {
            failedProducts.push(failedProduct.product_detail.name);
          }
        }
      }

      if (successCount === productIds.length) {
        toast.success("✅ Buyurtma muvaffaqiyatli berildi!", {
          description: `${successCount} ta mahsulot uchun buyurtma yaratildi`,
          duration: 4000
        });
        
        setCart((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
        setSelectedItems([]);
        fetchProfile();
      } else if (successCount > 0) {
        toast.warning("⚠️ Qisman buyurtma berildi", {
          description: `${successCount} ta mahsulot muvaffaqiyatli. Muvaffaqiyatsiz: ${failedProducts.join(", ")}`,
          duration: 5000
        });
        
        const successfulIds = selectedProducts
          .filter(p => !failedProducts.includes(p.product_detail.name))
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
    } finally {
      setIsOrdering(false);
    }
  };

  const getTotalPrice = () => {
    return cart
      .filter((item) => selectedItems.includes(item.id))
      .reduce((sum, item) => sum + item.product_detail.price, 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#ffcc00] mx-auto mb-4" />
          <p className="text-gray-400">Savat yuklanmoqda...</p>
        </div>
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
        <ShoppingBag size={64} className="mb-4 opacity-50" />
        <p className="text-lg">Savat bo'sh</p>
        <p className="text-sm text-gray-500">Mahsulot qo'shganingizda shu yerda ko'rinadi</p>
      </motion.div>
    );
  }

  const totalPrice = getTotalPrice();
  const isBalanceSufficient = balance >= totalPrice;
  const availableItemsCount = cart.filter(item => item.product_detail.count > 0).length;

  return (
    <div className="p-6 min-h-screen bg-[#0f0f0f] text-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-[#ffcc00]">Savatcha</h1>
        
        <button
          onClick={handleSelectAll}
          disabled={availableItemsCount === 0}
          className="px-4 py-2 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl hover:bg-[#2a2a2a] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {selectedItems.length === availableItemsCount && availableItemsCount > 0
            ? "Hammasini bekor qilish"
            : "Hammasini tanlash"}
        </button>
      </div>

      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3 mb-8">
        {cart.map((item) => {
          const isAvailable = item.product_detail.count > 0;
          const isDeleting = deletingId === item.id;
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`bg-[#1a1a1a] rounded-2xl border-2 shadow-md p-4 flex flex-col transition-all relative ${
                selectedItems.includes(item.id)
                  ? "border-[#ffcc00]"
                  : "border-[#2a2a2a]"
              } ${!isAvailable ? "opacity-60 brightness-75" : ""}`}
            >
              {/* Qolmagan badge */}
              {!isAvailable && (
                <div className="absolute top-2 right-2 z-10">
                  <div className="flex items-center gap-1 px-3 py-1.5 bg-red-500/90 text-white rounded-lg text-xs font-semibold shadow-lg">
                    <AlertCircle size={14} />
                    <span>Qolmagan</span>
                  </div>
                </div>
              )}

              <div className="flex items-start justify-between mb-3">
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleToggleSelection(item.id, item.product_detail.count)}
                  disabled={!isAvailable}
                  className="w-5 h-5 accent-[#ffcc00] cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <img
                src={item.product_detail.image}
                alt={item.product_detail.name}
                onError={(e) => {
                  const target = e.currentTarget;
                  if (!target.src.includes("placeholder.png")) {
                    target.src = "/placeholder.png";
                  }
                }}
                className="rounded-xl w-full h-40 object-cover mb-3"
              />
              
              <h2 className="text-lg font-medium text-[#ffcc00]">
                {item.product_detail.name}
              </h2>
              
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-400">
                  Narxi: <span className="text-gray-200">{item.product_detail.price} ball</span>
                </p>
                <p className={`text-sm font-semibold ${
                  isAvailable ? "text-green-400" : "text-red-400"
                }`}>
                  Qoldiq: {item.product_detail.count} ta
                </p>
              </div>

              <button
                onClick={() => handleDelete(item.id)}
                disabled={isDeleting}
                className="mt-auto flex items-center justify-center gap-2 bg-red-500/80 hover:bg-red-500 text-white font-medium py-2 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={18} className="animate-spin" />
                    O'chirilmoqda...
                  </>
                ) : (
                  <>
                    <Trash2 size={18} />
                    O'chirish
                  </>
                )}
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* BUYURTMA BERISH */}
      <div className="bg-[#1a1a1a] border border-[#2a2a2a] rounded-2xl p-5 shadow-md">
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
          disabled={balance === 0 || selectedItems.length === 0 || !isBalanceSufficient || isOrdering}
          className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition ${
            balance === 0 || selectedItems.length === 0 || !isBalanceSufficient || isOrdering
              ? "bg-gray-600 text-gray-400 cursor-not-allowed"
              : "bg-gradient-to-r from-yellow-400 to-yellow-300 text-black hover:scale-[1.02]"
          }`}
        >
          {isOrdering ? (
            <>
              <Loader2 size={20} className="animate-spin" />
              Buyurtma berilmoqda...
            </>
          ) : (
            <>
              <ShoppingBag size={20} />
              Buyurtma berish ({selectedItems.length} ta mahsulot)
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default Cart;