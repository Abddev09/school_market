import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Package, Calendar, CheckCircle, Clock, XCircle, Hash, Loader2 } from "lucide-react";
import { getMyOrders } from "../hooks/apis";

interface ProductDetail {
  id: number;
  name: string;
  desc: string;
  price: number;
  count: number;
  image?: string;
}

interface OrderItem {
  id: number;
  code: string;
  date: string;
  receipt_date: string;
  status: string;
  student: number;
  product_detail: ProductDetail;
}



const Order = () => {
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await getMyOrders();
      setOrders(res.data);
    } catch {
      toast.error("Buyurtmalarni yuklashda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "1":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
            <Clock size={16} />
            <span>Kutilmoqda</span>
          </div>
        );
      case "2":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-500/20 text-blue-400 rounded-lg text-sm">
            <Package size={16} />
            <span>Yetkazilmoqda</span>
          </div>
        );
      case "3":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm">
            <CheckCircle size={16} />
            <span>Yetkazildi</span>
          </div>
        );
      case "0":
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm">
            <XCircle size={16} />
            <span>Bekor qilindi</span>
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-2 px-3 py-1 bg-gray-500/20 text-gray-400 rounded-lg text-sm">
            <Clock size={16} />
            <span>Noma'lum</span>
          </div>
        );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    
    const months = [
      "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
      "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"
    ];
    
    const weekDays = [
      "Yakshanba", "Dushanba", "Seshanba", "Chorshanba", 
      "Payshanba", "Juma", "Shanba"
    ];
    
    const day = date.getDate();
    const month = months[date.getMonth()];
    const year = date.getFullYear();
    const weekDay = weekDays[date.getDay()];
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    return `${weekDay}, ${day}-${month} ${year}-yil, ${hours}:${minutes}`;
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-[#ffcc00] mx-auto mb-4" />
          <p className="text-gray-400">Buyurtmalar yuklanmoqda...</p>
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-gray-400"
      >
        <Package size={64} className="mb-4 opacity-50" />
        <p className="text-lg">Buyurtmalar yo'q</p>
        <p className="text-sm text-gray-500">Birinchi buyurtmangizni berishdan boshlang</p>
      </motion.div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-[#0f0f0f] text-gray-100">
      <h1 className="text-2xl font-semibold mb-6 text-[#ffcc00] flex items-center gap-2">
        <Package size={28} />
        Mening Buyurtmalarim
      </h1>

      <div className="space-y-5">
        {orders.map((order) => (
          <motion.div
            key={order.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#1a1a1a] rounded-2xl border border-[#2a2a2a] shadow-md overflow-hidden"
          >
            {/* Header */}
            <div className="bg-[#1a1a1a] border-b border-[#2a2a2a] p-4">
              <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="bg-[#2a2a2a] rounded-lg p-2">
                    <Hash size={20} className="text-[#ffcc00]" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Buyurtma kodi</p>
                    <p className="font-semibold text-[#ffcc00] text-lg">{order.code}</p>
                  </div>
                </div>

                {getStatusBadge(order.status)}
              </div>

              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={14} />
                  <span>Buyurtma sanasi:</span>
                  <span className="text-gray-200">{formatDate(order.date)}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <Calendar size={14} />
                  <span>Yetkazish sanasi:</span>
                  <span className="text-gray-200">{formatDate(order.receipt_date)}</span>
                </div>
              </div>
            </div>

            {/* Product Detail */}
            <div className="p-4">
              {order.product_detail ? (
                <>
                  <div className="flex gap-4 bg-[#0f0f0f] rounded-xl p-4 border border-[#2a2a2a] relative transition-all">
                  
                    
                    {order.product_detail?.image && (
                      <img
                        src={order.product_detail.image}
                        alt={order.product_detail.name || "Mahsulot"}
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (!target.src.includes("placeholder.png")) {
                            target.src = "/placeholder.png";
                          }
                        }}
                        className="w-24 h-24 object-cover rounded-lg flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-[#ffcc00] mb-1">
                        {order.product_detail.name || "Noma'lum mahsulot"}
                      </h3>
                      {order.product_detail.desc && (
                        <p className="text-gray-400 text-sm mb-3 line-clamp-2">
                          {order.product_detail.desc}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-4">
                        {order.product_detail.price && (
                          <div className="flex items-center gap-2">
                            <span className="text-gray-400 text-sm">Narxi:</span>
                            <span className="text-[#ffcc00] font-semibold">
                              {order.product_detail.price} ball
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Total */}
                  {order.product_detail.price && (
                    <div className="mt-4 pt-4 border-t border-[#2a2a2a] flex justify-between items-center">
                      <span className="text-gray-400 text-lg">Jami to'lov:</span>
                      <span className="text-2xl font-bold text-[#ffcc00]">
                        {order.product_detail.price} ball
                      </span>
                    </div>
                  )}
                </>
              ) : (
                <div className="bg-[#0f0f0f] rounded-xl p-4 border border-[#2a2a2a] text-center text-gray-400">
                  Mahsulot ma'lumotlari topilmadi
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Order;