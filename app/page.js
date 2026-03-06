'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { authAPI } from '@/lib/api';
import {
  Building2, MapPin, Phone, Globe, ChevronDown, Shield,
  LayoutDashboard, User, Bell, MessageSquare, LogOut, Wrench,
  Zap, Star, Mail, Code2, Heart, Users, UserCheck, TrendingUp
} from 'lucide-react';

function toBranchSlug(name) {
  return name.toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

const FEATURES = [
  { icon: Users,          title: 'Multi-Role Access',     desc: 'Admin, Manager & Tenant dashboards with role-based permissions.',        grad: 'linear-gradient(135deg,#7c3aed,#4f46e5)', glow: 'rgba(124,58,237,0.35)' },
  { icon: Globe,          title: 'Multi-Branch',          desc: 'Manage unlimited branches from one admin panel with unified reporting.',   grad: 'linear-gradient(135deg,#059669,#0d9488)', glow: 'rgba(5,150,105,0.35)' },
  { icon: MessageSquare,  title: 'Complaint System',      desc: 'Tenants raise complaints. Managers resolve them. Full audit trail.',      grad: 'linear-gradient(135deg,#7c3aed,#6d28d9)', glow: 'rgba(109,40,217,0.35)' },
  { icon: Bell,           title: 'Alerts & Notices',      desc: 'Push instant alerts to specific branches or all tenants at once.',        grad: 'linear-gradient(135deg,#10b981,#059669)', glow: 'rgba(16,185,129,0.35)' },
  { icon: LogOut,         title: 'Exit Management',       desc: 'Structured exit requests with refund calculations and approval flow.',    grad: 'linear-gradient(135deg,#8b5cf6,#7c3aed)', glow: 'rgba(139,92,246,0.35)' },
  { icon: Wrench,         title: 'Branch Customization',  desc: 'Set facilities, food menu, rent details and gallery photos per branch.',  grad: 'linear-gradient(135deg,#047857,#10b981)', glow: 'rgba(4,120,87,0.35)'  },
];

export default function HomePage() {
  const [branches, setBranches] = useState([]);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('ADMIN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showDevEmail, setShowDevEmail] = useState(false);
  const dropdownRef = useRef(null);
  const router = useRouter();

  useEffect(() => {
    loadBranches();
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setIsDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadBranches = async () => {
    try {
      const res = await fetch('/api/branches');
      if (res.ok) setBranches((await res.json()).filter(b => b.status === 'ACTIVE'));
    } catch (e) { console.error(e); }
  };

  const openLoginWithRole = (r) => { setRole(r); setIsDropdownOpen(false); setIsLoginOpen(true); };

  const handleLogin = async (e) => {
    e.preventDefault(); setError(''); setLoading(true);
    try {
      const res = await authAPI.login(mobile, password, role);
      localStorage.setItem('token', res.token);
      localStorage.setItem('user', JSON.stringify(res.user));
      if (res.user.forcePasswordChange && (role === 'MANAGER' || role === 'TENANT')) { router.push('/change-password'); return; }
      router.push(role === 'ADMIN' ? '/admin' : role === 'MANAGER' ? '/manager' : '/tenant');
    } catch (err) { setError(err.message || 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f0720 0%, #150d2e 25%, #0d1a1a 55%, #0a1628 80%, #130720 100%)' }}>

      <style jsx global>{`
        @keyframes aurora1 {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.5; }
          33%      { transform: translate(60px,-40px) scale(1.1); opacity:0.7; }
          66%      { transform: translate(-30px,30px) scale(0.9); opacity:0.4; }
        }
        @keyframes aurora2 {
          0%,100% { transform: translate(0,0) scale(1); opacity:0.4; }
          40%      { transform: translate(-50px,30px) scale(1.15); opacity:0.65; }
          70%      { transform: translate(40px,-20px) scale(0.95); opacity:0.5; }
        }
        @keyframes aurora3 {
          0%,100% { transform: translate(0,0) scale(1.05); opacity:0.3; }
          50%      { transform: translate(30px,50px) scale(0.9); opacity:0.55; }
        }
        @keyframes shimmerAurora {
          0%   { background-position: -300% center; }
          100% { background-position: 300% center; }
        }
        @keyframes float {
          0%,100% { transform: translateY(0) rotate(-1deg); }
          50%      { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes walkRight {
          0%   { left:-60px; opacity:0; }
          5%   { opacity:1; }
          90%  { opacity:1; }
          100% { left:calc(100% + 20px); opacity:0; }
        }
        @keyframes glowPulse {
          0%,100% { box-shadow: 0 0 20px rgba(139,92,246,0.4), 0 0 40px rgba(16,185,129,0.15); }
          50%      { box-shadow: 0 0 35px rgba(139,92,246,0.6), 0 0 60px rgba(16,185,129,0.25); }
        }
        @keyframes slideUp {
          from { opacity:0; transform:translateY(8px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeInScale {
          from { opacity:0; transform:scale(0.95); }
          to   { opacity:1; transform:scale(1); }
        }
        @keyframes borderGlow {
          0%,100% { border-color: rgba(139,92,246,0.3); }
          50%      { border-color: rgba(16,185,129,0.4); }
        }

        .aurora-blob1 { animation: aurora1 12s ease-in-out infinite; }
        .aurora-blob2 { animation: aurora2 15s ease-in-out infinite; }
        .aurora-blob3 { animation: aurora3 18s ease-in-out infinite; }

        .aurora-text {
          background: linear-gradient(90deg, #a78bfa, #34d399, #60a5fa, #a78bfa, #34d399);
          background-size: 300% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          animation: shimmerAurora 5s linear infinite;
        }
        .float-anim  { animation: float 3.5s ease-in-out infinite; }
        .glow-pulse  { animation: glowPulse 3s ease-in-out infinite; }
        .slide-up    { animation: slideUp 0.35s ease forwards; }
        .fade-scale  { animation: fadeInScale 0.25s ease forwards; }

        .walker {
          position: absolute;
          top: 50%;
          transform: translateY(-50%);
          animation: walkRight 4.5s linear infinite;
          font-size: 18px;
          filter: drop-shadow(0 0 6px rgba(167,139,250,0.9));
        }

        .nav-aurora {
          background: rgba(15,7,32,0.82);
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(139,92,246,0.18);
        }

        .glass-card {
          background: rgba(255,255,255,0.035);
          border: 1px solid rgba(139,92,246,0.18);
          backdrop-filter: blur(14px);
          transition: all 0.35s ease;
          animation: borderGlow 4s ease-in-out infinite;
        }
        .glass-card:hover {
          background: rgba(139,92,246,0.08);
          border-color: rgba(52,211,153,0.35);
          transform: translateY(-5px);
          box-shadow: 0 20px 50px rgba(0,0,0,0.5), 0 0 30px rgba(139,92,246,0.15);
        }

        .feat-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(139,92,246,0.12);
          transition: all 0.3s ease;
        }
        .feat-card:hover {
          background: rgba(139,92,246,0.06);
          border-color: rgba(52,211,153,0.3);
          transform: translateY(-3px);
          box-shadow: 0 12px 35px rgba(0,0,0,0.4);
        }

        .btn-aurora {
          background: linear-gradient(135deg, #7c3aed, #059669);
          box-shadow: 0 8px 30px rgba(124,58,237,0.4), 0 0 0 1px rgba(52,211,153,0.2);
          transition: all 0.3s ease;
        }
        .btn-aurora:hover {
          background: linear-gradient(135deg, #6d28d9, #047857);
          box-shadow: 0 12px 40px rgba(124,58,237,0.55), 0 0 0 1px rgba(52,211,153,0.35);
          transform: translateY(-2px);
        }

        .badge-aurora {
          background: rgba(139,92,246,0.12);
          border: 1px solid rgba(139,92,246,0.25);
          color: #c4b5fd;
        }

        .dev-track {
          position: relative;
          height: 28px;
          width: 90px;
          overflow: hidden;
          border-radius: 14px;
          background: rgba(139,92,246,0.08);
          border: 1px solid rgba(139,92,246,0.2);
        }
        .dev-track-line {
          position: absolute;
          top: 50%; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent);
        }
        .footer-aurora {
          background: rgba(15,7,32,0.95);
          backdrop-filter: blur(24px);
          border-top: 1px solid rgba(139,92,246,0.15);
        }

        .dropdown-aurora {
          background: #150d2e;
          border: 1px solid rgba(139,92,246,0.25);
          box-shadow: 0 25px 70px rgba(0,0,0,0.7), 0 0 40px rgba(124,58,237,0.1);
        }
        .dropdown-item:hover { background: rgba(139,92,246,0.12); }

        /* ✨ Extraordinary dev showcase */
        @keyframes particleFloat {
          0%   { transform: translateY(0) rotate(0deg); opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 0.6; }
          100% { transform: translateY(-120px) rotate(360deg); opacity: 0; }
        }
        @keyframes streakMove {
          0%   { transform: translateX(-100%); opacity: 0; }
          20%  { opacity: 1; }
          80%  { opacity: 0.6; }
          100% { transform: translateX(200%); opacity: 0; }
        }
        @keyframes rotateBorder {
          0%   { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes avatarRingPulse {
          0%,100% { transform: scale(1); opacity: 0.6; }
          50%      { transform: scale(1.4); opacity: 0; }
        }
        @keyframes skillPillIn {
          from { opacity: 0; transform: translateX(-10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes tapHint {
          0%,100% { opacity: 0.4; transform: scale(1); }
          50%      { opacity: 1; transform: scale(1.05); }
        }
        @keyframes spotlightSweep {
          0%   { left: -80%; opacity: 0; }
          10%  { opacity: 1; }
          90%  { opacity: 1; }
          100% { left: 130%; opacity: 0; }
        }

        .dev-showcase-section {
          border-top: 1px solid rgba(139,92,246,0.1);
          background: linear-gradient(180deg, rgba(15,7,32,0) 0%, rgba(15,7,32,0.6) 100%);
        }

        /* Floating particles */
        .particle {
          position: absolute;
          font-size: 10px;
          color: rgba(167,139,250,0.4);
          animation: particleFloat linear infinite;
          pointer-events: none;
        }
        .p1 { left: 8%;  bottom: 0; animation-duration: 5s; animation-delay: 0s;    color: rgba(167,139,250,0.5); }
        .p2 { left: 20%; bottom: 0; animation-duration: 7s; animation-delay: 1.2s;  color: rgba(52,211,153,0.4); }
        .p3 { left: 40%; bottom: 0; animation-duration: 6s; animation-delay: 0.5s;  color: rgba(167,139,250,0.3); font-size: 8px; }
        .p4 { left: 60%; bottom: 0; animation-duration: 8s; animation-delay: 2s;    color: rgba(52,211,153,0.5); }
        .p5 { left: 78%; bottom: 0; animation-duration: 5.5s; animation-delay: 0.8s; color: rgba(167,139,250,0.4); font-size: 8px; }
        .p6 { left: 90%; bottom: 0; animation-duration: 6.5s; animation-delay: 1.5s; color: rgba(52,211,153,0.3); }

        /* Aurora streaks */
        .streak {
          position: absolute;
          height: 1px;
          width: 200px;
          pointer-events: none;
          border-radius: 999px;
          animation: streakMove linear infinite;
        }
        .s1 { top: 20%; background: linear-gradient(90deg, transparent, rgba(139,92,246,0.5), transparent); animation-duration: 4s; animation-delay: 0s; }
        .s2 { top: 50%; background: linear-gradient(90deg, transparent, rgba(52,211,153,0.4), transparent); animation-duration: 5.5s; animation-delay: 1.5s; }
        .s3 { top: 80%; background: linear-gradient(90deg, transparent, rgba(167,139,250,0.35), transparent); animation-duration: 3.5s; animation-delay: 0.8s; }

        /* Rotating border */
        .dev-hero-card {
          background: transparent;
          padding: 2px;
          position: relative;
          transition: transform 0.3s ease;
        }
        .dev-hero-card:hover { transform: translateY(-3px) scale(1.01); }
        .rotating-border {
          position: absolute;
          inset: -2px;
          border-radius: 26px;
          background: conic-gradient(from 0deg, #7c3aed, #059669, #a78bfa, #34d399, #4f46e5, #7c3aed);
          animation: rotateBorder 4s linear infinite;
          filter: blur(1px);
        }

        /* Avatar rings */
        .avatar-ring-outer, .avatar-ring-inner {
          position: absolute;
          inset: -8px;
          border-radius: 24px;
          border: 1.5px solid rgba(124,58,237,0.4);
          animation: avatarRingPulse 2.5s ease-out infinite;
        }
        .avatar-ring-inner {
          inset: -4px;
          border-color: rgba(52,211,153,0.4);
          animation-delay: 0.8s;
          animation-duration: 2s;
        }

        /* Skill pills */
        .skill-pill {
          background: rgba(124,58,237,0.12);
          border: 1px solid rgba(139,92,246,0.25);
          color: #c4b5fd;
          animation: skillPillIn 0.4s ease forwards;
          opacity: 0;
        }
        .skill-pill:nth-child(2) { background: rgba(5,150,105,0.1); border-color: rgba(52,211,153,0.2); color: #6ee7b7; }
        .skill-pill:nth-child(3) { animation-delay: 0.6s; }
        .skill-pill:nth-child(4) { animation-delay: 0.9s; }

        /* Tap hint */
        .tap-hint { animation: tapHint 2s ease-in-out infinite; display: inline-block; }

        /* Spotlight on inner card */
        .spotlight-beam {
          position: absolute;
          top: 0; bottom: 0;
          width: 80px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), rgba(167,139,250,0.1), rgba(52,211,153,0.07), transparent);
          filter: blur(8px);
          animation: spotlightSweep 3s ease-in-out infinite;
          pointer-events: none;
          z-index: 0;
          border-radius: 50%;
        }

        .input-aurora {
          background: rgba(255,255,255,0.04) !important;
          border-color: rgba(139,92,246,0.25) !important;
          color: white !important;
        }
        .input-aurora::placeholder { color: rgba(167,139,250,0.3) !important; }
      `}</style>

      {/* Aurora background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="aurora-blob1 absolute top-[-10%] left-[-5%] w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />
        <div className="aurora-blob2 absolute top-[20%] right-[-10%] w-[500px] h-[500px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(5,150,105,0.14) 0%, transparent 70%)' }} />
        <div className="aurora-blob3 absolute bottom-[10%] left-[20%] w-[700px] h-[700px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(79,70,229,0.12) 0%, transparent 70%)' }} />
        <div className="absolute top-[50%] right-[30%] w-[400px] h-[400px] rounded-full aurora-blob1"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,0.08) 0%, transparent 70%)', animationDelay: '6s' }} />
      </div>

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 nav-aurora">
        <div className="container mx-auto px-6 py-3.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img src="/vihari-logo.png" width="38" className="rounded-xl" style={{ filter: 'drop-shadow(0 0 8px rgba(139,92,246,0.5))' }} />
              <div>
                <span className="text-base font-bold text-white">Vihari Co-Living</span>
                <span className="hidden sm:inline text-xs ml-2" style={{ color: 'rgba(167,139,250,0.6)' }}>Hostel ERP</span>
              </div>
            </div>
            <div className="relative" ref={dropdownRef}>
              <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="btn-aurora flex items-center gap-1.5 text-white px-5 py-2 rounded-full text-sm font-medium">
                Login
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl overflow-hidden fade-scale dropdown-aurora">
                  {[
                    { r: 'ADMIN',   Icon: Shield,         color: '#a78bfa', bg: 'rgba(167,139,250,0.1)', label: 'Admin Login'   },
                    { r: 'MANAGER', Icon: LayoutDashboard, color: '#34d399', bg: 'rgba(52,211,153,0.1)', label: 'Manager Login' },
                    { r: 'TENANT',  Icon: User,            color: '#60a5fa', bg: 'rgba(96,165,250,0.1)', label: 'Tenant Login'  },
                  ].map(({ r, Icon, color, bg, label }, i) => (
                    <button key={i} onClick={() => openLoginWithRole(r)}
                      className={`dropdown-item w-full px-4 py-3 text-left text-white flex items-center gap-3 transition-all text-sm font-medium ${i > 0 ? 'border-t' : ''}`}
                      style={{ borderColor: 'rgba(139,92,246,0.1)' }}>
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: bg }}>
                        <Icon className="h-4 w-4" style={{ color }} />
                      </div>
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative z-10 pt-32 pb-14 px-6 text-center">
        <div className="container mx-auto max-w-4xl">
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-6 text-sm font-medium badge-aurora">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#34d399' }}></span>
            Complete Hostel Management Solution
          </div>
          <h1 className="text-4xl md:text-6xl font-bold mb-5 leading-tight">
            <span className="text-white">Hostel Management</span><br />
            <span className="aurora-text">Made Simple</span>
          </h1>
          <p className="text-lg mb-8 max-w-2xl mx-auto leading-relaxed" style={{ color: 'rgba(196,181,253,0.6)' }}>
            Streamline your hostel operations with our powerful management platform.
            Track tenants, payments, rooms, and more — all in one place.
          </p>
          <button onClick={() => setIsLoginOpen(true)} className="btn-aurora text-white px-8 py-3 rounded-full text-base font-semibold">
            Login to Dashboard
          </button>
        </div>
      </section>

      {/* Branches */}
      {branches.length > 0 && (
        <section className="relative z-10 py-14 px-6">
          <div className="container mx-auto">
            <div className="text-center mb-10">
              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-sm badge-aurora">
                <Star className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
                <span>Our Locations</span>
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Our Branches</h2>
              <p style={{ color: 'rgba(196,181,253,0.5)' }}>Find a hostel location near you</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {branches.map((branch, index) => (
                <div key={branch.branchId} className="glass-card rounded-3xl overflow-hidden">
                  <div className="h-44 overflow-hidden relative">
                    <img src={`/vihari-${index === 0 ? 'grand' : 'luxury'}.png`} alt="Branch"
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" />
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(15,7,32,0.75), transparent)' }} />
                    <div className="absolute bottom-3 left-4">
                      <span className="text-xs font-semibold px-3 py-1 rounded-full"
                        style={{ background: 'rgba(124,58,237,0.3)', border: '1px solid rgba(167,139,250,0.35)', color: '#c4b5fd' }}>
                        {branch.code}
                      </span>
                    </div>
                  </div>
                  <div className="p-5 space-y-3">
                    <h3 className="text-base font-bold text-white">{branch.name}</h3>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: '#a78bfa' }} />
                      <div>
                        <p className="text-xs leading-snug" style={{ color: 'rgba(196,181,253,0.5)' }}>{branch.address}</p>
                        <p className="text-xs font-semibold" style={{ color: '#a78bfa' }}>{branch.city}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4" style={{ color: '#34d399' }} />
                      <p className="text-xs" style={{ color: 'rgba(196,181,253,0.5)' }}>{branch.phone}</p>
                    </div>
                    <button
                      onClick={() => router.push(`/branch/${toBranchSlug(branch.name)}`)}
                      className="w-full text-white text-sm font-semibold py-2.5 rounded-xl transition-all duration-300 hover:-translate-y-0.5"
                      style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.5), rgba(5,150,105,0.4))', border: '1px solid rgba(139,92,246,0.3)' }}
                      data-testid={`branch-details-btn-${index}`}
                    >
                      View Details →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="relative z-10 py-14 px-6" style={{ background: 'rgba(139,92,246,0.03)' }}>
        <div className="container mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-4 text-sm badge-aurora">
              <Zap className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
              <span>Platform Features</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Everything Built In</h2>
            <p style={{ color: 'rgba(196,181,253,0.5)' }}>Every module to run a professional hostel</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {FEATURES.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="feat-card rounded-2xl p-5 flex items-start gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: f.grad, boxShadow: `0 6px 20px ${f.glow}` }}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white mb-1">{f.title}</h3>
                    <p className="text-xs leading-relaxed" style={{ color: 'rgba(196,181,253,0.5)' }}>{f.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 footer-aurora">
        <div className="container mx-auto px-6 py-3.5">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <img src="/vihari-logo.png" width="26" className="rounded-lg opacity-70" />
              <span className="text-sm font-bold text-white">Vihari Co-Living</span>
              <span className="text-xs" style={{ color: 'rgba(167,139,250,0.4)' }}>· Hostel ERP</span>
            </div>
            <p className="text-xs" style={{ color: 'rgba(196,181,253,0.2)' }}>© 2024 All rights reserved.</p>
          </div>
        </div>

        {/* ✨ Developer Showcase — collapsed by default, expands on click */}
        <div className="dev-showcase-section relative overflow-hidden">

          {/* Particles & streaks — only shown when expanded */}
          {showDevEmail && (
            <div className="absolute inset-0 pointer-events-none">
              <div className="particle p1">✦</div>
              <div className="particle p2">✦</div>
              <div className="particle p3">◆</div>
              <div className="particle p4">✦</div>
              <div className="particle p5">◆</div>
              <div className="particle p6">✦</div>
              <div className="streak s1" />
              <div className="streak s2" />
              <div className="streak s3" />
            </div>
          )}

          <div className="relative z-10 container mx-auto px-6 py-4 flex flex-col items-center gap-3">

            {/* COLLAPSED STATE — compact pill */}
            {!showDevEmail ? (
              <button
                onClick={() => setShowDevEmail(true)}
                className="dev-pill group flex items-center gap-3 rounded-full px-4 py-2 transition-all duration-300 hover:scale-105"
                style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(139,92,246,0.2)' }}
              >
                {/* Mini avatar */}
                <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black text-white flex-shrink-0"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #059669)', boxShadow: '0 0 8px rgba(124,58,237,0.5)' }}>
                  V
                </div>
                <span className="text-xs" style={{ color: 'rgba(167,139,250,0.5)' }}>
                  Crafted by <span className="text-white font-semibold">Venu M</span>
                </span>
                {/* Pulsing dot */}
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse flex-shrink-0" />
              </button>
            ) : (
              /* EXPANDED STATE — cinematic card */
              <div className="slide-up w-full flex flex-col items-center gap-4">

                {/* CRAFTED BY label */}
                <div className="flex items-center gap-3">
                  <div className="h-px w-10 md:w-20" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.6))' }} />
                  <p className="text-xs uppercase tracking-[0.3em] font-bold" style={{ color: 'rgba(167,139,250,0.5)' }}>Crafted by</p>
                  <div className="h-px w-10 md:w-20" style={{ background: 'linear-gradient(90deg, rgba(52,211,153,0.6), transparent)' }} />
                </div>

                {/* Cinematic card */}
                <div className="dev-hero-card relative rounded-3xl cursor-pointer w-full" style={{ maxWidth: '360px' }}>
                  <div className="rotating-border" />
                  <div className="dev-hero-inner relative z-10 rounded-3xl p-5 m-[2px]"
                    style={{ background: 'linear-gradient(135deg, rgba(20,10,45,0.97), rgba(10,30,20,0.97))' }}>

                    {/* Avatar + name row */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className="relative flex-shrink-0">
                        <div className="avatar-ring-outer" />
                        <div className="avatar-ring-inner" />
                        <div className="relative w-12 h-12 rounded-xl flex items-center justify-center text-lg font-black text-white z-10"
                          style={{ background: 'linear-gradient(135deg, #7c3aed, #059669)', boxShadow: '0 0 20px rgba(124,58,237,0.6)' }}>
                          V
                        </div>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-base font-black tracking-wide aurora-text">Venu M</h3>
                        <p className="text-xs font-semibold" style={{ color: 'rgba(52,211,153,0.7)' }}>⚡ Full Stack Developer</p>
                      </div>
                      {/* Close button */}
                      <button onClick={() => setShowDevEmail(false)}
                        className="w-7 h-7 rounded-lg flex items-center justify-center text-xs flex-shrink-0 transition-all hover:bg-white/10"
                        style={{ color: 'rgba(167,139,250,0.4)', border: '1px solid rgba(139,92,246,0.15)' }}>
                        ✕
                      </button>
                    </div>

                    {/* Skill pills */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {['Next.js', 'React', 'Node.js', 'MongoDB'].map((s, i) => (
                        <span key={i} className="skill-pill text-xs px-2 py-0.5 rounded-full font-medium" style={{ animationDelay: `${i*0.2}s` }}>{s}</span>
                      ))}
                    </div>

                    {/* Divider */}
                    <div className="h-px w-full mb-3" style={{ background: 'linear-gradient(90deg, transparent, rgba(139,92,246,0.4), rgba(52,211,153,0.4), transparent)' }} />

                    {/* Email */}
                    <a href="mailto:muthamgarivenu234@gmail.com"
                      className="flex items-center justify-center gap-2 text-xs font-semibold py-2 px-4 rounded-xl w-full transition-all"
                      style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#34d399' }}>
                      <Mail className="h-3.5 w-3.5" />
                      muthamgarivenu234@gmail.com
                    </a>

                    <div className="spotlight-beam" />
                  </div>
                </div>

                {/* Made with love */}
                <div className="flex items-center gap-1.5 text-xs" style={{ color: 'rgba(196,181,253,0.2)' }}>
                  <Heart className="h-2.5 w-2.5 text-red-400 fill-red-400" />
                  <span>Made with love for Vihari Co-Living</span>
                </div>

              </div>
            )}

          </div>
        </div>
      </footer>

      {/* Login Modal */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="max-w-md border" style={{ background: '#150d2e', borderColor: 'rgba(139,92,246,0.25)', boxShadow: '0 25px 80px rgba(0,0,0,0.7), 0 0 60px rgba(124,58,237,0.15)' }}>
          <DialogHeader>
            <div className="flex items-center justify-center mb-3">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center"
                style={{ background: 'linear-gradient(135deg, #7c3aed, #059669)', boxShadow: '0 8px 30px rgba(124,58,237,0.5)' }}>
                <Building2 className="w-7 h-7 text-white" />
              </div>
            </div>
            <DialogTitle className="text-2xl text-center text-white">Welcome Back</DialogTitle>
            <p className="text-center text-sm" style={{ color: 'rgba(196,181,253,0.5)' }}>Sign in to your dashboard</p>
          </DialogHeader>
          <form onSubmit={handleLogin} className="space-y-4 mt-2">
            {error && (
              <div className="px-4 py-3 rounded-xl text-sm text-red-400" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.25)' }}>
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: 'rgba(196,181,253,0.7)' }}>Login As</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger className="input-aurora rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent style={{ background: '#150d2e', borderColor: 'rgba(139,92,246,0.2)' }}>
                  <SelectItem value="ADMIN" className="text-white focus:bg-purple-900/40">Admin</SelectItem>
                  <SelectItem value="MANAGER" className="text-white focus:bg-purple-900/40">Manager</SelectItem>
                  <SelectItem value="TENANT" className="text-white focus:bg-purple-900/40">Tenant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: 'rgba(196,181,253,0.7)' }}>Mobile Number</Label>
              <Input type="tel" placeholder="Enter 10 digit mobile" value={mobile}
                onChange={e => setMobile(e.target.value)} maxLength={10} required className="input-aurora rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium" style={{ color: 'rgba(196,181,253,0.7)' }}>Password</Label>
              <Input type="password" placeholder="Enter password" value={password}
                onChange={e => setPassword(e.target.value)} required className="input-aurora rounded-xl" />
            </div>
            <button type="submit" disabled={loading}
              className="btn-aurora w-full text-white py-3 rounded-xl font-semibold mt-2 disabled:opacity-60">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </DialogContent>
      </Dialog>

    </div>
  );
}