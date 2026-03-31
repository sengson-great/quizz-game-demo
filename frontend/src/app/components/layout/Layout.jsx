import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
const LIGHT_BG = 'linear-gradient(145deg, #FFF5F5 0%, #FDE8EC 40%, #FCE4EC 70%, #FFF0F3 100%)';
export function Layout() {
    return (<div className="min-h-screen" style={{ background: LIGHT_BG, fontFamily: 'Poppins, Inter, sans-serif' }}>
      {/* Ambient rose-tinted orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.25]" style={{ background: 'radial-gradient(circle, #FCE4EC, transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.18]" style={{ background: 'radial-gradient(circle, #F8BBD0, transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full opacity-[0.12]" style={{ background: 'radial-gradient(circle, #F48FB1, transparent)', filter: 'blur(100px)' }}/>
      </div>
      <Navbar />
      <main className="relative pt-16">
        <Outlet />
      </main>
    </div>);
}
export function FullLayout() {
    return (<div className="min-h-screen" style={{ background: LIGHT_BG, fontFamily: 'Poppins, Inter, sans-serif' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/3 w-[700px] h-[700px] rounded-full opacity-[0.25]" style={{ background: 'radial-gradient(circle, #FCE4EC, transparent)', filter: 'blur(130px)' }}/>
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-[0.18]" style={{ background: 'radial-gradient(circle, #F8BBD0, transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute top-1/3 left-0 w-[350px] h-[350px] rounded-full opacity-[0.12]" style={{ background: 'radial-gradient(circle, #F48FB1, transparent)', filter: 'blur(100px)' }}/>
      </div>
      <main className="relative">
        <Outlet />
      </main>
    </div>);
}
