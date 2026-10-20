import React, { useState } from 'react';
import { StoreProfile } from '../../types/business';
import { cosmicAudio } from '../../utils/formatters';
import {
  Settings,
  Store,
  Volume2,
  VolumeX,
  Smartphone,
  Monitor,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  X,
  Sparkles,
  Info
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeProfile: StoreProfile;
  onUpdateStoreProfile: (profile: StoreProfile) => void;
  isAndroidFrameMode: boolean;
  onToggleAndroidFrameMode: () => void;
  onExportAllData: () => void;
  onImportData: (file: File) => void;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  storeProfile,
  onUpdateStoreProfile,
  isAndroidFrameMode,
  onToggleAndroidFrameMode,
  onExportAllData,
  onImportData,
  onResetDemoData,
}) => {
  const [formData, setFormData] = useState<StoreProfile>({ ...storeProfile });
  const [soundEnabled, setSoundEnabled] = useState(cosmicAudio.enabled);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreProfile(formData);
    cosmicAudio.playSuccess();
    onClose();
  };

  const toggleSound = () => {
    const next = !soundEnabled;
    setSoundEnabled(next);
    cosmicAudio.enabled = next;
    if (next) cosmicAudio.playBeep();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-lg bg-[#0e1227] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 mb-1">
          <Settings className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white font-cosmic">
            Konfigurasi & Pengaturan Astro Business
          </h3>
        </div>
        <p className="text-xs text-slate-400 mb-4">
          Kelola profil toko, preferensi antarmuka Android, dan cadangan data lokal
        </p>

        {/* Brand identity disclosure */}
        <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200/90 flex items-start gap-2.5 mb-4">
          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="font-semibold text-amber-300">Konsep Desain Kosmik Astro</div>
            <p className="text-[11px] text-amber-200/80 mt-0.5">
              Aplikasi ini adalah sistem manajemen bisnis, kasir POS, dan pembukuan profesional. Simbol rasi bintang dan galaksi digunakan sebagai estetika identitas merek (bukan ramalan horoskop).
            </p>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-xs">
          {/* Store Info */}
          <div className="space-y-3">
            <h4 className="font-semibold text-slate-200 uppercase text-[10px] tracking-wider border-b border-white/5 pb-1 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-amber-400" />
              <span>Profil Usaha & Struk</span>
            </h4>

            <div>
              <label className="block text-slate-300 mb-1">Nama Usaha / Bisnis</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Tagline Slogan</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Nomor Kontak / WhatsApp</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Kasir Aktif Default</label>
                <input
                  type="text"
                  value={formData.cashierName}
                  onChange={(e) => setFormData({ ...formData, cashierName: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 mb-1">Tarif Pajak PPN (%)</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.taxRatePercent}
                  onChange={(e) => setFormData({ ...formData, taxRatePercent: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Mata Uang</label>
                <input
                  type="text"
                  disabled
                  value={formData.currency}
                  className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 mb-1">Alamat Lokasi Usaha</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
              />
            </div>

            <div className="grid grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-slate-300 mb-1">Modal Awal Usaha (IDR)</label>
                <input
                  type="number"
                  min="0"
                  step="500000"
                  value={formData.initialCapital || 35000000}
                  onChange={(e) => setFormData({ ...formData, initialCapital: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Tanggal Mulai Modal</label>
                <input
                  type="date"
                  value={formData.initialCapitalDate || '2026-01-01'}
                  onChange={(e) => setFormData({ ...formData, initialCapitalDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-3 pt-2">
            <h4 className="font-semibold text-slate-200 uppercase text-[10px] tracking-wider border-b border-white/5 pb-1">
              Preferensi Tampilan & Suara
            </h4>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div>
                <div className="font-medium text-slate-200">Efek Suara Kosmik (Chimes)</div>
                <div className="text-[11px] text-slate-400">Audio synthesizer nada feedback saat klik & checkout</div>
              </div>
              <button
                type="button"
                onClick={toggleSound}
                className={`p-2 rounded-lg border transition-all ${
                  soundEnabled
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-white/5">
              <div>
                <div className="font-medium text-slate-200">Mode Frame Ponsel Android</div>
                <div className="text-[11px] text-slate-400">Tampilkan bingkai smartphone Android dengan status bar</div>
              </div>
              <button
                type="button"
                onClick={onToggleAndroidFrameMode}
                className={`p-2 rounded-lg border transition-all ${
                  isAndroidFrameMode
                    ? 'bg-sky-500/20 border-sky-400 text-sky-300'
                    : 'bg-slate-800 border-slate-700 text-slate-500'
                }`}
              >
                {isAndroidFrameMode ? <Smartphone className="w-4 h-4" /> : <Monitor className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="space-y-2 pt-2">
            <h4 className="font-semibold text-slate-200 uppercase text-[10px] tracking-wider border-b border-white/5 pb-1">
              Pencadangan Data
            </h4>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={onExportAllData}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-white/5"
              >
                <Download className="w-3.5 h-3.5 text-amber-400" />
                <span>Unduh Cadangan JSON</span>
              </button>

              <label className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center justify-center gap-1.5 border border-white/5 cursor-pointer text-center">
                <Upload className="w-3.5 h-3.5 text-sky-400" />
                <span>Pulihkan dari File</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) onImportData(file);
                  }}
                />
              </label>
            </div>

            <button
              type="button"
              onClick={() => {
                if (confirm('Muat ulang ke data demo awal? Perubahan yang belum dicadangkan akan direset.')) {
                  onResetDemoData();
                  onClose();
                }
              }}
              className="w-full mt-1 py-2 text-rose-400 hover:text-rose-300 text-xs flex items-center justify-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset ke Data Demo Awal</span>
            </button>
          </div>

          <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Tutup
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 shadow"
            >
              Simpan Profil
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
