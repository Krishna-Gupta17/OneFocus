
import { createRoot } from 'react-dom/client';
import { HashRouter} from 'react-router-dom'
import App from './App.jsx';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'boxicons/css/boxicons.min.css';
import './index.css'; // Tailwind (via PostCSS build, not CDN)


createRoot(document.getElementById('root')!).render(
  < HashRouter>
    <App />
  </ HashRouter>
);
