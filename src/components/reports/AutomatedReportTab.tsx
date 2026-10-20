import React, { useState, useMemo } from 'react';
import {
  Product,
  Transaction,
  Expense,
  Income,
  StockMovement,
  StoreProfile,
  BusinessTarget,
} from '../../types/business';
import {
  formatRupiah,
  formatDateIndo,
  formatDateTimeIndo,
  cosmicAudio,
  CONSTELLATION_CONFIG,
} from '../../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  BarChart3,
  Package,
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  Calendar,
  CheckCircle2,
  AlertTriangle,
  Printer,
  Download,
  RefreshCw,
  FileText,
  Sparkles,
  DollarSign,
  Percent,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
  Edit3,
  SlidersHorizontal,
  Layers,
  Activity,
  X
} from 'lucide-react';

interface AutomatedReportTabProps {
  products: Product[];
  transactions: Transaction[];
  expenses: Expense[];
  incomes: Income[];
  stockMovements: StockMovement[];
  storeProfile: StoreProfile;
  onUpdateStoreProfile: (profile: StoreProfile) => void;
  onNavigateTab: (tab: any) => void;
}

export type ReportTimeframe = 'BULAN_INI' | 'MINGGU_INI' | 'HARI_INI' | 'SEMUA';

export const AutomatedReportTab: React.FC<AutomatedReportTabProps> = ({
  products,
  transactions,
  expenses,
  incomes,
  stockMovements,
  storeProfile,
  onUpdateStoreProfile,
  onNavigateTab,
}) => {
  const [timeframe, setTimeframe] = useState<ReportTimeframe>('BULAN_INI');
  const [isEditTargetModalOpen, setIsEditTargetModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Business Target State
  const defaultTarget: BusinessTarget = storeProfile.businessTarget || {
    monthlyRevenueTarget: 25000000,
    monthlyProfitTarget: 10000000,
    monthlyTransactionsTarget: 150,
    targetMonth: 'Oktober 2026',
  };

  const [targetRevenueInput, setTargetRevenueInput] = useState<number>(defaultTarget.monthlyRevenueTarget);
  const [targetProfitInput, setTargetProfitInput] = useState<number>(defaultTarget.monthlyProfitTarget);
  const [targetTrxInput, setTargetTrxInput] = useState<number>(defaultTarget.monthlyTransactionsTarget);

  // Helper date filter
  const isDateWithinTimeframe = (dateStr: string, tf: ReportTimeframe): boolean => {
    const itemDate = new Date(dateStr);
    const now = new Date();

    if (tf === 'SEMUA') return true;

    if (tf === 'HARI_INI') {
      return (
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getDate() === now.getDate()
      );
    }

    if (tf === 'MINGGU_INI') {
      const past7 = new Date(now);
      past7.setDate(now.getDate() - 7);
      return itemDate >= past7 && itemDate <= now;
    }

    if (tf === 'BULAN_INI') {
      return (
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth()
      );
    }

    return true;
  };

  // 1. FILTERED RAW BUSINESS DATA
  const completedTrx = useMemo(() => {
    return transactions.filter((t) => t.status === 'COMPLETED' && isDateWithinTimeframe(t.date, timeframe));
  }, [transactions, timeframe]);

  const filteredIncomes = useMemo(() => {
    return incomes.filter((i) => isDateWithinTimeframe(i.date, timeframe));
  }, [incomes, timeframe]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => isDateWithinTimeframe(e.date, timeframe));
  }, [expenses, timeframe]);

  const filteredMovements = useMemo(() => {
    return stockMovements.filter((m) => isDateWithinTimeframe(m.date, timeframe));
  }, [stockMovements, timeframe]);

  // 2. FINANCIAL METRICS COMPUTATION (100% Mathematical from User Business Data)
  const totalPOSRevenue = useMemo(() => {
    return completedTrx.reduce((sum, t) => sum + t.total, 0);
  }, [completedTrx]);

  const totalOtherRevenue = useMemo(() => {
    return filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  }, [filteredIncomes]);

  const totalRevenue = totalPOSRevenue + totalOtherRevenue;

  const totalCOGS = useMemo(() => {
    return completedTrx.reduce((sum, t) => {
      const orderCOGS = t.items.reduce((acc, it) => acc + (it.costPrice * it.quantity), 0);
      return sum + orderCOGS;
    }, 0);
  }, [completedTrx]);

  const grossProfit = totalRevenue - totalCOGS;
  const grossProfitMargin = totalRevenue > 0 ? Math.round((grossProfit / totalRevenue) * 100) : 0;

  const totalExpenses = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  // Automatic Net Profit (Laba Bersih Otomatis)
  const netProfit = totalRevenue - totalExpenses;
  const netProfitMargin = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 100) : 0;
  const expenseRatio = totalRevenue > 0 ? Math.round((totalExpenses / totalRevenue) * 100) : 0;

  // 3. TOP-SELLING PRODUCTS (PRODUK TERLARIS)
  const bestSellers = useMemo(() => {
    const map = new Map<string, {
      product: Product;
      unitsSold: number;
      revenue: number;
      cogs: number;
      profit: number;
    }>();

    completedTrx.forEach((tx) => {
      tx.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId) || {
          id: item.productId,
          name: item.productName,
          sku: item.sku,
          category: 'Umum',
          costPrice: item.costPrice,
          sellingPrice: item.unitPrice,
          stock: 0,
          minStock: 10,
          unit: 'pcs',
        };

        const existing = map.get(item.productId) || {
          product: prod as Product,
          unitsSold: 0,
          revenue: 0,
          cogs: 0,
          profit: 0,
        };

        const itemRev = item.unitPrice * item.quantity;
        const itemCost = item.costPrice * item.quantity;

        existing.unitsSold += item.quantity;
        existing.revenue += itemRev;
        existing.cogs += itemCost;
        existing.profit += (itemRev - itemCost);

        map.set(item.productId, existing);
      });
    });

    return Array.from(map.values())
      .map((entry) => ({
        ...entry,
        revenueShare: totalPOSRevenue > 0 ? Math.round((entry.revenue / totalPOSRevenue) * 100) : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [completedTrx, products, totalPOSRevenue]);

  // 4. INVENTORY STOCK CHANGES (PERUBAHAN STOK)
  const stockChangesSummary = useMemo(() => {
    const totalInboundQty = filteredMovements
      .filter((m) => m.type === 'IN')
      .reduce((sum, m) => sum + m.quantity, 0);

    const totalOutboundQty = filteredMovements
      .filter((m) => m.type === 'OUT')
      .reduce((sum, m) => sum + m.quantity, 0);

    const netStockChange = totalInboundQty - totalOutboundQty;

    // Current stock status across catalog
    const totalStockQty = products.reduce((sum, p) => sum + p.stock, 0);
    const totalAssetCostValue = products.reduce((sum, p) => sum + (p.costPrice * p.stock), 0);
    const totalAssetRetailValue = products.reduce((sum, p) => sum + (p.sellingPrice * p.stock), 0);
    const criticalStockProducts = products.filter((p) => p.stock <= p.minStock);

    // Dynamic stock change per product
    const productDeltas = products.map((prod) => {
      const prodIn = filteredMovements
        .filter((m) => m.productId === prod.id && m.type === 'IN')
        .reduce((sum, m) => sum + m.quantity, 0);

      const prodOut = filteredMovements
        .filter((m) => m.productId === prod.id && m.type === 'OUT')
        .reduce((sum, m) => sum + m.quantity, 0);

      return {
        product: prod,
        inbound: prodIn,
        outbound: prodOut,
        netDelta: prodIn - prodOut,
        currentStock: prod.stock,
        isLow: prod.stock <= prod.minStock,
      };
    }).sort((a, b) => b.outbound - a.outbound);

    return {
      totalInboundQty,
      totalOutboundQty,
      netStockChange,
      totalStockQty,
      totalAssetCostValue,
      totalAssetRetailValue,
      criticalStockProducts,
      productDeltas,
    };
  }, [filteredMovements, products]);

  // 5. SALES TREND & TRANSACTION PATTERNS (TREN PENJUALAN)
  const salesTrends = useMemo(() => {
    const transactionCount = completedTrx.length;
    const aov = transactionCount > 0 ? Math.round(totalPOSRevenue / transactionCount) : 0;
    const totalItemsSold = completedTrx.reduce((sum, t) => {
      return sum + t.items.reduce((acc, it) => acc + it.quantity, 0);
    }, 0);
    const avgItemsPerOrder = transactionCount > 0 ? (totalItemsSold / transactionCount).toFixed(1) : '0';

    // Grouping by date (Last 7 intervals)
    const dateMap = new Map<string, { label: string; revenue: number; count: number }>();
    const now = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(now.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayLabel = new Intl.DateTimeFormat('id-ID', { weekday: 'short', day: 'numeric' }).format(d);
      dateMap.set(iso, { label: dayLabel, revenue: 0, count: 0 });
    }

    completedTrx.forEach((tx) => {
      const iso = tx.date.slice(0, 10);
      if (dateMap.has(iso)) {
        const item = dateMap.get(iso)!;
        item.revenue += tx.total;
        item.count += 1;
      }
    });

    const trajectory = Array.from(dateMap.values());
    const maxRevInTrend = Math.max(...trajectory.map((t) => t.revenue), 100000);

    // Peak hours analysis
    const morningCount = completedTrx.filter((t) => {
      const hour = new Date(t.date).getHours();
      return hour >= 6 && hour < 12;
    }).length;

    const afternoonCount = completedTrx.filter((t) => {
      const hour = new Date(t.date).getHours();
      return hour >= 12 && hour < 17;
    }).length;

    const eveningCount = completedTrx.filter((t) => {
      const hour = new Date(t.date).getHours();
      return hour >= 17;
    }).length;

    let peakTimePeriod = 'Pagi Hari (06:00 - 12:00)';
    if (afternoonCount >= morningCount && afternoonCount >= eveningCount) {
      peakTimePeriod = 'Siang Hari (12:00 - 17:00)';
    } else if (eveningCount >= morningCount && eveningCount >= afternoonCount) {
      peakTimePeriod = 'Sore / Malam (17:00 - 22:00)';
    }

    return {
      transactionCount,
      aov,
      totalItemsSold,
      avgItemsPerOrder,
      trajectory,
      maxRevInTrend,
      morningCount,
      afternoonCount,
      eveningCount,
      peakTimePeriod,
    };
  }, [completedTrx, totalPOSRevenue]);

  // 6. BUSINESS TARGET PROGRESS & RUN-RATE PROJECTION (PERKEMBANGAN TARGET BISNIS)
  const targetProgress = useMemo(() => {
    const revTarget = defaultTarget.monthlyRevenueTarget;
    const profitTarget = defaultTarget.monthlyProfitTarget;
    const trxTarget = defaultTarget.monthlyTransactionsTarget;

    const revPercent = revTarget > 0 ? Math.min(100, Math.round((totalRevenue / revTarget) * 100)) : 0;
    const profitPercent = profitTarget > 0 ? Math.min(100, Math.round((netProfit / profitTarget) * 100)) : 0;
    const trxPercent = trxTarget > 0 ? Math.min(100, Math.round((completedTrx.length / trxTarget) * 100)) : 0;

    // Run-rate projection to end of month
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysRemaining = Math.max(0, daysInMonth - currentDay);

    const dailyRevenueRate = currentDay > 0 ? totalRevenue / currentDay : 0;
    const projectedMonthEndRevenue = Math.round(totalRevenue + (dailyRevenueRate * daysRemaining));

    const dailyProfitRate = currentDay > 0 ? netProfit / currentDay : 0;
    const projectedMonthEndProfit = Math.round(netProfit + (dailyProfitRate * daysRemaining));

    const projectedRevAchievementPercent = revTarget > 0
      ? Math.round((projectedMonthEndRevenue / revTarget) * 100)
      : 0;

    return {
      revTarget,
      profitTarget,
      trxTarget,
      revPercent,
      profitPercent,
      trxPercent,
      currentDay,
      daysInMonth,
      daysRemaining,
      dailyRevenueRate,
      projectedMonthEndRevenue,
      projectedMonthEndProfit,
      projectedRevAchievementPercent,
    };
  }, [defaultTarget, totalRevenue, netProfit, completedTrx]);

  // 7. SAVE TARGET HANDLER
  const handleSaveTarget = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreProfile({
      ...storeProfile,
      businessTarget: {
        monthlyRevenueTarget: targetRevenueInput,
        monthlyProfitTarget: targetProfitInput,
        monthlyTransactionsTarget: targetTrxInput,
        targetMonth: defaultTarget.targetMonth,
      },
    });
    cosmicAudio.playSuccess();
    setIsEditTargetModalOpen(false);
  };

  // 8. EXPORT CSV OF REPORT
  const handleExportReportCSV = () => {
    cosmicAudio.playBeep();
    const lines = [
      `LAPORAN EKSEKUTIF OTOMATIS - ${storeProfile.name.toUpperCase()}`,
      `Tanggal Unduh: ${new Date().toLocaleString('id-ID')}`,
      `Periode Analisis: ${timeframe}`,
      `Metode Perhitungan: Audit Matematis Data Transaksi Pengguna (Non-Astrologi)`,
      '',
      '--- 1. RINGKASAN FINANSIAL & LABA BERSIH ---',
      `Total Pendapatan Usaha,${totalRevenue}`,
      `Penjualan Kasir POS,${totalPOSRevenue}`,
      `Pendapatan Eksternal Lainnya,${totalOtherRevenue}`,
      `Harga Pokok Penjualan (COGS),${totalCOGS}`,
      `Laba Kotor (Gross Profit),${grossProfit}`,
      `Total Beban Operasional,${totalExpenses}`,
      `Keuntungan Bersih (Net Profit),${netProfit}`,
      `Margin Keuntungan Bersih,${netProfitMargin}%`,
      `Rasio Beban Operasional,${expenseRatio}%`,
      '',
      '--- 2. PERKEMBANGAN TARGET BISNIS ---',
      `Target Omset Bulanan,${targetProgress.revTarget}`,
      `Realisasi Omset,${totalRevenue}`,
      `Persentase Capaian Omset,${targetProgress.revPercent}%`,
      `Proyeksi Omset Akhir Bulan,${targetProgress.projectedMonthEndRevenue}`,
      `Target Laba Bersih,${targetProgress.profitTarget}`,
      `Realisasi Laba Bersih,${netProfit}`,
      `Persentase Capaian Laba,${targetProgress.profitPercent}%`,
      `Target Transaksi,${targetProgress.trxTarget}`,
      `Realisasi Transaksi,${completedTrx.length}`,
      '',
      '--- 3. PERINGKAT PRODUK TERLARIS ---',
      'Peringkat,Nama Produk,SKU,Unit Terjual,Omset Penjualan (IDR),Kontribusi Omset (%),Estimasi Laba Produk (IDR)',
      ...bestSellers.map((item, idx) =>
        `${idx + 1},"${item.product.name}",${item.product.sku},${item.unitsSold},${item.revenue},${item.revenueShare}%,${item.profit}`
      ),
      '',
      '--- 4. PERUBAHAN STOK & LOGISTIK ---',
      `Total Barang Masuk (Inbound),${stockChangesSummary.totalInboundQty}`,
      `Total Barang Keluar (Outbound),${stockChangesSummary.totalOutboundQty}`,
      `Perubahan Bersih Stok,${stockChangesSummary.netStockChange}`,
      `Total Valuasi Modal Aset Stok,${stockChangesSummary.totalAssetCostValue}`,
      `Total Nilai Estimasi Jual Stok,${stockChangesSummary.totalAssetRetailValue}`,
      `Jumlah SKU Kritis / Menipis,${stockChangesSummary.criticalStockProducts.length}`,
      '',
      '--- 5. TREN PENJUALAN & POLA ORDER ---',
      `Total Transaksi Sukses,${salesTrends.transactionCount}`,
      `Rata-Rata Nilai Belanja (AOV),${salesTrends.aov}`,
      `Total Item Terjual,${salesTrends.totalItemsSold}`,
      `Rata-Rata Item per Order,${salesTrends.avgItemsPerOrder}`,
      `Jam Puncak Penjualan,${salesTrends.peakTimePeriod}`,
    ];

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + lines.join('\n');
    const encoded = encodeURI(csvContent);
    const a = document.createElement('a');
    a.href = encoded;
    a.download = `laporan-eksekutif-astro-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="space-y-4 pb-24 select-none">
      {/* 1. TOP HEADER & TIMEFRAME CONTROLS */}
      <div className="relative rounded-2xl p-5 bg-gradient-to-r from-indigo-950/80 via-slate-900/90 to-amber-950/40 border border-white/10 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>SISTEM LAPORAN OTOMATIS & ANALISIS EKSEKUTIF</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-cosmic mt-1">
              Laporan Bisnis Otomatis
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Kompilasi otomatis metrik pendapatan, pengeluaran, laba bersih, produk terlaris, perubahan stok, tren penjualan, dan evaluasi target bisnis berbasis data transaksi riil.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsEditTargetModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-white/10 hover:bg-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Target className="w-4 h-4 text-amber-400" />
              <span>Atur Target</span>
            </button>

            <button
              onClick={handleExportReportCSV}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-white/10 hover:bg-slate-700 flex items-center gap-1.5 transition-all"
            >
              <Download className="w-4 h-4 text-emerald-400" />
              <span>Unduh CSV</span>
            </button>

            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Laporan PDF</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. REAL-DATA AUDIT BANNER (CLARITY GUARANTEE) */}
      <div className="p-3.5 rounded-2xl bg-indigo-950/40 border border-indigo-500/25 flex items-start gap-3">
        <div className="p-2 rounded-xl bg-indigo-500/15 text-indigo-400 shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div className="text-xs">
          <span className="font-bold text-indigo-200 block">
            Jaminan Integritas & Verifikasi Data Matematis
          </span>
          <p className="text-slate-300 text-[11px] mt-0.5 leading-relaxed">
            Semua perhitungan omset, pengeluaran, keuntungan bersih, tren, dan proyeksi target di bawah ini dihitung <b>100% dari data transaksi penjualan POS, buku jurnal kas, dan pencatatan inventaris pengguna</b>. Tidak ada unsur ramalan horoskop atau astrologi dalam kalkulasi angka.
          </p>
        </div>
      </div>

      {/* 3. TIMEFRAME SELECTOR BAR */}
      <div className="p-2.5 rounded-2xl cosmic-glass border border-white/10 flex items-center justify-between gap-2 overflow-x-auto">
        <span className="text-xs text-slate-400 font-semibold px-2 shrink-0">
          Periode Analisis:
        </span>
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5">
          <button
            onClick={() => {
              setTimeframe('HARI_INI');
              cosmicAudio.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === 'HARI_INI'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Hari Ini
          </button>
          <button
            onClick={() => {
              setTimeframe('MINGGU_INI');
              cosmicAudio.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === 'MINGGU_INI'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            7 Hari Terakhir
          </button>
          <button
            onClick={() => {
              setTimeframe('BULAN_INI');
              cosmicAudio.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === 'BULAN_INI'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Bulan Ini (Oktober 2026)
          </button>
          <button
            onClick={() => {
              setTimeframe('SEMUA');
              cosmicAudio.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              timeframe === 'SEMUA'
                ? 'bg-amber-400 text-slate-950 shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Semua Data
          </button>
        </div>
      </div>

      {/* 4. BAGIAN 1 & 2: PENDAPATAN, PENGELUARAN & KEUNTUNGAN BERSIH */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* TOTAL PENDAPATAN */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-950/40 via-slate-900/80 to-slate-950 border border-amber-500/25">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Total Pendapatan</span>
            <span className="text-emerald-400 font-mono">+{completedTrx.length} order</span>
          </div>
          <div className="text-2xl font-extrabold text-amber-300 font-cosmic mt-1">
            {formatRupiah(totalRevenue)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>POS: {formatRupiah(totalPOSRevenue)}</span>
            <span>·</span>
            <span>Jasa/Mitra: {formatRupiah(totalOtherRevenue)}</span>
          </div>
        </div>

        {/* TOTAL PENGELUARAN */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-950 border border-rose-500/25">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Total Pengeluaran</span>
            <span className="text-rose-400 font-mono">-{filteredExpenses.length} pos</span>
          </div>
          <div className="text-2xl font-extrabold text-rose-300 font-cosmic mt-1">
            {formatRupiah(totalExpenses)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>Rasio Beban Usaha: <b className="text-rose-300 font-mono">{expenseRatio}%</b></span>
            <span>·</span>
            <span>HPP: {formatRupiah(totalCOGS)}</span>
          </div>
        </div>

        {/* KEUNTUNGAN BERSIH OTOMATIS */}
        <div className="p-4 rounded-2xl cosmic-card-violet">
          <div className="flex items-center justify-between text-purple-300 text-[10px] uppercase font-bold tracking-wider">
            <span>Keuntungan Bersih (Otomatis)</span>
            <span className="text-emerald-300 font-mono font-bold bg-emerald-500/20 px-1.5 py-0.5 rounded border border-emerald-500/30">
              Margin {netProfitMargin}%
            </span>
          </div>
          <div className={`text-2xl font-extrabold font-cosmic mt-1 ${netProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'}`}>
            {formatRupiah(netProfit)}
          </div>
          <div className="text-[11px] text-purple-200 mt-2 flex justify-between">
            <span>Laba Kotor: {formatRupiah(grossProfit)}</span>
            <span>·</span>
            <span>G. Margin: {grossProfitMargin}%</span>
          </div>
        </div>

        {/* RATA-RATA TRANSAKSI & EFFISIENSI */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 via-slate-900/80 to-slate-950 border border-sky-500/25">
          <div className="flex items-center justify-between text-slate-400 text-[10px] uppercase font-bold tracking-wider">
            <span>Rata-Rata Order (AOV)</span>
            <span className="text-sky-400 font-mono">Keranjang</span>
          </div>
          <div className="text-2xl font-extrabold text-sky-300 font-cosmic mt-1">
            {formatRupiah(salesTrends.aov)}
          </div>
          <div className="text-[11px] text-slate-400 mt-2 flex justify-between">
            <span>{salesTrends.totalItemsSold} barang terjual</span>
            <span>·</span>
            <span>{salesTrends.avgItemsPerOrder} item/order</span>
          </div>
        </div>
      </div>

      {/* 5. BAGIAN 6: PERKEMBANGAN TARGET BISNIS (TARGET VS ACTUAL) */}
      <div className="p-5 rounded-2xl cosmic-glass border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
          <div>
            <div className="flex items-center gap-2">
              <Target className="w-5 h-5 text-amber-400" />
              <h3 className="text-base font-bold text-white font-cosmic">
                Perkembangan Target Bisnis Bulanan ({defaultTarget.targetMonth})
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Evaluasi target vs pencapaian aktual serta proyeksi ekstrapolasi laju harian
            </p>
          </div>

          <button
            onClick={() => setIsEditTargetModalOpen(true)}
            className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold flex items-center gap-1.5 border border-white/10 self-start sm:self-auto"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Sesuaikan Target</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Target 1: Omset Pendapatan */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Target Omset Bulanan</span>
              <span className="font-bold text-amber-300 font-mono">
                {targetProgress.revPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-emerald-400"
                style={{ width: `${targetProgress.revPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Terkumpul: <b>{formatRupiah(totalRevenue)}</b></span>
              <span className="text-slate-500">Target: {formatRupiah(targetProgress.revTarget)}</span>
            </div>
          </div>

          {/* Target 2: Laba Bersih */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Target Laba Bersih</span>
              <span className={`font-bold font-mono ${targetProgress.profitPercent >= 100 ? 'text-emerald-400' : 'text-purple-300'}`}>
                {targetProgress.profitPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-emerald-400"
                style={{ width: `${targetProgress.profitPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Terealisasi: <b>{formatRupiah(netProfit)}</b></span>
              <span className="text-slate-500">Target: {formatRupiah(targetProgress.profitTarget)}</span>
            </div>
          </div>

          {/* Target 3: Jumlah Transaksi */}
          <div className="p-4 rounded-xl bg-slate-900/70 border border-white/5 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-slate-400">Target Volume Transaksi</span>
              <span className="font-bold text-sky-300 font-mono">
                {targetProgress.trxPercent}%
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-sky-500 to-teal-400"
                style={{ width: `${targetProgress.trxPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-300">
              <span>Terealisasi: <b>{completedTrx.length} order</b></span>
              <span className="text-slate-500">Target: {targetProgress.trxTarget} order</span>
            </div>
          </div>
        </div>

        {/* Proyeksi Akhir Bulan (Run-rate Projection) */}
        <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-slate-900 to-emerald-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5">
            <Activity className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-bold text-white block">
                Proyeksi Ekstrapolasi Akhir Bulan (Hari ke-{targetProgress.currentDay} dari {targetProgress.daysInMonth})
              </span>
              <span className="text-slate-400 text-[11px]">
                Dengan laju harian saat ini ({formatRupiah(targetProgress.dailyRevenueRate)}/hari), proyeksi omset mencapai:
              </span>
            </div>
          </div>

          <div className="text-right shrink-0">
            <div className="text-base font-extrabold text-amber-300 font-cosmic">
              {formatRupiah(targetProgress.projectedMonthEndRevenue)}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono">
              Estimasi Capaian Target: {targetProgress.projectedRevAchievementPercent}%
            </div>
          </div>
        </div>
      </div>

      {/* 6. BAGIAN 3 & 4: PRODUK TERLARIS & PERUBAHAN STOK */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* PRODUK TERLARIS */}
        <div className="p-4 rounded-2xl cosmic-glass border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-white font-cosmic">
                  Peringkat Produk Terlaris
                </h4>
                <p className="text-[11px] text-slate-400">
                  Dihitung dari transaksi riil ({bestSellers.length} produk berkontribusi)
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>Katalog</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {bestSellers.map((item, idx) => (
              <div
                key={item.product.id}
                className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:border-amber-400/20 transition-all flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center font-black font-cosmic text-xs shrink-0 ${
                      idx === 0
                        ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                        : idx === 1
                        ? 'bg-slate-300 text-slate-950'
                        : idx === 2
                        ? 'bg-amber-700 text-white'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    #{idx + 1}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-100 truncate">
                      {item.product.name}
                    </div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                      <span>{item.unitsSold} unit terjual</span>
                      <span>·</span>
                      <span className="text-emerald-400">Laba: {formatRupiah(item.profit)}</span>
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-xs font-bold text-amber-300 font-cosmic">
                    {formatRupiah(item.revenue)}
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">
                    {item.revenueShare}% omset
                  </div>
                </div>
              </div>
            ))}

            {bestSellers.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-500">
                Belum ada transaksi penjualan pada periode ini.
              </div>
            )}
          </div>
        </div>

        {/* PERUBAHAN STOK & LOGISTIK */}
        <div className="p-4 rounded-2xl cosmic-glass border border-white/10 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-teal-400" />
              <div>
                <h4 className="text-sm font-bold text-white font-cosmic">
                  Laporan Perubahan Stok
                </h4>
                <p className="text-[11px] text-slate-400">
                  Arus barang masuk, barang keluar, dan status minimum
                </p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab('inventory')}
              className="text-xs text-teal-400 hover:underline flex items-center gap-1"
            >
              <span>Inventaris</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Quick Metrics of Stock Changes */}
          <div className="grid grid-cols-3 gap-2">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-center">
              <div className="text-[10px] text-slate-400">Barang Masuk</div>
              <div className="text-sm font-bold text-emerald-400 font-mono mt-0.5">
                +{stockChangesSummary.totalInboundQty}
              </div>
              <div className="text-[9px] text-slate-500">Restock/Audit</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-center">
              <div className="text-[10px] text-slate-400">Barang Keluar</div>
              <div className="text-sm font-bold text-rose-400 font-mono mt-0.5">
                -{stockChangesSummary.totalOutboundQty}
              </div>
              <div className="text-[9px] text-slate-500">Penjualan POS</div>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-white/5 text-center">
              <div className="text-[10px] text-slate-400">Stok Kritis</div>
              <div className="text-sm font-bold text-amber-400 font-mono mt-0.5">
                {stockChangesSummary.criticalStockProducts.length} SKU
              </div>
              <div className="text-[9px] text-slate-500">Perlu Restock</div>
            </div>
          </div>

          {/* Per-Product Stock Movement Table */}
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {stockChangesSummary.productDeltas.slice(0, 6).map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-xl bg-slate-900/40 border border-white/5 flex items-center justify-between text-xs"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-slate-200 truncate">
                    {item.product.name}
                  </div>
                  <div className="text-[10px] text-slate-400 flex items-center gap-1.5">
                    <span>Masuk: +{item.inbound}</span>
                    <span>·</span>
                    <span>Keluar: -{item.outbound}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-slate-100">
                    Sisa: {item.currentStock} {item.product.unit}
                  </div>
                  {item.isLow ? (
                    <span className="text-[9px] text-rose-400 font-bold bg-rose-500/10 px-1 py-0.5 rounded">
                      Stok Menipis
                    </span>
                  ) : (
                    <span className="text-[9px] text-emerald-400 font-mono">
                      Stok Aman
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 7. BAGIAN 5: TREN PENJUALAN & POLA ORDER */}
      <div className="p-5 rounded-2xl cosmic-glass border border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <div>
              <h3 className="text-base font-bold text-white font-cosmic">
                Tren & Pola Penjualan Harian
              </h3>
              <p className="text-xs text-slate-400">
                Pola laju pendapatan dan distribusi jam sibuk pelanggan
              </p>
            </div>
          </div>

          <div className="text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1 rounded-xl border border-indigo-500/20">
            Jam Paling Sibuk: <b>{salesTrends.peakTimePeriod}</b>
          </div>
        </div>

        {/* Trajectory Run-Chart */}
        <div className="space-y-2">
          <div className="text-xs text-slate-400 flex justify-between">
            <span>Kurva Trajectory Pendapatan (7 Titik Periode Terakhir)</span>
            <span className="text-emerald-400 font-mono">Puncak: {formatRupiah(salesTrends.maxRevInTrend)}</span>
          </div>

          <div className="grid grid-cols-7 gap-1.5 h-36 items-end pt-4 bg-slate-900/40 p-3 rounded-xl border border-white/5">
            {salesTrends.trajectory.map((pt, i) => {
              const heightPct = Math.max(6, Math.round((pt.revenue / salesTrends.maxRevInTrend) * 100));
              return (
                <div key={i} className="flex flex-col items-center h-full justify-end group">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity text-[9px] text-amber-300 font-mono mb-1 text-center truncate max-w-full">
                    {formatRupiah(pt.revenue)}
                  </div>
                  <div
                    className="w-full max-w-[36px] rounded-t-lg bg-gradient-to-t from-indigo-600 via-violet-500 to-amber-400 group-hover:brightness-125 transition-all"
                    style={{ height: `${heightPct}%` }}
                  />
                  <div className="text-[9px] text-slate-400 mt-2 font-mono truncate w-full text-center">
                    {pt.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* MODAL 1: SESUAIKAN TARGET BISNIS BULANAN */}
      {isEditTargetModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1227] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative">
            <button
              onClick={() => setIsEditTargetModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white font-cosmic mb-1">
              Atur Target Bisnis Bulanan
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Tentukan target pendapatan, laba bersih, dan jumlah transaksi untuk periode berjalan.
            </p>

            <form onSubmit={handleSaveTarget} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Target Pendapatan / Omset (IDR)</label>
                <input
                  type="number"
                  min="1000000"
                  step="500000"
                  required
                  value={targetRevenueInput}
                  onChange={(e) => setTargetRevenueInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Target Keuntungan Bersih (IDR)</label>
                <input
                  type="number"
                  min="500000"
                  step="500000"
                  required
                  value={targetProfitInput}
                  onChange={(e) => setTargetProfitInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-emerald-300 font-bold font-mono focus:outline-none focus:border-emerald-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Target Jumlah Transaksi (Order)</label>
                <input
                  type="number"
                  min="10"
                  step="10"
                  required
                  value={targetTrxInput}
                  onChange={(e) => setTargetTrxInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-sky-300 font-bold font-mono focus:outline-none focus:border-sky-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditTargetModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 shadow"
                >
                  Simpan Target Baru
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CETAK / SIMPAN PDF LAPORAN EKSEKUTIF RESMI */}
      {isPrintModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-3xl bg-[#0b0e1d] border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-cosmic">
                  Laporan Bisnis Eksekutif Resmi
                </h3>
              </div>
              <button
                onClick={() => setIsPrintModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable Document Paper */}
            <div className="bg-white text-slate-900 p-8 rounded-xl shadow-xl font-sans text-xs space-y-6 printable-content">
              {/* Kop Surat Bisnis */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-black uppercase tracking-tight text-slate-950 font-cosmic">
                    {storeProfile.name}
                  </h1>
                  <p className="text-slate-600 text-[11px]">{storeProfile.tagline}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{storeProfile.address} · {storeProfile.phone}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-amber-700 tracking-wider">
                    LAPORAN EKSEKUTIF BISNIS
                  </div>
                  <div className="text-[11px] text-slate-700 font-semibold mt-0.5">
                    Periode: {timeframe} ({new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date())})
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Sistem Perhitungan: Verifikasi Transaksi Riil
                  </div>
                </div>
              </div>

              {/* 1. Ringkasan Finansial */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1 flex justify-between">
                  <span>1. KINERJA PENDAPATAN, PENGELUARAN & LABA BERSIH</span>
                  <span className="text-emerald-700 font-mono">Margin: {netProfitMargin}%</span>
                </div>
                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>Total Pendapatan Kasir POS:</span>
                      <span className="font-mono">{formatRupiah(totalPOSRevenue)}</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Pendapatan Jasa & Sponsorship:</span>
                      <span className="font-mono">{formatRupiah(totalOtherRevenue)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                      <span>TOTAL PENDAPATAN USAHA:</span>
                      <span className="font-mono text-emerald-700">{formatRupiah(totalRevenue)}</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="flex justify-between text-slate-700">
                      <span>Harga Pokok Penjualan (HPP):</span>
                      <span className="font-mono text-rose-700">({formatRupiah(totalCOGS)})</span>
                    </div>
                    <div className="flex justify-between text-slate-700">
                      <span>Total Beban Operasional:</span>
                      <span className="font-mono text-rose-700">({formatRupiah(totalExpenses)})</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 border-t border-slate-200 pt-1">
                      <span>KEUNTUNGAN BERSIH (NET PROFIT):</span>
                      <span className="font-mono text-emerald-700">{formatRupiah(netProfit)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Evaluasi Target Bisnis */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                  2. PERKEMBANGAN TARGET USAHA
                </div>
                <div className="grid grid-cols-3 gap-3 pt-1 text-[11px]">
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Target Omset:</span>
                    <span className="font-bold">{formatRupiah(targetProgress.revTarget)}</span>
                    <span className="block text-emerald-700 font-bold mt-1">Capaian: {targetProgress.revPercent}%</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Target Laba Bersih:</span>
                    <span className="font-bold">{formatRupiah(targetProgress.profitTarget)}</span>
                    <span className="block text-purple-700 font-bold mt-1">Capaian: {targetProgress.profitPercent}%</span>
                  </div>
                  <div className="p-2.5 rounded bg-slate-50 border border-slate-200">
                    <span className="text-slate-500 block">Target Transaksi:</span>
                    <span className="font-bold">{targetProgress.trxTarget} Transaksi</span>
                    <span className="block text-sky-700 font-bold mt-1">Capaian: {targetProgress.trxPercent}%</span>
                  </div>
                </div>
              </div>

              {/* 3. Produk Terlaris */}
              <div className="space-y-2">
                <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                  3. TOP 5 PRODUK DENGAN KONTRIBUSI PENJUALAN TERTINGGI
                </div>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-600">
                      <th className="py-1">No</th>
                      <th className="py-1">Nama Produk</th>
                      <th className="py-1">SKU</th>
                      <th className="py-1 text-right">Unit Terjual</th>
                      <th className="py-1 text-right">Omset (IDR)</th>
                      <th className="py-1 text-right">Kontribusi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bestSellers.slice(0, 5).map((item, idx) => (
                      <tr key={item.product.id} className="border-b border-slate-100">
                        <td className="py-1.5 font-bold">#{idx + 1}</td>
                        <td className="py-1.5 font-semibold text-slate-900">{item.product.name}</td>
                        <td className="py-1.5 font-mono text-slate-500">{item.product.sku}</td>
                        <td className="py-1.5 text-right font-mono">{item.unitsSold}</td>
                        <td className="py-1.5 text-right font-mono font-bold text-slate-900">{formatRupiah(item.revenue)}</td>
                        <td className="py-1.5 text-right font-mono text-emerald-700 font-bold">{item.revenueShare}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 4. Perubahan Stok & Tren */}
              <div className="grid grid-cols-2 gap-4 border-t border-slate-200 pt-3">
                <div>
                  <div className="font-bold text-slate-900 mb-1">Status Perubahan Stok</div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div>Total Barang Masuk: <b>+{stockChangesSummary.totalInboundQty} item</b></div>
                    <div>Total Barang Keluar (Penjualan): <b>-{stockChangesSummary.totalOutboundQty} item</b></div>
                    <div>Nilai Aset Modal Tersimpan: <b>{formatRupiah(stockChangesSummary.totalAssetCostValue)}</b></div>
                  </div>
                </div>

                <div>
                  <div className="font-bold text-slate-900 mb-1">Tren & Perilaku Pelanggan</div>
                  <div className="text-[11px] text-slate-600 space-y-0.5">
                    <div>Rata-Rata Belanja (AOV): <b>{formatRupiah(salesTrends.aov)}</b></div>
                    <div>Item Terjual per Order: <b>{salesTrends.avgItemsPerOrder} item</b></div>
                    <div>Jam Puncak Penjualan: <b>{salesTrends.peakTimePeriod}</b></div>
                  </div>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between text-center text-[10px] text-slate-600">
                <div>
                  <p>Disusun Oleh,</p>
                  <div className="h-12" />
                  <p className="font-bold border-t border-slate-400 pt-1">{storeProfile.cashierName}</p>
                  <p>Staf Akuntansi / Operasional</p>
                </div>
                <div>
                  <p>Diverifikasi & Disahkan,</p>
                  <div className="h-12" />
                  <p className="font-bold border-t border-slate-400 pt-1">Pimpinan Usaha Astro</p>
                  <p>Manajer Bisnis Utama</p>
                </div>
              </div>
            </div>

            {/* Modal Buttons */}
            <div className="flex items-center justify-end gap-2 mt-4 no-print">
              <button
                onClick={handleExportReportCSV}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Unduh File CSV</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak / Simpan PDF</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
