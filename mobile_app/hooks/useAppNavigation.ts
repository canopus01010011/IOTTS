import { useRouter } from "expo-router";

export function useAppNavigation() {
  const router = useRouter();

  function goToLogin() {
    router.push("/login");
  }

  return { goToLogin };
}