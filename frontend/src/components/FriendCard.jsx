import { formatDistanceToNow } from 'date-fns';
import { UserPlus, Check, X } from 'lucide-react';

const FriendCard = ({ user, status, onSend, onCancel, onAccept, onReject, createdAt }) => {
  const getTimeAgo = () => {
    if (!createdAt) return '';
    try {
      return formatDistanceToNow(new Date(createdAt), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const renderActions = () => {
    if (status === 'search') {
      return (
        <button
          onClick={() => onSend(user._id)}
          disabled={user.hasPendingRequest || user.isFriend}
          className={`
            btn rounded-full px-4 py-2 min-h-0 h-9 text-sm font-medium transition-all duration-200
            ${user.isFriend 
              ? 'btn-success btn-disabled cursor-not-allowed' 
              : user.hasPendingRequest 
                ? 'btn-ghost btn-disabled cursor-not-allowed'
                : 'btn-primary hover:scale-105 shadow-md hover:shadow-lg'
            }
          `}
          aria-label={`Send friend request to ${user.fullName}`}
        >
          {user.isFriend ? (
            <><Check className="w-4 h-4 mr-1" />Friends</>
          ) : user.hasPendingRequest ? (
            'Request Sent'
          ) : (
            <><UserPlus className="w-4 h-4 mr-1" />Send Request</>
          )}
        </button>
      );
    }

    if (status === 'sent') {
      return (
        <button
          onClick={() => onCancel(user._id)}
          className="btn btn-ghost rounded-full px-4 py-2 min-h-0 h-9 text-sm hover:btn-error transition-all duration-200"
          aria-label={`Cancel friend request to ${user.fullName}`}
        >
          <X className="w-4 h-4 mr-1" />Cancel
        </button>
      );
    }

    if (status === 'received') {
      return (
        <div className="flex gap-2">
          <button
            onClick={() => onAccept(user._id)}
            className="btn btn-success rounded-full px-3 py-2 min-h-0 h-9 text-sm hover:scale-105 transition-all duration-200"
            aria-label={`Accept friend request from ${user.fullName}`}
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => onReject(user._id)}
            className="btn btn-error rounded-full px-3 py-2 min-h-0 h-9 text-sm hover:scale-105 transition-all duration-200"
            aria-label={`Reject friend request from ${user.fullName}`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      );
    }

    return null;
  };

  return (
    <div className="group relative bg-base-100 rounded-2xl shadow-md hover:shadow-lg transition-all duration-300 hover:scale-[1.02] p-4 border border-base-300/50 hover:border-primary/20 cursor-pointer">
      {/* Hover glow effect */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="relative flex items-center gap-4">
        <div className="avatar flex-shrink-0">
          <div className="w-12 h-12 rounded-full ring-2 ring-base-300 group-hover:ring-primary/30 transition-all duration-300">
            {user.profilePic ? (
              <img
                src={user.profilePic}
                alt={user.fullName}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-full h-full rounded-full bg-primary flex items-center justify-center text-primary-content font-semibold text-lg">
                {user.fullName?.split(' ').map(name => name.charAt(0)).join('').toUpperCase().slice(0, 2) || 'U'}
              </div>
            )}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-base-content break-words group-hover:text-primary transition-colors duration-200 leading-tight">
            {user.fullName}
          </h3>
          <p className="text-sm text-base-content/60 mt-0.5">
            {createdAt ? getTimeAgo() : 'Available to connect'}
          </p>
        </div>

        <div className="flex-shrink-0 opacity-100 group-hover:opacity-100 transition-opacity duration-200">
          {renderActions()}
        </div>
      </div>
    </div>
  );
};

export default FriendCard;