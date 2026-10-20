import React, { useState, useMemo } from 'react';
import { Product, CartItem, PaymentMethod, Customer, StoreProfile, Transaction } from '../../types/business';
import { formatRupiah, formatDateTimeIndo, formatDateIndo, cosmicAudio, CONSTELLATION_CONFIG } from '../../utils/formatters';
import { PlanetCategoryBadge, getCategoryPlanet } from '../cosmic/PlanetIcons';
import confetti from 'canvas-confetti';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle,
  QrCode,
  Banknote,
  Building2,
  Calendar,
  Printer,
  Share2,
  X,
  Sparkles,
  Layers,
  ArrowRight,
  History,
  RotateCcw,
  Delete,
  Check
} from 'lucide-react';

interface PosTabProps {
  products: Product[];
  customers: Customer[];
  transactions: Transaction[];
  storeProfile: StoreProfile;
  onCompleteTransaction: (transaction: Transaction) => void;
  onAddNewCustomer?: (name: string, phone: string) => Customer;
}

export const PosTab: React.FC<PosTabProps> = ({
  products,
  customers,
  transactions,
  storeProfile,
  onCompleteTransaction,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Semua');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [guestCustomerName, setGuestCustomerName] = useState('');
  const [applyTax, setApplyTax] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout modal states
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('TUNAI');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [lastCompletedTransaction, setLastCompletedTransaction] = useState<Transaction | null>(null);

  // History modal state
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [selectedHistoryTx, setSelectedHistoryTx] = useState<Transaction | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => set.add(p.category));
    return ['Semua', ...Array.from(set)];
  }, [products]);

  // Filtered products by search and category
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.constellationTag.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  // 1. Memilih produk yang dibeli pelanggan (Add to Cart)
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;
    cosmicAudio.playBeep();
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev;
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [...prev, { product, quantity: 1, discountPercent: 0 }];
    });
  };

  const updateCartQty = (productId: string, delta: number) => {
    cosmicAudio.playSubtle();
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty <= 0) return null;
            if (newQty > item.product.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    cosmicAudio.playSubtle();
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // 2. Menghitung total pembayaran otomatis
  const subtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.product.sellingPrice * item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (subtotal * discountPercent) / 100;
  }, [subtotal, discountPercent]);

  const afterDiscount = subtotal - discountAmount;

  const taxAmount = useMemo(() => {
    if (!applyTax) return 0;
    return (afterDiscount * storeProfile.taxRatePercent) / 100;
  }, [afterDiscount, applyTax, storeProfile.taxRatePercent]);

  const grandTotal = Math.round(afterDiscount + taxAmount);
  const totalItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // 3 & 4. Memasukkan jumlah uang yang dibayarkan & Menghitung kembalian
  const cashChange = (cashGiven || 0) - grandTotal;
  const isCashSufficient = paymentMethod !== 'TUNAI' || cashGiven >= grandTotal;

  // Quick cash preset values
  const cashPresets = useMemo(() => {
    if (grandTotal <= 0) return [];
    const presets: number[] = [grandTotal]; // Uang Pas

    const round20k = Math.ceil(grandTotal / 20000) * 20000;
    const round50k = Math.ceil(grandTotal / 50000) * 50000;
    const round100k = Math.ceil(grandTotal / 100000) * 100000;

    if (round20k > grandTotal && !presets.includes(round20k)) presets.push(round20k);
    if (round50k > grandTotal && !presets.includes(round50k)) presets.push(round50k);
    if (round100k > grandTotal && !presets.includes(round100k)) presets.push(round100k);
    if (!presets.includes(200000) && grandTotal < 200000) presets.push(200000);
    if (!presets.includes(500000) && grandTotal < 500000) presets.push(500000);

    return presets.slice(0, 5);
  }, [grandTotal]);

  // Open Checkout
  const handleOpenCheckout = () => {
    if (cart.length === 0) return;
    setCashGiven(grandTotal); // default to uang pas
    setIsCheckoutModalOpen(true);
    cosmicAudio.playBeep();
  };

  // Keypad append for touch cashier
  const handleKeypadPress = (val: string) => {
    cosmicAudio.playSubtle();
    if (val === 'CLEAR') {
      setCashGiven(0);
      return;
    }
    if (val === 'BACK') {
      const str = String(cashGiven);
      const next = str.slice(0, -1);
      setCashGiven(next ? Number(next) : 0);
      return;
    }
    const currentStr = cashGiven === 0 ? '' : String(cashGiven);
    const newStr = currentStr + val;
    setCashGiven(Number(newStr));
  };

  // 5 & 7. Menyimpan riwayat transaksi & Memperbarui stok otomatis
  const handleFinishCheckout = () => {
    if (paymentMethod === 'TUNAI' && cashGiven < grandTotal) {
      alert('Jumlah uang yang dibayarkan kurang dari total belanja.');
      return;
    }

    const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
    const customerName = selectedCustomer ? selectedCustomer.name : (guestCustomerName.trim() || 'Pelanggan Umum');
    const customerPhone = selectedCustomer ? selectedCustomer.phone : '';

    let totalCost = 0;
    const transactionItems = cart.map((item) => {
      const itemCost = item.product.costPrice * item.quantity;
      totalCost += itemCost;
      return {
        productId: item.product.id,
        productName: item.product.name,
        sku: item.product.sku,
        quantity: item.quantity,
        unitPrice: item.product.sellingPrice,
        costPrice: item.product.costPrice,
        subtotal: item.product.sellingPrice * item.quantity,
      };
    });

    const profit = Math.round(afterDiscount - totalCost);

    const newTransaction: Transaction = {
      id: `trx-${Date.now()}`,
      invoiceNumber: `AST-POS-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(100 + Math.random() * 900)}`,
      date: new Date().toISOString(),
      items: transactionItems,
      subtotal,
      discountAmount,
      taxAmount,
      total: grandTotal,
      profit,
      paymentMethod,
      cashReceived: paymentMethod === 'TUNAI' ? cashGiven : grandTotal,
      cashChange: paymentMethod === 'TUNAI' ? Math.max(0, cashChange) : 0,
      customerId: selectedCustomerId || undefined,
      customerName,
      customerPhone,
      cashierName: storeProfile.cashierName,
      status: 'COMPLETED',
    };

    // Callback updates stock automatically and saves to transaction database
    onCompleteTransaction(newTransaction);
    setLastCompletedTransaction(newTransaction);
    setIsCheckoutModalOpen(false);
    clearCart();
    setIsCartOpen(false);

    cosmicAudio.playSuccess();
    try {
      confetti({
        particleCount: 75,
        spread: 60,
        origin: { y: 0.65 },
        colors: ['#fbbf24', '#a855f7', '#38bdf8', '#ffffff'],
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="relative pb-24 select-none">
      {/* Top Search, Category & History Bar */}
      <div className="sticky top-0 z-20 bg-[#090b17]/95 backdrop-blur-md pb-3 pt-1 border-b border-white/5 space-y-2">
        <div className="flex items-center gap-2">
          {/* Real-time search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Cari produk kasir, SKU, atau nama..."
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

          {/* History Button */}
          <button
            onClick={() => setIsHistoryModalOpen(true)}
            className="px-3 py-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 border border-white/5 flex items-center gap-1.5 text-xs font-semibold"
            title="Riwayat Transaksi Penjualan"
          >
            <History className="w-4 h-4 text-sky-400" />
            <span className="hidden sm:inline">Riwayat</span>
            <span className="w-5 h-5 rounded-full bg-slate-800 text-slate-300 text-[10px] flex items-center justify-center font-mono">
              {transactions.length}
            </span>
          </button>

          {/* Cart Trigger */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/40 text-amber-300 flex items-center gap-2 font-medium text-xs sm:text-sm hover:border-amber-400 transition-all active:scale-95 shadow"
          >
            <ShoppingCart className="w-4 h-4" />
            <span className="hidden sm:inline">Pesanan</span>
            {totalItemsCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center">
                {totalItemsCount}
              </span>
            )}
          </button>
        </div>

        {/* Category Filter Pills with Planet Icons */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pt-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            const planetInfo = cat !== 'Semua' ? getCategoryPlanet(cat) : null;
            const PlanetIcon = planetInfo?.IconComponent;

            return (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  cosmicAudio.playSubtle();
                }}
                className={`whitespace-nowrap px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 shadow-sm font-bold'
                    : 'bg-slate-900/70 text-slate-400 hover:text-white border border-white/5'
                }`}
              >
                {PlanetIcon && <PlanetIcon size={14} />}
                <span>{cat}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Product Catalog Grid (Memilih produk yang dibeli pelanggan) */}
      <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {filteredProducts.map((product) => {
          const cartItem = cart.find((c) => c.product.id === product.id);
          const isOutOfStock = product.stock <= 0;
          const isLowStock = product.stock > 0 && product.stock <= product.minStock;
          const constellation = CONSTELLATION_CONFIG[product.constellationTag] || CONSTELLATION_CONFIG.Polaris;

          return (
            <div
              key={product.id}
              onClick={() => !isOutOfStock && addToCart(product)}
              className={`group relative rounded-2xl p-3.5 transition-all flex flex-col justify-between cursor-pointer border ${
                isOutOfStock
                  ? 'bg-slate-900/30 border-white/5 opacity-50 cursor-not-allowed'
                  : 'cosmic-glass-interactive'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-1 mb-1">
                  <span className={`text-[10px] font-mono tracking-tight ${constellation.color}`}>
                    {product.constellationTag}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {product.sku}
                  </span>
                </div>

                <h4 className="text-xs sm:text-sm font-semibold text-slate-100 line-clamp-2 leading-snug group-hover:text-amber-200 transition-colors">
                  {product.name}
                </h4>

                <div className="mt-1">
                  <PlanetCategoryBadge category={product.category} size={13} />
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-sm font-bold text-amber-300 font-cosmic">
                    {formatRupiah(product.sellingPrice)}
                  </div>
                  <div className="text-[10px] mt-0.5">
                    {isOutOfStock ? (
                      <span className="text-rose-400 font-bold">Stok Habis</span>
                    ) : isLowStock ? (
                      <span className="text-amber-400 font-medium">Sisa {product.stock} {product.unit}</span>
                    ) : (
                      <span className="text-slate-400">Stok: {product.stock} {product.unit}</span>
                    )}
                  </div>
                </div>

                {/* Add / Qty Controller */}
                <div>
                  {cartItem ? (
                    <div
                      className="flex items-center gap-1.5 bg-amber-400/20 border border-amber-400/50 rounded-xl px-2 py-1 text-amber-300 font-bold text-xs"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        onClick={() => updateCartQty(product.id, -1)}
                        className="hover:text-white p-0.5"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-4 text-center font-mono">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateCartQty(product.id, 1)}
                        disabled={cartItem.quantity >= product.stock}
                        className="hover:text-white p-0.5 disabled:opacity-30"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      disabled={isOutOfStock}
                      className="w-8 h-8 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center hover:bg-amber-400 hover:text-slate-950 transition-all disabled:opacity-30"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="py-16 text-center text-xs text-slate-500">
          Produk tidak ditemukan. Coba kata kunci lain atau pilih Semua Kategori.
        </div>
      )}

      {/* Floating Bottom Bar when Cart has items */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-20 left-0 right-0 px-4 z-30 pointer-events-none">
          <div className="max-w-md mx-auto pointer-events-auto">
            <button
              onClick={() => {
                setIsCartOpen(true);
                cosmicAudio.playSubtle();
              }}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold shadow-2xl shadow-amber-400/30 flex items-center justify-between border border-amber-200 active:scale-[0.99] transition-transform"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-slate-950 text-amber-300 flex items-center justify-center text-xs font-bold font-mono">
                  {totalItemsCount}
                </div>
                <div className="text-left">
                  <div className="text-[10px] uppercase font-bold text-slate-900">
                    Total Belanja:
                  </div>
                  <div className="text-base font-extrabold font-cosmic">
                    {formatRupiah(grandTotal)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs font-bold bg-slate-950/20 px-3 py-1.5 rounded-xl">
                <span>Bayar Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* CART REGISTER DRAWER (DAFTAR PESANAN & TOTAL OTOMATIS) */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex justify-end animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-[#0d1021] h-full flex flex-col border-l border-white/10 shadow-2xl">
            {/* Drawer Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white font-cosmic">
                  Register Kasir ({totalItemsCount} item)
                </h3>
              </div>

              <div className="flex items-center gap-2">
                {cart.length > 0 && (
                  <button
                    onClick={clearCart}
                    className="text-xs text-rose-400 hover:text-rose-300 px-2 py-1"
                  >
                    Reset
                  </button>
                )}
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Customer Picker */}
            <div className="p-3 bg-slate-900/50 border-b border-white/5 space-y-2">
              <label className="block text-[11px] text-slate-400">Pilih Pelanggan (Opsional):</label>
              <select
                value={selectedCustomerId}
                onChange={(e) => {
                  setSelectedCustomerId(e.target.value);
                  if (e.target.value) setGuestCustomerName('');
                }}
                className="w-full text-xs px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400"
              >
                <option value="">-- Pelanggan Umum / Guest --</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.tier.replace('_', ' ')})
                  </option>
                ))}
              </select>

              {!selectedCustomerId && (
                <input
                  type="text"
                  placeholder="Atau ketik nama pembeli langsung..."
                  value={guestCustomerName}
                  onChange={(e) => setGuestCustomerName(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl bg-slate-800 border border-slate-700 text-slate-200 focus:outline-none focus:border-amber-400"
                />
              )}
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {cart.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-12 h-12 rounded-full bg-slate-800/80 border border-slate-700 mx-auto flex items-center justify-center text-slate-500 mb-2">
                    <ShoppingCart className="w-6 h-6" />
                  </div>
                  <p className="text-sm text-slate-300 font-semibold">Pesanan masih kosong</p>
                  <p className="text-xs text-slate-500 mt-1">Pilih produk dari katalog untuk memulai transaksi.</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 rounded-xl bg-slate-900/80 border border-white/5 flex items-center justify-between gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-semibold text-slate-100 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-amber-300 font-mono mt-0.5">
                        {formatRupiah(item.product.sellingPrice)} x {item.quantity} = {formatRupiah(item.product.sellingPrice * item.quantity)}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700">
                        <button
                          onClick={() => updateCartQty(item.product.id, -1)}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-bold text-slate-100 font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(item.product.id, 1)}
                          disabled={item.quantity >= item.product.stock}
                          className="w-6 h-6 rounded flex items-center justify-center text-slate-300 hover:text-white disabled:opacity-30"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-500 hover:text-rose-400 p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations & Discounts */}
            {cart.length > 0 && (
              <div className="p-4 bg-slate-900 border-t border-white/10 space-y-3">
                {/* Options: Discount & Tax */}
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <div className="flex items-center gap-1.5">
                    <span>Diskon:</span>
                    <select
                      value={discountPercent}
                      onChange={(e) => setDiscountPercent(Number(e.target.value))}
                      className="px-2 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs text-amber-300 font-medium"
                    >
                      <option value="0">0%</option>
                      <option value="5">5%</option>
                      <option value="10">10%</option>
                      <option value="15">15%</option>
                      <option value="20">20%</option>
                    </select>
                  </div>

                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={applyTax}
                      onChange={(e) => setApplyTax(e.target.checked)}
                      className="rounded accent-amber-400"
                    />
                    <span>PPN {storeProfile.taxRatePercent}%</span>
                  </label>
                </div>

                {/* Subtotals Breakdown */}
                <div className="space-y-1 text-xs text-slate-400 border-t border-white/5 pt-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="text-slate-200 font-mono">{formatRupiah(subtotal)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-rose-400">
                      <span>Diskon ({discountPercent}%):</span>
                      <span className="font-mono">-{formatRupiah(discountAmount)}</span>
                    </div>
                  )}
                  {applyTax && (
                    <div className="flex justify-between">
                      <span>PPN ({storeProfile.taxRatePercent}%):</span>
                      <span className="text-slate-200 font-mono">{formatRupiah(taxAmount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm font-extrabold text-white pt-1 border-t border-white/10">
                    <span>Total Pembayaran:</span>
                    <span className="text-amber-400 font-cosmic text-base">{formatRupiah(grandTotal)}</span>
                  </div>
                </div>

                {/* Checkout Trigger */}
                <button
                  onClick={handleOpenCheckout}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-bold text-sm shadow-xl shadow-amber-400/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                >
                  <Banknote className="w-5 h-5 text-slate-950" />
                  <span>Lanjutkan ke Pembayaran</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT MODAL: MEMASUKKAN UANG DIBAYARKAN & MENGHITUNG KEMBALIAN */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0f1329] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsCheckoutModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Total Billing Display */}
            <div className="text-center mb-4 pb-3 border-b border-white/10">
              <span className="text-[10px] uppercase font-bold tracking-widest text-amber-400">
                Total Tagihan Belanja
              </span>
              <div className="text-3xl font-extrabold text-white font-cosmic mt-0.5">
                {formatRupiah(grandTotal)}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {totalItemsCount} item · Pelanggan: {selectedCustomerId ? customers.find(c => c.id === selectedCustomerId)?.name : (guestCustomerName || 'Pelanggan Umum')}
              </p>
            </div>

            {/* Payment Method Switcher */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                type="button"
                onClick={() => setPaymentMethod('TUNAI')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'TUNAI'
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow'
                    : 'bg-slate-900/60 border-white/5 text-slate-400'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Tunai (Cash)</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('QRIS_STELLAR')}
                className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  paymentMethod === 'QRIS_STELLAR'
                    ? 'bg-amber-400/20 border-amber-400 text-amber-300 shadow'
                    : 'bg-slate-900/60 border-white/5 text-slate-400'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>QRIS Instant</span>
              </button>
            </div>

            {/* CASH PAYMENT WORKFLOW */}
            {paymentMethod === 'TUNAI' ? (
              <div className="space-y-3">
                {/* Uang Diterima & Kembalian Display */}
                <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400">
                    <span>Uang Tunai Diterima:</span>
                    <button
                      type="button"
                      onClick={() => setCashGiven(grandTotal)}
                      className="text-amber-400 hover:text-amber-300 text-xs font-semibold"
                    >
                      [Uang Pas]
                    </button>
                  </div>

                  <input
                    type="number"
                    min="0"
                    value={cashGiven || ''}
                    onChange={(e) => setCashGiven(Number(e.target.value))}
                    className="w-full text-2xl font-black px-3 py-2 rounded-xl bg-slate-900 border border-amber-500/40 text-amber-300 font-mono text-right focus:outline-none focus:border-amber-400"
                    placeholder="0"
                  />

                  {/* Quick Cash Preset Shortcuts */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {cashPresets.map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setCashGiven(preset);
                          cosmicAudio.playSubtle();
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition-colors ${
                          cashGiven === preset
                            ? 'bg-amber-400 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {formatRupiah(preset)}
                      </button>
                    ))}
                  </div>

                  {/* 4. Menghitung Kembalian */}
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-xs">
                    <span className="text-slate-400">Kembalian:</span>
                    <span
                      className={`text-lg font-bold font-cosmic ${
                        cashChange >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {cashChange >= 0 ? formatRupiah(cashChange) : `Uang Kurang (${formatRupiah(Math.abs(cashChange))})`}
                    </span>
                  </div>
                </div>

                {/* Touch Numeric Keypad */}
                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  {['1', '2', '3', '4', '5', '6', '7', '8', '9', '00', '0', '000'].map((digit) => (
                    <button
                      key={digit}
                      type="button"
                      onClick={() => handleKeypadPress(digit)}
                      className="py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-base font-bold font-mono active:scale-95 transition-all border border-white/5"
                    >
                      {digit}
                    </button>
                  ))}
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('CLEAR')}
                    className="col-span-2 py-2 rounded-xl bg-slate-800 text-rose-300 text-xs font-bold hover:bg-rose-950/40"
                  >
                    Hapus Semua
                  </button>
                  <button
                    type="button"
                    onClick={() => handleKeypadPress('BACK')}
                    className="py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold flex items-center justify-center hover:bg-slate-700"
                  >
                    <Delete className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* QRIS Simulated Scanner */
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 text-center space-y-3">
                <div className="w-36 h-36 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                  <div className="w-full h-full bg-slate-950 rounded flex flex-col items-center justify-center text-white">
                    <QrCode className="w-20 h-20 text-amber-400" />
                    <span className="text-[8px] font-mono text-slate-300 mt-0.5">ASTRO-QRIS-LIVE</span>
                  </div>
                </div>
                <div className="text-xs text-amber-400 font-mono flex items-center justify-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Siap di-scan: BCA, Mandiri, GoPay, OVO</span>
                </div>
              </div>
            )}

            {/* Confirm Checkout Button */}
            <button
              onClick={handleFinishCheckout}
              disabled={!isCashSufficient}
              className="w-full mt-4 py-3.5 rounded-xl bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 text-slate-950 font-black text-sm shadow-xl shadow-amber-400/20 hover:brightness-105 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-5 h-5 text-slate-950" />
              <span>Selesaikan Penjualan & Cetak Bukti</span>
            </button>
          </div>
        </div>
      )}

      {/* 6. MEMBUAT BUKTI TRANSAKSI SEDERHANA (STRUK DIGITAL) */}
      {lastCompletedTransaction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#0a0c18] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            {/* Action Top Bar */}
            <div className="flex items-center justify-between mb-3 no-print">
              <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4" />
                <span>Transaksi Berhasil Disimpan</span>
              </span>
              <button
                onClick={() => setLastCompletedTransaction(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Thermal Printable Paper Receipt */}
            <div className="p-4 bg-white text-slate-900 rounded-xl font-mono text-[11px] shadow-inner space-y-3">
              {/* Header */}
              <div className="text-center border-b border-dashed border-slate-300 pb-2.5">
                <div className="text-base font-extrabold uppercase font-sans tracking-tight text-slate-950">
                  {storeProfile.name}
                </div>
                <div className="text-[10px] text-slate-600 mt-0.5">
                  {storeProfile.tagline}
                </div>
                <div className="text-[9px] text-slate-500 mt-0.5">
                  {storeProfile.address} · {storeProfile.phone}
                </div>
              </div>

              {/* Metadata */}
              <div className="text-[10px] text-slate-600 space-y-0.5 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>No. Struk:</span>
                  <span className="font-bold text-slate-900">{lastCompletedTransaction.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Waktu:</span>
                  <span>{formatDateTimeIndo(lastCompletedTransaction.date)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Kasir:</span>
                  <span>{lastCompletedTransaction.cashierName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pelanggan:</span>
                  <span className="font-semibold text-slate-900">{lastCompletedTransaction.customerName}</span>
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-2">
                {lastCompletedTransaction.items.map((item, idx) => (
                  <div key={idx}>
                    <div className="font-bold text-slate-900">{item.productName}</div>
                    <div className="flex justify-between text-slate-600 text-[10px]">
                      <span>{item.quantity} x {formatRupiah(item.unitPrice)}</span>
                      <span className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="space-y-1 text-[10px] text-slate-700 border-b border-dashed border-slate-300 pb-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatRupiah(lastCompletedTransaction.subtotal)}</span>
                </div>
                {lastCompletedTransaction.discountAmount > 0 && (
                  <div className="flex justify-between text-rose-600">
                    <span>Diskon:</span>
                    <span>-{formatRupiah(lastCompletedTransaction.discountAmount)}</span>
                  </div>
                )}
                {lastCompletedTransaction.taxAmount > 0 && (
                  <div className="flex justify-between">
                    <span>PPN ({storeProfile.taxRatePercent}%):</span>
                    <span>{formatRupiah(lastCompletedTransaction.taxAmount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-xs font-black text-slate-950 pt-1 border-t border-slate-300">
                  <span>TOTAL:</span>
                  <span>{formatRupiah(lastCompletedTransaction.total)}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600 pt-0.5">
                  <span>Metode Bayar:</span>
                  <span className="font-semibold">{lastCompletedTransaction.paymentMethod.replace('_', ' ')}</span>
                </div>
                {lastCompletedTransaction.paymentMethod === 'TUNAI' && (
                  <>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Uang Diterima:</span>
                      <span>{formatRupiah(lastCompletedTransaction.cashReceived || 0)}</span>
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-600">
                      <span>Kembalian:</span>
                      <span className="font-bold text-slate-900">{formatRupiah(lastCompletedTransaction.cashChange || 0)}</span>
                    </div>
                  </>
                )}
              </div>

              {/* Receipt Footer */}
              <div className="text-center text-[9px] text-slate-500 pt-1">
                <p>{storeProfile.receiptHeader}</p>
                <p className="mt-1 font-bold text-slate-700">★ ASTRO BUSINESS POS ★</p>
              </div>
            </div>

            {/* Receipt Actions */}
            <div className="grid grid-cols-2 gap-2 mt-3 no-print">
              <button
                onClick={() => window.print()}
                className="py-2.5 px-3 rounded-xl bg-slate-800 text-slate-200 text-xs font-semibold hover:bg-slate-700 flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Struk</span>
              </button>

              <button
                onClick={() => {
                  const message = `Halo ${lastCompletedTransaction.customerName}, terima kasih telah bertransaksi di ${storeProfile.name}.\n\nNo. Struk: ${lastCompletedTransaction.invoiceNumber}\nTotal: ${formatRupiah(lastCompletedTransaction.total)}\nStatus: LUNAS\n\nSimpan bukti transaksi ini. Semoga harimu menyenangkan!`;
                  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="py-2.5 px-3 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-500 flex items-center justify-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>WhatsApp</span>
              </button>
            </div>

            <button
              onClick={() => setLastCompletedTransaction(null)}
              className="w-full mt-2 py-2.5 rounded-xl bg-amber-400 text-slate-950 font-bold text-xs hover:bg-amber-300 transition-all no-print"
            >
              Transaksi Baru
            </button>
          </div>
        </div>
      )}

      {/* 5. MODAL RIWAYAT TRANSAKSI KASIR (TRANSACTION HISTORY & REPRINT) */}
      {isHistoryModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-[#0e1227] border border-sky-500/30 rounded-2xl p-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setIsHistoryModalOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <History className="w-5 h-5 text-sky-400" />
              <h3 className="text-base font-bold text-white font-cosmic">
                Riwayat Transaksi Kasir
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-3">
              Daftar seluruh transaksi penjualan yang telah tersimpan di sistem
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {transactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-xl bg-slate-900/80 border border-white/5 hover:border-sky-400/30 transition-all flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-amber-300">
                        {tx.invoiceNumber}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDateTimeIndo(tx.date)}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-slate-200 mt-0.5">
                      {tx.customerName} · <span className="text-slate-400">{tx.items.length} item</span>
                    </div>

                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Metode: {tx.paymentMethod.replace('_', ' ')}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-sm font-bold text-amber-300 font-cosmic">
                      {formatRupiah(tx.total)}
                    </div>
                    <button
                      onClick={() => {
                        setLastCompletedTransaction(tx);
                        setIsHistoryModalOpen(false);
                      }}
                      className="mt-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[10px] font-semibold flex items-center gap-1 border border-white/5 ml-auto"
                    >
                      <Printer className="w-3 h-3" />
                      <span>Cetak Struk</span>
                    </button>
                  </div>
                </div>
              ))}

              {transactions.length === 0 && (
                <div className="py-12 text-center text-xs text-slate-500">
                  Belum ada riwayat transaksi tersimpan.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
