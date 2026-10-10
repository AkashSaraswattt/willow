import { useEffect, useState } from "react";
import { useChatStore } from "../store/useChatStore";
import { useAuthStore } from "../store/useAuthStore";
import SidebarSkeleton from "./skeletons/SidebarSkeleton";
import SimpleSidebar from "./SimpleSidebar";
import Avatar from "./Avatar";
import { Users, Search, X } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "../lib/translations";
import { groupsAPI } from "../lib/groupsAPI";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { 
    getUsers, 
    getGroups,
    users, 
    groups,
    selectedUser, 
    setSelectedUser, 
    isUsersLoading,
    aiUsers,
    showAiPanel,
    openAiPanel,
    openHumanChat,
    setActiveAi,
    chatMode
  } = useChatStore();

  const { onlineUsers } = useAuthStore();
  const { socket } = useAuthStore();
  const [showOnlineOnly, setShowOnlineOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const isGroupsPage = location.pathname === '/groups';

  useEffect(() => {
    getUsers();
    if (isGroupsPage) {
      getGroups();
      openHumanChat(); // Reset to human chat mode when on groups page
    }
  }, [getUsers, getGroups, isGroupsPage, openHumanChat]);



  const filteredUsers = (Array.isArray(users) ? users : [])
    .filter((user) => {
      const matchesSearch = !searchQuery || 
        user.fullName?.toLowerCase().startsWith(searchQuery.toLowerCase());
      const matchesOnline = !showOnlineOnly || 
        (Array.isArray(onlineUsers) && onlineUsers.includes(user._id));
      return matchesSearch && matchesOnline;
    });

  // Count online friends only (not all online users)
  const onlineFriendsCount = (Array.isArray(users) ? users : []).filter((user) => 
    Array.isArray(onlineUsers) && onlineUsers.includes(user._id)
  ).length;

  // Combine regular users with AI users when AI panel is open, or groups when on groups page
  let allUsers, sidebarTitle;
  
  if (isGroupsPage) {
    allUsers = searchQuery 
      ? groups.filter(g => g.name?.toLowerCase().startsWith(searchQuery.toLowerCase()))
      : groups;
    sidebarTitle = 'Groups';
  } else if (chatMode === 'ai') {
    allUsers = searchQuery
      ? aiUsers.filter(ai => ai.fullName?.toLowerCase().startsWith(searchQuery.toLowerCase()))
      : aiUsers;
    sidebarTitle = t('contacts');
  } else {
    allUsers = filteredUsers;
    sidebarTitle = t('contacts');
  }

  const handleUserClick = (user) => {
    if (isGroupsPage) {
      // Handle group selection
      setSelectedUser(user);
    } else if (user.type === 'ai') {
      setActiveAi(user.id);
      setSelectedUser(user);
    } else {
      setSelectedUser(user);
    }
  };

  if (isUsersLoading) return <SidebarSkeleton />;

  return (
    <div className="flex h-full">
      {/* Unified Sidebar Navigation */}
      <SimpleSidebar />
      
      {/* Main Sidebar */}
      <aside className="h-full w-20 sm:w-24 md:w-28 lg:w-64 xl:w-72 laptop:w-80 border-r border-base-300 flex flex-col transition-all duration-200">
      <div className="border-b border-base-300 w-full p-3 sm:p-4 lg:p-5">
        <div className="flex items-center gap-2">
          <Users className="size-5 sm:size-6" />
          <span className="font-medium hidden lg:block text-sm laptop:text-base">{sidebarTitle}</span>
        </div>
        
        {/* Search Bar - hide for AI mode */}
        {chatMode !== 'ai' && (
          <div className="mt-2 sm:mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-base-content/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isGroupsPage ? "Search groups..." : "Search friends..."}
              className="w-full pl-9 pr-9 py-2 text-sm bg-base-200 border border-base-300 rounded-lg focus:outline-none focus:border-primary transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              >
                <X className="size-4" />
              </button>
            )}
          </div>
        )}

        {/* Online filter toggle - only show for contacts, not groups or AI */}
        {!isGroupsPage && chatMode !== 'ai' && (
          <div className="mt-2 sm:mt-3 hidden lg:flex items-center gap-2">
            <label className="cursor-pointer flex items-center gap-2">
              <input
                type="checkbox"
                checked={showOnlineOnly}
                onChange={(e) => setShowOnlineOnly(e.target.checked)}
                className="checkbox checkbox-sm"
              />
              <span className="text-xs laptop:text-sm">{t('showOnlineOnly')}</span>
            </label>
            <span className="text-[10px] laptop:text-xs text-zinc-500">
              ({onlineFriendsCount} {t('online').toLowerCase()})
            </span>
          </div>
        )}
      </div>

      <div className="overflow-y-auto w-full py-2 sm:py-3 flex-1">
        {allUsers.map((user) => (
          <button
            key={user._id || user.id}
            onClick={() => handleUserClick(user)}
            className={`
              w-full p-2 sm:p-3 flex items-center gap-2 sm:gap-3
              hover:bg-base-300 transition-colors
              ${(selectedUser?._id === user._id || selectedUser?.id === user.id) ? "bg-base-300 ring-1 ring-base-300" : ""}
            `}
          >
            <div className="relative mx-auto lg:mx-0">
              <Avatar user={user} size="md" />
              {(user.isOnline || (Array.isArray(onlineUsers) && onlineUsers.includes(user._id))) && (
                <span
                  className="absolute bottom-0 right-0 size-2.5 sm:size-3 bg-green-500 
                  rounded-full ring-2 ring-zinc-900"
                />
              )}
            </div>

            {/* User info - only visible on larger screens */}
            <div className="hidden lg:block text-left min-w-0 flex-1">
              <div className="font-medium truncate text-sm xl:text-base laptop:text-base">{user.fullName || user.name}</div>
              <div className="text-xs xl:text-sm laptop:text-sm text-zinc-400">
                {isGroupsPage ? `${user.memberCount || 1} members` :
                 user.type === 'ai' ? t('online') : 
                 (Array.isArray(onlineUsers) && onlineUsers.includes(user._id)) ? t('online') : t('offline')}
              </div>
            </div>
            
            {/* Unread count badge - only for individual chats */}
            {!isGroupsPage && user.unreadCount > 0 && (
              <div className="bg-green-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 flex items-center justify-center px-1.5">
                {user.unreadCount > 99 ? '99+' : user.unreadCount}
              </div>
            )}
          </button>
        ))}

        {allUsers.length === 0 && (
          <div className="text-center text-zinc-500 py-4 text-sm">
            {searchQuery ? 'No results found' : (isGroupsPage ? 'No groups yet' : (showOnlineOnly ? t('noOnlineFriends') : t('noFriends')))}
          </div>
        )}
      </div>

      {/* Get API Key at bottom - only for AI mode and not on groups page */}
      {chatMode === 'ai' && !isGroupsPage && (
        <div className="border-t border-base-300 p-3 sm:p-4">
          <a
            href="https://willowapi-lj3e.onrender.com/"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-sm btn-primary w-full text-xs laptop:text-sm"
          >
            Get API Key
          </a>
        </div>
      )}
    </aside>
    </div>
  );
};
export default Sidebar;
