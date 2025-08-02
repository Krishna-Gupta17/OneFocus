import React, { useState, useEffect } from 'react';
import { CogIcon, UserIcon, CameraIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const CLOUDINARY_UPLOAD_PRESET = 'focus_profile';
const CLOUDINARY_CLOUD_NAME = 'dmn7dmpgo';

const Settings = () => {
  const { user } = useAuth();

  const [userProfile, setUserProfile] = useState({
    displayName: '',
    bio: '',
    profilePicture: '',
    settings: {
      soundEnabled: true,
    },
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    loadUserProfile();
  }, [user]);

  const loadUserProfile = async () => {
    if (!user) return;

    try {
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${user.uid}`);
      if (response.ok) {
        const userData = await response.json();
        setUserProfile({
          displayName: userData.displayName || '',
          bio: userData.bio || '',
          profilePicture: userData.profilePicture || '',
          settings: {
            soundEnabled: userData.settings?.soundEnabled !== false,
          },
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
      const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/users/${user.uid}`, {
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
    setUserProfile((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

    setUploadingImage(true);

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();
      if (data.secure_url) {
        setUserProfile((prev) => ({
          ...prev,
          profilePicture: data.secure_url,
        }));
        toast.success('Image uploaded successfully!');
      } else {
        toast.error('Image upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Upload error');
    } finally {
      setUploadingImage(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse space-y-4 w-full max-w-md p-4">
          <div className="h-8 bg-white/10 rounded"></div>
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-20 bg-white/10 rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2 flex justify-center items-center gap-3">
            <CogIcon className="w-8 h-8 text-purple-400" />
            Settings
          </h2>
          <p className="text-white/70">Customize your profile.</p>
        </div>

        <div className="grid grid-cols-1 gap-6">
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
                  <label className="absolute bottom-0 right-0 p-2 bg-purple-600 hover:bg-purple-700 text-white rounded-full cursor-pointer transition-colors">
                    <CameraIcon className="w-4 h-4" />
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>
                <p className="text-white/60 text-sm">
                  {uploadingImage ? 'Uploading...' : 'Click to change profile picture'}
                </p>
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

              {/* Email */}
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
    </div>
  );
};

export default Settings;
