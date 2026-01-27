import { Navigate } from "react-router-dom";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: string | string[]; // bitta yoki ko‘p rollar bo‘lishi mumkin
}

const ProtectedRoute = ({ children, allowedRole = ["1", "2", "3"] }: ProtectedRouteProps) => {
  const token = localStorage.getItem("token");
  const storedRole = localStorage.getItem("role");

  // 🔒 Agar foydalanuvchi login qilmagan bo‘lsa — login sahifasiga
  if (!token || !storedRole) {
    return <Navigate to="/login" replace />;
  }

  // 🧩 localStorage dagi role ni decode qilamiz
  const decodedRole = atob(storedRole);

  // 🔄 allowedRole ni har doim massivga aylantiramiz
  const allowedRolesArray = Array.isArray(allowedRole) ? allowedRole : [allowedRole];

  // ✅ endi agar decodedRole massiv ichida bo‘lsa — kirish mumkin
  if (!allowedRolesArray.includes(decodedRole) && decodedRole !== "0") {
    return <Navigate to="/login" replace />;
  }

  // 👌 Hammasi joyida — kirishga ruxsat
  return <>{children}</>;
};

export default ProtectedRoute;
