import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaEye } from "react-icons/fa";
import { toast } from "sonner";
import { getHistory, searchUserByUsername } from "../hooks/apis";
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
  const navigate = useNavigate();
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<HistoryRecord | null>(null);
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const perPage = 40;
  const [serverPaginated, setServerPaginated] = useState(false);

  const [filterAction, setFilterAction] = useState<string>("");
  const [filterRole, setFilterRole] = useState<string>(""); // "" | "2" | "3"
  const [usernameFilter, setUsernameFilter] = useState(""); // input value
  const [usernameQuery, setUsernameQuery] = useState(""); // applied query sent to API
  const [userIdMap, setUserIdMap] = useState<Record<string, number>>({}); // username -> user id mapping

  const fetchHistory = async (page: number = 1) => {
    try {
      setLoading(true);
      const res = await getHistory(page, filterAction, filterRole, usernameQuery);

      const hasResults = Boolean(res.data && res.data.results);
      if (hasResults) {
        setHistory(res.data.results);
        setTotalCount(res.data.count ?? res.data.results.length);
        setServerPaginated(true);
      } else {
        setHistory(res.data);
        setTotalCount(res.data.length ?? 0);
        setServerPaginated(false);
      }

      setCurrentPage(page);
    } catch (err) {
      console.error(err);
      toast.error("Arxivni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory(currentPage);
  }, [currentPage, filterAction, filterRole, usernameQuery]);

  const getUserName = (user: HistoryRecord["username"]) => {
    if (!user) return "Noma'lum";
    return user;
  };

  

 

  const getNewGrade = (r: HistoryRecord): string | null => {
    if (!r.new_data) return null;
    const candidates = ['ball', 'score', 'grade', 'mark'];
    for (const key of candidates) {
      const val = (r.new_data as any)?.[key];
      if (val !== undefined && val !== null && val !== '') return String(val);
    }
    // also check nested objects
    for (const k of Object.keys(r.new_data || {})) {
      const v = (r.new_data as any)[k];
      if (typeof v === 'number' || typeof v === 'string') {
        if (String(k).toLowerCase().includes('ball') || String(k).toLowerCase().includes('score') || String(k).toLowerCase().includes('grade') || String(k).toLowerCase().includes('mark')) {
          return String(v);
        }
      }
    }
    return null;
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

  const getModelLabel = (model: string): string => {
    const labels: Record<string, string> = {
      grade: "Baho",
      class: "Sinf",
      user: "Foydalanuvchi",
      student: "O'quvchi",
      teacher: "O'qituvchi",
      history: "Arxiv",
    };
    return labels[model.toLowerCase()] || model;
  };

  const getActionBadge = (action: string) => {
    const actionStyles: Record<string, { bg: string; text: string; label: string }> = {
      create: { bg: "bg-green-500/20", text: "text-green-400", label: "Yaratildi" },
      update: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Yangilandi" },
      delete: { bg: "bg-red-500/20", text: "text-red-400", label: "O'chirildi" },
      login: { bg: "bg-cyan-500/20", text: "text-cyan-400", label: "Kirdi" },
      login_failed: { bg: "bg-orange-500/20", text: "text-orange-400", label: "Kirish muvaffaqiyatsiz" },
    };

    const style = actionStyles[action] || actionStyles.create;
    
    return (
      <span className={`px-3 py-1 rounded-full ${style.bg} ${style.text} text-xs font-semibold border ${style.bg.replace('20', '30')}`}>
        {style.label}
      </span>
    );
  };

  const filteredHistory = history;

  const totalPages = Math.max(1, Math.ceil(totalCount / perPage));
  const paginated = serverPaginated
    ? history
    : filteredHistory.slice((currentPage - 1) * perPage, currentPage * perPage);
  
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };
  
  const startIndex = (currentPage - 1) * perPage;

  const navigateToUserProfile = async (record: HistoryRecord) => {
    // Block navigation for "sakura" user
    if (record.username === "sakura") {
      toast.error("Bu foydalanuvchini ko'rish mumkin emas");
      return;
    }

    // If we have object_id, navigate directly
    if (record.action === "login"){
      if (record.object_id) {
      navigate(`/user/${record.object_id}`);
      return;
    }
    }else{
      toast.error("Bu harakat turi uchun foydalanuvchi profiliga o'tish mumkin emas");
      return;
    }
    

    // If we don't have object_id, search for the user by username
    if (record.username && !userIdMap[record.username]) {
      try {
        const res = await searchUserByUsername(record.username);
        const results = res.data.results || res.data;
        
        if (Array.isArray(results) && results.length > 0) {
          const userId = results[0].id || results[0].student_id;
          if (userId) {
            // Store the mapping for future use
            setUserIdMap(prev => ({ ...prev, [record.username as string]: userId }));
            navigate(`/user/${userId}`);
            return;
          }
        }
      } catch (err) {
        console.error("Error searching user:", err);
      }
    }

    // If we found it in our map, use it
    if (userIdMap[record.username as string]) {
      navigate(`/user/${userIdMap[record.username as string]}`);
      return;
    }

    toast.error("User ID topilmadi");
  };

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

      <div className="mb-6 flex gap-4 justify-end items-center bg-[#212121]/90 p-4 rounded-xl border border-gray-700">
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

        <div className="relative w-48">
          <select
            value={filterRole}
            onChange={(e) => {
              setFilterRole(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full px-4 pr-10 border border-gray-600 bg-[#2a2a2a] p-3 rounded-lg focus:outline-none focus:border-yellow-400 text-gray-100 appearance-none"
          >
            <option value="">Barchasi</option>
            <option value="2">Faqat o'qituvchilar</option>
            <option value="3">Faqat o'quvchilar</option>
          </select>
        </div>

        <div className="relative w-56 flex items-center">
          <input
            type="text"
            placeholder="Username bo'yicha qidirish..."
            value={usernameFilter}
            onChange={(e) => setUsernameFilter(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (setUsernameQuery(usernameFilter), setCurrentPage(1))}
            className="w-full border border-gray-600 bg-[#2a2a2a] p-3 rounded-lg focus:outline-none focus:border-yellow-400 text-gray-100 placeholder-gray-500"
          />
          <button
            onClick={() => { setUsernameQuery(usernameFilter); setCurrentPage(1); }}
            className={`ml-2 px-3 py-2 rounded bg-yellow-500 hover:bg-yellow-400 text-black font-semibold`}
          >
            Qidirish
          </button>
        </div>

        {(filterAction || filterRole || usernameQuery) && (
          <button
            onClick={() => {
              setFilterAction("");
              setFilterRole("");
              setUsernameFilter("");
              setUsernameQuery("");
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
              <th className="p-3">Ob'ekt turi</th>
              <th className="p-3">Harakat turi</th>
              <th className="p-3">Eslatma</th>
              <th className="p-3">Sanasi</th>
              <th className="p-3 text-center">Harakatlar</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <th colSpan={7}> 
                  <CenteredProgressLoader/>
                </th>
              </tr>
            ) : paginated.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-gray-400">
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
                  <td className="p-3">
                    <button
                      onClick={() => navigateToUserProfile(record)}
                      className={`flex items-center gap-2 transition ${
                        record.username === "sakura"
                          ? "text-gray-500 cursor-not-allowed"
                          : `${record.action === "login" ? "text-yellow-400 hover:text-yellow-300 hover:underline" : "text-gray-300 hover:text-gray-100"}`
                      }`}
                    >
                      {(() => {
                        // Don't show icon for sakura user
                        return (
                          <>
                            <span>{getUserName(record.username)}</span>
                          </>
                        );
                      })()}
                    </button>
                  </td>
                  <td className="p-3 text-gray-300">{getModelLabel(record.model)}</td>
                  <td className="p-3">{getActionBadge(record.action)}</td>
                  <td className="p-3 text-gray-400 text-xs truncate max-w-xl">{getNewGrade(record) ?? record.note ?? "-"}</td>
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