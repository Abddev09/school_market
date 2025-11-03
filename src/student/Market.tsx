import { useEffect, useState } from "react";
import { Heart, ShoppingCart } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  getProducts,
  createFavourite,
  getFavourite,
  createCart,
} from "../hooks/apis";

interface Product {
  id: number;
  name: string;
  desc: string;
  price: number;
  image: string;
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

  const userId = Number(atob(localStorage.getItem("id") || "0"));

  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await getProducts();
      setProducts(res.data);

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

  const isFavourite = (productId: number) =>
    favourites.some((f) => f.product === productId);

  const toggleFavourite = async (productId: number) => {
    try {
      if (isFavourite(productId)) {
        toast.info("Bu mahsulot allaqachon sevimlilarda ❤️");
        return;
      }

      const res = await createFavourite({ product: productId, student: userId });
      setFavourites([...favourites, res.data]);
      toast.success("Sevimlilarga qo‘shildi 💛");
    } catch (err) {
      console.error(err);
      toast.error("Xatolik yuz berdi!");
    }
  };

  const addToCart = async (productId: number) => {
    try {
      await createCart({ product: productId, student: userId });
      toast.success("Savatchaga qo‘shildi 🛒");
    } catch (err) {
      toast.error("Savatchaga qo‘shishda xatolik!");
    }
  };

  if (loading)
    return (
      <div className="flex justify-center items-center h-64 text-gray-400">
        Yuklanmoqda...
      </div>
    );

  return (
    <div className="p-6 min-h-screen bg-[#121212]">
      <h1 className="text-3xl font-bold text-yellow-300 mb-6">Market</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p) => (
          <motion.div
            key={p.id}
            whileHover={{ scale: 1.03 }}
            className="relative bg-[#1e1e1e] border border-gray-700 rounded-xl p-3 sm:p-4 shadow-lg transition-all"
          >
            {/* Heart icon */}
            <button
              onClick={() => toggleFavourite(p.id)}
              disabled={isFavourite(p.id)}
              className={`absolute top-2 right-2 sm:top-3 sm:right-3 p-2 rounded-full border border-gray-700 transition
                ${
                  isFavourite(p.id)
                    ? "bg-red-500/20 text-red-400 cursor-not-allowed"
                    : "bg-gray-800 text-gray-400 hover:scale-110"
                }`}
            >
              <Heart
                size={18}
                fill={isFavourite(p.id) ? "red" : "transparent"} // ❤️ to‘liq yonsin
                stroke={isFavourite(p.id) ? "red" : "currentColor"} // ❤️ chizig‘i ham qizil
              />
            </button>

            {/* Image */}
            <img
              src={p.image || "/placeholder.png"}
              alt={p.name}
              className="w-full h-32 sm:h-40 object-cover rounded-lg mb-2 sm:mb-3 border border-gray-700"
            />

            {/* Title and price */}
            <h2 className="text-base sm:text-lg font-semibold capitalize text-gray-200">
              {p.name}
            </h2>
            <p className="text-gray-400 text-xs sm:text-sm line-clamp-2">
              {p.desc}
            </p>
            <p className="text-yellow-300 font-bold mt-1 sm:mt-2 text-sm sm:text-base">
              {p.price} so‘m
            </p>

            {/* Cart button */}
            <button
              onClick={() => addToCart(p.id)}
              className="mt-2 sm:mt-3 w-full bg-gradient-to-r from-yellow-400 to-yellow-300 text-black py-1.5 sm:py-2 rounded-md sm:rounded-lg flex items-center justify-center gap-1 sm:gap-2 font-semibold text-sm sm:text-base hover:scale-[1.02] transition-transform"
            >
              <ShoppingCart size={10} className="sm:size-4" />
              Savatga Qo‘shish
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Market;
