import { MoreVertical, UserX, UserCheck, X, Search, Copy, Users, LogOut } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { useChatStore } from "../store/useChatStore";
import Avatar from "./Avatar";
import { useState, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

const ChatHeader = () => {
  const { selectedUser, setSelectedUser, blockStatus, blockUser, unblockUser } = useChatStore();
  const { onlineUsers } = useAuthStore();
  const [showMenu, setShowMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMembers, setShowMembers] = useState(false);
  const [groupMembers, setGroupMembers] = useState([]);
  const [hasLeftGroup, setHasLeftGroup] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleBlock = async () => {
    await blockUser(selectedUser._id);
    setShowMenu(false);
  };

  const handleUnblock = async () => {
    await unblockUser(selectedUser._id);
    setShowMenu(false);
  };

  const handleCloseChat = () => {
    setSelectedUser(null);
    setShowMenu(false);
  };

  const handleSearch = () => {
    setShowSearch(true);
    setShowMenu(false);
  };

  const handleCopyCode = async () => {
    try {
      const res = await axiosInstance.get(`/groups/${selectedUser._id}/qr`);
      await navigator.clipboard.writeText(res.data.joinCode);
      toast.success('Join code copied to clipboard');
      setShowMenu(false);
    } catch (error) {
      toast.error('Failed to copy code');
    }
  };

  const handleShowMembers = async () => {
    try {
      const res = await axiosInstance.get(`/groups/${selectedUser._id}/members`);
      setGroupMembers(res.data);
      setShowMembers(true);
      setShowMenu(false);
    } catch (error) {
      toast.error('Failed to load members');
    }
  };

  const handleLeaveGroup = async () => {
    try {
      await axiosInstance.post(`/groups/${selectedUser._id}/leave`);
      setHasLeftGroup(true);
      setShowMenu(false);
      toast.success('You left the group');
      const event = new CustomEvent('groupLeft');
      window.dispatchEvent(event);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to leave group');
    }
  };

  return (
    <div className="p-2.5 border-b border-base-300">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="avatar">
            <Avatar user={selectedUser} size="sm" />
          </div>

          <div>
            <h3 className="font-medium">{selectedUser.fullName || selectedUser.name}</h3>
            <p className="text-sm text-base-content/70">
              {selectedUser.type === 'ai' ? "Online" : 
               selectedUser.memberCount ? `${selectedUser.memberCount} members` :
               (onlineUsers.includes(selectedUser._id) ? "Online" : "Offline")}
            </p>
          </div>
        </div>

        {selectedUser.type !== 'ai' && !selectedUser.memberCount && (
          <div className="relative" ref={menuRef}>
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 hover:bg-base-200 rounded-full"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 min-w-[150px]">
                <button 
                  onClick={handleSearch}
                  className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
                {blockStatus?.iBlockedThem ? (
                  <button 
                    onClick={handleUnblock}
                    className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-success"
                  >
                    <UserCheck className="w-4 h-4" />
                    Unblock
                  </button>
                ) : (
                  <button 
                    onClick={handleBlock}
                    className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-error"
                  >
                    <UserX className="w-4 h-4" />
                    Block
                  </button>
                )}
                <button 
                  onClick={handleCloseChat}
                  className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2"
                >
                  <X className="w-4 h-4" />
                  Close Chat
                </button>
              </div>
            )}
          </div>
        )}
        
        {(selectedUser.type === 'ai' || selectedUser.memberCount) && (
          <div className="relative" ref={menuRef}>
            {selectedUser.memberCount && !hasLeftGroup ? (
              <>
                <button 
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2 hover:bg-base-200 rounded-full"
                >
                  <MoreVertical className="w-5 h-5" />
                </button>
                
                {showMenu && (
                  <div className="absolute right-0 top-full mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-10 min-w-[150px]">
                    <button 
                      onClick={handleCopyCode}
                      className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-sm"
                    >
                      <Copy className="w-4 h-4" />
                      Copy Code
                    </button>
                    <button 
                      onClick={handleShowMembers}
                      className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-sm"
                    >
                      <Users className="w-4 h-4" />
                      Show Members
                    </button>
                    <button 
                      onClick={handleSearch}
                      className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-sm"
                    >
                      <Search className="w-4 h-4" />
                      Search
                    </button>
                    <button 
                      onClick={handleLeaveGroup}
                      className="w-full px-4 py-2 text-left hover:bg-base-200 flex items-center gap-2 text-error text-sm"
                    >
                      <LogOut className="w-4 h-4" />
                      Leave Group
                    </button>
                  </div>
                )}
              </>
            ) : (
              <button onClick={() => setSelectedUser(null)}>
                <X />
              </button>
            )}
          </div>
        )}
      </div>
      
      {showSearch && (
        <div className="mt-2">
          <div className="relative">
            <input
              type="text"
              placeholder="Search messages..."
              className="input input-sm w-full pr-8"
              onChange={(e) => {
                const event = new CustomEvent('searchMessages', { detail: e.target.value });
                window.dispatchEvent(event);
              }}
              autoFocus
            />
            <button
              onClick={() => {
                setShowSearch(false);
                const event = new CustomEvent('searchMessages', { detail: '' });
                window.dispatchEvent(event);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
      
      {showMembers && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={() => setShowMembers(false)}>
          <div className="bg-base-100 rounded-lg p-4 max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold text-lg">Group Members ({groupMembers.length})</h3>
              <button onClick={() => setShowMembers(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-2">
              {groupMembers.map((member) => (
                <div key={member._id} className="flex items-center gap-3 p-2 hover:bg-base-200 rounded">
                  <Avatar user={member.userId} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{member.userId.fullName}</p>
                    {member.userId.username && (
                      <p className="text-xs text-base-content/70 truncate">@{member.userId.username}</p>
                    )}
                  </div>
                  {member.role === 'owner' && (
                    <span className="badge badge-sm">admin</span>
                  )}
                  {member.role === 'admin' && (
                    <span className="badge badge-sm">admin</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatHeader;
