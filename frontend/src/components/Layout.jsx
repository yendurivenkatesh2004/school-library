import { Outlet } from 'react-router-dom';
import Navbar from './Navbar.jsx';
import Footer from './Footer.jsx';
import useTableLabels from '../utils/useTableLabels.js';

export default function Layout() {
  useTableLabels();
  return (
    <div className="app-shell">
      <Navbar />
      <main className="main container">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
