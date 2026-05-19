import { useAuthContext } from "@/context/AuthContext";

export const useAuth = () => {
  const { user, login, logout } = useAuthContext();

  const updateUser = async (data: any) => {
    console.log("Update user data:", data);
    return data;
  };

  return {
    user,
    login,
    logout,
    updateUser,
  };
};
