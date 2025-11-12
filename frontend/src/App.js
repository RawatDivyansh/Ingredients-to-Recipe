import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Ingredients to Recipe</h1>
          <p>Find recipes based on what you have in your kitchen</p>
        </header>
      </div>
    </Router>
  );
}

export default App;
