import { Link } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { LogOut, MessageSquare } from "lucide-react";
import { useTranslation } from "../lib/translations";

const Navbar = () => {
  const { logout, authUser } = useAuthStore();
  const { t } = useTranslation();

  return (
    <header
      className="bg-base-100 border-b border-base-300 fixed w-full top-0 z-40 
    backdrop-blur-lg bg-base-100/80"
    >
      <div className="container mx-auto px-4 h-16">
        <div className="flex items-center justify-between h-full">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 hover:opacity-80 transition-all">
              <div className="size-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-primary" />
              </div>
              <h1 className="text-lg font-bold">{t('appName')}</h1>
            </Link>
          </div>

          <div className="flex items-center gap-2">
            {authUser && (
              <button className="flex gap-2 items-center btn btn-sm" onClick={logout}>
                <LogOut className="size-5" />
                <span className="hidden sm:inline">{t('logout')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
export default Navbar;