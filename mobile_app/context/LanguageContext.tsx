import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type LanguageCode = "en" | "fr" | "ar";

export const LANGUAGES: Array<{
  code: LanguageCode;
  label: string;
  nativeLabel: string;
}> = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "fr", label: "French", nativeLabel: "Francais" },
  { code: "ar", label: "Arabic", nativeLabel: "العربية" },
];

const STORAGE_KEY = "app_language";

const messages: Record<LanguageCode, Record<string, string>> = {
  en: {
    "tabs.home": "Home",
    "tabs.missions": "Missions",
    "tabs.qr": "QR Scan",
    "tabs.map": "Map",
    "tabs.profile": "Profile",
    "common.language": "Language",
    "common.loadingMissions": "Loading missions...",
    "common.noMissions": "No missions available.",
    "home.welcome": "Welcome Back",
    "home.active": "Active",
    "home.completed": "Completed",
    "home.activeMissions": "Active Missions",
    "home.items": "Items",
    "missions.search": "Search missions...",
    "missions.all": "All",
    "missions.today": "Today",
    "missions.completed": "Completed",
    "missions.pending": "Pending",
    "missions.empty": "No missions match your filters.",
    "missions.upcoming": "Upcoming & Other",
    "profile.notSignedIn": "You are not signed in yet.",
    "profile.goLogin": "Go to Login",
    "profile.missions": "Missions",
    "profile.completed": "Completed",
    "profile.settings": "Settings",
    "profile.account": "Account Settings",
    "profile.notifications": "Notifications",
    "profile.help": "Help & Support",
    "profile.logout": "Logout",
    "qr.scan": "Scan QR Code",
    "qr.driverHint": "Scan the container QR at the warehouse.",
    "qr.techHint": "Scan the mission QR on site.",
    "qr.scanning": "Scanning for QR code",
    "qr.scanned": "QR scanned",
    "qr.ready": "Ready to scan",
    "qr.readyHint": "Keep the QR code steady inside the frame and wait for it to register.",
    "qr.confirming": "Confirming...",
    "qr.driverAction": "Start delivery",
    "qr.techAction": "Confirm site arrival",
    "qr.scanAnother": "Scan another QR",
  },
  fr: {
    "tabs.home": "Accueil",
    "tabs.missions": "Missions",
    "tabs.qr": "Scan QR",
    "tabs.map": "Carte",
    "tabs.profile": "Profil",
    "common.language": "Langue",
    "common.loadingMissions": "Chargement des missions...",
    "common.noMissions": "Aucune mission disponible.",
    "home.welcome": "Bon retour",
    "home.active": "Actives",
    "home.completed": "Terminees",
    "home.activeMissions": "Missions actives",
    "home.items": "Articles",
    "missions.search": "Rechercher des missions...",
    "missions.all": "Tous",
    "missions.today": "Aujourd'hui",
    "missions.completed": "Terminees",
    "missions.pending": "En attente",
    "missions.empty": "Aucune mission ne correspond aux filtres.",
    "missions.upcoming": "A venir et autres",
    "profile.notSignedIn": "Vous n'etes pas connecte.",
    "profile.goLogin": "Aller a la connexion",
    "profile.missions": "Missions",
    "profile.completed": "Terminees",
    "profile.settings": "Parametres",
    "profile.account": "Parametres du compte",
    "profile.notifications": "Notifications",
    "profile.help": "Aide et support",
    "profile.logout": "Deconnexion",
    "qr.scan": "Scanner QR",
    "qr.driverHint": "Scannez le QR du conteneur a l'entrepot.",
    "qr.techHint": "Scannez le QR de la mission sur site.",
    "qr.scanning": "Recherche du QR",
    "qr.scanned": "QR scanne",
    "qr.ready": "Pret a scanner",
    "qr.readyHint": "Gardez le QR stable dans le cadre.",
    "qr.confirming": "Confirmation...",
    "qr.driverAction": "Demarrer livraison",
    "qr.techAction": "Confirmer arrivee site",
    "qr.scanAnother": "Scanner un autre QR",
  },
  ar: {
    "tabs.home": "الرئيسية",
    "tabs.missions": "المهام",
    "tabs.qr": "مسح QR",
    "tabs.map": "الخريطة",
    "tabs.profile": "الملف",
    "common.language": "اللغة",
    "common.loadingMissions": "جار تحميل المهام...",
    "common.noMissions": "لا توجد مهام.",
    "home.welcome": "مرحبا بعودتك",
    "home.active": "نشطة",
    "home.completed": "مكتملة",
    "home.activeMissions": "المهام النشطة",
    "home.items": "عناصر",
    "missions.search": "ابحث عن مهمة...",
    "missions.all": "الكل",
    "missions.today": "اليوم",
    "missions.completed": "مكتملة",
    "missions.pending": "بانتظار",
    "missions.empty": "لا توجد مهام تطابق الفلاتر.",
    "missions.upcoming": "القادمة والأخرى",
    "profile.notSignedIn": "لم تقم بتسجيل الدخول.",
    "profile.goLogin": "اذهب لتسجيل الدخول",
    "profile.missions": "المهام",
    "profile.completed": "مكتملة",
    "profile.settings": "الإعدادات",
    "profile.account": "إعدادات الحساب",
    "profile.notifications": "الإشعارات",
    "profile.help": "المساعدة والدعم",
    "profile.logout": "تسجيل الخروج",
    "qr.scan": "مسح QR",
    "qr.driverHint": "امسح QR الحاوية في المخزن.",
    "qr.techHint": "امسح QR المهمة في الموقع.",
    "qr.scanning": "جار البحث عن QR",
    "qr.scanned": "تم مسح QR",
    "qr.ready": "جاهز للمسح",
    "qr.readyHint": "ثبت رمز QR داخل الإطار.",
    "qr.confirming": "جار التأكيد...",
    "qr.driverAction": "بدء التوصيل",
    "qr.techAction": "تأكيد الوصول للموقع",
    "qr.scanAnother": "مسح QR آخر",
  },
};

type LanguageContextValue = {
  language: LanguageCode;
  isRTL: boolean;
  setLanguage: (language: LanguageCode) => Promise<void>;
  t: (key: string) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((stored) => {
      if (stored === "en" || stored === "fr" || stored === "ar") {
        setLanguageState(stored);
      }
    });
  }, []);

  const setLanguage = async (nextLanguage: LanguageCode) => {
    await AsyncStorage.setItem(STORAGE_KEY, nextLanguage);
    setLanguageState(nextLanguage);
  };

  const value = useMemo(
    () => ({
      language,
      isRTL: language === "ar",
      setLanguage,
      t: (key: string) => messages[language]?.[key] || messages.en[key] || key,
    }),
    [language],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("LanguageProvider is missing");
  return context;
}
