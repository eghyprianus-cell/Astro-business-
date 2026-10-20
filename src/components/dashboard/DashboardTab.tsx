import React, { useState, useMemo } from 'react';
import { Product, Transaction, Expense } from '../../types/business';
import { formatRupiah, formatDateIndo, formatDateTimeIndo } from '../../utils/formatters';
import { ConstellationChart } from '../cosmic/ConstellationChart';
import {
  SaturnPlanetIcon,
  MarsPlanetIcon,
  JupiterPlanetIcon,
  MercuryPlanetIcon,
} from '../cosmic/PlanetIcons';
import { GalaxyDecoration } from '../cosmic/GalaxyDecoration';
import {
  ShoppingCart,
  PlusCircle,
  DollarSign,
  FileText,
  Clock,
  ArrowUpRight,
  ArrowDownLeft,
  Flame,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  Layers,
  BarChart3,
} from 'lucide-react';

import { TabType } from '../layout/AndroidShell';

interface DashboardTabProps {
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  onNavigateTab: (tab: TabType) => void;
  onOpenNewProductModal: () => void;
  onOpenNewExpenseModal: () => void;
}

export const DashboardTab: React.FC<DashboardTabProps> = ({
  products,
  transactions,
  expenses,
  onNavigateTab,
  onOpenNewProductModal,
  onOpenNewExpenseModal,
}) => {
  const [chartTimeframe, setChartTimeframe] = useState<'TODAY' | '7DAYS' | '30DAYS'>('7DAYS');
  const [hoveredDataPoint, setHoveredDataPoint] = useState<{ label: string; amount: number; count: number } | null>(null);

  // Today's date ISO prefix (YYYY-MM-DD)
  const todayPrefix = new Date().toISOString().slice(0, 10);

  // 1. TOTAL PENDAPATAN
  const totalRevenue = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.total, 0);
  }, [transactions]);

  // 2. TOTAL PENGELUARAN
  const totalExpense = useMemo(() => {
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }, [expenses]);

  // Total raw profit from sales (Revenue - COGS)
  const grossProfit = useMemo(() => {
    return transactions
      .filter((t) => t.status === 'COMPLETED')
      .reduce((sum, t) => sum + t.profit, 0);
  }, [transactions]);

  // 3. KEUNTUNGAN BERSIH (Gross Profit - Total Expenses)
  const netProfit = grossProfit - totalExpense;
  const netMarginPercent = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;

  // 4. JUMLAH TRANSAKSI
  const completedTransactions = useMemo(() => {
    return transactions.filter((t) => t.status === 'COMPLETED');
  }, [transactions]);
  const totalTransactionsCount = completedTransactions.length;
  const averageTicket = totalTransactionsCount > 0 ? Math.round(totalRevenue / totalTransactionsCount) : 0;

  // 5. PRODUK TERLARIS (Best Sellers)
  const bestSellingProducts = useMemo(() => {
    const map = new Map<string, { product: Product; qtySold: number; totalSales: number }>();

    products.forEach((p) => {
      map.set(p.id, { product: p, qtySold: 0, totalSales: 0 });
    });

    completedTransactions.forEach((tx) => {
      tx.items.forEach((item) => {
        const entry = map.get(item.productId);
        if (entry) {
          entry.qtySold += item.quantity;
          entry.totalSales += item.subtotal;
        }
      });
    });

    return Array.from(map.values())
      .sort((a, b) => b.qtySold - a.qtySold || b.totalSales - a.totalSales)
      .slice(0, 5);
  }, [products, completedTransactions]);

  // Max sales for best seller progress bars
  const maxSoldVolume = Math.max(...bestSellingProducts.map((b) => b.qtySold), 1);

  // 6. GRAFIK PERKEMBANGAN PENJUALAN (Dynamic based on timeframe)
  const chartData = useMemo(() => {
    if (chartTimeframe === 'TODAY') {
      // 6 time blocks today (06:00, 09:00, 12:00, 15:00, 18:00, 21:00)
      const blocks = [
        { label: '06:00', startH: 6, endH: 9 },
        { label: '09:00', startH: 9, endH: 12 },
        { label: '12:00', startH: 12, endH: 15 },
        { label: '15:00', startH: 15, endH: 18 },
        { label: '18:00', startH: 18, endH: 21 },
        { label: '21:00', startH: 21, endH: 24 },
      ];

      return blocks.map((block) => {
        const matches = completedTransactions.filter((t) => {
          if (!t.date.startsWith(todayPrefix)) return false;
          const h = new Date(t.date).getHours();
          return h >= block.startH && h < block.endH;
        });

        const amount = matches.reduce((sum, t) => sum + t.total, 0);
        return {
          label: block.label,
          amount,
          count: matches.length,
        };
      });
    }

    if (chartTimeframe === '30DAYS') {
      // 4 weeks of data
      const weeks = [
        { label: 'Mgg 1', daysBack: 28 },
        { label: 'Mgg 2', daysBack: 21 },
        { label: 'Mgg 3', daysBack: 14 },
        { label: 'Mgg 4', daysBack: 7 },
        { label: 'Mgg Ini', daysBack: 0 },
      ];

      return weeks.map((w, idx) => {
        const prevDays = idx === 0 ? 35 : weeks[idx - 1].daysBack;
        const now = new Date();
        const start = new Date(now.getTime() - prevDays * 24 * 60 * 60 * 1000);
        const end = new Date(now.getTime() - w.daysBack * 24 * 60 * 60 * 1000);

        const matches = completedTransactions.filter((t) => {
          const d = new Date(t.date);
          return d >= start && d <= end;
        });

        const amount = matches.reduce((sum, t) => sum + t.total, 0);
        return {
          label: w.label,
          amount,
          count: matches.length,
        };
      });
    }

    // Default: '7DAYS'
    const days: { label: string; amount: number; count: number }[] = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayName = new Intl.DateTimeFormat('id-ID', { weekday: 'short' }).format(d);

      const matches = completedTransactions.filter((t) => t.date.startsWith(iso));
      const amount = matches.reduce((sum, t) => sum + t.total, 0);

      days.push({
        label: i === 0 ? 'Hari Ini' : dayName,
        amount,
        count: matches.length,
      });
    }
    return days;
  }, [completedTransactions, chartTimeframe, todayPrefix]);

  const maxChartAmount = Math.max(...chartData.map((d) => d.amount), 300000);

  // SVG Chart points calculation
  const totalPoints = chartData.length;
  const chartPoints = chartData.map((d, index) => {
    const x = 12 + (index / (totalPoints - 1)) * 76;
    const y = 82 - (d.amount / maxChartAmount) * 60;
    return { x, y, ...d };
  });

  const svgPathD = chartPoints.reduce((acc, point, index) => {
    if (index === 0) return `M ${point.x} ${point.y}`;
    const prev = chartPoints[index - 1];
    const cx = (prev.x + point.x) / 2;
    return `${acc} C ${cx} ${prev.y}, ${cx} ${point.y}, ${point.x} ${point.y}`;
  }, '');

  const areaPathD = `${svgPathD} L ${chartPoints[chartPoints.length - 1].x} 86 L ${chartPoints[0].x} 86 Z`;

  // 7. RINGKASAN AKTIVITAS BISNIS HARI INI
  const todayTransactions = useMemo(() => {
    return completedTransactions.filter((t) => t.date.startsWith(todayPrefix));
  }, [completedTransactions, todayPrefix]);

  const todayExpenses = useMemo(() => {
    return expenses.filter((e) => e.date.startsWith(todayPrefix));
  }, [expenses, todayPrefix]);

  const todayRevenue = useMemo(() => {
    return todayTransactions.reduce((sum, t) => sum + t.total, 0);
  }, [todayTransactions]);

  const todayExpenseAmount = useMemo(() => {
    return todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [todayExpenses]);

  const todayGrossProfit = useMemo(() => {
    return todayTransactions.reduce((sum, t) => sum + t.profit, 0);
  }, [todayTransactions]);

  const todayNetProfit = todayGrossProfit - todayExpenseAmount;

  // Combined Today's Activity Stream
  const todayActivities = useMemo(() => {
    const items: {
      id: string;
      timestamp: string;
      type: 'SALE' | 'EXPENSE';
      title: string;
      details: string;
      amount: number;
      method: string;
    }[] = [];

    todayTransactions.forEach((tx) => {
      items.push({
        id: tx.id,
        timestamp: tx.date,
        type: 'SALE',
        title: `Penjualan Kasir #${tx.invoiceNumber}`,
        details: `${tx.items.length} item · Klien: ${tx.customerName}`,
        amount: tx.total,
        method: tx.paymentMethod.replace('_', ' '),
      });
    });

    todayExpenses.forEach((exp) => {
      items.push({
        id: exp.id,
        timestamp: exp.date,
        type: 'EXPENSE',
        title: exp.description || `Pengeluaran: ${exp.category}`,
        details: `Kategori: ${exp.category} · Oleh: ${exp.recordedBy}`,
        amount: exp.amount,
        method: exp.paymentMethod,
      });
    });

    // If no activities today yet, show latest recent transactions as fallback context
    if (items.length === 0) {
      transactions.slice(0, 3).forEach((tx) => {
        items.push({
          id: tx.id,
          timestamp: tx.date,
          type: 'SALE',
          title: `Penjualan #${tx.invoiceNumber}`,
          details: `${tx.items.length} item · Klien: ${tx.customerName}`,
          amount: tx.total,
          method: tx.paymentMethod.replace('_', ' '),
        });
      });
    }

    return items.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [todayTransactions, todayExpenses, transactions]);

  return (
    <div className="space-y-5 pb-24">
      {/* Planetary Welcome Header */}
      <div className="relative rounded-2xl p-5 bg-gradient-to-r from-violet-950/70 via-slate-900/90 to-amber-950/50 border border-white/10 overflow-hidden shadow-2xl">
        <GalaxyDecoration variant="banner" />
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-44 h-44 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-semibold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>ORBIT PUSAT KENDALI BISNIS</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-cosmic mt-1">
              Ringkasan Kinerja Astro Business
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-lg">
              Sistem manajemen modern dengan gravitasi data real-time, statistik planet, dan navigasi arus kas akurat.
            </p>
          </div>

          {/* Quick Launch Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onNavigateTab('pos')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 text-xs font-bold shadow-lg shadow-amber-400/20 hover:brightness-110 transition-all active:scale-95"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Kasir POS</span>
            </button>

            <button
              onClick={onOpenNewProductModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 text-slate-200 text-xs font-medium border border-white/10 hover:bg-slate-700 transition-all"
            >
              <PlusCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>+ Produk</span>
            </button>

            <button
              onClick={onOpenNewExpenseModal}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 text-slate-200 text-xs font-medium border border-white/10 hover:bg-slate-700 transition-all"
            >
              <DollarSign className="w-3.5 h-3.5 text-rose-400" />
              <span>+ Beban</span>
            </button>

            <button
              onClick={() => onNavigateTab('reports')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-indigo-600/30 text-indigo-200 text-xs font-semibold border border-indigo-500/30 hover:bg-indigo-600/50 transition-all"
            >
              <BarChart3 className="w-3.5 h-3.5 text-amber-400" />
              <span>Laporan Otomatis</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 MODERN STAT CARDS WITH PLANETARY ICONS AND COSMIC ELEMENTS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* CARD 1: TOTAL PENDAPATAN (Planet Saturnus) */}
        <div className="p-4 rounded-2xl cosmic-card-gold relative overflow-hidden group hover:border-amber-400/50 transition-all">
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-amber-400/10 blur-xl pointer-events-none group-hover:bg-amber-400/20 transition-all" />

          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                Planet Saturnus
              </span>
              <h3 className="text-xs text-slate-400 mt-0.5">
                Total Pendapatan
              </h3>
            </div>
            {/* Custom SVG Saturn Planet Icon */}
            <div className="shrink-0 p-1 rounded-xl bg-amber-400/10 border border-amber-400/20 group-hover:scale-105 transition-transform">
              <SaturnPlanetIcon size={40} />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-extrabold text-amber-300 font-cosmic truncate">
              {formatRupiah(totalRevenue)}
            </div>
            <div className="text-[11px] text-amber-400/80 mt-1.5 flex items-center gap-1">
              <span className="font-semibold">{completedTransactions.length}</span>
              <span>transaksi sukses terkumpul</span>
            </div>
          </div>
        </div>

        {/* CARD 2: TOTAL PENGELUARAN (Planet Mars) */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-950 border border-rose-500/25 relative overflow-hidden group hover:border-rose-400/50 transition-all">
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-rose-500/10 blur-xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />

          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-rose-300 uppercase tracking-wider">
                Planet Mars
              </span>
              <h3 className="text-xs text-slate-400 mt-0.5">
                Total Pengeluaran
              </h3>
            </div>
            {/* Custom SVG Mars Planet Icon */}
            <div className="shrink-0 p-1 rounded-xl bg-rose-500/10 border border-rose-500/20 group-hover:scale-105 transition-transform">
              <MarsPlanetIcon size={40} />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-extrabold text-rose-300 font-cosmic truncate">
              {formatRupiah(totalExpense)}
            </div>
            <div className="text-[11px] text-rose-400/80 mt-1.5 flex items-center gap-1">
              <span>{expenses.length} pos catatan beban operasional</span>
            </div>
          </div>
        </div>

        {/* CARD 3: KEUNTUNGAN BERSIH (Planet Jupiter) */}
        <div className="p-4 rounded-2xl cosmic-card-violet relative overflow-hidden group hover:border-purple-400/50 transition-all">
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-purple-500/10 blur-xl pointer-events-none group-hover:bg-purple-500/20 transition-all" />

          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-purple-300 uppercase tracking-wider">
                Planet Jupiter
              </span>
              <h3 className="text-xs text-slate-400 mt-0.5">
                Keuntungan Bersih
              </h3>
            </div>
            {/* Custom SVG Jupiter Planet Icon */}
            <div className="shrink-0 p-1 rounded-xl bg-purple-500/10 border border-purple-500/20 group-hover:scale-105 transition-transform">
              <JupiterPlanetIcon size={40} />
            </div>
          </div>

          <div className="mt-2">
            <div className={`text-xl sm:text-2xl font-extrabold font-cosmic truncate ${netProfit >= 0 ? 'text-purple-200' : 'text-rose-400'}`}>
              {formatRupiah(netProfit)}
            </div>
            <div className="text-[11px] text-purple-300/80 mt-1.5 flex items-center gap-1.5">
              <span>Margin bersih:</span>
              <span className="font-bold text-emerald-400">{netMarginPercent}%</span>
              <span>·</span>
              <span>Posisi kas sehat</span>
            </div>
          </div>
        </div>

        {/* CARD 4: JUMLAH TRANSAKSI (Planet Merkurius / Neptunus) */}
        <div className="p-4 rounded-2xl cosmic-card-cyan relative overflow-hidden group hover:border-sky-400/50 transition-all">
          <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-sky-400/10 blur-xl pointer-events-none group-hover:bg-sky-400/20 transition-all" />

          <div className="flex items-start justify-between">
            <div>
              <span className="text-[11px] font-semibold text-sky-300 uppercase tracking-wider">
                Planet Merkurius
              </span>
              <h3 className="text-xs text-slate-400 mt-0.5">
                Jumlah Transaksi
              </h3>
            </div>
            {/* Custom SVG Mercury Planet Icon */}
            <div className="shrink-0 p-1 rounded-xl bg-sky-400/10 border border-sky-400/20 group-hover:scale-105 transition-transform">
              <MercuryPlanetIcon size={40} />
            </div>
          </div>

          <div className="mt-2">
            <div className="text-xl sm:text-2xl font-extrabold text-sky-200 font-cosmic truncate">
              {totalTransactionsCount} Transaksi
            </div>
            <div className="text-[11px] text-sky-300/80 mt-1.5 flex items-center gap-1">
              <span>Rata-rata:</span>
              <span className="font-semibold text-sky-100">{formatRupiah(averageTicket)}/nota</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROW 2: GRAFIK PERKEMBANGAN PENJUALAN & PRODUK TERLARIS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* GRAFIK PERKEMBANGAN PENJUALAN (Span 2 cols) */}
        <div className="p-5 rounded-2xl cosmic-glass border border-white/10 lg:col-span-2 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                <h3 className="text-base font-bold text-white font-cosmic">
                  Grafik Perkembangan Penjualan
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Kurva fluktuasi gravitasi omset dan akselerasi transaksi bisnis
              </p>
            </div>

            {/* Timeframe Filter Buttons */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setChartTimeframe('TODAY')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  chartTimeframe === 'TODAY'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Hari Ini
              </button>
              <button
                onClick={() => setChartTimeframe('7DAYS')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  chartTimeframe === '7DAYS'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                7 Hari
              </button>
              <button
                onClick={() => setChartTimeframe('30DAYS')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  chartTimeframe === '30DAYS'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                30 Hari
              </button>
            </div>
          </div>

          {/* Interactive SVG Chart */}
          <div className="relative w-full aspect-[16/8] max-h-56 my-2 select-none">
            {hoveredDataPoint && (
              <div className="absolute top-2 right-2 bg-slate-900/95 border border-sky-400/40 p-2 rounded-xl text-xs z-20 shadow-xl pointer-events-none">
                <span className="text-[10px] text-slate-400">{hoveredDataPoint.label}</span>
                <div className="font-bold text-amber-300 font-cosmic text-sm">
                  {formatRupiah(hoveredDataPoint.amount)}
                </div>
                <div className="text-[10px] text-sky-300">{hoveredDataPoint.count} Transaksi</div>
              </div>
            )}

            <svg viewBox="0 0 100 90" className="w-full h-full overflow-visible">
              <defs>
                <linearGradient id="cosmicSalesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.4" />
                  <stop offset="60%" stopColor="#818cf8" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#a855f7" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Grid guide lines */}
              <line x1="12" y1="22" x2="88" y2="22" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
              <line x1="12" y1="52" x2="88" y2="52" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
              <line x1="12" y1="82" x2="88" y2="82" stroke="rgba(255,255,255,0.08)" />

              {/* Area fill */}
              <path d={areaPathD} fill="url(#cosmicSalesGradient)" />

              {/* Glowing Curve stroke */}
              <path
                d={svgPathD}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.4"
                strokeLinecap="round"
                className="drop-shadow-[0_0_10px_rgba(56,189,248,0.7)]"
              />

              {/* Data points */}
              {chartPoints.map((pt, i) => (
                <g
                  key={i}
                  className="cursor-pointer group"
                  onMouseEnter={() => setHoveredDataPoint({ label: pt.label, amount: pt.amount, count: pt.count })}
                  onMouseLeave={() => setHoveredDataPoint(null)}
                >
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#0a0e24"
                    stroke="#38bdf8"
                    strokeWidth="2"
                    className="group-hover:scale-150 transition-transform origin-center"
                  />
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="1.8"
                    fill="#fbbf24"
                  />
                  <text
                    x={pt.x}
                    y="89"
                    textAnchor="middle"
                    className="text-[3.4px] fill-slate-400 font-mono font-medium"
                  >
                    {pt.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          <div className="pt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Puncak Penjualan Tertinggi:</span>
              <span className="font-bold text-amber-300 font-cosmic">{formatRupiah(maxChartAmount)}</span>
            </div>
            <button
              onClick={() => onNavigateTab('finance')}
              className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
            >
              <span>Laporan Lengkap</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* PRODUK TERLARIS (Top 5 Best Sellers) */}
        <div className="p-5 rounded-2xl cosmic-glass border border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-amber-400" />
                <h3 className="text-base font-bold text-white font-cosmic">
                  Produk Terlaris
                </h3>
              </div>
              <span className="text-[10px] text-amber-300 font-mono bg-amber-400/10 border border-amber-400/20 px-2 py-0.5 rounded-full">
                Orbit Unggulan
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Item dengan volume dan omset paling dominan
            </p>

            {/* List of best selling products */}
            <div className="space-y-3">
              {bestSellingProducts.map((item, idx) => {
                const rankLabels = ['1. Surya Polaris', '2. Cassiopeia', '3. Orion Nebula', '4. Sirius Core', '5. Andromeda'];
                const rankColors = [
                  'text-amber-300 border-amber-400/30 bg-amber-400/15',
                  'text-purple-300 border-purple-400/30 bg-purple-400/15',
                  'text-sky-300 border-sky-400/30 bg-sky-400/15',
                  'text-slate-300 border-slate-700 bg-slate-800',
                  'text-slate-400 border-slate-800 bg-slate-900',
                ];

                const percentage = Math.round((item.qtySold / maxSoldVolume) * 100);

                return (
                  <div key={item.product.id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold border shrink-0 ${rankColors[idx]}`}
                        >
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-200 truncate">
                          {item.product.name}
                        </span>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="font-bold text-amber-300 font-cosmic">
                          {formatRupiah(item.totalSales)}
                        </span>
                      </div>
                    </div>

                    {/* Progress Bar of Volume */}
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-amber-400 via-violet-500 to-sky-400"
                          style={{ width: `${Math.max(percentage, 8)}%` }}
                        />
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                        {item.qtySold} {item.product.unit}
                      </span>
                    </div>
                  </div>
                );
              })}

              {bestSellingProducts.length === 0 && (
                <div className="py-8 text-center text-xs text-slate-500">
                  Belum ada data penjualan tercatat.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('inventory')}
            className="w-full mt-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 border border-white/5 transition-colors"
          >
            <span>Katalog Inventaris Lengkap</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>
      </div>

      {/* 7. RINGKASAN AKTIVITAS BISNIS HARI INI */}
      <div className="p-5 rounded-2xl cosmic-glass border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-white/10">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-bold text-white font-cosmic">
                Ringkasan Aktivitas Bisnis Hari Ini
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Pantauan performa harian operasional dan aliran transaksi langsung
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-300 font-mono bg-slate-900/80 px-3 py-1.5 rounded-xl border border-white/5">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span>{formatDateIndo(new Date().toISOString())}</span>
          </div>
        </div>

        {/* Today's 4 Sub-Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-amber-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Omset Hari Ini
            </span>
            <div className="text-base sm:text-lg font-bold text-amber-300 font-cosmic mt-0.5">
              {formatRupiah(todayRevenue)}
            </div>
            <div className="text-[10px] text-amber-400/80 mt-1">
              {todayTransactions.length} transaksi kasir
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-rose-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Beban Hari Ini
            </span>
            <div className="text-base sm:text-lg font-bold text-rose-300 font-cosmic mt-0.5">
              {formatRupiah(todayExpenseAmount)}
            </div>
            <div className="text-[10px] text-rose-400/80 mt-1">
              {todayExpenses.length} pos biaya
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-purple-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Laba Bersih Hari Ini
            </span>
            <div className={`text-base sm:text-lg font-bold font-cosmic mt-0.5 ${todayNetProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
              {formatRupiah(todayNetProfit)}
            </div>
            <div className="text-[10px] text-purple-300/80 mt-1">
              Setelah dikurangi beban
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/80 border border-sky-500/20">
            <span className="text-[10px] uppercase font-bold text-slate-400">
              Status Kasir
            </span>
            <div className="text-base sm:text-lg font-bold text-sky-200 font-cosmic mt-0.5 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Aktif / Buka</span>
            </div>
            <div className="text-[10px] text-slate-400 mt-1">
              Sistem register siap melayani
            </div>
          </div>
        </div>

        {/* Chronological Activity Feed */}
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
            <span className="font-semibold text-slate-200">Log Aktivitas Terbaru</span>
            <span>{todayActivities.length} aktivitas tercatat</span>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {todayActivities.map((act) => {
              const isSale = act.type === 'SALE';
              return (
                <div
                  key={act.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:bg-white/[0.02] flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isSale
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isSale ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-100 truncate">
                        {act.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span>{formatDateTimeIndo(act.timestamp)}</span>
                        </span>
                        <span>·</span>
                        <span>{act.details}</span>
                        <span>·</span>
                        <span className="text-slate-300 font-mono">{act.method}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-bold font-cosmic ${
                        isSale ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isSale ? '+' : '-'} {formatRupiah(act.amount)}
                    </div>
                  </div>
                </div>
              );
            })}

            {todayActivities.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                Belum ada aktivitas baru hari ini. Tekan tombol Kasir POS untuk memulai penjualan!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bonus Interactive Constellation Map Section */}
      <div className="mt-4">
        <ConstellationChart
          products={products}
          transactions={transactions}
          onSelectProduct={() => onNavigateTab('inventory')}
        />
      </div>
    </div>
  );
};
