import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ErrorBoundary, Layout, ProtectedRoute, LoadingSpinner } from './components';
import { AuthProvider } from './contexts';
import './App.css';

// Code splitting by route using React.lazy
const HomePage = lazy(() => import('./pages/HomePage'));
const RecipeResults = lazy(() => import('./pages/RecipeResults'));
const RecipeDetail = lazy(() => import('./pages/RecipeDetail'));
const UserProfile = lazy(() => import('./pages/UserProfile'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Suspense fallback={<LoadingSpinner message="Loading page..." size="large" />}>
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
          </Suspense>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
