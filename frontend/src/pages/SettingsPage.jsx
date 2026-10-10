import { Globe, Sun, Moon } from "lucide-react";
import SimpleSidebar from "../components/SimpleSidebar";
import { useState } from "react";
import { useTranslation } from "../lib/translations";
import { useThemeStore } from "../store/useThemeStore";

const SettingsPage = () => {
  const { theme, setTheme } = useThemeStore();
  const { t } = useTranslation();
  const [language, setLanguage] = useState(localStorage.getItem('app-language') || 'en');
  
  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    localStorage.setItem('app-language', lang);
    window.location.reload();
  };

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  ];

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16 sm:pt-20 px-2 sm:px-4 pb-2 sm:pb-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-7xl laptop:max-w-8xl 3xl:max-w-9xl h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-6rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <SimpleSidebar />
            
            <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
              <div className="space-y-6 sm:space-y-8 max-w-6xl laptop:max-w-7xl mx-auto">
        
        {/* Language Settings */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5" />
              <h2 className="text-xl sm:text-2xl font-semibold">{t('language')}</h2>
            </div>
            <p className="text-sm text-base-content/70">{t('chooseLanguage')}</p>
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {languages.map((lang) => (
              <button
                key={lang.code}
                className={`
                  flex items-center gap-3 p-4 rounded-lg border-2 transition-all
                  ${
                    language === lang.code
                      ? 'border-primary bg-primary/10'
                      : 'border-base-300 hover:border-base-400'
                  }
                `}
                onClick={() => handleLanguageChange(lang.code)}
              >
                <span className="text-3xl">{lang.flag}</span>
                <span className="font-medium">{lang.name}</span>
              </button>
            ))}
          </div>
        </div>
        
        {/* Theme Settings */}
        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <h2 className="text-xl sm:text-2xl font-semibold">{t('theme')}</h2>
            <p className="text-sm text-base-content/70">{t('chooseTheme')}</p>
          </div>

          <div className="flex items-center justify-start">
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className={`relative inline-flex h-8 w-16 items-center rounded-full transition-colors duration-300 ${
                theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'
              }`}
            >
              <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 ${
                theme === 'dark' ? 'translate-x-9' : 'translate-x-1'
              }`} />
              <Sun className={`absolute left-1.5 h-4 w-4 text-yellow-500 transition-opacity duration-300 ${
                theme === 'dark' ? 'opacity-0' : 'opacity-100'
              }`} />
              <Moon className={`absolute right-1.5 h-4 w-4 text-gray-400 transition-opacity duration-300 ${
                theme === 'dark' ? 'opacity-100' : 'opacity-0'
              }`} />
            </button>
          </div>
        </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
export default SettingsPage;
