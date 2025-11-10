import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../hooks/apis";
import { toast } from "sonner";
import LightRays from "../components/bg"; // joylashuvni o'zingga moslashtir
import HelmetPage from "../utils/Helmet";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);
  try {
    const res = await login(form);
    console.log(res);

    // 🔐 token va role’ni saqlaymiz (role hash qilinadi)
    localStorage.setItem("token", res.data.access_token);

    // role ni base64 bilan hash qilish (oddiy, tez, front uchun yetarli)
    const hashedRole = btoa(res.data.user.role);
    localStorage.setItem("role", hashedRole);
    localStorage.setItem("id",res.data.user.id)
    const role = res.data.user.role
    toast.success("Kirish muvaffaqiyatli!");
    if(role === 1 || role === 0){
      navigate("/teachers");
    }else if(role === 2){
      navigate("/dashboard/teacher")
    }else {
      navigate("/my-profile")
    }
  } catch (err: any) {
    console.error(err);
    toast.error("Login yoki parol noto‘g‘ri!");
  } finally {
    setLoading(false);
  }
};

  return (
    <>
    <HelmetPage/>
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0a0a] text-gray-100">
      {/* 🌌 LightRays background */}
      <div className="absolute inset-0 z-0">
        <LightRays
          raysOrigin="top-center"
          raysColor="#ffffff"
          raysSpeed={1.5}
          lightSpread={0.8}
          rayLength={1.2}
          followMouse={true}
          mouseInfluence={0.1}
          noiseAmount={0.1}
          distortion={0.05}
        />
      </div>

      {/* 🔷 Login form */}
      <div className="relative z-10 flex items-center justify-center h-full bg-black/30">
        <div className="bg-[#111]/50 backdrop-blur-md border border-yellow-300 shadow-xl rounded-2xl p-8 w-full max-w-md">
          <h2 className="text-2xl font-semibold text-center mb-6 text-yellow-200">
            School Marketga Kirish
          </h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-1 text-gray-400">
                Login
              </label>
              <input
                type="text"
                name="username"
                value={form.username}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] text-gray-100 border border-yellow-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition"
                placeholder="Username"
              />
            </div>

            <div>
              <label className="block text-sm mb-1 text-gray-400">
                Parol
              </label>
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 rounded-lg bg-[#1a1a1a] text-gray-100 border border-yellow-300 focus:border-gray-400 focus:ring-1 focus:ring-gray-400 outline-none transition"
                placeholder="password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 mt-2 bg-yellow-500 text-black hover:bg-yellow-200 rounded-lg transition font-medium tracking-wide"
            >
              {loading ? "Kirilmoqda..." : "Kirish"}
            </button>
          </form>
        </div>
      </div>
    </div>
    </>
  );
};

export default Login;
