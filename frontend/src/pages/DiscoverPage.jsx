import { useState, useEffect, useCallback } from 'react';
import { useFriendStore } from '../store/useFriendStore.js';
import FriendCard from '../components/FriendCard.jsx';
import SimpleSidebar from '../components/SimpleSidebar.jsx';
import { Search, Users, UserPlus, Sparkles } from 'lucide-react';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import { useChatStore } from '../store/useChatStore.js';
import { useTranslation } from '../lib/translations.js';

const DiscoverPage = () => {
  const navigate = useNavigate();
  const { openHumanChat, openAiPanel } = useChatStore();
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState('');
  const {
    sentRequests,
    receivedRequests,
    searchResults,
    discoverableUsers,
    isSearching,
    isLoadingDiscoverable,
    searchUsers,
    fetchDiscoverableUsers,
    sendFriendRequest,
    cancelFriendRequest,
    respondToFriendRequest,
    fetchSentRequests,
    fetchReceivedRequests,
    clearSearch
  } = useFriendStore();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((query) => {
      searchUsers(query);
    }, 300),
    [searchUsers]
  );

  useEffect(() => {
    fetchSentRequests();
    fetchReceivedRequests();
    fetchDiscoverableUsers();
  }, [fetchSentRequests, fetchReceivedRequests, fetchDiscoverableUsers]);

  useEffect(() => {
    if (searchQuery.trim()) {
      debouncedSearch(searchQuery);
    } else {
      clearSearch();
    }
  }, [searchQuery, debouncedSearch, clearSearch]);

  const handleSendRequest = async (recipientId) => {
    try {
      await sendFriendRequest(recipientId);
      // Refresh discoverable users to update status
      if (!searchQuery.trim()) {
        fetchDiscoverableUsers();
      }
    } catch (error) {
      console.error('Failed to send request:', error);
    }
  };

  const handleCancelRequest = async (requestId) => {
    try {
      await cancelFriendRequest(requestId);
    } catch (error) {
      console.error('Failed to cancel request:', error);
    }
  };

  const handleAcceptRequest = async (requestId) => {
    try {
      await respondToFriendRequest(requestId, 'accept');
    } catch (error) {
      console.error('Failed to accept request:', error);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      await respondToFriendRequest(requestId, 'reject');
    } catch (error) {
      console.error('Failed to reject request:', error);
    }
  };

  const DiscoverSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <div key={i} className="bg-base-100 rounded-2xl p-4 border border-base-300/50">
          <div className="flex items-center gap-4">
            <div className="skeleton w-12 h-12 rounded-full"></div>
            <div className="flex-1">
              <div className="skeleton h-4 w-24 mb-2"></div>
              <div className="skeleton h-3 w-32"></div>
            </div>
            <div className="skeleton h-9 w-24 rounded-full"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const displayUsers = searchQuery.trim() ? searchResults : discoverableUsers;
  const isLoading = searchQuery.trim() ? isSearching : isLoadingDiscoverable;

  return (
    <div className="h-screen bg-base-200">
      <div className="flex items-center justify-center pt-16 sm:pt-20 px-2 sm:px-4 pb-2 sm:pb-4">
        <div className="bg-base-100 rounded-lg shadow-cl w-full max-w-7xl laptop:max-w-8xl 3xl:max-w-9xl h-[calc(100vh-4.5rem)] sm:h-[calc(100vh-6rem)]">
          <div className="flex h-full rounded-lg overflow-hidden">
            <SimpleSidebar />
            
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-primary/10 rounded-xl">
              <Sparkles className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-3xl font-bold text-base-content">{t('discoverFriends')}</h1>
          </div>
          <p className="text-base-content/70 text-lg">{t('findConnect')}</p>
        </div>

        {/* Desktop Layout */}
        <div className="hidden lg:grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Search & Discover Grid */}
          <div className="lg:col-span-2 space-y-6">
            {/* Search Bar */}
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300/50 p-6">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
                <input
                  type="text"
                  placeholder={t('searchFriends')}
                  className="input input-bordered w-full pl-12 pr-4 h-12 rounded-xl bg-base-200/50 border-base-300 focus:border-primary focus:bg-base-100 transition-all duration-200"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Discover Grid */}
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300/50 p-6">
              <div className="flex items-center gap-2 mb-6">
                <Users className="w-5 h-5 text-primary" />
                <h2 className="text-xl font-semibold">
                  {searchQuery.trim() ? `${t('searchResults')} (${displayUsers.length})` : `${t('discoverPeople')} (${displayUsers.length})`}
                </h2>
              </div>
              
              {isLoading ? (
                <DiscoverSkeleton />
              ) : displayUsers.length > 0 ? (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                  {displayUsers.map((user) => (
                    <FriendCard
                      key={user._id}
                      user={user}
                      status="search"
                      onSend={handleSendRequest}
                    />
                  ))}
                </div>
              ) : searchQuery.trim() ? (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-base-content/70 mb-2">No users found</h3>
                  <p className="text-base-content/50">Try searching with different keywords</p>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Sparkles className="w-16 h-16 text-base-content/30 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-base-content/70 mb-2">No users to discover</h3>
                  <p className="text-base-content/50">Check back later for new people to connect with</p>
                </div>
              )}
            </div>
          </div>

          {/* Right Panel - Friend Requests */}
          <div className="space-y-6">
            {/* Received Requests */}
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-success" />
                <h2 className="text-lg font-semibold">{t('friendRequests')}</h2>
                <div className="badge badge-success badge-sm">{receivedRequests.length}</div>
              </div>
              
              <div className="space-y-3">
                {receivedRequests.length > 0 ? (
                  receivedRequests.map((request) => (
                    <FriendCard
                      key={request._id}
                      user={request.requester}
                      status="received"
                      createdAt={request.createdAt}
                      onAccept={() => handleAcceptRequest(request._id)}
                      onReject={() => handleRejectRequest(request._id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                    <p className="text-base-content/60 text-sm">{t('noRequests')}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sent Requests */}
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300/50 p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-warning" />
                <h2 className="text-lg font-semibold">{t('sentRequests')}</h2>
                <div className="badge badge-warning badge-sm">{sentRequests.length}</div>
              </div>
              
              <div className="space-y-3">
                {sentRequests.length > 0 ? (
                  sentRequests.map((request) => (
                    <FriendCard
                      key={request._id}
                      user={request.recipient}
                      status="sent"
                      createdAt={request.createdAt}
                      onCancel={() => handleCancelRequest(request._id)}
                    />
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                    <p className="text-base-content/60 text-sm">{t('noPending')}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout */}
        <div className="lg:hidden space-y-6">
          {/* Search Bar */}
          <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300/50 p-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-base-content/50" />
              <input
                type="text"
                placeholder="Search for friends..."
                className="input input-bordered w-full pl-12 pr-4 h-12 rounded-xl bg-base-200/50 border-base-300 focus:border-primary focus:bg-base-100 transition-all duration-200"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Friend Requests - Mobile */}
          {receivedRequests.length > 0 && (
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300/50 p-4">
              <div className="flex items-center gap-2 mb-4">
                <UserPlus className="w-5 h-5 text-success" />
                <h2 className="text-lg font-semibold">Friend Requests</h2>
                <div className="badge badge-success badge-sm">{receivedRequests.length}</div>
              </div>
              
              <div className="space-y-3">
                {receivedRequests.map((request) => (
                  <FriendCard
                    key={request._id}
                    user={request.requester}
                    status="received"
                    createdAt={request.createdAt}
                    onAccept={() => handleAcceptRequest(request._id)}
                    onReject={() => handleRejectRequest(request._id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Discover Grid - Mobile */}
          <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300/50 p-4">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-5 h-5 text-primary" />
              <h2 className="text-lg font-semibold">
                {searchQuery.trim() ? `Search Results (${displayUsers.length})` : `Discover People (${displayUsers.length})`}
              </h2>
            </div>
            
            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-base-200 rounded-2xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="skeleton w-12 h-12 rounded-full"></div>
                      <div className="flex-1">
                        <div className="skeleton h-4 w-24 mb-2"></div>
                        <div className="skeleton h-3 w-32"></div>
                      </div>
                      <div className="skeleton h-9 w-24 rounded-full"></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : displayUsers.length > 0 ? (
              <div className="space-y-3">
                {displayUsers.map((user) => (
                  <FriendCard
                    key={user._id}
                    user={user}
                    status="search"
                    onSend={handleSendRequest}
                  />
                ))}
              </div>
            ) : searchQuery.trim() ? (
              <div className="text-center py-8">
                <Users className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                <p className="text-base-content/60">No users found</p>
              </div>
            ) : (
              <div className="text-center py-8">
                <Sparkles className="w-12 h-12 text-base-content/30 mx-auto mb-3" />
                <p className="text-base-content/60">No users to discover</p>
              </div>
            )}
          </div>

          {/* Sent Requests - Mobile */}
          {sentRequests.length > 0 && (
            <div className="bg-base-100 rounded-2xl shadow-lg border border-base-300/50 p-4">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-warning" />
                <h2 className="text-lg font-semibold">Sent Requests</h2>
                <div className="badge badge-warning badge-sm">{sentRequests.length}</div>
              </div>
              
              <div className="space-y-3">
                {sentRequests.map((request) => (
                  <FriendCard
                    key={request._id}
                    user={request.recipient}
                    status="sent"
                    createdAt={request.createdAt}
                    onCancel={() => handleCancelRequest(request._id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiscoverPage;