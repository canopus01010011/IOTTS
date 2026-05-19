import api from "./api";

export const updateUser = async (data: {
  name: string;
  email: string;
  phone: string;
  password?: string;
}) => {
  try {
    const response = await api.put("/user/update", data);
    return response.data;
  } catch (error) {
    console.error("Update user error:", error);
    throw error;
  }
};
