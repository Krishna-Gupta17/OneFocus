import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import { 
  HomeIcon, 
  ChartBarIcon, 
  UserGroupIcon, 
  CogIcon,
  ArrowRightOnRectangleIcon 
} from '@heroicons/react/24/outline';

const Navbar = ({ activeTab, setActiveTab }) => {
  const { user, logout } = useAuth();

  const navItems = [
    { id: 'dashboard', name: 'Dashboard', icon: HomeIcon },
    { id: 'analytics', name: 'Analytics', icon: ChartBarIcon },
    { id: 'compete', name: 'Compete', icon: UserGroupIcon },
    { id: 'settings', name: 'Settings', icon: CogIcon },
  ];

  return (
    <nav className="backdrop-blur-lg bg-white/10 border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex items-center gap-2">
              <div className="">
                <span className="text-white font-bold text-sm">
                  <img src="src\components\Layout\Asset 1@4x 4[1].png" alt="icon" className="w-4 h-4 scale-[1.7]" ></img>
                </span>
              </div>
              <h1 className="text-xl font-bold text-white">ONE FOCUS</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                    activeTab === item.id
                      ? 'bg-purple-600/50 text-white'
                      : 'text-white/70 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-sm font-medium">{item.name}</span>
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-white font-medium text-sm">{user?.email}</p>
              <p className="text-white/60 text-xs">Study Warrior</p>
            </div>
            <button
              onClick={logout}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-all duration-200"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
