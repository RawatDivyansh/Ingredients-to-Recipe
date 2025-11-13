import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary, Layout, ProtectedRoute } from './components';
import { AuthProvider } from './contexts';
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
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="recipes" element={<RecipeResults />} />
              <Route path="recipes/:id" element={<RecipeDetail />} />
              <Route
                path="profile"
                element={
                  <ProtectedRoute>
                    <UserProfile />
                  </ProtectedRoute>
                }
              />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
