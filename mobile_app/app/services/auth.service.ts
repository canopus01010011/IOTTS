import api from "./api";

export const updateUserProfile = async (
  userId: string,
  data: {
    full_name: string;
    email: string;
    phone: string;
    password?: string;
  },
) => {
  return api.put(`/users/${userId}`, data);
};
