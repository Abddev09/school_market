import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getProduct } from "../hooks/apis";

interface Product {
  id: number;
  name: string;
  desc?: string;
  price?: number;
  image?: string;
  count?: number;
  is_active?: boolean;
}

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetchProduct(Number(id));
  }, [id]);

  const fetchProduct = async (pid: number) => {
    try {
      setLoading(true);
      const res = await getProduct(pid);
      setProduct(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Mahsulotni yuklashda xatolik");
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };
  if (loading) return (
    <div className="flex items-center justify-center min-h-screen bg-[#0f0f0f]">
      <Loader2 size={48} className="animate-spin text-yellow-400" />
    </div>
  );

  if (!product) return null;

  return (
    <div className="p-6 min-h-screen bg-[#0f0f0f] text-gray-100">
      <div className="max-w-3xl mx-auto bg-gradient-to-b from-[#141414] to-[#0f0f0f] rounded-2xl p-6 shadow-2xl border border-gray-700">
        <div className="flex flex-col md:flex-row gap-6">
          <img
            src={product.image || '/placeholder.png'}
            alt={product.name}
            onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.png'; }}
            className="w-full md:w-56 h-56 object-cover rounded-2xl border border-gray-700"
          />

          <div className="flex-1">
            <h1 className="text-2xl font-bold text-yellow-400">{product.name}</h1>
            {product.desc && <p className="text-gray-400 mt-3">{product.desc}</p>}

            <div className="mt-4 flex items-center gap-6">
              <div className="text-3xl font-bold text-yellow-400">{product.price ?? '—'} ball</div>
              <div className="text-sm text-gray-400">Mavjud: <span className="text-gray-100 font-medium">{product.count ?? '—'}</span></div>
            </div>

            <div className="mt-6">
              <p className="text-sm text-gray-400">Mahsulot kodi: <span className="text-gray-200 font-medium">{product.id}</span></p>
            </div>

            <div className="mt-6">
              <button onClick={() => navigate(-1)} className="px-4 py-2 rounded bg-[#2a2a2a] border border-gray-600 text-gray-100">Orqaga</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
