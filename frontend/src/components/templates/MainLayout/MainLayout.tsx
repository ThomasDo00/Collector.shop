import { Outlet } from 'react-router-dom';
import Header from '@/components/organisms/Header';
import Footer from '@/components/organisms/Footer';

/**
 * Main layout with header and footer
 */
function MainLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}

export default MainLayout;
