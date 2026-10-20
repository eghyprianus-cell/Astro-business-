import { ConstellationTag } from '../types/business';

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDateIndo(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(d);
  } catch {
    return dateString;
  }
}

export function formatDateTimeIndo(dateString: string): string {
  try {
    const d = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(d);
  } catch {
    return dateString;
  }
}

export const CONSTELLATION_CONFIG: Record<ConstellationTag, {
  color: string;
  glow: string;
  borderColor: string;
  symbol: string;
  indonesianName: string;
}> = {
  Polaris: {
    color: 'text-amber-300',
    glow: 'rgba(251, 191, 36, 0.4)',
    borderColor: 'border-amber-400/30',
    symbol: '✧ Polaris (Bintang Kejora)',
    indonesianName: 'Bintang Panduan',
  },
  Orion: {
    color: 'text-sky-300',
    glow: 'rgba(56, 189, 248, 0.4)',
    borderColor: 'border-sky-400/30',
    symbol: '✦ Orion (Sang Pemburu)',
    indonesianName: 'Pilar Kekuatan',
  },
  Sirius: {
    color: 'text-indigo-300',
    glow: 'rgba(99, 102, 241, 0.4)',
    borderColor: 'border-indigo-400/30',
    symbol: '✶ Sirius (Bintang Anjing)',
    indonesianName: 'Terang Utama',
  },
  Cassiopeia: {
    color: 'text-purple-300',
    glow: 'rgba(168, 85, 247, 0.4)',
    borderColor: 'border-purple-400/30',
    symbol: '✵ Cassiopeia (Ratu Langit)',
    indonesianName: 'Tahta Anggun',
  },
  Andromeda: {
    color: 'text-emerald-300',
    glow: 'rgba(52, 211, 153, 0.4)',
    borderColor: 'border-emerald-400/30',
    symbol: '✺ Andromeda (Galaksi Spiral)',
    indonesianName: 'Ekspansi Luas',
  },
  Pegasus: {
    color: 'text-rose-300',
    glow: 'rgba(251, 113, 133, 0.4)',
    borderColor: 'border-rose-400/30',
    symbol: '✷ Pegasus (Kuda Terbang)',
    indonesianName: 'Akselerasi Tinggi',
  },
  Centaurus: {
    color: 'text-teal-300',
    glow: 'rgba(45, 212, 191, 0.4)',
    borderColor: 'border-teal-400/30',
    symbol: '✸ Centaurus (Pemanah Bintang)',
    indonesianName: 'Akurasi Pasar',
  },
};

// Cosmic Web Audio synthesizer (gentle celestial feedback)
class CosmicSoundEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playBeep() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, this.ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1320, this.ctx.currentTime + 0.08); // E6
      gain.gain.setValueAtTime(0.04, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.08);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.09);
    } catch {
      // Audio fallback silent
    }
  }

  playSuccess() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 (Cosmic chord)
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const time = this.ctx.currentTime + idx * 0.07;
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, time);
        gain.gain.setValueAtTime(0.06, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(time);
        osc.stop(time + 0.3);
      });
    } catch {
      // Audio fallback silent
    }
  }

  playSubtle() {
    if (!this.enabled) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      gain.gain.setValueAtTime(0.02, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.06);
    } catch {
      // Audio fallback silent
    }
  }

  playClick() {
    this.playSubtle();
  }
}

export const cosmicAudio = new CosmicSoundEngine();
