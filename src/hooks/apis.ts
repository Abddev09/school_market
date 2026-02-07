import { api,loginApi } from "./api";
import type { LoginData } from "../types/dataTypes.ts";


export const login = async (data: LoginData) => {
  const res = await loginApi.post("login/", data);
  return res.data;
};


export const getUsers = async () => {
  const res = await api.get(`users/`);
  return res
};

export const getOneUsers = async (id:any) => {
  const res = await api.get(`users/${id}`);
  return res
};

export const createUser = async (data: any) => {
  try {
    const res = await api.post("users/", data);
    return res.data;
  } catch (error: any) {
    console.log("STATUS:", error.response?.status);
    console.log("ERROR DATA:", error.response?.data);
    console.log("FULL ERROR:", error);

    // xohlasang yuqoriga ham o‘tkazamiz
    throw error.response?.data;
  }
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


export const getClasses = async (page: number | string = 1) => {
  // Accept either a page number or a full/relative URL returned by the API `next` field.
  if (typeof page === "number") {
    return await api.get(`classes/?page=${page}`);
  }

  // If a string is passed, assume it's a URL (absolute or relative) and request it directly.
  return await api.get(page);
};

export const getClassesByTeacher = async (teacherId: number) => {
  const res = await api.get(`teachers/classe/?teacher_id=${teacherId}`);
  return res;
};

export const createClass = async (data: any) => {
  try {
    const res = await api.post("classes/", data);
    return res;
  } catch (error: any) {
    console.log("STATUS:", error.response?.status);
    console.log("ERROR DATA:", error.response?.data);
    console.log("FULL ERROR:", error);
    throw error.response?.data || error;
  }
};

// ⚙️ PATCH — id data ichida ketadi
export const updateClass = async (data: any) => {
  try {
    const res = await api.patch(`classes/${data.id}/`, data);
    return res;
  } catch (error: any) {
    console.log("STATUS:", error.response?.status);
    console.log("ERROR DATA:", error.response?.data);
    console.log("FULL ERROR:", error);
    throw error.response?.data || error;
  }
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
  const res = await api.get(`products/`);
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
export const getOrders = async (page:number) => {
  const res = await api.get(`orders/?paga=${page}`);
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



export const getMyStudents = async (page:number) =>{
  const res = await api.get(`my-students/?page=${page}`);
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



export const getStudentUsers = async ()=> {
  const res = await api.get(`student/users/`);
  return res
}


export const getTeacherAll = async ()=> {
  const res = await api.get(`all-teachers`);
  return res;
}


export const getStudentAll = async (page:number)=> {
  const res = await api.get(`all-students/?page=${page}`);
  return res;
}

export const getStudentsByClass = async (page: number, classId: number) => {
  const res = await api.get(`all-students?page=${page}&class_id=${classId}`);
  return res;
}


export const searchStudent = async (s:string,page:number) => {
  const res = await api.get(`search?s=${s}&page=${page}`);
  return res;
}

export const searchUserByUsername = async (username: string) => {
  const res = await api.get(`search?s=${username}&page=1`);
  return res;
}

// 📊 GET — barcha arxiv yozuvlarini olish
export const getHistory = async (
  page: number = 1,
  action: string = "",
  role: string | number = "",
  username: string = ""
) => {
  const params: string[] = [];
  params.push(`page=${page}`);
  if (action) params.push(`action=${encodeURIComponent(action)}`);
  if (role !== "" && role !== null && role !== undefined) params.push(`role=${encodeURIComponent(String(role))}`);
  if (username) params.push(`username=${encodeURIComponent(username)}`);

  const query = params.length ? `?${params.join("&")}` : "";
  const res = await api.get(`history/${query}`);
  return res;
};

// 🗑️ DELETE — arxiv yozuvini o'chirish
export const deleteHistory = async (id: number) => {
  const res = await api.delete(`history/${id}/`);
  return res;
};