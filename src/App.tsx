import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RouterLayout from "./layout/RouterLayout";
import StudentLayout from "./layout/StudentLayout";
import DashboardLayout from "./layout/RouterLayout";

import Login from "./auth/login";
import ProtectedRoute from "./components/RoleCounter";
import Home from "./auth/Home";
import Classes from "./admin/Classes";
import Students from "./admin/Students";
import Teachers from "./admin/Teachers";
import Shop from "./admin/Shop";
import Orders from "./admin/Orders";
import Teacher from "./teacher/Teacher";
import MyStudents from "./teacher/MyStudents";
import { Toaster } from "sonner";
import Order from "./student/Order";
import Favourite from "./student/Favourite";
import Cart from "./student/Cart";
import Profile from "./student/Profile";
import Market from "./student/Market";
import NotFound from "./components/404";

const App = () => {
  const router = createBrowserRouter([
    // Public Routes
    {
      path: "/",
      element: <RouterLayout />,
      children: [
        { index: true, element: <Home /> },
        { path: "/login", element: <Login /> },
      ],
    },

    // Admin Dashboard Routes
    {
      path: "/",
      element: (
        <ProtectedRoute allowedRole="1">
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/classes", element: <Classes /> },
        { path: "/students", element: <Students /> },
        { path: "/teachers", element: <Teachers /> },
        { path: "/shop", element: <Shop /> },
        { path: "/orders", element: <Orders /> },
        // 404 sahifa admin dashboard ichida
        { path: "*", element: <DashboardLayout isPublic>
      <NotFound />
    </DashboardLayout> },
      ],
    },

    // Teacher Dashboard Routes
    {
      path: "/",
      element: (
        <ProtectedRoute allowedRole="2">
          <DashboardLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/dashboard/teacher", element: <Teacher /> },
        { path: "/my-students", element: <MyStudents /> },
        { path: "*", element: <DashboardLayout isPublic>
      <NotFound />
    </DashboardLayout> }, // teacher 404
      ],
    },

    // Student Layout Routes
    {
      path: "/",
      element: (
        <ProtectedRoute allowedRole="3">
          <StudentLayout />
        </ProtectedRoute>
      ),
      children: [
        { path: "/market", element: <Market /> },
        { path: "/my-orders", element: <Order /> },
        { path: "/my-favourite", element: <Favourite /> },
        { path: "/my-cart", element: <Cart /> },
        { path: "/my-profile", element: <Profile /> },
        { path: "*", element: <DashboardLayout isPublic>
      <NotFound />
    </DashboardLayout> }, // student 404
      ],
    },
  ]);

  return (
    <>
    <Toaster position="top-center"/>
      <RouterProvider router={router} />
    </>
  );
};

export default App;
