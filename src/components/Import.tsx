import { motion } from "framer-motion";
import { FaPlus } from "react-icons/fa";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { importStudents } from "../hooks/apis"; // API funksiyang joylashgan joy

const ImportButton = ({ onImported }: { onImported: (data: any[]) => void }) => {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [studentsData, setStudentsData] = useState<any[]>([]);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls") && !fileName.endsWith(".csv")) {
      toast.error("Faqat .xlsx, .xls yoki .csv fayllar qabul qilinadi!");
      e.target.value = "";
      return;
    }

    try {
      toast.info("Import qilinmoqda...");
      const res = await importStudents(file);
      if (res.success) {
        setStudentsData(res.data); // Excel ichidagi studentlar
        setShowModal(true);
        toast.success(res.message || "Import muvaffaqiyatli!");
        onImported(res.data); // agar yangilanish kerak bo‘lsa
        window.location.reload()
      } else {
        toast.error(res.message || "Importda xatolik yuz berdi!");
      }
    } catch (err: any) {
      console.error("Import xatosi:", err);
      toast.error("Server bilan ulanishda xatolik!");
    }

    e.target.value = "";
  };

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.9 }}
        onClick={handleFileSelect}
        className="flex items-center gap-2 bg-yellow-500 hover:bg-yellow-400 text-black font-semibold px-4 py-2 rounded-lg shadow-md transition"
      >
        <FaPlus /> O‘quvchilarni Import qilish
      </motion.button>

      {/* Ko‘rinmas input */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileChange}
        accept=".xlsx,.xls,.csv"
      />

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-b from-[#2a2a2a] to-[#313131]  text-gray-100 rounded-xl shadow-2xl w-[90%] max-w-3xl p-6"
          >
            <h2 className="text-xl font-bold mb-4">Import qilingan o‘quvchilar</h2>
            <div className="max-h-80 overflow-y-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="bg-[#212121]">
                    <th className="px-3 py-2 border">#</th>
                    <th className="px-3 py-2 border">Username</th>
                    <th className="px-3 py-2 border">Ism</th>
                    <th className="px-3 py-2 border">Familiya</th>
                    <th className="px-3 py-2 border">Jinsi</th>
                  </tr>
                </thead>
                <tbody>
                  {studentsData.map((s, i) => (
                    <tr key={i} className="hover:bg-[#2c2c2c] text-center">
                      <td className="border px-3 py-2">{i + 1}</td>
                      <td className="border px-3 py-2">{s.username}</td>
                      <td className="border px-3 py-2">{s.first_name}</td>
                      <td className="border px-3 py-2">{s.last_name}</td>
                      <td className="border px-3 py-2">
                        {s.gender ? "Erkak" : "Ayol"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end mt-5">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowModal(false)}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
              >
                Yopish
              </motion.button>
            </div>
          </motion.div>
        </div>
      )}
    </>
  );
};

export default ImportButton;
