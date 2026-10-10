import { useState } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Camera, Mail, User } from "lucide-react";
import SimpleSidebar from "../components/SimpleSidebar";
import { useTranslation } from "../lib/translations";

const ProfilePage = () => {
  const { authUser, isUpdatingProfile, updateProfile } = useAuthStore();
  const [selectedImg, setSelectedImg] = useState(null);
  const { t } = useTranslation();

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.readAsDataURL(file);

    reader.onload = async () => {
      const base64Image = reader.result;
      setSelectedImg(base64Image);
      await updateProfile({ profilePic: base64Image });
    };
  };

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16 sm:pt-20 px-2 sm:px-4 pb-2 sm:pb-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-7xl laptop:max-w-8xl 3xl:max-w-9xl h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-6rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <SimpleSidebar />
            
            <div className="flex-1 p-3 sm:p-6 overflow-y-auto">
              <div className="max-w-4xl laptop:max-w-5xl mx-auto">
                <div className="bg-base-300 rounded-xl p-4 sm:p-6 space-y-6 sm:space-y-8">
          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-semibold">{t('profile')}</h1>
            <p className="mt-2 text-sm sm:text-base">{t('profileInfo')}</p>
          </div>

          {/* avatar upload section */}
          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="relative">
              <img
                src={selectedImg || authUser.profilePic || "/avatar.png"}
                alt="Profile"
                className="size-24 sm:size-32 rounded-full object-cover border-4"
              />
              <label
                htmlFor="avatar-upload"
                className={`
                  absolute bottom-0 right-0 
                  bg-base-content hover:scale-105
                  p-1.5 sm:p-2 rounded-full cursor-pointer 
                  transition-all duration-200
                  ${isUpdatingProfile ? "animate-pulse pointer-events-none" : ""}
                `}
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="text-xs sm:text-sm text-zinc-400 text-center px-4">
              {isUpdatingProfile ? "Uploading..." : "Click the camera icon to update your photo"}
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">
            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <User className="w-4 h-4" />
                {t('fullName')}
              </div>
              <p className="px-3 sm:px-4 py-2 sm:py-2.5 bg-base-200 rounded-lg border text-sm sm:text-base">{authUser?.fullName}</p>
            </div>

            <div className="space-y-1.5">
              <div className="text-sm text-zinc-400 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {t('emailAddress')}
              </div>
              <p className="px-3 sm:px-4 py-2 sm:py-2.5 bg-base-200 rounded-lg border text-sm sm:text-base break-all">{authUser?.email}</p>
            </div>
          </div>

          <div className="mt-4 sm:mt-6 bg-base-300 rounded-xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">{t('accountInfo')}</h2>
            <div className="space-y-2 sm:space-y-3 text-sm">
              <div className="flex items-center justify-between py-2 border-b border-zinc-700">
                <span>{t('memberSince')}</span>
                <span className="text-xs sm:text-sm">
                  {authUser?.createdAt ? new Date(authUser.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span>{t('accountStatus')}</span>
                <span className="text-green-500 text-xs sm:text-sm">{t('active')}</span>
              </div>
            </div>
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
export default ProfilePage;
