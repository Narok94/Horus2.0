
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './src/index.css';
import './src/personal.css';
import './src/background.css';
import './src/cards.css';
import './src/activeExercise.css';
import './src/branding.css';
import './src/diet.css';
import './src/redesign.css';

console.info('[HORUS BUILD]', import.meta.env.VITE_BUILD_SHA);

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
