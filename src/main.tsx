import React from 'react'; // react
import { createRoot } from 'react-dom/client'; // dom client
import App from './App'; // app
import './index.css'; // styles

const el = document.getElementById('root'); // root element
if (!el) { // guard
  throw new Error('Root element not found'); // error
}
createRoot(el).render( // render
  <React.StrictMode> {/* strict mode */}
    <App /> {/* app */}
  </React.StrictMode>
);