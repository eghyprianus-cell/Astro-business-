import React, { useState, useMemo } from 'react';
import { Product, ConstellationTag, StockMovement, StockMovementType, StockMovementReason, Transaction, StoreProfile } from '../../types/business';
import { formatRupiah, formatDateIndo, formatDateTimeIndo, CONSTELLATION_CONFIG, cosmicAudio } from '../../utils/formatters';
import { PlanetCategoryBadge } from '../cosmic/PlanetIcons';
import {
  Search,
  Plus,
  Edit2,
  Trash2,
  AlertTriangle,
  Package,
  Layers,
  ArrowUpDown,
  Sparkles,
  Check,
  X,
  ArrowDownLeft,
  ArrowUpRight,
  TrendingUp,
  Percent,
  History,
  Boxes,
  Bell,
  RefreshCw,
  FileSpreadsheet
} from 'lucide-react';

interface InventoryTabProps {
  products: Product[];
  transactions: Transaction[];
  stockMovements: StockMovement[];
  storeProfile: StoreProfile;
  onAddProduct: (product: Omit<Product, 'id'>) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onAddStockMovement: (movement: Omit<StockMovement, 'id'>) => void;
  isCreateModalOpen: boolean;
  setIsCreateModalOpen: (open: boolean) => void;
}

export const InventoryTab: React.FC<InventoryTabProps> = ({
  products,
  transactions,
  stockMovements,
  storeProfile,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
  onAddStockMovement,
  isCreateModalOpen,
  setIsCreateModalOpen,
}) => {
  // Sub-tabs: 'PRODUCTS' vs 'MOVEMENTS' (Barang Masuk & Keluar)
  const [activeSubTab, setActiveSubTab] = useState<'PRODUCTS' | 'MOVEMENTS'>('PRODUCTS');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [stockFilter, setStockFilter] = useState<'ALL' | 'LOW' | 'OUT'>('ALL');
  const [movementFilter, setMovementFilter] = useState<'ALL' | 'IN' | 'OUT'>('ALL');

  // Modals
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockQty, setRestockQty] = useState<number>(10);
  const [isRecordMovementOpen, setIsRecordMovementOpen] = useState(false);
  const [deleteConfirmProduct, setDeleteConfirmProduct] = useState<Product | null>(null);

  // New / Edit Product Form State
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: 'Minuman Kopi',
    costPrice: 10000,
    sellingPrice: 25000,
    stock: 20,
    minStock: 5,
    unit: 'pcs',
    constellationTag: 'Polaris' as ConstellationTag,
    description: '',
  });

  // Stock Movement Form State (Barang Masuk / Keluar)
  const [movementForm, setMovementForm] = useState({
    productId: products[0]?.id || '',
    type: 'IN' as StockMovementType,
    quantity: 10,
    date: new Date().toISOString().slice(0, 16),
    reason: 'RESTOCK_PEMBELIAN' as StockMovementReason,
    notes: '',
    performedBy: storeProfile.cashierName || 'Arya Kosmik',
  });

  // Calculate Cumulative Profit Per Product from Completed Sales
  const productProfitStats = useMemo(() => {
    const statsMap = new Map<string, { totalSold: number; totalGrossProfit: number }>();
    products.forEach((p) => {
      statsMap.set(p.id, { totalSold: 0, totalGrossProfit: 0 });
    });

    transactions
      .filter((t) => t.status === 'COMPLETED')
      .forEach((tx) => {
        tx.items.forEach((item) => {
          const entry = statsMap.get(item.productId);
          if (entry) {
            entry.totalSold += item.quantity;
            entry.totalGrossProfit += (item.unitPrice - item.costPrice) * item.quantity;
          }
        });
      });

    return statsMap;
  }, [products, transactions]);

  // Overall Valuations
  const totalCostValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock * p.costPrice, 0);
  }, [products]);

  const totalRetailValuation = useMemo(() => {
    return products.reduce((acc, p) => acc + p.stock * p.sellingPrice, 0);
  }, [products]);

  const potentialProfit = totalRetailValuation - totalCostValuation;

  // Stock Alert Calculations (Notifikasi Stok Menipis & Habis)
  const lowStockProducts = useMemo(() => {
    return products.filter((p) => p.stock > 0 && p.stock <= p.minStock);
  }, [products]);

  const outOfStockProducts = useMemo(() => {
    return products.filter((p) => p.stock <= 0);
  }, [products]);

  const criticalStockCount = lowStockProducts.length + outOfStockProducts.length;

  // Filter products by search & stock level
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.constellationTag.toLowerCase().includes(searchQuery.toLowerCase());

      if (!matchSearch) return false;

      if (stockFilter === 'LOW') return p.stock > 0 && p.stock <= p.minStock;
      if (stockFilter === 'OUT') return p.stock <= 0;
      return true;
    });
  }, [products, searchQuery, stockFilter]);

  // Filter stock movements
  const filteredMovements = useMemo(() => {
    return stockMovements.filter((mov) => {
      const matchType = movementFilter === 'ALL' || mov.type === movementFilter;
      const matchSearch =
        mov.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        mov.reason.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (mov.notes && mov.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchType && matchSearch;
    });
  }, [stockMovements, movementFilter, searchQuery]);

  // Open Add Product Modal
  const openAddModal = () => {
    setFormData({
      name: '',
      sku: `AST-PRD-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Minuman Kopi',
      costPrice: 10000,
      sellingPrice: 25000,
      stock: 25,
      minStock: 5,
      unit: 'pcs',
      constellationTag: 'Polaris',
      description: '',
    });
    setEditingProduct(null);
    setIsCreateModalOpen(true);
  };

  // Open Edit Product Modal
  const openEditModal = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      sku: product.sku,
      category: product.category,
      costPrice: product.costPrice,
      sellingPrice: product.sellingPrice,
      stock: product.stock,
      minStock: product.minStock,
      unit: product.unit,
      constellationTag: product.constellationTag,
      description: product.description || '',
    });
    setIsCreateModalOpen(true);
  };

  // Save Add/Edit Product
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...formData,
      });
    } else {
      onAddProduct(formData);
    }

    cosmicAudio.playSuccess();
    setIsCreateModalOpen(false);
    setEditingProduct(null);
  };

  // Quick Restock Apply
  const handleApplyRestock = () => {
    if (!restockProduct || restockQty <= 0) return;

    // Log to stock movement
    onAddStockMovement({
      productId: restockProduct.id,
      productName: restockProduct.name,
      type: 'IN',
      quantity: restockQty,
      date: new Date().toISOString(),
      reason: 'RESTOCK_PEMBELIAN',
      notes: `Restock cepat +${restockQty} ${restockProduct.unit}`,
      performedBy: storeProfile.cashierName || 'Arya Kosmik',
    });

    cosmicAudio.playSuccess();
    setRestockProduct(null);
  };

  // Record Stock In / Stock Out
  const handleSaveStockMovement = (e: React.FormEvent) => {
    e.preventDefault();
    const targetProd = products.find((p) => p.id === movementForm.productId);
    if (!targetProd || movementForm.quantity <= 0) return;

    onAddStockMovement({
      productId: targetProd.id,
      productName: targetProd.name,
      type: movementForm.type,
      quantity: movementForm.quantity,
      date: new Date(movementForm.date).toISOString(),
      reason: movementForm.reason,
      notes: movementForm.notes || undefined,
      performedBy: movementForm.performedBy,
    });

    cosmicAudio.playSuccess();
    setIsRecordMovementOpen(false);
    setMovementForm({
      ...movementForm,
      quantity: 10,
      notes: '',
    });
  };

  return (
    <div className="space-y-4 pb-24 select-none">
      {/* Top Banner with Quick Actions */}
      <div className="relative rounded-2xl p-5 bg-gradient-to-r from-violet-950/70 via-slate-900/90 to-amber-950/40 border border-white/10 overflow-hidden shadow-2xl">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-amber-400 font-bold tracking-wide">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              <span>GUDANG STOK NEBULA & LOGISTIK</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white font-cosmic mt-1">
              Manajemen Inventaris & Produk
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Kontrol penuh katalog barang, kalkulasi keuntungan per produk, peringatan stok menipis, serta mutasi barang masuk dan keluar.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={openAddModal}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:brightness-110 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-amber-400/20 active:scale-95 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>+ Tambah Produk</span>
            </button>

            <button
              onClick={() => {
                setMovementForm({
                  ...movementForm,
                  productId: products[0]?.id || '',
                  type: 'IN',
                  reason: 'RESTOCK_PEMBELIAN',
                });
                setIsRecordMovementOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 text-xs font-semibold border border-emerald-500/30 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <ArrowDownLeft className="w-4 h-4" />
              <span>+ Barang Masuk</span>
            </button>

            <button
              onClick={() => {
                setMovementForm({
                  ...movementForm,
                  productId: products[0]?.id || '',
                  type: 'OUT',
                  reason: 'BARANG_RUSAK',
                });
                setIsRecordMovementOpen(true);
              }}
              className="px-3 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold border border-rose-500/30 flex items-center gap-1.5 active:scale-95 transition-all"
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>+ Barang Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 CORE INVENTORY & PROFIT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* CARD 1: VALUASI MODAL STOK (HPP) */}
        <div className="p-4 rounded-2xl cosmic-card-gold relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-amber-400/90 tracking-wider">
            Total Modal Stok (HPP)
          </span>
          <div className="text-xl font-extrabold text-amber-300 font-cosmic mt-1">
            {formatRupiah(totalCostValuation)}
          </div>
          <div className="text-[11px] text-amber-400/80 mt-1.5 flex items-center justify-between">
            <span>{products.length} SKU terdaftar</span>
          </div>
        </div>

        {/* CARD 2: POTENSI OMSET PENJUALAN */}
        <div className="p-4 rounded-2xl cosmic-card-cyan relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-sky-400/90 tracking-wider">
            Potensi Nilai Jual Stok
          </span>
          <div className="text-xl font-extrabold text-sky-200 font-cosmic mt-1">
            {formatRupiah(totalRetailValuation)}
          </div>
          <div className="text-[11px] text-sky-300/80 mt-1.5">
            Jika seluruh stok fisik terjual
          </div>
        </div>

        {/* CARD 3: POTENSI LABA KOTOR STOK */}
        <div className="p-4 rounded-2xl cosmic-card-violet relative overflow-hidden">
          <span className="text-[10px] uppercase font-bold text-purple-300 tracking-wider">
            Potensi Margin Laba Stok
          </span>
          <div className="text-xl font-extrabold text-purple-200 font-cosmic mt-1">
            {formatRupiah(potentialProfit)}
          </div>
          <div className="text-[11px] text-purple-300/80 mt-1.5">
            Selisih harga jual vs modal
          </div>
        </div>

        {/* CARD 4: PERINGATAN STOK KRITIS / MENIPIS */}
        <div className={`p-4 rounded-2xl border relative overflow-hidden transition-all ${
          criticalStockCount > 0
            ? 'bg-gradient-to-br from-rose-950/40 via-slate-900/80 to-slate-950 border-rose-500/40'
            : 'cosmic-glass border-emerald-500/30'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold tracking-wider text-rose-300">
              Notifikasi Stok Menipis
            </span>
            <Bell className={`w-4 h-4 ${criticalStockCount > 0 ? 'text-rose-400 animate-bounce' : 'text-emerald-400'}`} />
          </div>

          <div className="text-xl font-extrabold font-cosmic mt-1">
            <span className={criticalStockCount > 0 ? 'text-rose-300' : 'text-emerald-300'}>
              {criticalStockCount} Item Butuh Restock
            </span>
          </div>

          <div className="text-[11px] mt-1.5 flex items-center gap-1.5 text-slate-300">
            <span>{outOfStockProducts.length} habis</span>
            <span>·</span>
            <span>{lowStockProducts.length} menipis</span>
          </div>
        </div>
      </div>

      {/* NOTIFIKASI STOK MENIPIS BANNER (JIKA ADA STOK KRITIS) */}
      {criticalStockCount > 0 && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400/20 text-amber-300 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-xs font-bold text-amber-200">
                Peringatan: Terdapat {criticalStockCount} produk yang mendekati atau di bawah batas minimum stok!
              </div>
              <div className="text-[11px] text-amber-300/80 mt-0.5">
                Segera lakukan restock agar operasional kasir penjualan tidak terhambat.
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setStockFilter('LOW')}
              className="px-3 py-1.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-colors shadow"
            >
              Lihat Produk Menipis
            </button>
            <button
              onClick={() => setStockFilter('ALL')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-colors"
            >
              Tampilkan Semua
            </button>
          </div>
        </div>
      )}

      {/* SUB-TABS: KATALOG PRODUK VS BUKU MUTASI BARANG (MASUK / KELUAR) */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('PRODUCTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'PRODUCTS'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Boxes className="w-4 h-4" />
            <span>Katalog Produk & Profit ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('MOVEMENTS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'MOVEMENTS'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Buku Mutasi Barang Masuk & Keluar ({stockMovements.length})</span>
          </button>
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Real-time Search Box */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeSubTab === 'PRODUCTS'
                ? 'Cari nama produk, kode SKU, rasi bintang, atau kategori...'
                : 'Cari riwayat mutasi barang, nama produk, alasan...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-9 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400/50"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Buttons */}
        {activeSubTab === 'PRODUCTS' ? (
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setStockFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                stockFilter === 'ALL' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setStockFilter('LOW')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                stockFilter === 'LOW' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Menipis ({lowStockProducts.length})
            </button>
            <button
              onClick={() => setStockFilter('OUT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                stockFilter === 'OUT' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Habis ({outOfStockProducts.length})
            </button>
          </div>
        ) : (
          <div className="flex items-center bg-slate-900/80 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setMovementFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                movementFilter === 'ALL' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua Mutasi
            </button>
            <button
              onClick={() => setMovementFilter('IN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                movementFilter === 'IN' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Barang Masuk
            </button>
            <button
              onClick={() => setMovementFilter('OUT')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                movementFilter === 'OUT' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Barang Keluar
            </button>
          </div>
        )}
      </div>

      {/* VIEW 1: KATALOG PRODUK DENGAN KALKULASI KEUNTUNGAN PER PRODUK */}
      {activeSubTab === 'PRODUCTS' && (
        <div className="cosmic-glass rounded-2xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] uppercase text-slate-400 bg-slate-900/50 border-b border-white/5">
                <tr>
                  <th className="py-3 px-4 font-semibold">Produk & SKU</th>
                  <th className="py-3 px-3 font-semibold">Rasi Bintang</th>
                  <th className="py-3 px-3 font-semibold text-right">Harga Modal</th>
                  <th className="py-3 px-3 font-semibold text-right">Harga Jual</th>
                  <th className="py-3 px-3 font-semibold text-right">Keuntungan / Unit</th>
                  <th className="py-3 px-3 font-semibold text-center">Stok Fisik</th>
                  <th className="py-3 px-3 font-semibold text-right">Laba Terkumpul</th>
                  <th className="py-3 px-4 font-semibold text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredProducts.map((p) => {
                  const constellation = CONSTELLATION_CONFIG[p.constellationTag] || CONSTELLATION_CONFIG.Polaris;
                  const isOutOfStock = p.stock <= 0;
                  const isLowStock = p.stock > 0 && p.stock <= p.minStock;

                  // 3. Menghitung keuntungan per produk
                  const unitProfit = p.sellingPrice - p.costPrice;
                  const marginPercent = p.sellingPrice > 0 ? Math.round((unitProfit / p.sellingPrice) * 100) : 0;
                  const stats = productProfitStats.get(p.id) || { totalSold: 0, totalGrossProfit: 0 };

                  return (
                    <tr key={p.id} className="hover:bg-white/[0.02] transition-colors">
                      {/* Name & SKU */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-100">{p.name}</div>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400 font-mono">{p.sku}</span>
                          <PlanetCategoryBadge category={p.category} size={13} />
                        </div>
                      </td>

                      {/* Constellation Tag */}
                      <td className="py-3 px-3">
                        <span className={`font-mono text-[11px] ${constellation.color}`}>
                          {p.constellationTag}
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td className="py-3 px-3 text-right font-mono text-slate-400">
                        {formatRupiah(p.costPrice)}
                      </td>

                      {/* Selling Price */}
                      <td className="py-3 px-3 text-right font-mono font-bold text-amber-300 font-cosmic">
                        {formatRupiah(p.sellingPrice)}
                      </td>

                      {/* Keuntungan per Unit & Margin % */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-emerald-400 font-mono">
                          +{formatRupiah(unitProfit)}
                        </div>
                        <div className="text-[10px] text-emerald-400/80 font-mono mt-0.5">
                          {marginPercent}% margin
                        </div>
                      </td>

                      {/* Stock Level with Low Stock Badge */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-lg text-[11px] font-bold ${
                            isOutOfStock
                              ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                              : isLowStock
                              ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                              : 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                          }`}
                        >
                          {p.stock} {p.unit}
                        </span>
                        {isLowStock && (
                          <div className="text-[9px] text-amber-400 mt-0.5 font-semibold">
                            Menipis (Min: {p.minStock})
                          </div>
                        )}
                        {isOutOfStock && (
                          <div className="text-[9px] text-rose-400 mt-0.5 font-semibold">
                            Habis Total
                          </div>
                        )}
                      </td>

                      {/* Laba Terkumpul dari Penjualan */}
                      <td className="py-3 px-3 text-right">
                        <div className="font-bold text-purple-300 font-mono">
                          {formatRupiah(stats.totalGrossProfit)}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">
                          {stats.totalSold} {p.unit} terjual
                        </div>
                      </td>

                      {/* Action buttons (Restock, Edit, Delete) */}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => {
                              setRestockProduct(p);
                              setRestockQty(10);
                            }}
                            className="px-2 py-1 rounded-lg bg-sky-500/15 hover:bg-sky-500/30 text-sky-300 text-[10px] font-semibold border border-sky-500/30 transition-colors"
                            title="Restock Tambah Stok"
                          >
                            +Stok
                          </button>

                          <button
                            onClick={() => openEditModal(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                            title="Ubah Produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmProduct(p)}
                            className="p-1.5 rounded-lg bg-slate-800 hover:bg-rose-900/50 text-slate-400 hover:text-rose-300 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredProducts.length === 0 && (
            <div className="py-12 text-center text-xs text-slate-500">
              Tidak ada produk yang cocok dengan pencarian / filter ini.
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: BUKU MUTASI BARANG (BARANG MASUK & KELUAR) */}
      {activeSubTab === 'MOVEMENTS' && (
        <div className="cosmic-glass rounded-2xl border border-white/10 overflow-hidden space-y-3 p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-white/5">
            <div>
              <h4 className="text-sm font-bold text-white font-cosmic">
                Kartu Stok & Riwayat Mutasi Barang
              </h4>
              <p className="text-xs text-slate-400">
                Catatan resmi setiap barang yang masuk ke gudang atau keluar dari inventaris
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setMovementForm({
                    ...movementForm,
                    productId: products[0]?.id || '',
                    type: 'IN',
                    reason: 'RESTOCK_PEMBELIAN',
                  });
                  setIsRecordMovementOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <ArrowDownLeft className="w-3.5 h-3.5" />
                <span>Catat Masuk</span>
              </button>

              <button
                onClick={() => {
                  setMovementForm({
                    ...movementForm,
                    productId: products[0]?.id || '',
                    type: 'OUT',
                    reason: 'BARANG_RUSAK',
                  });
                  setIsRecordMovementOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-rose-500 hover:bg-rose-400 text-white text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <ArrowUpRight className="w-3.5 h-3.5" />
                <span>Catat Keluar</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="text-[10px] uppercase text-slate-400 bg-slate-900/50 border-b border-white/5">
                <tr>
                  <th className="py-2.5 px-3 font-semibold">Waktu Mutasi</th>
                  <th className="py-2.5 px-3 font-semibold">Produk</th>
                  <th className="py-2.5 px-3 font-semibold">Tipe</th>
                  <th className="py-2.5 px-3 font-semibold text-center">Jumlah</th>
                  <th className="py-2.5 px-3 font-semibold">Alasan / Keterangan</th>
                  <th className="py-2.5 px-3 font-semibold">Petugas</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300">
                {filteredMovements.map((mov) => {
                  const isIncoming = mov.type === 'IN';
                  return (
                    <tr key={mov.id} className="hover:bg-white/[0.02]">
                      <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px]">
                        {formatDateTimeIndo(mov.date)}
                      </td>
                      <td className="py-2.5 px-3 font-semibold text-slate-200">
                        {mov.productName}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold inline-flex items-center gap-1 ${
                            isIncoming
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isIncoming ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          <span>{isIncoming ? 'Barang Masuk' : 'Barang Keluar'}</span>
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center font-bold font-mono text-xs">
                        <span className={isIncoming ? 'text-emerald-400' : 'text-rose-400'}>
                          {isIncoming ? '+' : '-'}{mov.quantity}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">
                        <div className="font-medium text-[11px] text-amber-300/90">
                          {mov.reason.replace(/_/g, ' ')}
                        </div>
                        {mov.notes && (
                          <div className="text-[10px] text-slate-400 italic mt-0.5">
                            "{mov.notes}"
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {mov.performedBy}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredMovements.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-500">
              Belum ada riwayat mutasi barang pada filter ini.
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: TAMBAH / EDIT PRODUK */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1227] border border-amber-500/25 rounded-2xl p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white font-cosmic mb-1">
              {editingProduct ? 'Ubah Informasi Produk' : 'Tambah Produk Kosmik Baru'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Daftarkan produk beserta nama, harga modal, harga jual, dan stok awal
            </p>

            <form onSubmit={handleSaveProduct} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nama Produk</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Cold Brew Orion Dark Roast"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Kode SKU</label>
                  <input
                    type="text"
                    required
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Kategori</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Minuman Kopi">Minuman Kopi</option>
                    <option value="Non-Kopi">Non-Kopi</option>
                    <option value="Pastry & Makanan">Pastry & Makanan</option>
                    <option value="Biji Kopi & Retail">Biji Kopi & Retail</option>
                    <option value="Merchandise">Merchandise</option>
                    <option value="Layanan & Co-Working">Layanan & Co-Working</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Harga Modal (HPP)</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formData.costPrice}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Harga Jual</label>
                  <input
                    type="number"
                    min="0"
                    step="500"
                    required
                    value={formData.sellingPrice}
                    onChange={(e) => setFormData({ ...formData, sellingPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>
              </div>

              {/* Live Preview Profit per Unit */}
              <div className="p-3 rounded-xl bg-slate-900/80 border border-emerald-500/20 flex justify-between items-center text-xs">
                <div>
                  <span className="text-slate-400">Estimasi Keuntungan per Unit:</span>
                  <div className="font-bold text-emerald-400 font-cosmic text-sm">
                    +{formatRupiah(Math.max(0, formData.sellingPrice - formData.costPrice))}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400">Margin Laba:</span>
                  <div className="font-bold text-amber-300 font-mono text-sm">
                    {formData.sellingPrice > 0
                      ? Math.round(((formData.sellingPrice - formData.costPrice) / formData.sellingPrice) * 100)
                      : 0}
                    %
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Jumlah Stok</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Batas Minimum</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Satuan</label>
                  <input
                    type="text"
                    required
                    placeholder="cup / pcs / botol"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Rasi Bintang Astro (Identitas Merek)</label>
                <select
                  value={formData.constellationTag}
                  onChange={(e) => setFormData({ ...formData, constellationTag: e.target.value as ConstellationTag })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-medium focus:outline-none focus:border-amber-400"
                >
                  <option value="Polaris">✧ Polaris (Bintang Panduan Kejora)</option>
                  <option value="Orion">✦ Orion (Pilar Kekuatan & Pemburu)</option>
                  <option value="Sirius">✶ Sirius (Terang Utama & Tercepat)</option>
                  <option value="Cassiopeia">✵ Cassiopeia (Tahta Anggun & Premium)</option>
                  <option value="Andromeda">✺ Andromeda (Ekspansi Galaksi Luas)</option>
                  <option value="Pegasus">✷ Pegasus (Akselerasi Tinggi)</option>
                  <option value="Centaurus">✸ Centaurus (Akurasi Pasar)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Deskripsi Produk (Opsional)</label>
                <textarea
                  rows={2}
                  placeholder="Catatan keunggulan rasa atau spesifikasi produk..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 shadow-md transition-all"
                >
                  Simpan Produk
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CATAT BARANG MASUK & BARANG KELUAR */}
      {isRecordMovementOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1227] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative">
            <button
              onClick={() => setIsRecordMovementOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white font-cosmic mb-1">
              {movementForm.type === 'IN' ? 'Catat Barang Masuk (Restock)' : 'Catat Barang Keluar (Pengurangan)'}
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Rekam perubahan stok fisik gudang secara transparan
            </p>

            <form onSubmit={handleSaveStockMovement} className="space-y-3.5 text-xs">
              {/* Type Switcher */}
              <div className="flex bg-slate-900 p-1 rounded-xl border border-white/10">
                <button
                  type="button"
                  onClick={() => setMovementForm({ ...movementForm, type: 'IN', reason: 'RESTOCK_PEMBELIAN' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    movementForm.type === 'IN'
                      ? 'bg-emerald-500 text-slate-950 shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Barang Masuk
                </button>

                <button
                  type="button"
                  onClick={() => setMovementForm({ ...movementForm, type: 'OUT', reason: 'BARANG_RUSAK' })}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    movementForm.type === 'OUT'
                      ? 'bg-rose-500 text-white shadow'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Barang Keluar
                </button>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Pilih Produk</label>
                <select
                  value={movementForm.productId}
                  onChange={(e) => setMovementForm({ ...movementForm, productId: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Stok: {p.stock} {p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Jumlah Unit</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={movementForm.quantity}
                    onChange={(e) => setMovementForm({ ...movementForm, quantity: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold font-mono text-base focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Alasan Mutasi</label>
                  <select
                    value={movementForm.reason}
                    onChange={(e) => setMovementForm({ ...movementForm, reason: e.target.value as StockMovementReason })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    {movementForm.type === 'IN' ? (
                      <>
                        <option value="RESTOCK_PEMBELIAN">Restock Pembelian</option>
                        <option value="PENYESUAIAN_STOK">Penyesuaian Stok Gudang</option>
                        <option value="RETUR_SUPPLIER">Retur Pengembalian</option>
                      </>
                    ) : (
                      <>
                        <option value="BARANG_RUSAK">Barang Rusak / Basi</option>
                        <option value="PENYESUAIAN_STOK">Penyesuaian Selisih Fisik</option>
                        <option value="SAMPEL_PROMOSI">Sampel Promosi / Display</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Waktu Transaksi</label>
                <input
                  type="datetime-local"
                  required
                  value={movementForm.date}
                  onChange={(e) => setMovementForm({ ...movementForm, date: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Catatan / Supplier / Keterangan</label>
                <input
                  type="text"
                  placeholder="Contoh: Pembelian 5 box dari Supplier Roastery Gayo"
                  value={movementForm.notes}
                  onChange={(e) => setMovementForm({ ...movementForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsRecordMovementOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-lg text-xs font-bold transition-all shadow ${
                    movementForm.type === 'IN'
                      ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      : 'bg-rose-500 text-white hover:bg-rose-400'
                  }`}
                >
                  Simpan Mutasi
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: QUICK RESTOCK COUNTER */}
      {restockProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0e1227] border border-sky-500/30 rounded-2xl p-5 shadow-2xl relative">
            <button
              onClick={() => setRestockProduct(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white font-cosmic mb-1">
              Restock Stok Produk Cepat
            </h3>
            <p className="text-xs text-slate-300 font-semibold mb-3">
              {restockProduct.name}
            </p>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1 mb-3">
              <div className="flex justify-between text-slate-400">
                <span>Stok Sekarang:</span>
                <span className="font-bold text-slate-200">{restockProduct.stock} {restockProduct.unit}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Batas Minimum:</span>
                <span>{restockProduct.minStock} {restockProduct.unit}</span>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <label className="block text-xs text-slate-300">Jumlah Tambah Stok:</label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={(e) => setRestockQty(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-bold text-base font-mono"
              />

              <div className="flex gap-2">
                {[5, 10, 25, 50].map((qty) => (
                  <button
                    key={qty}
                    type="button"
                    onClick={() => setRestockQty(qty)}
                    className="flex-1 py-1 rounded bg-slate-800 text-xs font-mono text-slate-300 hover:bg-slate-700"
                  >
                    +{qty}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleApplyRestock}
              className="w-full py-2.5 rounded-xl bg-sky-400 hover:bg-sky-300 text-slate-950 font-bold text-xs transition-all shadow-md"
            >
              Konfirmasi Restock (+{restockQty})
            </button>
          </div>
        </div>
      )}

      {/* MODAL 4: HAPUS PRODUK KONFIRMASI */}
      {deleteConfirmProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0e1227] border border-rose-500/40 rounded-2xl p-5 shadow-2xl relative text-center">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/40 mx-auto flex items-center justify-center text-rose-400 mb-3">
              <Trash2 className="w-6 h-6" />
            </div>

            <h3 className="text-base font-bold text-white font-cosmic mb-1">
              Hapus Produk dari Katalog?
            </h3>
            <p className="text-xs text-slate-300 mb-1">
              {deleteConfirmProduct.name}
            </p>
            <p className="text-[11px] text-slate-500 mb-4">
              Tindakan ini tidak dapat dibatalkan. Riwayat transaksi sebelumnya tetap tercatat di sistem pembukuan.
            </p>

            <div className="flex justify-center gap-2">
              <button
                onClick={() => setDeleteConfirmProduct(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onDeleteProduct(deleteConfirmProduct.id);
                  cosmicAudio.playSubtle();
                  setDeleteConfirmProduct(null);
                }}
                className="px-5 py-2 rounded-xl bg-rose-500 text-white font-bold text-xs hover:bg-rose-400 shadow-lg shadow-rose-500/20"
              >
                Ya, Hapus Produk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
