import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye } from "react-icons/fa";
import { toast } from "sonner";
import { getHistory } from "../hooks/apis";
import { CenteredProgressLoader } from "../components/loading";
import Pagination from "../components/Pagination";

interface HistoryRecord {
  id: number;
  model: string;
  object_id: number | null;
  username: string | null;
  action: "create" | "update" | "delete" | "login" | "logout" | "login_failed";
  old_data: Record<string, any> | null;
  new_data: Record<string, any> | null;
  note: string | null;
  created_at: string;
}

const History = () => {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 40;

  const [searchTerm, setSearchTerm] = useState("");
  const [filterAction, setFilterAction] = useState<string>("");

  const fetchHistory = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await getHistory(page);
      
      if (res.data.results) {
        setHistory(res.data.results);
        setTotalCount(res.data.count);
      } else {
        setHistory(res.data);
        setTotalCount(res.data.length);
      }
      
      setLoading(false);
    } catch (err) {
      setLoading(false);
      console.log(err);
      toast.error("Arxivni yuklashda xatolik");
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const getUserName = (user: HistoryRecord["username"]) => {
    if (!user) return "Noma'lum";
    return user;
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

  const getActionBadge = (action: string) => {
    const actionStyles: Record<string, { bg: string; text: string; label: string }> = {
      create: { bg: "bg-green-500/20", text: "text-green-400", label: "Yaratildi" },
      update: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Yangilandi" },
      delete: { bg: "bg-red-500/20", text: "text-red-400", label: "O'chirildi" },
      login: { bg: "bg-cyan-500/20", text: "text-cyan-400", label: "Kirdi" },
      logout: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Chiqdi" },
      login_failed: { bg: "bg-orange-500/20", text: "text-orange-400", label: "Kirish muvaffaqiyatsiz" },
    };

    const style = actionStyles[action] || actionStyles.create;
    
    return (
      <span className={`px-3 py-1 rounded-full ${style.bg} ${style.text} text-xs font-semibold border ${style.bg.replace('20', '30')}`}>
        {style.label}
      </span>
    );
  };

  const filteredHistory = history.filter((record) => {
    const userName = getUserName(record.username).toLowerCase();
    const matchesSearch = 
      userName.includes(searchTerm.toLowerCase()) ||
      record.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (record.object_id?.toString() || "").includes(searchTerm.toLowerCase());
    
    const matchesAction = filterAction === "" || record.action === filterAction;
    
    return matchesSearch && matchesAction;
  });

  const totalPages = Math.ceil(totalCount / perPage);
  const paginated = filteredHistory.slice((currentPage - 1) * perPage, currentPage * perPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const startIndex = (currentPage - 1) * perPage;

  return (
    <div className="p-6 bg-linear-to-b from-[#2a2a2a] to-[#0f0f0f] min-h-[95vh] text-gray-100 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-yellow-400 tracking-wide">
          📋 Harakatlar Arxivi
        </h1>
        <div className="text-sm text-gray-400">
          Jami: <span className="text-yellow-400 font-semibold">{history.length}</span> ta yozuv
        </div>
      </div>

      <div className="mb-6 flex gap-4 items-center bg-[#212121]/90 p-4 rounded-xl border border-gray-700">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Foydalanuvchi yoki turdagi xarakat bo'yicha qidirish..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border border-gray-600 bg-[#2a2a2a] p-3 rounded-lg focus:outline-none focus:border-yellow-400 text-gray-100 placeholder-gray-500"
          />
        </div>
        
        <div className="relative w-56">
          <select
            value={filterAction}
            onChange={(e) => {
              setFilterAction(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 pr-10 border border-gray-600 bg-[#2a2a2a] p-3 rounded-lg focus:outline-none focus:border-yellow-400 text-gray-100 appearance-none"
          >
            <option value="">Barcha harakatlar</option>
            <option value="create">Yaratildi</option>
            <option value="update">Yangilandi</option>
            <option value="delete">O'chirildi</option>
            <option value="login">Kirdi</option>
            <option value="logout">Chiqdi</option>
            <option value="login_failed">Kirish muvaffaqiyatsiz</option>
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

        {(searchTerm || filterAction) && (
          <button
            onClick={() => {
              setSearchTerm("");
              setFilterAction("");
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
              <th className="p-3">Foydalanuvchi</th>
              <th className="p-3">Harakat turi</th>
              <th className="p-3">Ob'ekt turi</th>
              <th className="p-3">ID</th>
              <th className="p-3">Eslatma</th>
              <th className="p-3">Sanasi</th>
              <th className="p-3 text-center">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <th colSpan={8}> 
                  <CenteredProgressLoader/>
                </th>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-gray-400">
                  Arxiv yozuvlari mavjud emas
                </td>
              </tr>
            ) : (
              paginated.map((record, i) => (
                <motion.tr
                  key={record.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-gray-700 hover:bg-yellow-400/10 transition"
                >
                  <td className="p-3 text-gray-300">{startIndex + i + 1}</td>
                  <td className="p-3 text-gray-100">{getUserName(record.username)}</td>
                  <td className="p-3">{getActionBadge(record.action)}</td>
                  <td className="p-3 text-gray-300 capitalize">{record.model}</td>
                  <td className="p-3 text-gray-400">{record.object_id || "-"}</td>
                  <td className="p-3 text-gray-400 text-xs truncate max-w-xs">{record.note || "-"}</td>
                  <td className="p-3 text-gray-400 text-xs">{formatDate(record.created_at)}</td>
                  <td className="p-3 flex justify-center gap-4">
                    <button
                      onClick={() => {
                        setSelectedRecord(record);
                        setShowDetailModal(true);
                      }}
                      className="text-blue-400 hover:text-blue-300 transition"
                      title="Batafsil ko'rish"
                    >
                      <FaEye />
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
        {showDetailModal && selectedRecord && (
          <ModalWrapper onClose={() => setShowDetailModal(false)} title="📖 Arxiv yozuvining batafsili">
            <div className="space-y-4 max-h-96 overflow-y-auto">
              <div>
                <label className="text-gray-300 font-medium block mb-1">Foydalanuvchi:</label>
                <p className="text-gray-100">{getUserName(selectedRecord.username)}</p>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Harakat turi:</label>
                <p>{getActionBadge(selectedRecord.action)}</p>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Ob'ekt turi:</label>
                <p className="text-gray-100 capitalize">{selectedRecord.model}</p>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Ob'ekt ID:</label>
                <p className="text-gray-100">{selectedRecord.object_id || "-"}</p>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Eslatma:</label>
                <p className="text-gray-100">{selectedRecord.note || "-"}</p>
              </div>

              <div>
                <label className="text-gray-300 font-medium block mb-1">Vaqti:</label>
                <p className="text-gray-100">{formatDate(selectedRecord.created_at)}</p>
              </div>

              {selectedRecord.old_data && (
                <div>
                  <label className="text-gray-300 font-medium block mb-1">Eski ma'lumotlar:</label>
                  <pre className="bg-[#1a1a1a] p-3 rounded text-xs text-gray-300 overflow-x-auto border border-gray-600">
                    {JSON.stringify(selectedRecord.old_data, null, 2)}
                  </pre>
                </div>
              )}

              {selectedRecord.new_data && (
                <div>
                  <label className="text-gray-300 font-medium block mb-1">Yangi ma'lumotlar:</label>
                  <pre className="bg-[#1a1a1a] p-3 rounded text-xs text-gray-300 overflow-x-auto border border-gray-600">
                    {JSON.stringify(selectedRecord.new_data, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-gray-700">
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 rounded bg-[#2a2a2a] hover:bg-[#333] border border-gray-600 transition"
                >
                  Yopish
                </button>
              </div>
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
      className="bg-[#212121]/95 text-gray-100 rounded-xl shadow-2xl w-full max-w-2xl p-6 border border-yellow-500/30 max-h-screen overflow-y-auto"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-semibold mb-4 text-yellow-400">{title}</h2>
      {children}
    </motion.div>
  </motion.div>
);

export default History;