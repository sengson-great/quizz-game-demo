import { Outlet } from 'react-router';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(145deg, #0a0e27 0%, #131842 40%, #1a1145 70%, #0f172a 100%)', fontFamily: 'Outfit, Inter, sans-serif' }}>
      {/* Ambient background orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(120px)' }} />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(120px)' }} />
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', filter: 'blur(100px)' }} />
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
    <div className="min-h-screen" style={{ background: 'linear-gradient(145deg, #0a0e27 0%, #131842 40%, #1a1145 70%, #0f172a 100%)', fontFamily: 'Outfit, Inter, sans-serif' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/3 w-[700px] h-[700px] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)', filter: 'blur(130px)' }} />
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-[0.08]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)', filter: 'blur(120px)' }} />
        <div className="absolute top-1/3 left-0 w-[350px] h-[350px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent)', filter: 'blur(100px)' }} />
      </div>
      <main className="relative">
        <Outlet />
      </main>
    </div>
  );
}
