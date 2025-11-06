import { useEffect, useState } from "react";
import { Heart, ShoppingCart, PackageX, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { createCart, createFavourite, getFavourite, getProducts } from "../hooks/apis";

interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  image: string;
  count: number;
  is_active: boolean;
}

interface Favourite {
  id: number;
  product: number;
  student: number;
}



const Market = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [favourites, setFavourites] = useState<Favourite[]>([]);
  const [loading, setLoading] = useState(false);
  const [addingToCart, setAddingToCart] = useState<number | null>(null);
  const [togglingFav, setTogglingFav] = useState<number | null>(null);

  const userId = localStorage.getItem("id");

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res.data);

      // Faqat o'sha user ning sevimlilarini olish
      const favRes = await getFavourite();
      setFavourites(favRes.data);
    } catch (err) {
      console.error(err);
      toast.error("Ma'lumotlarni olishda xatolik!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Product ID bo'yicha favourite borligini tekshirish
  const isFavourite = (productId: number) =>
    favourites.some((f) => f.product === productId && f.student === Number(userId));

  const toggleFavourite = async (productId: number) => {
    if (togglingFav) return; // Agar boshqa favourite toggle qilinayotgan bo'lsa
    
    try {
      setTogglingFav(productId);
      
      if (isFavourite(productId)) {
        toast.info("Bu mahsulot allaqachon sevimlilarda ❤️");
        return;
      }

      const res = await createFavourite({ product: productId, student: userId });
      setFavourites([...favourites, res.data]);
      toast.success("Sevimlilarga qo'shildi 💛");
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi!");
    } finally {
      setTogglingFav(null);
    }
  };

  const addToCart = async (product: Product) => {
    // Agar mahsulot qolmagan bo'lsa
  

    // Agar mahsulot active emas bo'lsa
    if (!product.is_active) {
      toast.error("❌ Bu mahsulot hozirda mavjud emas!");
      return;
    }

    try {
      setAddingToCart(product.id);
      await createCart({ product: product.id, student: userId });
      toast.success("✅ Savatchaga qo'shildi 🛒");
    } catch (err) {
      toast.error("❌ Savatchaga qo'shishda xatolik!");
    } finally {
      setAddingToCart(null);
    }
  };

  // Faqat active mahsulotlarni ko'rsatish
  const activeProducts = products.filter((p) => p.is_active);

  if (loading)
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-[#121212]">
        <Loader2 size={48} className="animate-spin text-yellow-400 mb-4" />
        <p className="text-gray-400">Mahsulotlar yuklanmoqda...</p>
      </div>
    );

  return (
    <div className="p-6 min-h-screen bg-[#121212]">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-300">Market</h1>
        <p className="text-gray-400">
          {activeProducts.length} ta mahsulot
        </p>
      </div>

      {activeProducts.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-400">
          <PackageX size={64} className="mb-4 text-gray-600" />
          <p className="text-xl">Hozircha mahsulotlar yo'q</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {activeProducts.map((p) => {
            const isOutOfStock = p.count <= 0;
            const isLowStock = p.count <= 5 && p.count > 0;
            const isFav = isFavourite(p.id);
            const isAddingThisToCart = addingToCart === p.id;
            const isTogglingThisFav = togglingFav === p.id;

            return (
              <motion.div
                key={p.id}
                whileHover={{ scale: isOutOfStock ? 1 : 1.03 }}
                className={`relative bg-[#1e1e1e] border rounded-xl p-3 sm:p-4 shadow-lg transition-all ${
                  isOutOfStock
                    ? "border-red-500/30 opacity-100"
                    : "border-gray-700"
                }`}
              >
                {/* Stock badge */}
                <div 
                  className={`absolute top-2 left-2 sm:top-3 sm:left-3 px-2 py-1 rounded-md text-xs font-semibold z-20 ${
                    isOutOfStock 
                      ? "bg-red-500 text-white" 
                      : isLowStock 
                      ? "bg-orange-500/90 text-white" 
                      : "bg-green-500/90 text-white"
                  }`}
                >
                  {isOutOfStock ? "Qolmagan" : `${p.count} ta qoldi`}
                </div>

                {/* Heart icon - Favourite button */}
                <button
                  onClick={() => toggleFavourite(p.id)}
                  disabled={isTogglingThisFav}
                  className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full border transition z-20 ${
                    isFav
                      ? "bg-red-500/20 text-red-400 border-red-400/50"
                      : "bg-gray-800 text-gray-400 border-gray-700 hover:scale-110 hover:border-red-400/50"
                  } ${isTogglingThisFav ? "opacity-50 cursor-not-allowed" : ""}`}
                >
                  {isTogglingThisFav ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : (
                    <Heart
                      size={18}
                      fill={isFav ? "#ef4444" : "transparent"}
                      stroke={isFav ? "#ef4444" : "currentColor"}
                    />
                  )}
                </button>

                {/* Image */}
                <img
                  src={p.image || "/placeholder.png"}
                  alt={p.name}
                  onError={(e) => {
                    const target = e.currentTarget;
                    if (!target.src.includes("placeholder.png")) {
                      target.src = "/placeholder.png";
                    }
                  }}
                  className={`w-full h-32 sm:h-40 object-cover rounded-lg mb-2 sm:mb-3 border border-gray-700 ${
                    isOutOfStock ? "grayscale opacity-60" : ""
                  }`}
                />

                {/* Stock count badge */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-gray-400 text-xs">Mavjud:</span>
                  <span
                    className={`font-semibold text-sm ${
                      isOutOfStock
                        ? "text-red-400"
                        : isLowStock
                        ? "text-orange-400"
                        : "text-green-400"
                    }`}
                  >
                    {p.count} ta
                  </span>
                </div>

                {/* Title and desc */}
                <h2 className="text-base sm:text-lg font-semibold capitalize text-gray-200">
                  {p.name}
                </h2>
                <p className="text-gray-400 text-xs sm:text-sm line-clamp-2 mb-1">
                  {p.desc}
                </p>
                <p className="text-yellow-300 font-bold mt-1 sm:mt-2 text-sm sm:text-base">
                  {p.price} ball
                </p>

                {/* Cart button */}
                <button
                  onClick={() => addToCart(p)}
                  disabled={isAddingThisToCart}
                  className={`mt-2 sm:mt-3 w-full py-1.5 sm:py-2 rounded-md sm:rounded-lg flex items-center justify-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base transition-transform ${
                    isAddingThisToCart
                      ? "bg-gray-600 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-yellow-400 to-yellow-300 text-black hover:scale-[1.02]"
                  }`}
                >
                  {isAddingThisToCart ? (
                    <>
                      <Loader2 size={16} className="animate-spin sm:size-4" />
                      Qo'shilmoqda...
                    </>
                  )  : (
                    <>
                      <ShoppingCart size={16} className="sm:size-4" />
                      Savatga Qo'shish
                    </>
                  )}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Market;