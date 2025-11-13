import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary, Layout } from './components';
import {
  HomePage,
  RecipeResults,
  RecipeDetail,
  UserProfile,
  Login,
  Register,
} from './pages';
import './App.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<HomePage />} />
            <Route path="recipes" element={<RecipeResults />} />
            <Route path="recipes/:id" element={<RecipeDetail />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
          </Route>
        </Routes>
      </Router>
    </ErrorBoundary>
  );
};

export default App;
