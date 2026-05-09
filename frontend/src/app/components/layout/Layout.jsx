import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
const LIGHT_BG = 'var(--grad-surface)';
export function Layout() {
    return (<div className="min-h-screen" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
      {/* Ambient rose-tinted orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/4 w-[600px] h-[600px] rounded-full opacity-[0.25]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.05), transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full opacity-[0.18]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.03), transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute top-1/2 left-0 w-[400px] h-[400px] rounded-full opacity-[0.12]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.02), transparent)', filter: 'blur(100px)' }}/>
      </div>
      <Navbar />
      <main className="relative mx-auto max-w-7xl main-content-wrapper">
        <Outlet />
      </main>
    </div>);
}
export function FullLayout() {
    return (<div className="min-h-screen" style={{ background: LIGHT_BG, fontFamily: 'inherit' }}>
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 left-1/3 w-[700px] h-[700px] rounded-full opacity-[0.25]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.05), transparent)', filter: 'blur(130px)' }}/>
        <div className="absolute bottom-1/4 right-0 w-[500px] h-[500px] rounded-full opacity-[0.18]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.03), transparent)', filter: 'blur(120px)' }}/>
        <div className="absolute top-1/3 left-0 w-[350px] h-[350px] rounded-full opacity-[0.12]" style={{ background: 'radial-gradient(circle, rgba(250, 204, 21, 0.02), transparent)', filter: 'blur(100px)' }}/>
      </div>
      <main 
        className="relative mx-auto max-w-7xl" 
        style={{ 
          paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)', 
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 2rem)',
          paddingLeft: 'calc(1rem + env(safe-area-inset-left, 0px))',
          paddingRight: 'calc(1rem + env(safe-area-inset-right, 0px))'
        }}
      >
        <Outlet />
      </main>
    </div>);
}
