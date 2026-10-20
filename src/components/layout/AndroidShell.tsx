import React, { useState, useEffect } from 'react';
import { StoreProfile } from '../../types/business';
import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  Wallet,
  FileText,
  Settings,
  Bell,
  Smartphone,
  Maximize2,
  Wifi,
  BatteryCharging,
  Signal,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { cosmicAudio } from '../../utils/formatters';

export type TabType = 'dashboard' | 'pos' | 'inventory' | 'finance' | 'reports' | 'invoices';

interface AndroidShellProps {
  children: React.ReactNode;
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  storeProfile: StoreProfile;
  isAndroidFrameMode: boolean;
  onToggleFrameMode: () => void;
  onOpenSettings: () => void;
  alertCount: number;
}

export const AndroidShell: React.FC<AndroidShellProps> = ({
  children,
  activeTab,
  onChangeTab,
  storeProfile,
  isAndroidFrameMode,
  onToggleFrameMode,
  onOpenSettings,
  alertCount,
}) => {
  const [currentTime, setCurrentTime] = useState('09:41');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const mins = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${mins}`);
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard' as TabType, label: 'Orbit', sublabel: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos' as TabType, label: 'Kasir', sublabel: 'POS Register', icon: ShoppingCart },
    { id: 'inventory' as TabType, label: 'Stok', sublabel: 'Inventaris', icon: Package },
    { id: 'finance' as TabType, label: 'Keuangan', sublabel: 'Buku Kas', icon: Wallet },
    { id: 'reports' as TabType, label: 'Laporan', sublabel: 'Laporan Otomatis', icon: BarChart3 },
    { id: 'invoices' as TabType, label: 'Faktur', sublabel: 'Invoice & CRM', icon: FileText },
  ];

  const content = (
    <div className="flex flex-col h-full bg-[#080913] text-slate-100 relative overflow-hidden select-none">
      {/* Top Android Status Bar */}
      <div className="w-full bg-[#090b17] px-5 py-2 flex items-center justify-between text-[11px] text-slate-400 font-mono border-b border-white/5 z-30 shrink-0">
        <div className="flex items-center gap-1.5 font-bold text-slate-200">
          <span>{currentTime}</span>
        </div>

        {/* Center Punch-hole camera simulator in phone mode */}
        {isAndroidFrameMode && (
          <div className="w-3.5 h-3.5 rounded-full bg-black border border-slate-800 shadow-inner -my-1" />
        )}

        <div className="flex items-center gap-2">
          <Signal className="w-3.5 h-3.5 text-slate-300" />
          <Wifi className="w-3.5 h-3.5 text-slate-300" />
          <div className="flex items-center gap-0.5">
            <span className="text-[10px]">98%</span>
            <BatteryCharging className="w-3.5 h-3.5 text-emerald-400" />
          </div>
        </div>
      </div>

      {/* Astro Business App Header */}
      <header className="w-full bg-[#0a0d1f]/95 backdrop-blur-md px-4 py-2.5 border-b border-white/10 flex items-center justify-between z-30 shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-violet-600 to-sky-400 p-[1px] shadow-lg shadow-violet-500/20">
            <div className="w-full h-full bg-[#0d1024] rounded-[11px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-300" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold text-white tracking-wide font-cosmic">
                ASTRO BUSINESS
              </h1>
              <span className="text-[9px] font-bold text-amber-300 bg-amber-400/15 border border-amber-400/30 px-1.5 py-0.2 rounded font-mono">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[160px] sm:max-w-xs">
              {storeProfile.name}
            </p>
          </div>
        </div>

        {/* Header Right Actions */}
        <div className="flex items-center gap-1.5">
          {/* Frame Toggle */}
          <button
            onClick={onToggleFrameMode}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors border border-white/5"
            title={isAndroidFrameMode ? 'Beralih ke Layar Penuh' : 'Beralih ke Mode Ponsel Android'}
          >
            {isAndroidFrameMode ? <Maximize2 className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
          </button>

          {/* Alert icon */}
          <button
            onClick={() => onChangeTab('inventory')}
            className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors border border-white/5"
            title="Peringatan Stok & Tagihan"
          >
            <Bell className="w-4 h-4" />
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
            {alertCount > 0 && (
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          {/* Settings icon */}
          <button
            onClick={onOpenSettings}
            className="p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors border border-white/5"
            title="Pengaturan Usaha"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Scrollable Viewport */}
      <main className="flex-1 overflow-y-auto px-4 pt-4 relative z-10 no-scrollbar">
        {children}
      </main>

      {/* Android Bottom Navigation Bar */}
      <nav className="w-full bg-[#0a0d20]/95 backdrop-blur-md border-t border-white/10 px-2 py-1.5 z-30 shrink-0">
        <div className="max-w-md mx-auto grid grid-cols-6 gap-0.5 sm:gap-1">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;

            return (
              <button
                key={item.id}
                onClick={() => {
                  onChangeTab(item.id);
                  cosmicAudio.playSubtle();
                }}
                className={`flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all relative ${
                  isActive
                    ? 'text-amber-300 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {isActive && (
                  <span className="absolute -top-1.5 w-6 h-0.5 rounded-full bg-amber-400 shadow-[0_0_8px_#fbbf24]" />
                )}
                <div
                  className={`p-1 rounded-lg transition-transform ${
                    isActive ? 'scale-110 bg-amber-400/15' : ''
                  }`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] tracking-tight mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Android Gesture Bar */}
        <div className="w-28 h-1 rounded-full bg-slate-700/60 mx-auto mt-1 mb-0.5" />
      </nav>
    </div>
  );

  if (isAndroidFrameMode) {
    return (
      <div className="min-h-screen bg-[#04050a] flex items-center justify-center p-2 sm:p-6 relative">
        {/* Flagship Android Phone Mockup Frame */}
        <div className="relative w-full max-w-[430px] h-[92vh] max-h-[890px] rounded-[44px] bg-[#1a1b26] p-2.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(124,58,237,0.15)] border-2 border-slate-700/60 flex flex-col">
          {/* Subtle side buttons */}
          <div className="absolute -left-[5px] top-28 w-[3px] h-12 rounded-l-md bg-slate-700" />
          <div className="absolute -left-[5px] top-44 w-[3px] h-12 rounded-l-md bg-slate-700" />
          <div className="absolute -right-[5px] top-32 w-[3px] h-16 rounded-r-md bg-slate-700" />

          {/* Inner Screen */}
          <div className="w-full h-full rounded-[36px] overflow-hidden flex flex-col relative border border-slate-800">
            {content}
          </div>
        </div>
      </div>
    );
  }

  // Fullscreen Responsive Web View
  return (
    <div className="min-h-screen max-w-7xl mx-auto flex flex-col bg-[#080913] shadow-2xl relative">
      {content}
    </div>
  );
};
