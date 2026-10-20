import React, { useState, useMemo } from 'react';
import { Transaction, Expense, Income, StoreProfile, ExpenseCategory, IncomeCategory } from '../../types/business';
import { formatRupiah, formatDateIndo, formatDateTimeIndo, cosmicAudio } from '../../utils/formatters';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Download,
  Plus,
  Filter,
  PieChart,
  ArrowUpRight,
  ArrowDownLeft,
  X,
  CreditCard,
  Calendar,
  Layers,
  Printer,
  FileSpreadsheet,
  FileText,
  Edit3,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ChevronDown,
  Clock,
  Briefcase,
  SlidersHorizontal,
  Info
} from 'lucide-react';

interface FinanceTabProps {
  transactions: Transaction[];
  expenses: Expense[];
  incomes: Income[];
  storeProfile: StoreProfile;
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onAddIncome: (income: Omit<Income, 'id'>) => void;
  onUpdateStoreProfile: (profile: StoreProfile) => void;
  isCreateExpenseOpen: boolean;
  setIsCreateExpenseOpen: (open: boolean) => void;
}

export type FinancialPeriod = 'HARIAN' | 'MINGGUAN' | 'BULANAN' | 'SEMUA';

export const FinanceTab: React.FC<FinanceTabProps> = ({
  transactions,
  expenses,
  incomes,
  storeProfile,
  onAddExpense,
  onAddIncome,
  onUpdateStoreProfile,
  isCreateExpenseOpen,
  setIsCreateExpenseOpen,
}) => {
  // 1. Navigation & Period Selection (Harian, Mingguan, Bulanan, Semua)
  const [selectedPeriod, setSelectedPeriod] = useState<FinancialPeriod>('BULANAN');
  const [activeLedgerFilter, setActiveLedgerFilter] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');
  const [cashflowDaysSpan, setCashflowDaysSpan] = useState<7 | 14 | 30>(7);

  // Modals
  const [isCashTransactionModalOpen, setIsCashTransactionModalOpen] = useState(false);
  const [transactionType, setTransactionType] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [isEditCapitalModalOpen, setIsEditCapitalModalOpen] = useState(false);
  const [isPrintReportModalOpen, setIsPrintReportModalOpen] = useState(false);

  // Initial Capital form
  const [capitalInput, setCapitalInput] = useState<number>(storeProfile.initialCapital || 35000000);
  const [capitalDateInput, setCapitalDateInput] = useState<string>(storeProfile.initialCapitalDate || '2026-01-01');

  // Form states for Recording Cash Transaction
  const [formDate, setFormDate] = useState<string>(new Date().toISOString().slice(0, 16));
  const [formAmount, setFormAmount] = useState<number>(150000);
  const [formCategory, setFormCategory] = useState<string>('Operasional Rutin');
  const [formDescription, setFormDescription] = useState<string>('');
  const [formPaymentMethod, setFormPaymentMethod] = useState<string>('Transfer Bank');
  const [formRecordedBy, setFormRecordedBy] = useState<string>(storeProfile.cashierName || 'Arya Kosmik');

  // Interactive Chart Tooltip
  const [hoveredCashflowNode, setHoveredCashflowNode] = useState<{
    dateLabel: string;
    income: number;
    expense: number;
    net: number;
  } | null>(null);

  // Operational expense categories list
  const EXPENSE_CATEGORIES: ExpenseCategory[] = [
    'Operasional Rutin',
    'Bahan Baku & Stok',
    'Gaji & Honorarium',
    'Pemasaran & Iklan Orbit',
    'Peralatan & Perawatan',
    'Logistik & Ekspedisi',
    'Administrasi & Pajak',
    'Lainnya',
  ];

  const INCOME_CATEGORIES: IncomeCategory[] = [
    'Penjualan Tambahan',
    'Jasa & Konsultasi',
    'Sponsorship & Kemitraan',
    'Injeksi Modal Usaha',
    'Pendapatan Lainnya',
  ];

  // Quick Preset Templates for Recording
  const EXPENSE_PRESETS = [
    { label: '⚡ Listrik & Air PLN', cat: 'Operasional Rutin', desc: 'Tagihan listrik & operasional kafe', amount: 850000 },
    { label: '☕ Kopi Gayo 20kg', cat: 'Bahan Baku & Stok', desc: 'Pengadaan green beans gayo arabika 20kg', amount: 1450000 },
    { label: '👥 Gaji / Insentif Barista', cat: 'Gaji & Honorarium', desc: 'Honorarium & insentif shift barista', amount: 2500000 },
    { label: '📦 Cup & Sedotan Rasi', cat: 'Operasional Rutin', desc: 'Pengadaan cup plastik sablon & sedotan', amount: 380000 },
    { label: '🚀 Promosi Iklan Meta', cat: 'Pemasaran & Iklan Orbit', desc: 'Kampanye iklan digital media sosial', amount: 500000 },
    { label: '🔧 Kalibrasi Mesin', cat: 'Peralatan & Perawatan', desc: 'Service & pembersihan grinder + espresso', amount: 350000 },
  ];

  const INCOME_PRESETS = [
    { label: '🎓 Kelas Barista', cat: 'Jasa & Konsultasi', desc: 'Workshop privat teknik manual brew & latte art', amount: 1500000 },
    { label: '🤝 Sponsorship Mitra', cat: 'Sponsorship & Kemitraan', desc: 'Kemitraan branding event Astro Coffee Lounge', amount: 2500000 },
    { label: '☕ Biji Kopi Sangrai Retail', cat: 'Penjualan Tambahan', desc: 'Penjualan beans roasted pack langsung ke kafe rekanan', amount: 950000 },
    { label: '💰 Injeksi Modal Mitra', cat: 'Injeksi Modal Usaha', desc: 'Penyertaan dana ekspansi alat dari partner', amount: 5000000 },
  ];

  // Helper date boundary checker
  const isDateInPeriod = (dateIso: string, period: FinancialPeriod): boolean => {
    const itemDate = new Date(dateIso);
    const now = new Date();

    if (period === 'SEMUA') return true;

    if (period === 'HARIAN') {
      return (
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth() &&
        itemDate.getDate() === now.getDate()
      );
    }

    if (period === 'MINGGUAN') {
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);
      return itemDate >= sevenDaysAgo && itemDate <= now;
    }

    if (period === 'BULANAN') {
      return (
        itemDate.getFullYear() === now.getFullYear() &&
        itemDate.getMonth() === now.getMonth()
      );
    }

    return true;
  };

  const periodLabelText = useMemo(() => {
    const now = new Date();
    if (selectedPeriod === 'HARIAN') {
      return `Harian (${formatDateIndo(now.toISOString())})`;
    }
    if (selectedPeriod === 'MINGGUAN') {
      const past7 = new Date(now);
      past7.setDate(now.getDate() - 6);
      return `Mingguan (7 Hari Terakhir: ${past7.getDate()} - ${now.getDate()} ${new Intl.DateTimeFormat('id-ID', { month: 'short', year: 'numeric' }).format(now)})`;
    }
    if (selectedPeriod === 'BULANAN') {
      return `Bulanan (${new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(now)})`;
    }
    return 'Semua Periode (Seluruh Waktu Usaha)';
  }, [selectedPeriod]);

  // 2. UNIFIED LEDGER ENTRIES (All records)
  const completedPOS = useMemo(() => {
    return transactions.filter((t) => t.status === 'COMPLETED');
  }, [transactions]);

  const unifiedLedger = useMemo(() => {
    const list: {
      id: string;
      date: string;
      type: 'INCOME' | 'EXPENSE';
      title: string;
      category: string;
      amount: number;
      method: string;
      recordedBy: string;
      cogs?: number;
    }[] = [];

    // Add POS sales
    completedPOS.forEach((tx) => {
      const txCogs = tx.items.reduce((acc, it) => acc + (it.costPrice * it.quantity), 0);
      list.push({
        id: tx.id,
        date: tx.date,
        type: 'INCOME',
        title: `Penjualan POS #${tx.invoiceNumber} (${tx.customerName})`,
        category: 'Penjualan Produk POS',
        amount: tx.total,
        method: tx.paymentMethod.replace('_', ' '),
        recordedBy: tx.cashierName,
        cogs: txCogs,
      });
    });

    // Add other incomes
    incomes.forEach((inc) => {
      list.push({
        id: inc.id,
        date: inc.date,
        type: 'INCOME',
        title: inc.description || `Pemasukan: ${inc.category}`,
        category: inc.category,
        amount: inc.amount,
        method: inc.paymentMethod,
        recordedBy: inc.recordedBy,
      });
    });

    // Add expenses
    expenses.forEach((exp) => {
      list.push({
        id: exp.id,
        date: exp.date,
        type: 'EXPENSE',
        title: exp.description || `Pengeluaran: ${exp.category}`,
        category: exp.category,
        amount: exp.amount,
        method: exp.paymentMethod,
        recordedBy: exp.recordedBy,
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [completedPOS, incomes, expenses]);

  // 3. PERIOD-FILTERED CALCULATIONS (FOR AUTOMATIC NET PROFIT)
  const periodLedger = useMemo(() => {
    return unifiedLedger.filter((item) => isDateInPeriod(item.date, selectedPeriod));
  }, [unifiedLedger, selectedPeriod]);

  // Period Income Totals
  const periodPOSSales = useMemo(() => {
    return periodLedger
      .filter((i) => i.type === 'INCOME' && i.category === 'Penjualan Produk POS')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [periodLedger]);

  const periodOtherIncome = useMemo(() => {
    return periodLedger
      .filter((i) => i.type === 'INCOME' && i.category !== 'Penjualan Produk POS')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [periodLedger]);

  const periodTotalRevenue = periodPOSSales + periodOtherIncome;

  // Period COGS (HPP Produk Terjual)
  const periodCOGS = useMemo(() => {
    return periodLedger
      .filter((i) => i.type === 'INCOME')
      .reduce((sum, i) => sum + (i.cogs || 0), 0);
  }, [periodLedger]);

  const periodGrossProfit = periodTotalRevenue - periodCOGS;

  // Period Expenses Totals
  const periodTotalExpenses = useMemo(() => {
    return periodLedger
      .filter((i) => i.type === 'EXPENSE')
      .reduce((sum, i) => sum + i.amount, 0);
  }, [periodLedger]);

  // OTOMATIS: Keuntungan Bersih (Net Profit)
  const periodNetProfit = periodTotalRevenue - periodTotalExpenses;
  const periodProfitMargin = periodTotalRevenue > 0 ? Math.round((periodNetProfit / periodTotalRevenue) * 100) : 0;

  // All-time Grand Totals for Balance & Equity
  const allTimeRevenue = useMemo(() => {
    return unifiedLedger.filter((i) => i.type === 'INCOME').reduce((sum, i) => sum + i.amount, 0);
  }, [unifiedLedger]);

  const allTimeExpenses = useMemo(() => {
    return unifiedLedger.filter((i) => i.type === 'EXPENSE').reduce((sum, i) => sum + i.amount, 0);
  }, [unifiedLedger]);

  const allTimeNetProfit = allTimeRevenue - allTimeExpenses;
  const initialCapital = storeProfile.initialCapital || 35000000;
  const currentCashBalance = initialCapital + allTimeNetProfit;

  // 4. GROUPED OPERATIONAL EXPENSES (Selected Period)
  const categorizedExpenses = useMemo(() => {
    const map = new Map<string, { category: string; total: number; count: number }>();
    EXPENSE_CATEGORIES.forEach((cat) => {
      map.set(cat, { category: cat, total: 0, count: 0 });
    });

    periodLedger
      .filter((i) => i.type === 'EXPENSE')
      .forEach((e) => {
        const match = map.get(e.category) || { category: e.category, total: 0, count: 0 };
        match.total += e.amount;
        match.count += 1;
        map.set(e.category, match);
      });

    return Array.from(map.values())
      .map((item) => ({
        ...item,
        percentage: periodTotalExpenses > 0 ? Math.round((item.total / periodTotalExpenses) * 100) : 0,
      }))
      .sort((a, b) => b.total - a.total);
  }, [periodLedger, periodTotalExpenses]);

  // Filtered ledger entries for table
  const filteredLedger = useMemo(() => {
    return periodLedger.filter((entry) => {
      if (activeLedgerFilter === 'INCOME' && entry.type !== 'INCOME') return false;
      if (activeLedgerFilter === 'EXPENSE' && entry.type !== 'EXPENSE') return false;
      if (selectedCategoryFilter !== 'ALL' && entry.category !== selectedCategoryFilter) return false;
      return true;
    });
  }, [periodLedger, activeLedgerFilter, selectedCategoryFilter]);

  // 5. CASHFLOW CHART TIMELINE (Configurable span: 7, 14, 30 days)
  const cashflowTimeline = useMemo(() => {
    const days: { dateLabel: string; isoDate: string; income: number; expense: number; net: number }[] = [];
    const today = new Date();

    for (let i = cashflowDaysSpan - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const iso = d.toISOString().slice(0, 10);
      const dayName = new Intl.DateTimeFormat('id-ID', {
        weekday: cashflowDaysSpan > 14 ? undefined : 'short',
        day: 'numeric',
        month: cashflowDaysSpan > 14 ? 'numeric' : undefined
      }).format(d);

      // Incomes on this date
      const dayInflow = unifiedLedger
        .filter((item) => item.type === 'INCOME' && item.date.startsWith(iso))
        .reduce((sum, item) => sum + item.amount, 0);

      // Expenses on this date
      const dayOutflow = unifiedLedger
        .filter((item) => item.type === 'EXPENSE' && item.date.startsWith(iso))
        .reduce((sum, item) => sum + item.amount, 0);

      days.push({
        dateLabel: i === 0 ? 'Hari Ini' : dayName,
        isoDate: iso,
        income: dayInflow,
        expense: dayOutflow,
        net: dayInflow - dayOutflow,
      });
    }

    return days;
  }, [unifiedLedger, cashflowDaysSpan]);

  const maxCashflowVal = Math.max(
    ...cashflowTimeline.map((d) => Math.max(d.income, d.expense)),
    1000000
  );

  const totalChartPoints = cashflowTimeline.length;
  const incomePoints = cashflowTimeline.map((d, idx) => {
    const x = 8 + (idx / (totalChartPoints - 1)) * 84;
    const y = 82 - (d.income / maxCashflowVal) * 58;
    return { x, y, ...d };
  });

  const expensePoints = cashflowTimeline.map((d, idx) => {
    const x = 8 + (idx / (totalChartPoints - 1)) * 84;
    const y = 82 - (d.expense / maxCashflowVal) * 58;
    return { x, y, ...d };
  });

  const buildSvgPath = (pts: { x: number; y: number }[]) => {
    return pts.reduce((acc, pt, idx) => {
      if (idx === 0) return `M ${pt.x} ${pt.y}`;
      const prev = pts[idx - 1];
      const cx = (prev.x + pt.x) / 2;
      return `${acc} C ${cx} ${prev.y}, ${cx} ${pt.y}, ${pt.x} ${pt.y}`;
    }, '');
  };

  const incomePathD = buildSvgPath(incomePoints);
  const expensePathD = buildSvgPath(expensePoints);
  const incomeAreaD = `${incomePathD} L ${incomePoints[incomePoints.length - 1].x} 84 L ${incomePoints[0].x} 84 Z`;

  // 6. EXPORT CSV HANDLER
  const handleExportCSV = (exportFull: boolean = false) => {
    cosmicAudio.playBeep();
    const recordsToExport = exportFull ? unifiedLedger : periodLedger;
    const headers = [
      'ID Mutasi',
      'Tanggal',
      'Waktu',
      'Jenis Aliran Kas',
      'Kategori',
      'Keterangan Transaksi',
      'Metode Bayar',
      'Petugas Pencatat',
      'Nominal (IDR)'
    ];

    const rows = recordsToExport.map((row) => [
      row.id,
      formatDateIndo(row.date),
      new Date(row.date).toLocaleTimeString('id-ID'),
      row.type === 'INCOME' ? 'Pemasukan (+)' : 'Pengeluaran (-)',
      `"${row.category}"`,
      `"${row.title.replace(/"/g, '""')}"`,
      `"${row.method}"`,
      `"${row.recordedBy}"`,
      row.amount,
    ]);

    // Add summary row at the bottom
    const totalIn = recordsToExport.filter((r) => r.type === 'INCOME').reduce((s, r) => s + r.amount, 0);
    const totalOut = recordsToExport.filter((r) => r.type === 'EXPENSE').reduce((s, r) => s + r.amount, 0);
    const net = totalIn - totalOut;

    rows.push([]);
    rows.push(['RINGKASAN LAPORAN KEUANGAN', '', '', '', '', '', '', '', '']);
    rows.push(['Total Pemasukan Kas', '', '', '', '', '', '', '', totalIn]);
    rows.push(['Total Pengeluaran Kas', '', '', '', '', '', '', '', totalOut]);
    rows.push(['Keuntungan Bersih (Net Profit)', '', '', '', '', '', '', '', net]);
    rows.push(['Modal Awal Usaha', '', '', '', '', '', '', '', initialCapital]);
    rows.push(['Posisi Saldo Kas Akhir', '', '', '', '', '', '', '', currentCashBalance]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `laporan-keuangan-astro-${selectedPeriod.toLowerCase()}-${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 7. RECORD FORM SUBMISSION
  const handleSaveCashTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription.trim() || formAmount <= 0) return;

    if (transactionType === 'EXPENSE') {
      onAddExpense({
        date: new Date(formDate).toISOString(),
        category: formCategory,
        amount: formAmount,
        description: formDescription,
        paymentMethod: formPaymentMethod,
        recordedBy: formRecordedBy,
      });
    } else {
      onAddIncome({
        date: new Date(formDate).toISOString(),
        category: formCategory,
        amount: formAmount,
        description: formDescription,
        paymentMethod: formPaymentMethod,
        recordedBy: formRecordedBy,
      });
    }

    cosmicAudio.playSuccess();
    setIsCashTransactionModalOpen(false);
    setIsCreateExpenseOpen(false);
    setFormDescription('');
    setFormAmount(150000);
  };

  // 8. SAVE INITIAL CAPITAL
  const handleSaveInitialCapital = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateStoreProfile({
      ...storeProfile,
      initialCapital: capitalInput,
      initialCapitalDate: capitalDateInput,
    });
    cosmicAudio.playSuccess();
    setIsEditCapitalModalOpen(false);
  };

  return (
    <div className="space-y-4 pb-24 select-none">
      {/* 1. TOP HEADER & RECORD BUTTONS */}
      <div className="relative rounded-2xl p-5 bg-gradient-to-r from-violet-950/70 via-slate-900/90 to-amber-950/40 border border-white/10 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>STELLAR LEDGER & LAPORAN KEUANGAN KOSMIK</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-cosmic mt-1">
              Manajemen Arus Kas & Laba Bersih
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Catat pemasukan dan pengeluaran beban usaha, pantau modal awal, kelompokkan biaya operasional, dan cetak laporan resmi.
            </p>
          </div>

          {/* Quick Record Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setTransactionType('INCOME');
                setFormCategory('Penjualan Tambahan');
                setIsCashTransactionModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>+ Catat Pemasukan</span>
            </button>

            <button
              onClick={() => {
                setTransactionType('EXPENSE');
                setFormCategory('Operasional Rutin');
                setIsCashTransactionModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-rose-500/20 active:scale-95 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>+ Catat Pengeluaran</span>
            </button>

            <button
              onClick={() => setIsPrintReportModalOpen(true)}
              className="px-3 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold border border-white/10 hover:bg-slate-700 flex items-center gap-1.5 transition-all"
            >
              <FileText className="w-4 h-4 text-amber-400" />
              <span>Laporan Laba Rugi</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. DEDICATED PERIOD SWITCHER BAR (HARIAN, MINGGUAN, BULANAN, SEMUA) */}
      <div className="p-3 rounded-2xl cosmic-glass border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-400 shrink-0" />
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Filter Laporan Periode:
          </span>
          <span className="text-xs text-amber-300 font-mono font-semibold hidden sm:inline">
            {periodLabelText}
          </span>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-white/10 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => {
              setSelectedPeriod('HARIAN');
              cosmicAudio.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedPeriod === 'HARIAN'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>☀️ Harian (Hari Ini)</span>
          </button>

          <button
            onClick={() => {
              setSelectedPeriod('MINGGUAN');
              cosmicAudio.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedPeriod === 'MINGGUAN'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>📅 Mingguan (7 Hari)</span>
          </button>

          <button
            onClick={() => {
              setSelectedPeriod('BULANAN');
              cosmicAudio.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedPeriod === 'BULANAN'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🪐 Bulanan (Bulan Ini)</span>
          </button>

          <button
            onClick={() => {
              setSelectedPeriod('SEMUA');
              cosmicAudio.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${
              selectedPeriod === 'SEMUA'
                ? 'bg-amber-400 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>🌌 Semua Waktu</span>
          </button>
        </div>
      </div>

      {/* 3. CORE 4 FINANCIAL METRICS CARDS (INCLUDING MODAL AWAL & LABA BERSIH OTOMATIS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* CARD 1: MODAL AWAL USAHA */}
        <div className="p-4 rounded-2xl cosmic-card-gold relative overflow-hidden group">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider">
                Modal Awal Usaha Disetor
              </span>
              <div className="text-xl sm:text-2xl font-extrabold text-amber-300 font-cosmic mt-1">
                {formatRupiah(initialCapital)}
              </div>
            </div>
            <button
              onClick={() => {
                setCapitalInput(initialCapital);
                setCapitalDateInput(storeProfile.initialCapitalDate || '2026-01-01');
                setIsEditCapitalModalOpen(true);
              }}
              className="p-1.5 rounded-lg bg-amber-400/15 border border-amber-400/30 text-amber-300 hover:bg-amber-400/30 transition-colors"
              title="Ubah Modal Awal"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="text-[11px] text-amber-300/80 mt-2 flex items-center justify-between">
            <span>Dimulai sejak: {formatDateIndo(storeProfile.initialCapitalDate || '2026-01-01')}</span>
            <span className="text-[10px] bg-amber-400/20 px-1.5 py-0.5 rounded font-mono">Tetap</span>
          </div>
        </div>

        {/* CARD 2: TOTAL PEMASUKAN PERIODE */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-950/40 via-slate-900/80 to-slate-950 border border-emerald-500/25 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-emerald-400/90 tracking-wider">
              Pemasukan Kas ({selectedPeriod})
            </span>
            <span className="text-[10px] text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
              +{periodLedger.filter((i) => i.type === 'INCOME').length} transaksi
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-extrabold text-emerald-300 font-cosmic mt-1">
            {formatRupiah(periodTotalRevenue)}
          </div>

          <div className="text-[11px] text-emerald-400/80 mt-2 flex items-center justify-between">
            <span>POS: {formatRupiah(periodPOSSales)}</span>
            <span>·</span>
            <span>Lainnya: {formatRupiah(periodOtherIncome)}</span>
          </div>
        </div>

        {/* CARD 3: TOTAL PENGELUARAN PERIODE */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-950 border border-rose-500/25 relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-rose-400/90 tracking-wider">
              Beban Pengeluaran ({selectedPeriod})
            </span>
            <span className="text-[10px] text-rose-400 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
              -{periodLedger.filter((i) => i.type === 'EXPENSE').length} pos biaya
            </span>
          </div>

          <div className="text-xl sm:text-2xl font-extrabold text-rose-300 font-cosmic mt-1">
            {formatRupiah(periodTotalExpenses)}
          </div>

          <div className="text-[11px] text-rose-400/80 mt-2 flex items-center justify-between">
            <span>Beban Operasional Terinci</span>
            <span>·</span>
            <span>HPP: {formatRupiah(periodCOGS)}</span>
          </div>
        </div>

        {/* CARD 4: KEUNTUNGAN BERSIH OTOMATIS & POSISI SALDO KAS */}
        <div className="p-4 rounded-2xl cosmic-card-violet relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
              Keuntungan Bersih (Otomatis)
            </span>
            <span className={`text-[10px] font-bold font-mono px-1.5 py-0.5 rounded border ${
              periodNetProfit >= 0
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/20 text-rose-300 border-rose-500/30'
            }`}>
              Margin {periodProfitMargin}%
            </span>
          </div>

          <div
            className={`text-xl sm:text-2xl font-extrabold font-cosmic mt-1 ${
              periodNetProfit >= 0 ? 'text-emerald-300' : 'text-rose-400'
            }`}
          >
            {formatRupiah(periodNetProfit)}
          </div>

          <div className="text-[11px] text-purple-200 mt-2 flex items-center justify-between">
            <span>Laba Bersih {selectedPeriod}</span>
            <span>·</span>
            <span>Kas Aktif: <b className="text-amber-300 font-mono">{formatRupiah(currentCashBalance)}</b></span>
          </div>
        </div>
      </div>

      {/* 4. GRAFIK ARUS KAS INTERAKTIF (CASHFLOW TRAJECTORY) */}
      <div className="p-5 rounded-2xl cosmic-glass border border-white/10 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="text-base font-bold text-white font-cosmic">
                Grafik Arus Kas (Cashflow Trajectory)
              </h3>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Visualisasi perbandingan kas masuk (hijau) versus kas keluar (merah)
            </p>
          </div>

          {/* Span Switcher & Legends */}
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex bg-slate-900/80 p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => setCashflowDaysSpan(7)}
                className={`px-2 py-0.5 rounded ${cashflowDaysSpan === 7 ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                7H
              </button>
              <button
                onClick={() => setCashflowDaysSpan(14)}
                className={`px-2 py-0.5 rounded ${cashflowDaysSpan === 14 ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                14H
              </button>
              <button
                onClick={() => setCashflowDaysSpan(30)}
                className={`px-2 py-0.5 rounded ${cashflowDaysSpan === 30 ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
              >
                30H
              </button>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                <span className="text-slate-300">Masuk</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
                <span className="text-slate-300">Keluar</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Cashflow Chart */}
        <div className="relative w-full aspect-[16/7] max-h-64 select-none">
          {hoveredCashflowNode && (
            <div className="absolute top-2 right-2 bg-slate-900/95 border border-amber-400/40 p-2.5 rounded-xl text-xs z-20 shadow-2xl pointer-events-none">
              <span className="text-[10px] text-slate-400 font-mono">{hoveredCashflowNode.dateLabel}</span>
              <div className="flex justify-between gap-4 text-emerald-400 font-mono mt-0.5">
                <span>Kas Masuk:</span>
                <span className="font-bold">{formatRupiah(hoveredCashflowNode.income)}</span>
              </div>
              <div className="flex justify-between gap-4 text-rose-400 font-mono">
                <span>Kas Keluar:</span>
                <span className="font-bold">{formatRupiah(hoveredCashflowNode.expense)}</span>
              </div>
              <div className="flex justify-between gap-4 text-amber-300 font-bold border-t border-slate-700 pt-1 mt-1 font-cosmic">
                <span>Surplus Bersih:</span>
                <span>{formatRupiah(hoveredCashflowNode.net)}</span>
              </div>
            </div>
          )}

          <svg viewBox="0 0 100 90" className="w-full h-full overflow-visible">
            <defs>
              <linearGradient id="inflowGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="8" y1="24" x2="92" y2="24" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
            <line x1="8" y1="52" x2="92" y2="52" stroke="rgba(255,255,255,0.05)" strokeDasharray="2" />
            <line x1="8" y1="82" x2="92" y2="82" stroke="rgba(255,255,255,0.08)" />

            {/* Inflow Area Fill */}
            <path d={incomeAreaD} fill="url(#inflowGrad)" />

            {/* Inflow Stroke (Green) */}
            <path
              d={incomePathD}
              fill="none"
              stroke="#10b981"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]"
            />

            {/* Outflow Stroke (Red) */}
            <path
              d={expensePathD}
              fill="none"
              stroke="#f43f5e"
              strokeWidth="2.2"
              strokeLinecap="round"
              className="drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]"
            />

            {/* Interactive Data Point Dots */}
            {incomePoints.map((pt, i) => (
              <g
                key={`pt-${i}`}
                className="cursor-pointer group"
                onMouseEnter={() => setHoveredCashflowNode({
                  dateLabel: pt.dateLabel,
                  income: pt.income,
                  expense: pt.expense,
                  net: pt.net,
                })}
                onMouseLeave={() => setHoveredCashflowNode(null)}
              >
                <circle cx={pt.x} cy={pt.y} r="3.2" fill="#090d1f" stroke="#10b981" strokeWidth="2" />
                <circle cx={expensePoints[i].x} cy={expensePoints[i].y} r="3.2" fill="#090d1f" stroke="#f43f5e" strokeWidth="2" />
                <text x={pt.x} y="89" textAnchor="middle" className="text-[3px] fill-slate-400 font-mono">
                  {pt.dateLabel}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* 5. PENGELOMPOKAN BIAYA OPERASIONAL & BUKU MUTASI KAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* PENGELOMPOKAN BIAYA OPERASIONAL (Distribution Card) */}
        <div className="p-4 rounded-2xl cosmic-glass border border-white/10 lg:col-span-1 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div>
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                Kelompok Biaya Operasional
              </h4>
              <p className="text-[11px] text-slate-400">
                Alokasi beban pada periode: <b className="text-amber-300">{selectedPeriod}</b>
              </p>
            </div>
            <PieChart className="w-4 h-4 text-amber-400" />
          </div>

          <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
            {categorizedExpenses.map((cat) => (
              <div
                key={cat.category}
                onClick={() => setSelectedCategoryFilter(selectedCategoryFilter === cat.category ? 'ALL' : cat.category)}
                className={`p-2 rounded-xl transition-all cursor-pointer border ${
                  selectedCategoryFilter === cat.category
                    ? 'bg-amber-400/10 border-amber-400/40 shadow-sm'
                    : 'bg-slate-900/40 border-white/5 hover:border-white/15'
                }`}
              >
                <div className="flex justify-between items-center text-xs mb-1">
                  <span className="font-semibold text-slate-200">{cat.category}</span>
                  <span className="font-bold text-rose-300 font-mono">
                    {formatRupiah(cat.total)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 h-1.5 rounded-full bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-rose-500 to-amber-400"
                      style={{ width: `${Math.min(cat.percentage, 100)}%` }}
                    />
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono shrink-0">
                    {cat.percentage}% ({cat.count}x)
                  </span>
                </div>
              </div>
            ))}

            {periodTotalExpenses === 0 && (
              <div className="py-6 text-center text-xs text-slate-500">
                Belum ada pengeluaran pada periode {selectedPeriod.toLowerCase()} ini.
              </div>
            )}
          </div>
        </div>

        {/* BUKU KAS & JURNAL MUTASI LENGKAP DENGAN FILTER & EKSPOR */}
        <div className="p-4 rounded-2xl cosmic-glass border border-white/10 lg:col-span-2 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
            <div>
              <h4 className="text-sm font-bold text-white font-cosmic">
                Jurnal Mutasi Kas & Buku Besar
              </h4>
              <p className="text-xs text-slate-400">
                Pencatatan keluar masuk kas pada periode {periodLabelText}
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => handleExportCSV(false)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-white/5 shadow"
                title="Ekspor CSV untuk periode terpilih"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ekspor CSV</span>
              </button>

              <button
                onClick={() => setIsPrintReportModalOpen(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak Laporan</span>
              </button>
            </div>
          </div>

          {/* Type and Category Filter Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setActiveLedgerFilter('ALL')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeLedgerFilter === 'ALL'
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Semua ({periodLedger.length})
              </button>
              <button
                onClick={() => setActiveLedgerFilter('INCOME')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeLedgerFilter === 'INCOME'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pemasukan
              </button>
              <button
                onClick={() => setActiveLedgerFilter('EXPENSE')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  activeLedgerFilter === 'EXPENSE'
                    ? 'bg-rose-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Pengeluaran
              </button>
            </div>

            {selectedCategoryFilter !== 'ALL' && (
              <button
                onClick={() => setSelectedCategoryFilter('ALL')}
                className="text-xs text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded-lg flex items-center gap-1"
              >
                <span>Kategori: {selectedCategoryFilter}</span>
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          {/* Ledger Table */}
          <div className="space-y-2 max-h-88 overflow-y-auto pr-1">
            {filteredLedger.map((item) => {
              const isIncome = item.type === 'INCOME';
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-white/5 hover:bg-white/[0.02] flex items-center justify-between gap-3 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {isIncome ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                    </div>

                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-100 truncate">
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5 flex-wrap">
                        <span>{formatDateIndo(item.date)}</span>
                        <span>·</span>
                        <span className="text-amber-300/90">{item.category}</span>
                        <span>·</span>
                        <span>{item.method}</span>
                        <span>·</span>
                        <span className="text-slate-500">Oleh: {item.recordedBy}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div
                      className={`text-xs font-bold font-cosmic ${
                        isIncome ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {isIncome ? '+' : '-'} {formatRupiah(item.amount)}
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredLedger.length === 0 && (
              <div className="py-12 text-center text-xs text-slate-500">
                Tidak ada mutasi kas untuk periode {periodLabelText}.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MODAL 1: CATAT TRANSAKSI KAS (PEMASUKAN / PENGELUARAN) DENGAN PRESET CEPAT */}
      {(isCashTransactionModalOpen || isCreateExpenseOpen) && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1227] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsCashTransactionModalOpen(false);
                setIsCreateExpenseOpen(false);
              }}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Segmented Type Switcher */}
            <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10 mb-4">
              <button
                type="button"
                onClick={() => {
                  setTransactionType('EXPENSE');
                  setFormCategory('Operasional Rutin');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  transactionType === 'EXPENSE'
                    ? 'bg-rose-500 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Catat Pengeluaran (Beban Usaha)
              </button>

              <button
                type="button"
                onClick={() => {
                  setTransactionType('INCOME');
                  setFormCategory('Penjualan Tambahan');
                }}
                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${
                  transactionType === 'INCOME'
                    ? 'bg-emerald-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Catat Pemasukan Kas
              </button>
            </div>

            {/* Quick Preset Buttons */}
            <div className="mb-4">
              <div className="text-[11px] text-slate-400 mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Pilih Template Cepat (1-Klik Isi Form):</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {(transactionType === 'EXPENSE' ? EXPENSE_PRESETS : INCOME_PRESETS).map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setFormCategory(preset.cat);
                      setFormDescription(preset.desc);
                      setFormAmount(preset.amount);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 border border-white/10 hover:border-amber-400/40 text-[11px] text-slate-200 transition-all active:scale-95"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSaveCashTransaction} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">
                  {transactionType === 'EXPENSE' ? 'Kelompok Biaya Operasional' : 'Kategori Pemasukan'}
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {transactionType === 'EXPENSE'
                    ? EXPENSE_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))
                    : INCOME_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nominal Transaksi (IDR)</label>
                <input
                  type="number"
                  min="1000"
                  step="1000"
                  required
                  value={formAmount}
                  onChange={(e) => setFormAmount(Number(e.target.value))}
                  className={`w-full px-3 py-2 rounded-lg bg-slate-900 border text-base font-bold font-mono focus:outline-none ${
                    transactionType === 'EXPENSE'
                      ? 'border-rose-500/40 text-rose-300 focus:border-rose-400'
                      : 'border-emerald-500/40 text-emerald-300 focus:border-emerald-400'
                  }`}
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Keterangan / Deskripsi Transaksi</label>
                <input
                  type="text"
                  required
                  placeholder={
                    transactionType === 'EXPENSE'
                      ? 'Contoh: Bayar listrik PLN & internet WiFi kafe'
                      : 'Contoh: Jasa pelatihan barista & konsultasi mesin'
                  }
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Metode Pembayaran</label>
                  <select
                    value={formPaymentMethod}
                    onChange={(e) => setFormPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Tunai">Tunai / Kas Kecil</option>
                    <option value="Transfer Bank">Transfer Bank</option>
                    <option value="QRIS">QRIS StellarPay</option>
                    <option value="Kartu Debit/Kredit">Kartu Debit / Kredit</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Petugas Pencatat</label>
                  <input
                    type="text"
                    value={formRecordedBy}
                    onChange={(e) => setFormRecordedBy(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Waktu Transaksi</label>
                <input
                  type="datetime-local"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsCashTransactionModalOpen(false);
                    setIsCreateExpenseOpen(false);
                  }}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>

                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow ${
                    transactionType === 'EXPENSE'
                      ? 'bg-rose-500 hover:bg-rose-400 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
                  }`}
                >
                  Simpan {transactionType === 'EXPENSE' ? 'Pengeluaran' : 'Pemasukan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: UBAH MODAL AWAL USAHA */}
      {isEditCapitalModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0e1227] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative">
            <button
              onClick={() => setIsEditCapitalModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white font-cosmic mb-1">
              Atur Modal Awal Usaha
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Tentukan saldo awal modal usaha sebagai titik tolak penghitungan ekuitas kas
            </p>

            <form onSubmit={handleSaveInitialCapital} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nominal Modal Awal (IDR)</label>
                <input
                  type="number"
                  min="0"
                  step="100000"
                  required
                  value={capitalInput}
                  onChange={(e) => setCapitalInput(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold text-base font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Tanggal Mulai Usaha</label>
                <input
                  type="date"
                  required
                  value={capitalDateInput}
                  onChange={(e) => setCapitalDateInput(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditCapitalModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 shadow"
                >
                  Perbarui Modal Awal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LAPORAN KEUANGAN LABA RUGI RESMI (PRINTABLE / PDF PREVIEW & EXPORT) */}
      {isPrintReportModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0b0e1d] border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 no-print">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-cosmic">
                  Laporan Keuangan Laba Rugi Resmi
                </h3>
              </div>
              <button
                onClick={() => setIsPrintReportModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Period Switcher inside modal */}
            <div className="flex items-center gap-2 mb-4 no-print">
              <span className="text-xs text-slate-400">Periode Laporan:</span>
              <div className="flex bg-slate-900 p-0.5 rounded-xl border border-white/10 text-xs">
                <button
                  onClick={() => setSelectedPeriod('HARIAN')}
                  className={`px-3 py-1 rounded-lg ${selectedPeriod === 'HARIAN' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Harian
                </button>
                <button
                  onClick={() => setSelectedPeriod('MINGGUAN')}
                  className={`px-3 py-1 rounded-lg ${selectedPeriod === 'MINGGUAN' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Mingguan
                </button>
                <button
                  onClick={() => setSelectedPeriod('BULANAN')}
                  className={`px-3 py-1 rounded-lg ${selectedPeriod === 'BULANAN' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Bulanan
                </button>
                <button
                  onClick={() => setSelectedPeriod('SEMUA')}
                  className={`px-3 py-1 rounded-lg ${selectedPeriod === 'SEMUA' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400'}`}
                >
                  Semua
                </button>
              </div>
            </div>

            {/* High-Fidelity Printable Financial Statement Document */}
            <div className="bg-white text-slate-900 p-8 rounded-xl shadow-xl font-sans text-xs space-y-6 printable-content">
              {/* Document Letterhead */}
              <div className="flex justify-between items-start border-b-2 border-slate-900 pb-4">
                <div>
                  <h1 className="text-xl font-extrabold uppercase tracking-tight text-slate-950 font-cosmic">
                    {storeProfile.name}
                  </h1>
                  <p className="text-slate-600 text-[11px]">{storeProfile.tagline}</p>
                  <p className="text-slate-500 text-[10px] mt-0.5">{storeProfile.address} · {storeProfile.phone}</p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-amber-700 tracking-wider">
                    LAPORAN LABA RUGI
                  </div>
                  <div className="text-[11px] text-slate-700 font-semibold mt-0.5">
                    Periode: {periodLabelText}
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5">
                    Mata Uang: IDR (Rupiah Indonesia)
                  </div>
                </div>
              </div>

              {/* SECTION 1: PENDAPATAN OPERASIONAL */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                  1. PENDAPATAN OPERASIONAL
                </div>
                <div className="flex justify-between pl-4 text-slate-700">
                  <span>Penjualan Bersih Kasir POS ({periodLedger.filter((i) => i.category === 'Penjualan Produk POS').length} transaksi)</span>
                  <span className="font-mono">{formatRupiah(periodPOSSales)}</span>
                </div>
                {periodOtherIncome > 0 && (
                  <div className="flex justify-between pl-4 text-slate-700">
                    <span>Pendapatan Jasa, Sponsorship & Kemitraan Tambahan</span>
                    <span className="font-mono">{formatRupiah(periodOtherIncome)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-slate-950 border-t border-slate-200 pt-1">
                  <span>TOTAL PENDAPATAN USAHA</span>
                  <span className="font-mono text-emerald-700 font-bold">{formatRupiah(periodTotalRevenue)}</span>
                </div>
              </div>

              {/* SECTION 2: HPP & LABA KOTOR */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                  2. HARGA POKOK PENJUALAN (HPP)
                </div>
                <div className="flex justify-between pl-4 text-slate-700">
                  <span>Beban Pokok Penjualan Bahan & Produk Terjual</span>
                  <span className="font-mono text-rose-700">({formatRupiah(periodCOGS)})</span>
                </div>
                <div className="flex justify-between font-bold text-slate-950 border-t border-slate-200 pt-1">
                  <span>LABA KOTOR (GROSS PROFIT)</span>
                  <span className="font-mono text-slate-950 font-bold">{formatRupiah(periodGrossProfit)}</span>
                </div>
              </div>

              {/* SECTION 3: BEBAN OPERASIONAL */}
              <div className="space-y-1.5">
                <div className="font-bold text-slate-900 text-sm border-b border-slate-200 pb-1">
                  3. BEBAN OPERASIONAL USAHA
                </div>
                {categorizedExpenses.map((cat) => (
                  <div key={cat.category} className="flex justify-between pl-4 text-slate-700">
                    <span>{cat.category} ({cat.count} pos pengeluaran)</span>
                    <span className="font-mono text-rose-700">({formatRupiah(cat.total)})</span>
                  </div>
                ))}
                {categorizedExpenses.length === 0 && (
                  <div className="pl-4 text-slate-500 italic">Tidak ada beban pada periode ini.</div>
                )}
                <div className="flex justify-between font-bold text-slate-950 border-t border-slate-200 pt-1">
                  <span>TOTAL BEBAN OPERASIONAL</span>
                  <span className="font-mono text-rose-700 font-bold">({formatRupiah(periodTotalExpenses)})</span>
                </div>
              </div>

              {/* SECTION 4: LABA BERSIH & EKUITAS */}
              <div className="p-4 rounded-lg bg-slate-50 border border-slate-300 space-y-2">
                <div className="flex justify-between text-base font-black text-slate-950">
                  <span>LABA BERSIH USAHA (NET PROFIT)</span>
                  <span className={`font-mono ${periodNetProfit >= 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {formatRupiah(periodNetProfit)}
                  </span>
                </div>
                <div className="flex justify-between text-xs text-slate-600 border-t border-slate-200 pt-1.5">
                  <span>Margin Keuntungan Bersih:</span>
                  <span className="font-mono font-bold text-slate-800">{periodProfitMargin}%</span>
                </div>
                <div className="flex justify-between text-xs text-slate-600">
                  <span>Modal Awal Usaha Disetor:</span>
                  <span className="font-mono">{formatRupiah(initialCapital)}</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-slate-900">
                  <span>Posisi Saldo Kas & Ekuitas Saat Ini:</span>
                  <span className="font-mono text-amber-700 font-bold">{formatRupiah(currentCashBalance)}</span>
                </div>
              </div>

              {/* Signatures */}
              <div className="pt-6 flex justify-between text-center text-[10px] text-slate-600">
                <div>
                  <p>Disiapkan Oleh,</p>
                  <div className="h-12" />
                  <p className="font-bold border-t border-slate-400 pt-1">{storeProfile.cashierName}</p>
                  <p>Staf Keuangan / Kasir</p>
                </div>
                <div>
                  <p>Mengetahui & Menyetujui,</p>
                  <div className="h-12" />
                  <p className="font-bold border-t border-slate-400 pt-1">Pimpinan Usaha Astro</p>
                  <p>Manajer Operasional</p>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 mt-4 no-print flex-wrap">
              <button
                onClick={() => handleExportCSV(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 flex items-center gap-1.5"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Unduh CSV Periode Ini</span>
              </button>

              <button
                onClick={() => handleExportCSV(true)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-200 text-xs font-medium hover:bg-slate-700 flex items-center gap-1.5"
              >
                <FileSpreadsheet className="w-4 h-4 text-amber-400" />
                <span>Unduh Semua Rekap CSV</span>
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
