import React, { useState, useEffect } from 'react';
import { CogIcon, UserIcon, CameraIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const Settings = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState({
    displayName: '',
    bio: '',
    profilePicture: '',
    settings: {
      focusThreshold: 75,
      studyReminders: true,
      soundEnabled: true
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;
    
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.uid}`);
      if (response.ok) {
        const userData = await response.json();
        setUserProfile({
          displayName: userData.displayName || '',
          bio: userData.bio || '',
          profilePicture: userData.profilePicture || '',
          settings: {
            focusThreshold: userData.settings?.focusThreshold || 75,
            studyReminders: userData.settings?.studyReminders !== false,
            soundEnabled: userData.settings?.soundEnabled !== false
          }
        });
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    try {
      const response = await fetch(`http://localhost:5000/api/users/${user.uid}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userProfile),
      });
      
      if (response.ok) {
        toast.success('Profile updated successfully!');
      } else {
        toast.error('Failed to update profile');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setUserProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSettingChange = (setting, value) => {
    setUserProfile(prev => ({
      ...prev,
      settings: {
        ...prev.settings,
        [setting]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white/10 rounded mb-6"></div>
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-20 bg-white/10 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <CogIcon className="w-8 h-8 text-purple-400" />
          Settings
        </h2>
        <p className="text-white/70">
          Customize your profile and study preferences.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Settings */}
        <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <UserIcon className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold text-white">Profile Information</h3>
          </div>

          <div className="space-y-4">
            {/* Profile Picture */}
            <div className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                {userProfile.profilePicture ? (
                  <img
                    src={userProfile.profilePicture}
                    alt="Profile"
                    className="w-full h-full object-cover rounded-full border-4 border-purple-500/30"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-2xl">
                      {(userProfile.displayName || user?.email || 'U')[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <button className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors">
                  <CameraIcon className="w-4 h-4" />
                </button>
              </div>
              <p className="text-white/60 text-sm">Click to change profile picture</p>
            </div>

            {/* Display Name */}
            <div>
              <label className="text-white/80 text-sm block mb-2">Display Name</label>
              <input
                type="text"
                value={userProfile.displayName}
                onChange={(e) => handleInputChange('displayName', e.target.value)}
                placeholder="Enter your display name"
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="text-white/80 text-sm block mb-2">Email</label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full p-3 rounded-lg bg-white/5 border border-white/10 text-white/60 cursor-not-allowed"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="text-white/80 text-sm block mb-2">Bio</label>
              <textarea
                value={userProfile.bio}
                onChange={(e) => handleInputChange('bio', e.target.value)}
                placeholder="Tell us about yourself..."
                rows={3}
                className="w-full p-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Study Settings */}
        <div className="backdrop-blur-lg bg-white/10 p-6 rounded-2xl border border-white/20">
          <div className="flex items-center gap-2 mb-6">
            <CogIcon className="w-6 h-6 text-green-400" />
            <h3 className="text-xl font-bold text-white">Study Preferences</h3>
          </div>

          <div className="space-y-6">
            {/* Focus Threshold */}
            <div>
              <label className="text-white/80 text-sm block mb-2">
                Focus Threshold ({userProfile.settings.focusThreshold}%)
              </label>
              <p className="text-white/60 text-xs mb-3">
                Timer will pause when focus drops below this level
              </p>
              <input
                type="range"
                min="50"
                max="95"
                value={userProfile.settings.focusThreshold}
                onChange={(e) => handleSettingChange('focusThreshold', parseInt(e.target.value))}
                className="w-full h-2 bg-white/10 rounded-lg appearance-none slider"
              />
              <div className="flex justify-between text-xs text-white/60 mt-1">
                <span>50%</span>
                <span>95%</span>
              </div>
            </div>

            {/* Study Reminders */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-semibold">Study Reminders</h4>
                <p className="text-white/60 text-sm">Get notifications for study sessions</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userProfile.settings.studyReminders}
                  onChange={(e) => handleSettingChange('studyReminders', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Sound Enabled */}
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-semibold">Sound Effects</h4>
                <p className="text-white/60 text-sm">Enable audio feedback and notifications</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={userProfile.settings.soundEnabled}
                  onChange={(e) => handleSettingChange('soundEnabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-white/20 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            {/* Account Stats */}
            <div className="border-t border-white/10 pt-4">
              <h4 className="text-white font-semibold mb-3">Account Statistics</h4>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-purple-400">
                    {Math.floor(Math.random() * 50) + 10}
                  </p>
                  <p className="text-white/60 text-xs">Days Active</p>
                </div>
                <div className="p-3 bg-white/5 rounded-lg">
                  <p className="text-2xl font-bold text-green-400">
                    {Math.floor(Math.random() * 20) + 5}
                  </p>
                  <p className="text-white/60 text-xs">Friends</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="mt-8 text-center">
        <button
          onClick={saveProfile}
          disabled={saving}
          className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};

export default Settings;