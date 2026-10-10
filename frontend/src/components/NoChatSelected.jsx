import { MessageSquare, Bot } from "lucide-react";
import { useEffect, useState } from "react";
import { useTranslation } from "../lib/translations";
import { useNavigate } from "react-router-dom";
import { useChatStore } from "../store/useChatStore";

const NoChatSelected = () => {
  const [showAnimation, setShowAnimation] = useState(true);
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { showAiPanel, chatMode, selectedUser } = useChatStore();

  useEffect(() => {
    // Show animation for 3 seconds when component mounts
    const timer = setTimeout(() => {
      setShowAnimation(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  // Show AI welcome screen when AI panel is active but no AI is selected
  if (showAiPanel && !selectedUser) {
    return (
      <div className="w-full flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-base-100/50">
        <div className="max-w-md text-center space-y-4 sm:space-y-6">
          {/* AI Icon Display */}
          <div className="flex justify-center gap-4 mb-4">
            <div className="relative">
              <div
                className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center
               justify-center ${
                 showAnimation ? 'animate-bounce' : 'hover:animate-bounce'
               }`}
              >
                <Bot className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
              </div>
            </div>
          </div>

          {/* AI Welcome Text */}
          <h2 className="text-xl sm:text-2xl font-bold">{t('welcomeToWillow')}</h2>
          <p className="text-sm sm:text-base text-base-content/60">
            {t('chooseAiAssistant')}
          </p>
        </div>
      </div>
    );
  }

  // Default human chat welcome screen
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-8 sm:p-16 bg-base-100/50">
      <div className="max-w-md text-center space-y-4 sm:space-y-6">
        {/* Icon Display */}
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className={`w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-primary/10 flex items-center
             justify-center ${
               showAnimation ? 'animate-bounce' : 'hover:animate-bounce'
             }`}
            >
              <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-xl sm:text-2xl font-bold">{t('welcomeToWillow')}</h2>
        <p className="text-sm sm:text-base text-base-content/60">
          {t('findPeopleConnect')}
        </p>
        <button 
          onClick={() => navigate('/discover')}
          className="btn btn-primary mt-4"
        >
          {t('discoverFriends')}
        </button>
      </div>
    </div>
  );
};

export default NoChatSelected;
