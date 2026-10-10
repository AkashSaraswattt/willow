import { Users, Plus } from "lucide-react";
import Sidebar from "../components/Sidebar";
import { useState, useEffect } from "react";
import { groupsAPI } from "../lib/groupsAPI";
import toast from "react-hot-toast";
import { useChatStore } from "../store/useChatStore";
import ChatContainer from "../components/ChatContainer";
import { useTranslation } from "../lib/translations";

const GroupsPage = () => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const { selectedUser, getGroups } = useChatStore();
  const { t } = useTranslation();

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const name = formData.get('name');
    
    try {
      const result = await groupsAPI.createGroup(name);
      toast.success(`Group "${name}" created! Join code: ${result.group.joinCode}`);
      setShowCreateModal(false);
      getGroups(); // Refresh groups list
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handleJoinGroup = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const joinCode = formData.get('joinCode');
    
    try {
      const result = await groupsAPI.joinGroup(joinCode.toUpperCase());
      toast.success(`Joined group "${result.group.name}"!`);
      setShowJoinModal(false);
      getGroups(); // Refresh groups list
    } catch (error) {
      toast.error(error.message);
    }
  };
  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16 sm:pt-20 px-2 sm:px-4 pb-2 sm:pb-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-7xl laptop:max-w-8xl 3xl:max-w-9xl h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-6rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <Sidebar />
            
            <div className="flex-1 flex flex-col min-w-0">
              {selectedUser ? (
                <ChatContainer />
              ) : (
                <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
                  <div className="text-center max-w-xs sm:max-w-sm lg:max-w-md">
                    <div className="flex justify-center mb-4 sm:mb-6">
                      <div className="rounded-full bg-primary/10 p-4 sm:p-6">
                        <Users className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
                      </div>
                    </div>
                    
                    <h1 className="text-lg sm:text-xl lg:text-2xl font-bold mb-2">
                      {t('groupChats')}
                    </h1>
                    
                    <p className="text-sm sm:text-base text-base-content/60 mb-4 sm:mb-6">
                      {t('createJoinGroups')}
                    </p>
                    
                    <div className="space-y-2 sm:space-y-3">
                      <button 
                        className="btn btn-primary w-full sm:btn-wide gap-2 text-sm sm:text-base"
                        onClick={() => setShowCreateModal(true)}
                      >
                        <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                        {t('createGroup')}
                      </button>
                      
                      <button 
                        className="btn btn-outline w-full sm:btn-wide text-sm sm:text-base"
                        onClick={() => setShowJoinModal(true)}
                      >
                        {t('joinGroup')}
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Create Group Modal */}
      {showCreateModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="font-bold text-lg mb-4">{t('createGroup')}</h3>
            <form onSubmit={handleCreateGroup}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text text-sm sm:text-base">{t('groupName')}</span>
                </label>
                <input 
                  type="text" 
                  name="name"
                  placeholder={t('enterGroupName')} 
                  className="input input-bordered text-sm sm:text-base" 
                  required 
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-sm sm:btn-md" onClick={() => setShowCreateModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary btn-sm sm:btn-md">{t('create')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      
      {/* Join Group Modal */}
      {showJoinModal && (
        <div className="modal modal-open">
          <div className="modal-box w-11/12 max-w-md">
            <h3 className="font-bold text-lg mb-4">{t('joinGroup')}</h3>
            <form onSubmit={handleJoinGroup}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text text-sm sm:text-base">{t('joinCode')}</span>
                </label>
                <input 
                  type="text" 
                  name="joinCode"
                  placeholder={t('enterJoinCode')} 
                  className="input input-bordered text-sm sm:text-base uppercase" 
                  maxLength="8"
                  required 
                />
              </div>
              <div className="modal-action">
                <button type="button" className="btn btn-sm sm:btn-md" onClick={() => setShowJoinModal(false)}>{t('cancel')}</button>
                <button type="submit" className="btn btn-primary btn-sm sm:btn-md">{t('join')}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupsPage;