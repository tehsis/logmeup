import { useAuth0 } from '@auth0/auth0-react';

export const UserProfile = () => {
  const { user, logout, isLoading } = useAuth0();

  const handleLogout = () => {
    logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="relative group">
      <button className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 transition-colors">
        <img
          src={user.picture || '/default-avatar.png'}
          alt={user.name || 'User'}
          className="h-8 w-8 rounded-full"
        />
        <span className="text-sm font-medium text-gray-700 hidden sm:block">
          {user.name || user.email}
        </span>
      </button>
      
      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
        <div className="px-4 py-2 border-b border-gray-100">
          <p className="text-sm font-medium text-gray-900">{user.name}</p>
          <p className="text-sm text-gray-500">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
}; 