import { Outlet, useLocation } from "react-router-dom";
import StudentNavbar from "../components/StudentNavbar";

const StudentLayout = () => {
  const { pathname } = useLocation();

  // 🔍 Login yoki Home sahifasi bo‘lsa — navbarni yashiramiz
  const isAuthOrHome = pathname === "/login" || pathname === "/";

  // 🏷️ Sahifa nomlari
  const pageTitle =
    {
      "/market": "School Market",
      "/my-cart": "Savatcha",
      "/my-favourite": "Sevimlilar",
      "/my-orders": "Buyurtmalar",
      "/my-profile": "Profil",
    }[pathname] || "255 Maktab";

   if (isAuthOrHome){
    return <></>;
   } else{

  return (
    <div className="min-h-screen bg-[#0e0e0e] text-white">
      {/* 👇 Navbar faqat login va home bo‘lmagan sahifalarda chiqadi */}
      {!isAuthOrHome && <StudentNavbar pageTitle={pageTitle} />}

      <main className={`${!isAuthOrHome ? "pt-20" : ""} px-4 sm:px-6 md:px-10`}>
        <Outlet />
      </main>
    </div>
  );
};
   }


export default StudentLayout;
