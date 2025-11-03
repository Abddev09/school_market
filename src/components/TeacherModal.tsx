import React, { useState } from "react";
import { motion } from "framer-motion";
import { createUser } from "../hooks/apis";

interface Props {
  onClose: () => void;
  onAdded: () => void;
}

const TeacherModal: React.FC<Props> = ({ onClose, onAdded }) => {
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    password: "",
    role: 2,
    gender: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === "gender" ? value === "true" : value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser(form)
    onAdded();
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: -40 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-[#1a1a1a] border border-white/10 rounded-xl shadow-lg p-6 w-[400px]"
      >
        <h2 className="text-xl font-bold text-yellow-300 mb-4">
          Yangi ustoz qo‘shish
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="text"
            name="first_name"
            placeholder="Ism"
            value={form.first_name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-400"
            required
          />
          <input
            type="text"
            name="last_name"
            placeholder="Familiya"
            value={form.last_name}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-400"
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Parol"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-400"
            required
          />
          <select
            name="gender"
            value={String(form.gender)}
            onChange={handleChange}
            className="w-full p-2 rounded bg-white/5 border border-white/10 text-white focus:outline-none focus:border-yellow-400"
          >
            <option value="true">Erkak</option>
            <option value="false">Ayol</option>
          </select>
          
          <div className="flex justify-end gap-3 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-white/10 rounded text-gray-300 hover:bg-white/20 transition"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded bg-gradient-to-r from-yellow-400 to-yellow-300 text-black font-semibold shadow hover:scale-[1.03] transition-transform"
            >
              Saqlash
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default TeacherModal;
