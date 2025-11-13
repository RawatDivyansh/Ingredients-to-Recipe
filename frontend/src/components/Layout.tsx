import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const Layout: React.FC = () => {
  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-brand">
          <Link to="/">Ingredients to Recipe</Link>
        </div>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>
      <main className="main-content">
        <Outlet />
      </main>
      <footer className="footer">
        <p>&copy; 2024 Ingredients to Recipe. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Layout;
