import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import FavoriteRecipes from '../components/FavoriteRecipes';
import ShoppingList from '../components/ShoppingList';
import './UserProfile.css';

type TabType = 'favorites' | 'shopping-list';

const UserProfile: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('favorites');

  return (
    <div className="user-profile">
      <div className="user-profile-header">
        <h1>My Profile</h1>
        <div className="user-info">
          <p className="user-email">{user?.email}</p>
        </div>
      </div>

      <div className="user-profile-tabs">
        <button
          className={`tab-button ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => setActiveTab('favorites')}
        >
          Favorites
        </button>
        <button
          className={`tab-button ${activeTab === 'shopping-list' ? 'active' : ''}`}
          onClick={() => setActiveTab('shopping-list')}
        >
          Shopping List
        </button>
      </div>

      <div className="user-profile-content">
        {activeTab === 'favorites' && <FavoriteRecipes />}
        {activeTab === 'shopping-list' && <ShoppingList />}
      </div>
    </div>
  );
};

export default UserProfile;
