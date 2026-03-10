import { Outlet } from 'react-router';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(145deg, #fff5f5 0%, #fff0f0 50%, #ffffff 100%)', fontFamily: 'Outfit, Inter, sans-serif' }}>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #fecdd3, transparent)', filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.1]"
          style={{ background: 'radial-gradient(circle, #fda4af, transparent)', filter: 'blur(100px)' }} />
      </div>
      <Navbar />
      <main className="relative pt-16">
        <Outlet />
      </main>
    </div>
  );
}

export function FullLayout() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(145deg, #fff5f5 0%, #fff0f0 50%, #ffffff 100%)', fontFamily: 'Outfit, Inter, sans-serif' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/3 w-[600px] h-[600px] rounded-full opacity-[0.15]"
          style={{ background: 'radial-gradient(circle, #fecdd3, transparent)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full opacity-[0.1]"
          style={{ background: 'radial-gradient(circle, #fda4af, transparent)', filter: 'blur(100px)' }} />
      </div>
      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
}
