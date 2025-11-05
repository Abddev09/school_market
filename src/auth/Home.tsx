import React, { useState } from "react";
import { FaTelegramPlane, FaInstagram, FaYoutube } from "react-icons/fa";
import { toast } from "sonner"; // ✅ toasts uchun

const Home = () => {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!name.trim() || !comment.trim()) {
      toast.warning("Iltimos, barcha maydonlarni to‘ldiring!");
      return;
    }

    toast.success("Sizning izohingiz yuborildi!");
    setName("");
    setComment("");
  };

  const scrollToTop = (e: React.MouseEvent) => {
    e.preventDefault();
    window.scrollTo({
      top: 0,
      behavior: "smooth", // ✅ smooth scroll
    });
  };

  return (
    <div className="bg-gradient-to-b from-black to-[#0d0d0d] text-white overflow-x-hidden font-poppins ">
      {/* HEADER */}
      <header className="fixed top-0 left-0 w-full bg-[#111111d0] backdrop-blur-md z-50 shadow-lg animate-slideDown">
        <div className="max-w-[1200px] mx-auto flex justify-between items-center py-4 px-6" id="top">
          <img
            src="/logo.png"
            alt="logo"
            className="h-14 rounded-full drop-shadow-[0_0_10px_rgba(212,175,55,0.6)] hover:scale-110 transition-transform"
          />
          <p className="font-bold text-xl">Toshkent shahar Yashnabod tumani 255-maktab  Humo card</p>
          <a href="/login">
            <button className="border-2 border-yellow-400 text-yellow-400 px-5 py-2 rounded-lg font-semibold hover:bg-yellow-400 hover:text-black transition">
              Kirish
            </button>
          </a>
        </div>
      </header>

      {/* MAIN */}
      <main className="pt-28">
        <div className="max-w-[1200px] mx-auto px-4 space-y-24">
          {/* BOXES */}
          {[
            {
              text: "O‘quvchilarning ta‘lim olishga qiziqishlarini oshirish hamda rag‘batlantirish maqsadida “Maktab humo pul birligi” joriy qilindi.",
              img: "/aa.png",
            },
            {
              text: "Humo kartasi — bu maktab pul birligi. O‘quv yili oxirida yarmarkada humo kartalari bilan xaridni amalga oshirish mumkin.",
              img: "/bb.png",
            },
            {
              text: "O‘zbekiston Respublikasi Prezidentining PF-5712-sonli farmoni asosida Maktab madhiyasi joriy qilindi.",
              img: "/ll.png",
            },
            {
              text: "Ta'limga mayoq dargoh, onadek mehri qaynoq. Maktabim, jon maktabim, seni sevib maqtagum.",
              img: "/kl.png",
            },
          ].map((box, i) => (
            <div
              key={i}
              className={`flex flex-col md:flex-row ${
                i % 2 === 1 ? "md:flex-row-reverse" : ""
              } items-center gap-10 bg-white/5 p-8 rounded-2xl shadow-[0_0_25px_rgba(255,215,0,0.2)] hover:shadow-[0_0_40px_rgba(255,215,0,0.4)] transition-transform duration-500 hover:-translate-y-2`}
            >
              <p className="md:w-1/2 text-lg leading-relaxed">{box.text}</p>
              <img
                src={box.img}
                alt="image"
                className="w-[450px] border-2 border-yellow-400 rounded-2xl shadow-[0_0_20px_gold]"
              />
            </div>
          ))}

          {/* MAP + DIREKTOR */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2997.772498813418!2d69.36304133832043!3d41.29205552345554!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38aef5f244c55555%3A0xff41e61a516c192a!2z0KjQutC-0LvQsCDihJYyNTU!5e0!3m2!1sru!2s!4v1760527941683!5m2!1sru!2s"
              width="600"
              height="400"
              className="rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.4)] border-none"
              loading="lazy"
            ></iframe>

            <div className="flex-1 bg-white/5 border border-yellow-400 rounded-2xl p-6 text-center shadow-[0_0_25px_rgba(255,215,0,0.3)]">
              <h1 className="text-yellow-400 text-2xl font-bold">Direktor</h1>
              <p className="mb-3 text-lg">255-maktab</p>
              <img
                src="/image.png"
                alt=""
                className="w-40 h-40 rounded-full border-2 border-yellow-400 shadow-[0_0_20px_gold] mx-auto mb-4"
              />
              <p className="mb-6">Jo'rayeva Dilora Ergashevna</p>
              <input
                type="text"
                placeholder="Ismingiz va sinfingizni kiriting"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 mb-3 rounded-lg border border-yellow-400 bg-white/10 text-white outline-none placeholder-gray-300"
              />
              <textarea
                placeholder="Izohingizni qoldiring"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-3 mb-4 rounded-lg border border-yellow-400 bg-white/10 text-white outline-none placeholder-gray-300 h-24"
              ></textarea>
              <button
                onClick={handleSubmit}
                className="bg-gradient-to-r from-yellow-400 to-yellow-200 text-black font-semibold px-6 py-2 rounded-lg hover:scale-105 hover:shadow-[0_0_20px_gold] transition-transform"
              >
                Yuborish
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* SCROLL UP BUTTON */}
      <button
        onClick={scrollToTop}
        className="fixed bottom-10 right-10 w-12 h-12 flex items-center justify-center bg-yellow-400 text-black rounded-full font-bold text-2xl shadow-[0_0_25px_gold] hover:-translate-y-2 hover:shadow-[0_0_40px_gold] transition-all duration-300"
      >
        ↑
      </button>

      {/* FOOTER */}
      <footer className="bg-gradient-to-b from-black to-[#0c0c0c] border-t border-yellow-900 mt-20">
        <div className="max-w-[1200px] mx-auto px-4 py-12 flex flex-wrap justify-between gap-10">
          <div>
            <img
              src="/logo.png"
              alt="logo"
              className="h-14 drop-shadow-[0_0_15px_rgba(212,175,55,0.4)] rounded-full"
            />
            <h2 className="text-yellow-400 mt-3 text-xl font-bold">
              255-Maktab
            </h2>
            <p className="italic opacity-80">Bilim — kelajak kaliti ✨</p>
          </div>

          <div>
            <h3 className="text-yellow-400 text-lg font-semibold mb-2">
              Aloqa
            </h3>
            <p>📍 Toshkent shahri, Yashnobod tumani</p>
            <p>📞 +998 90 123 45 67</p>
            <p>✉️ info@255maktab.uz</p>
          </div>

          <div>
            <h3 className="text-yellow-400 text-lg font-semibold mb-3">
              Biz bilan bog‘laning
            </h3>
            <div className="flex gap-4 text-2xl">
              <a
                href="https://t.me/school_255"
                className="hover:text-yellow-400 transition-transform hover:scale-110"
              >
                <FaTelegramPlane />
              </a>
              <a
                href="https://www.instagram.com/255_maktab_official/"
                className="hover:text-yellow-400 transition-transform hover:scale-110"
              >
                <FaInstagram />
              </a>
              <a
                href="http://www.youtube.com/@255maktabYashnobod"
                className="hover:text-yellow-400 transition-transform hover:scale-110"
              >
                <FaYoutube />
              </a>
            </div>
          </div>
        </div>

        <div className="text-center text-gray-400 border-t border-gray-700 py-4 text-sm">
          © 2025 255-Maktab. Barcha huquqlar himoyalangan.
        </div>
      </footer>
    </div>
  );
};

export default Home;
