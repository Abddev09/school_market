import { createBrowserRouter, RouterProvider } from "react-router-dom";
import RouterLayout from "./layout/RouterLayout";
import StudentLayout from "./layout/StudentLayout";

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
import ClassStudents from "./admin/class_students";

const App = () => {
  const router = createBrowserRouter([
    {
      path: "/",
      element: <RouterLayout />,
      children: [
        { index: true, element: <Home /> },
        {path:"*",element:<NotFound/>},
        { path: "/login", element: <Login /> },
        { path: "/classes", element:<ProtectedRoute allowedRole="1"><Classes /></ProtectedRoute>  },
        { path: "/students", element:<ProtectedRoute allowedRole="1"><Students/></ProtectedRoute> },
        { path: "/teachers", element:<ProtectedRoute allowedRole="1"> <Teachers /></ProtectedRoute> },
        { path: "/shop", element: <ProtectedRoute allowedRole="1"><Shop /></ProtectedRoute> },
        { path: "/orders", element:<ProtectedRoute allowedRole="1"> <Orders /> </ProtectedRoute>},
        { path: "/class-students/:id", element:<ProtectedRoute allowedRole="2"> <ClassStudents /> </ProtectedRoute>},
        {
          path: "/dashboard/teacher",
          element: (
            <ProtectedRoute allowedRole="2">
              <Teacher />
            </ProtectedRoute>
          ),
        },
        {
          path: "/my-students", // teacher uchun, student emas
          element: (
            <ProtectedRoute allowedRole="2">
              <MyStudents />
            </ProtectedRoute>
          ),
        },
      ],
    },

    // 🎓 Student Layout uchun alohida branch
    {
      path: "/",
      element: <ProtectedRoute allowedRole="3"><StudentLayout /></ProtectedRoute>,
      children: [
        {path:"*",element:<NotFound/>},
        { path: "/market", element: <Market /> },
        { path: "/my-orders", element: <Order /> },
        { path: "/my-favourite", element: <Favourite /> },
        { path: "/my-cart", element: <Cart /> },
        { path: "/my-profile", element: <Profile /> },
      ],
    },
  ]);

  return (
    <>
      <Toaster richColors position="top-center" />
      <RouterProvider router={router} />
    </>
  );
};

export default App;
