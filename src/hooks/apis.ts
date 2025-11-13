import { api } from "./api";
import type { LoginData } from "../types/dataTypes.ts";


export const login = async (data: LoginData) => {
  const res = await api.post("login/", data);
  return res.data;
};


export const getUsers = async () => {
  const res = await api.get("users/");
  return res
};

export const getOneUsers = async (id:any) => {
  const res = await api.get(`users/${id}`);
  return res
};

export const createUser = async (data: any) => {
  const res = await api.post("users/", data);
  return res;
};

// ⚙️ PATCH — id data ichida ketadi
export const updateUser = async (data: any) => {
  const res = await api.patch(`users/${data.id}/`, data);
  return res;
};

// 🗑️ DELETE — id ham data ichida yuboriladi
export const deleteUser = async (data: any) => {
  const res = await api.delete(`users/${data.id}/`, { data });
  return res;
};


export const getClasses = async () => {
  const res = await api.get("classes/");
  return res
};

export const createClass = async (data: any) => {
  const res = await api.post("classes/", data);
  return res;
};

// ⚙️ PATCH — id data ichida ketadi
export const updateClass = async (data: any) => {
  const res = await api.patch(`classes/${data.id}/`, data);
  return res;
};

// 🗑️ DELETE — id ham data ichida yuboriladi
export const deleteClass = async (id: any) => {
  const res = await api.delete(`classes/${id}/`, { data:id });
  return res;
};

export const importStudents = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post("students/import/", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return res.data;
};






// 📦 GET — barcha productlarni olish
export const getProducts = async () => {
  const res = await api.get("products/");
  return res;
};

// ➕ POST — yangi product yaratish
export const createProduct = async (data: any) => {
  const res = await api.post("products/", data,{
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

// ⚙️ PATCH — mavjud productni tahrirlash (id data ichida bo‘ladi)
export const updateProduct = async (data: any) => {
  const res = await api.patch(`products/${data.get("id")}/`, data,{
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

// 🗑️ DELETE — productni o‘chirish (id argument sifatida beriladi)
export const deleteProduct = async (id: any) => {
  const res = await api.delete(`products/${id}/`);
  return res;
};


export const updatePassword = async (id:number, password:string) => {
  const res  = await api.patch(`reset-password/` , {
      id:id,
      new_password:password
  });
  return res.data
}





// 📦 GET — barcha orderlsrni olish
export const getOrders = async () => {
  const res = await api.get("orders/");
  return res;
};



// ⚙️ PATCH — mavjud orderlarni tahrirlash (id data ichida bo‘ladi)
export const updateOrder = async (data: any) => {
  const res = await api.patch(`orders/${data.get("id")}/`, data,{
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
};

// 🗑️ DELETE — orderni o‘chirish (id argument sifatida beriladi)
export const deleteOrder = async (id: any) => {
  const res = await api.delete(`orders/${id}/`);
  return res;
};



export const getMyStudents = async () =>{
  const res = await api.get('my-students/');
  return res
}





// 🔹 Barcha baholarni olish
export const getGrades = async () => {
  const res = await api.get("grade/");
  return res;
};

// 🔹 ID bo‘yicha bitta bahoni olish
export const getGrade = async (id: number) => {
  const res = await api.get(`grade/${id}/`);
  return res;
};

// 🔹 Yangi baho yaratish
export const createGrade = async (data: any) => {
  const res = await api.post("grade/", data, {
    headers: { "Content-Type": "application/json" },
  });
  return res;
};

// 🔹 Baho yangilash
export const updateGrade = async (id: number, data: any) => {
  const res = await api.put(`grade/${id}/`, data, {
    headers: { "Content-Type": "application/json" },
  });
  return res;
};

// 🔹 Baho o‘chirish
export const deleteGrade = async (id: number) => {
  const res = await api.delete(`grade/${id}/`);
  return res;
};



export const createFavourite = async (data:any) => {
  const res = await api.post(`favourite/`,data);
  return res;
};

export const getFavourite = async () => {
  const res = await api.get(`favourite/`);
  return res;
};

export const deleteFavourite = async (id:number) => {
  const res = await api.delete(`favourite/${id}/`);
  return res;
};

export const createCart = async (data:any) => {
  const res = await api.post(`carts/`,data);
  return res;
};



export const getMyCart = async () => {
  const res = await api.get(`carts/`);
  return res;
};

export const deleteCart = async (id:number) => {
  const res = await api.delete(`carts/${id}/`);
  return res;
};


export const createOrder = async (data:any) => {
  const res = await api.post(`orders/`,data);
  return res;
};

export const getMyOrders = async () => {
  const res = await api.get(`orders/`);
  return res;
};
