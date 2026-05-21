import { createContext, useContext, useEffect, useMemo, useState } from 'react'

export const LANGUAGES = [
  { code: 'en', label: 'English', nativeLabel: 'English' },
  { code: 'fr', label: 'French', nativeLabel: 'Francais' },
  { code: 'ar', label: 'Arabic', nativeLabel: 'العربية' },
]

const messages = {
  en: {
    'app.control': 'ErcTrack Control',
    'app.admin': 'Telecom Admin',
    'nav.dashboard': 'Dashboard',
    'nav.createMission': 'Create mission',
    'nav.tracking': 'Mission tracking',
    'nav.history': 'History',
    'nav.reports': 'Reports',
    'nav.createUser': 'Create user',
    'nav.drivers': 'Drivers',
    'nav.technicians': 'Technicians',
    'nav.sites': 'Sites',
    'nav.containers': 'Containers',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',
    'common.language': 'Language',
    'common.admin': 'Admin',
    'common.loading': 'Loading...',
    'dashboard.title': 'Overview',
    'dashboard.totalMissions': 'Total missions',
    'dashboard.inProgress': 'In progress',
    'dashboard.completed': 'Completed',
    'dashboard.pending': 'Pending',
    'dashboard.recentMissions': 'Recent missions',
    'dashboard.lastFive': 'Last 5',
    'dashboard.noRecent': 'No recent missions.',
    'dashboard.ref': 'Ref.',
    'dashboard.site': 'Site',
    'dashboard.driver': 'Driver',
    'dashboard.equipment': 'Equipment',
    'dashboard.date': 'Date',
    'dashboard.status': 'Status',
    'login.title': 'Sign in',
    'login.subtitle': 'Administrator access only',
    'login.email': 'Email address',
    'login.password': 'Password',
    'login.passwordPlaceholder': 'Your password',
    'login.submit': 'Sign in',
    'login.loading': 'Signing in...',
    'login.forgot': 'Forgot password?',
    'login.noAccount': 'No account yet?',
    'login.createAccount': 'Create account',
    'login.denied': 'Access denied. Only an administrator account can sign in.',
    'login.invalid': 'Email or password is incorrect.',
    'reports.title': 'Technician reports',
    'reports.submitted': 'Submitted reports',
    'reports.validated': 'Validated missions',
    'reports.awaiting': 'Awaiting validation',
    'reports.search': 'Search...',
    'reports.empty': 'No reports found.',
    'reports.detail': 'View detail',
  },
  fr: {
    'app.control': 'Controle ErcTrack',
    'app.admin': 'Admin Telecom',
    'nav.dashboard': 'Tableau de bord',
    'nav.createMission': 'Creer mission',
    'nav.tracking': 'Suivi missions',
    'nav.history': 'Historique',
    'nav.reports': 'Rapports',
    'nav.createUser': 'Creer utilisateur',
    'nav.drivers': 'Conducteurs',
    'nav.technicians': 'Techniciens',
    'nav.sites': 'Sites',
    'nav.containers': 'Conteneurs',
    'nav.settings': 'Parametres',
    'nav.logout': 'Deconnexion',
    'common.language': 'Langue',
    'common.admin': 'Admin',
    'common.loading': 'Chargement...',
    'dashboard.title': "Vue d'ensemble",
    'dashboard.totalMissions': 'Missions totales',
    'dashboard.inProgress': 'En cours',
    'dashboard.completed': 'Terminees',
    'dashboard.pending': 'En attente',
    'dashboard.recentMissions': 'Missions recentes',
    'dashboard.lastFive': '5 dernieres',
    'dashboard.noRecent': 'Aucune mission recente.',
    'dashboard.ref': 'Ref.',
    'dashboard.site': 'Site',
    'dashboard.driver': 'Conducteur',
    'dashboard.equipment': 'Equipement',
    'dashboard.date': 'Date',
    'dashboard.status': 'Statut',
    'login.title': 'Connexion',
    'login.subtitle': 'Acces reserve aux administrateurs',
    'login.email': 'Adresse e-mail',
    'login.password': 'Mot de passe',
    'login.passwordPlaceholder': 'Votre mot de passe',
    'login.submit': 'Se connecter',
    'login.loading': 'Connexion en cours...',
    'login.forgot': 'Mot de passe oublie ?',
    'login.noAccount': 'Pas encore de compte ?',
    'login.createAccount': 'Creer un compte',
    'login.denied': 'Acces refuse. Seul un compte administrateur peut se connecter.',
    'login.invalid': 'Email ou mot de passe incorrect.',
    'reports.title': 'Rapports techniciens',
    'reports.submitted': 'Rapports soumis',
    'reports.validated': 'Missions validees',
    'reports.awaiting': 'En attente validation',
    'reports.search': 'Rechercher...',
    'reports.empty': 'Aucun rapport trouve.',
    'reports.detail': 'Voir detail',
  },
  ar: {
    'app.control': 'لوحة ErcTrack',
    'app.admin': 'إدارة الاتصالات',
    'nav.dashboard': 'لوحة التحكم',
    'nav.createMission': 'إنشاء مهمة',
    'nav.tracking': 'تتبع المهام',
    'nav.history': 'السجل',
    'nav.reports': 'التقارير',
    'nav.createUser': 'إنشاء مستخدم',
    'nav.drivers': 'السائقون',
    'nav.technicians': 'الفنيون',
    'nav.sites': 'المواقع',
    'nav.containers': 'الحاويات',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',
    'common.language': 'اللغة',
    'common.admin': 'مدير',
    'common.loading': 'جار التحميل...',
    'dashboard.title': 'نظرة عامة',
    'dashboard.totalMissions': 'إجمالي المهام',
    'dashboard.inProgress': 'قيد التنفيذ',
    'dashboard.completed': 'مكتملة',
    'dashboard.pending': 'قيد الانتظار',
    'dashboard.recentMissions': 'المهام الأخيرة',
    'dashboard.lastFive': 'آخر 5',
    'dashboard.noRecent': 'لا توجد مهام حديثة.',
    'dashboard.ref': 'المرجع',
    'dashboard.site': 'الموقع',
    'dashboard.driver': 'السائق',
    'dashboard.equipment': 'المعدات',
    'dashboard.date': 'التاريخ',
    'dashboard.status': 'الحالة',
    'login.title': 'تسجيل الدخول',
    'login.subtitle': 'للمسؤولين فقط',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.passwordPlaceholder': 'كلمة المرور',
    'login.submit': 'دخول',
    'login.loading': 'جار تسجيل الدخول...',
    'login.forgot': 'نسيت كلمة المرور؟',
    'login.noAccount': 'ليس لديك حساب؟',
    'login.createAccount': 'إنشاء حساب',
    'login.denied': 'تم رفض الوصول. يسمح فقط لحساب المسؤول.',
    'login.invalid': 'البريد الإلكتروني أو كلمة المرور غير صحيحة.',
    'reports.title': 'تقارير الفنيين',
    'reports.submitted': 'التقارير المرسلة',
    'reports.validated': 'المهام المعتمدة',
    'reports.awaiting': 'بانتظار الاعتماد',
    'reports.search': 'بحث...',
    'reports.empty': 'لا توجد تقارير.',
    'reports.detail': 'عرض التفاصيل',
  },
}

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => localStorage.getItem('language') || 'en')
  const direction = language === 'ar' ? 'rtl' : 'ltr'

  const setLanguage = (nextLanguage) => {
    const safeLanguage = messages[nextLanguage] ? nextLanguage : 'en'
    localStorage.setItem('language', safeLanguage)
    setLanguageState(safeLanguage)
  }

  useEffect(() => {
    document.documentElement.lang = language
    document.documentElement.dir = direction
  }, [language, direction])

  const value = useMemo(
    () => ({
      language,
      direction,
      isRTL: direction === 'rtl',
      setLanguage,
      t: (key) => messages[language]?.[key] || messages.en[key] || key,
    }),
    [language, direction],
  )

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error('LanguageProvider is missing')
  return context
}
