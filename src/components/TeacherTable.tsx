import React, { useState } from "react";
import { motion } from "framer-motion";

interface TeacherTableProps {
  teachers: any[];
}

const TeacherTable: React.FC<TeacherTableProps> = ({ teachers }) => {
  const [page, setPage] = useState(1);
  const perPage = 20;
  const totalPages = Math.ceil(teachers.length / perPage);
  const current = teachers.slice((page - 1) * perPage, page * perPage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="bg-white shadow-xl rounded-xl p-6"
    >
      <h2 className="text-xl font-semibold mb-4 text-gray-700">
        Ustozlar ro‘yxati
      </h2>

      <div className="overflow-x-auto">
        <table className="min-w-full border border-gray-200 rounded-md">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Ism</th>
              <th className="px-4 py-2 text-left">Familiya</th>
              <th className="px-4 py-2 text-left">Jinsi</th>
              <th className="px-4 py-2 text-left">Sinf</th>
            </tr>
          </thead>
          <tbody>
            {current.map((t, i) => (
              <tr
                key={t.id}
                className="border-t hover:bg-gray-50 transition-all duration-200"
              >
                <td className="px-4 py-2">{(page - 1) * perPage + i + 1}</td>
                <td className="px-4 py-2">{t.first_name}</td>
                <td className="px-4 py-2">{t.last_name}</td>
                <td className="px-4 py-2">
                  {t.gender ? "Erkak" : "Ayol"}
                </td>
                <td className="px-4 py-2">{t.classe}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex justify-center items-center gap-2 mt-4">
        <button
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          ←
        </button>
        <span>
          {page} / {totalPages}
        </span>
        <button
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
        >
          →
        </button>
      </div>
    </motion.div>
  );
};

export default TeacherTable;
