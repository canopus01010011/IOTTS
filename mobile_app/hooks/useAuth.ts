import { updateUserProfile } from "@/app/services/auth.service";
import { useAuthContext } from "@/context/AuthContext";

export const useAuth = () => {
  const { user, isRestoring, login, logout, setUser } = useAuthContext();

  const updateUser = async (data: {
    name: string;
    email: string;
    phone: string;
    password?: string;
  }) => {
    if (!user) throw new Error("Not signed in");

    const updated = await updateUserProfile(user.id, {
      full_name: data.name,
      email: data.email,
      phone: data.phone,
      password: data.password,
    });

    setUser({
      ...user,
      full_name: data.name,
      email: data.email,
      phone: data.phone,
    });

    return updated;
  };

  return {
    user,
    isRestoring,
    login,
    logout,
    updateUser,
  };
};
