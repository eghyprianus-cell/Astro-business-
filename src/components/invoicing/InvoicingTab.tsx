import React, { useState, useMemo } from 'react';
import { Invoice, InvoiceItem, Customer, CustomerTier, StoreProfile } from '../../types/business';
import { formatRupiah, formatDateIndo, cosmicAudio } from '../../utils/formatters';
import {
  FileText,
  Users,
  Plus,
  Printer,
  Share2,
  CheckCircle,
  Clock,
  AlertCircle,
  Search,
  X,
  Trash2,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  Award
} from 'lucide-react';

interface InvoicingTabProps {
  invoices: Invoice[];
  customers: Customer[];
  storeProfile: StoreProfile;
  onAddInvoice: (invoice: Invoice) => void;
  onUpdateInvoiceStatus: (invoiceId: string, status: Invoice['status']) => void;
  onAddCustomer: (customer: Omit<Customer, 'id' | 'totalSpend' | 'totalTransactions' | 'joinedDate'>) => Customer;
}

export const InvoicingTab: React.FC<InvoicingTabProps> = ({
  invoices,
  customers,
  storeProfile,
  onAddInvoice,
  onUpdateInvoiceStatus,
  onAddCustomer,
}) => {
  const [activeSubTab, setActiveSubTab] = useState<'INVOICES' | 'CUSTOMERS'>('INVOICES');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'LUNAS' | 'MENUNGGU' | 'JATUH_TEMPO'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedInvoiceForView, setSelectedInvoiceForView] = useState<Invoice | null>(null);
  const [isCreateInvoiceOpen, setIsCreateInvoiceOpen] = useState(false);
  const [isCreateCustomerOpen, setIsCreateCustomerOpen] = useState(false);

  // New Invoice Form state
  const [newInvoiceData, setNewInvoiceData] = useState({
    customerId: customers[0]?.id || '',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    paymentTerms: 'Pembayaran dapat ditransfer ke Rekening Bank Mandiri ASTRO BUSINESS HUB 137-00-998877-1.',
    notes: 'Terima kasih atas kemitraan Anda bersama Astro Business Hub.',
    taxPercent: storeProfile.taxRatePercent,
  });

  const [newInvoiceItems, setNewInvoiceItems] = useState<InvoiceItem[]>([
    {
      id: 'item-1',
      description: 'Layanan Pengadaan Biji Kopi & Konsultasi Barista',
      quantity: 1,
      unitPrice: 1500000,
      amount: 1500000,
    },
  ]);

  // New Customer Form state
  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    tier: 'NEBULA_REGULAR' as CustomerTier,
    notes: '',
  });

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      const matchStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchSearch =
        inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.customerName.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchSearch;
    });
  }, [invoices, statusFilter, searchQuery]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      return (
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.phone.includes(searchQuery) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
    });
  }, [customers, searchQuery]);

  // Invoice calculations
  const invoiceSubtotal = useMemo(() => {
    return newInvoiceItems.reduce((acc, item) => acc + item.amount, 0);
  }, [newInvoiceItems]);

  const invoiceTaxAmount = (invoiceSubtotal * newInvoiceData.taxPercent) / 100;
  const invoiceTotalAmount = invoiceSubtotal + invoiceTaxAmount;

  // Invoice item management
  const addInvoiceItem = () => {
    setNewInvoiceItems((prev) => [
      ...prev,
      {
        id: `item-${Date.now()}`,
        description: '',
        quantity: 1,
        unitPrice: 100000,
        amount: 100000,
      },
    ]);
  };

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setNewInvoiceItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          if (field === 'quantity' || field === 'unitPrice') {
            updated.amount = updated.quantity * updated.unitPrice;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const removeInvoiceItem = (id: string) => {
    if (newInvoiceItems.length <= 1) return;
    setNewInvoiceItems((prev) => prev.filter((item) => item.id !== id));
  };

  // Submit invoice
  const handleSaveInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const customer = customers.find((c) => c.id === newInvoiceData.customerId);
    if (!customer) return;

    const newInvoice: Invoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: `INV/ASTRO/${new Date().getFullYear()}/${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().slice(0, 10),
      dueDate: newInvoiceData.dueDate,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      customerAddress: customer.address,
      items: newInvoiceItems,
      subtotal: invoiceSubtotal,
      taxPercent: newInvoiceData.taxPercent,
      taxAmount: invoiceTaxAmount,
      totalAmount: invoiceTotalAmount,
      status: 'MENUNGGU',
      paymentTerms: newInvoiceData.paymentTerms,
      notes: newInvoiceData.notes,
    };

    onAddInvoice(newInvoice);
    cosmicAudio.playSuccess();
    setIsCreateInvoiceOpen(false);
  };

  // Submit customer
  const handleSaveCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerForm.name.trim()) return;

    onAddCustomer(newCustomerForm);
    cosmicAudio.playSuccess();
    setIsCreateCustomerOpen(false);
    setNewCustomerForm({
      name: '',
      phone: '',
      email: '',
      address: '',
      tier: 'NEBULA_REGULAR',
      notes: '',
    });
  };

  // Generate WhatsApp reminder link
  const openWhatsAppReminder = (inv: Invoice) => {
    const text = `Halo ${inv.customerName},\n\nKami dari *${storeProfile.name}* ingin menginformasikan Faktur Resmi #${inv.invoiceNumber} sebesar *${formatRupiah(inv.totalAmount)}* dengan tanggal jatuh tempo ${formatDateIndo(inv.dueDate)}.\n\nStatus saat ini: ${inv.status}.\nTerima kasih!`;
    const cleanPhone = inv.customerPhone.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('0') ? '62' + cleanPhone.slice(1) : cleanPhone;
    window.open(`https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-4 pb-24">
      {/* Subtab Switcher */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveSubTab('INVOICES')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'INVOICES'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Faktur & Invoice ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('CUSTOMERS')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all ${
              activeSubTab === 'CUSTOMERS'
                ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/20'
                : 'bg-slate-900/60 text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Orbit Pelanggan CRM ({customers.length})</span>
          </button>
        </div>

        <div>
          {activeSubTab === 'INVOICES' ? (
            <button
              onClick={() => setIsCreateInvoiceOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Buat Faktur</span>
            </button>
          ) : (
            <button
              onClick={() => setIsCreateCustomerOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Klien</span>
            </button>
          )}
        </div>
      </div>

      {/* SEARCH AND FILTER BAR */}
      <div className="flex flex-col sm:flex-row gap-2.5">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder={
              activeSubTab === 'INVOICES'
                ? 'Cari nomor invoice atau nama klien...'
                : 'Cari nama pelanggan, nomor telepon, email...'
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl bg-slate-900/80 border border-slate-700/60 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
        </div>

        {activeSubTab === 'INVOICES' && (
          <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'ALL' ? 'bg-amber-400 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Semua
            </button>
            <button
              onClick={() => setStatusFilter('LUNAS')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'LUNAS' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Lunas
            </button>
            <button
              onClick={() => setStatusFilter('MENUNGGU')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'MENUNGGU' ? 'bg-sky-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Menunggu
            </button>
            <button
              onClick={() => setStatusFilter('JATUH_TEMPO')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                statusFilter === 'JATUH_TEMPO' ? 'bg-rose-500 text-white font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Jatuh Tempo
            </button>
          </div>
        )}
      </div>

      {/* VIEW: INVOICES LIST */}
      {activeSubTab === 'INVOICES' && (
        <div className="space-y-3">
          {filteredInvoices.map((inv) => {
            const isPaid = inv.status === 'LUNAS';
            const isDue = inv.status === 'JATUH_TEMPO';

            return (
              <div
                key={inv.id}
                className="p-4 rounded-xl cosmic-glass border border-white/10 hover:border-amber-400/30 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-amber-300">
                      {inv.invoiceNumber}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPaid
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : isDue
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </div>

                  <div className="text-sm font-semibold text-slate-100">
                    {inv.customerName}
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Terbit: {formatDateIndo(inv.date)}</span>
                    <span>·</span>
                    <span className={isDue ? 'text-rose-400 font-bold' : ''}>
                      Jatuh Tempo: {formatDateIndo(inv.dueDate)}
                    </span>
                  </div>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2">
                  <div className="text-sm sm:text-base font-extrabold text-amber-300 font-cosmic">
                    {formatRupiah(inv.totalAmount)}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setSelectedInvoiceForView(inv)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1"
                    >
                      <Printer className="w-3.5 h-3.5 text-slate-400" />
                      <span>Lihat & Cetak</span>
                    </button>

                    {!isPaid && (
                      <>
                        <button
                          onClick={() => openWhatsAppReminder(inv)}
                          className="px-2.5 py-1.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/50 text-emerald-300 border border-emerald-500/30 text-xs font-medium flex items-center gap-1"
                          title="Kirim pengingat WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Kirim WA</span>
                        </button>

                        <button
                          onClick={() => {
                            onUpdateInvoiceStatus(inv.id, 'LUNAS');
                            cosmicAudio.playSuccess();
                          }}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold"
                          title="Tandai sudah lunas"
                        >
                          Tandai Lunas
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {filteredInvoices.length === 0 && (
            <div className="py-16 text-center text-xs text-slate-500">
              Tidak ada faktur pada filter ini.
            </div>
          )}
        </div>
      )}

      {/* VIEW: CUSTOMERS LIST */}
      {activeSubTab === 'CUSTOMERS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {filteredCustomers.map((cust) => {
            const isVIP = cust.tier === 'SUPERNOVA_VIP';
            const isGold = cust.tier === 'PULSAR_GOLD';

            return (
              <div
                key={cust.id}
                className="p-4 rounded-xl cosmic-glass border border-white/10 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-sm text-slate-100">{cust.name}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-slate-500" />
                      <span>{cust.phone}</span>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                      isVIP
                        ? 'bg-amber-400/20 text-amber-300 border border-amber-400/40'
                        : isGold
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    <Award className="w-3 h-3" />
                    <span>{cust.tier.replace('_', ' ')}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/5 text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400">Total Belanja</div>
                    <div className="font-bold text-amber-300 font-cosmic mt-0.5">
                      {formatRupiah(cust.totalSpend)}
                    </div>
                  </div>

                  <div>
                    <div className="text-[10px] text-slate-400">Frekuensi Belanja</div>
                    <div className="font-semibold text-slate-200 mt-0.5">
                      {cust.totalTransactions} Transaksi
                    </div>
                  </div>
                </div>

                {cust.notes && (
                  <p className="text-[11px] text-slate-400 italic bg-slate-900/50 p-2 rounded-lg border border-white/5">
                    "{cust.notes}"
                  </p>
                )}
              </div>
            );
          })}

          {filteredCustomers.length === 0 && (
            <div className="col-span-2 py-16 text-center text-xs text-slate-500">
              Tidak ada pelanggan ditemukan.
            </div>
          )}
        </div>
      )}

      {/* CREATE INVOICE MODAL */}
      {isCreateInvoiceOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-[#0e1227] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative max-h-[92vh] overflow-y-auto">
            <button
              onClick={() => setIsCreateInvoiceOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white font-cosmic mb-1">
              Buat Faktur Tagihan Baru
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Terbitkan faktur profesional bernomor seri resmi Astro Business
            </p>

            <form onSubmit={handleSaveInvoice} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Pilih Pelanggan / Klien</label>
                  <select
                    value={newInvoiceData.customerId}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, customerId: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  >
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Tanggal Jatuh Tempo</label>
                  <input
                    type="date"
                    required
                    value={newInvoiceData.dueDate}
                    onChange={(e) => setNewInvoiceData({ ...newInvoiceData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Line Items */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-slate-300 font-semibold">Rincian Item Tagihan</label>
                  <button
                    type="button"
                    onClick={addInvoiceItem}
                    className="text-amber-400 hover:text-amber-300 text-xs font-semibold flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Tambah Baris</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {newInvoiceItems.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center gap-2"
                    >
                      <input
                        type="text"
                        required
                        placeholder="Deskripsi barang / layanan"
                        value={item.description}
                        onChange={(e) => updateInvoiceItem(item.id, 'description', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100"
                      />

                      <input
                        type="number"
                        min="1"
                        required
                        placeholder="Qty"
                        value={item.quantity}
                        onChange={(e) => updateInvoiceItem(item.id, 'quantity', Number(e.target.value))}
                        className="w-16 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-slate-100 text-center font-mono"
                      />

                      <input
                        type="number"
                        min="0"
                        step="1000"
                        required
                        placeholder="Harga Satuan"
                        value={item.unitPrice}
                        onChange={(e) => updateInvoiceItem(item.id, 'unitPrice', Number(e.target.value))}
                        className="w-28 px-2.5 py-1.5 rounded bg-slate-950 border border-slate-700 text-amber-300 font-mono text-right"
                      />

                      <span className="w-24 text-right font-bold text-amber-400 font-mono">
                        {formatRupiah(item.amount)}
                      </span>

                      {newInvoiceItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeInvoiceItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Calculation Row */}
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1.5 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Subtotal Item:</span>
                  <span className="text-slate-200">{formatRupiah(invoiceSubtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PPN ({newInvoiceData.taxPercent}%):</span>
                  <span className="text-slate-200">{formatRupiah(invoiceTaxAmount)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-slate-100 pt-1 border-t border-slate-800">
                  <span>Total Tagihan:</span>
                  <span className="text-amber-400 font-cosmic">{formatRupiah(invoiceTotalAmount)}</span>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Instruksi Pembayaran</label>
                <input
                  type="text"
                  value={newInvoiceData.paymentTerms}
                  onChange={(e) => setNewInvoiceData({ ...newInvoiceData, paymentTerms: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateInvoiceOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 shadow"
                >
                  Terbitkan Faktur
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CREATE CUSTOMER MODAL */}
      {isCreateCustomerOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#0e1227] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative">
            <button
              onClick={() => setIsCreateCustomerOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white font-cosmic mb-1">
              Daftarkan Pelanggan Baru
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Tambahkan profil pelanggan ke ekosistem CRM Astro
            </p>

            <form onSubmit={handleSaveCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Nama Lengkap / Instansi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sarah Nurhaliza"
                  value={newCustomerForm.name}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Nomor WhatsApp</label>
                  <input
                    type="text"
                    required
                    placeholder="0812-xxxx-xxxx"
                    value={newCustomerForm.phone}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, phone: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Email</label>
                  <input
                    type="email"
                    placeholder="nama@email.com"
                    value={newCustomerForm.email}
                    onChange={(e) => setNewCustomerForm({ ...newCustomerForm, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Tier Keanggotaan</label>
                <select
                  value={newCustomerForm.tier}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, tier: e.target.value as CustomerTier })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-amber-300 font-semibold focus:outline-none focus:border-amber-400"
                >
                  <option value="NEBULA_REGULAR">Nebula Regular (Standar)</option>
                  <option value="PULSAR_GOLD">Pulsar Gold (Loyal)</option>
                  <option value="SUPERNOVA_VIP">Supernova VIP (Korporat / Prioritas)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Alamat</label>
                <input
                  type="text"
                  placeholder="Kota atau alamat lengkap pengiriman"
                  value={newCustomerForm.address}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, address: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Catatan CRM</label>
                <textarea
                  rows={2}
                  placeholder="Preferensi pesanan atau info penting..."
                  value={newCustomerForm.notes}
                  onChange={(e) => setNewCustomerForm({ ...newCustomerForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100"
                />
              </div>

              <div className="pt-3 border-t border-white/10 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCustomerOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-amber-400 text-slate-950 font-bold hover:bg-amber-300 shadow"
                >
                  Simpan Pelanggan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW & PRINT INVOICE MODAL */}
      {selectedInvoiceForView && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-2xl bg-[#0b0e1d] border border-amber-500/30 rounded-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4 no-print">
              <h3 className="text-sm font-bold text-amber-400 flex items-center gap-1.5 font-cosmic">
                <FileText className="w-4 h-4" />
                <span>Pratinjau Faktur Resmi</span>
              </h3>
              <button
                onClick={() => setSelectedInvoiceForView(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* High-fidelity printable invoice sheet */}
            <div className="bg-white text-slate-900 p-8 rounded-xl shadow-lg font-sans text-xs space-y-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start border-b border-slate-200 pb-5">
                <div>
                  <div className="text-xl font-extrabold tracking-tight text-slate-950">
                    {storeProfile.name}
                  </div>
                  <div className="text-slate-600 text-[11px] mt-0.5">
                    {storeProfile.tagline}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-1 max-w-xs">
                    {storeProfile.address} · {storeProfile.phone}
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-amber-600 tracking-wider font-mono">
                    FAKTUR
                  </div>
                  <div className="text-slate-700 font-mono font-bold text-xs mt-1">
                    #{selectedInvoiceForView.invoiceNumber}
                  </div>
                  <div className="text-slate-500 text-[10px] mt-0.5">
                    Tanggal: {formatDateIndo(selectedInvoiceForView.date)}
                  </div>
                  <div className="text-slate-500 text-[10px]">
                    Jatuh Tempo: {formatDateIndo(selectedInvoiceForView.dueDate)}
                  </div>
                </div>
              </div>

              {/* Bill To */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-200 flex justify-between">
                <div>
                  <div className="text-[10px] uppercase font-bold text-slate-400">Tagihan Ditujukan Kepada:</div>
                  <div className="text-sm font-bold text-slate-900 mt-0.5">{selectedInvoiceForView.customerName}</div>
                  <div className="text-[11px] text-slate-600 mt-0.5">{selectedInvoiceForView.customerPhone}</div>
                  {selectedInvoiceForView.customerAddress && (
                    <div className="text-[10px] text-slate-500 mt-0.5">{selectedInvoiceForView.customerAddress}</div>
                  )}
                </div>

                <div className="text-right">
                  <div className="text-[10px] uppercase font-bold text-slate-400">Status Pembayaran:</div>
                  <div className="mt-1">
                    <span
                      className={`font-bold px-2.5 py-1 rounded-md text-[11px] ${
                        selectedInvoiceForView.status === 'LUNAS'
                          ? 'bg-emerald-100 text-emerald-800'
                          : selectedInvoiceForView.status === 'JATUH_TEMPO'
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {selectedInvoiceForView.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Item Table */}
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 text-[10px] uppercase border-y border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">Deskripsi Barang / Layanan</th>
                    <th className="py-2.5 px-3 text-center">Qty</th>
                    <th className="py-2.5 px-3 text-right">Harga Satuan</th>
                    <th className="py-2.5 px-3 text-right">Jumlah</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-800">
                  {selectedInvoiceForView.items.map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2.5 px-3 font-medium">{item.description}</td>
                      <td className="py-2.5 px-3 text-center font-mono">{item.quantity}</td>
                      <td className="py-2.5 px-3 text-right font-mono">{formatRupiah(item.unitPrice)}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold">{formatRupiah(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span className="font-mono text-slate-900">{formatRupiah(selectedInvoiceForView.subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>PPN ({selectedInvoiceForView.taxPercent}%):</span>
                    <span className="font-mono text-slate-900">{formatRupiah(selectedInvoiceForView.taxAmount)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-extrabold text-slate-950 pt-2 border-t border-slate-300">
                    <span>TOTAL:</span>
                    <span className="font-mono text-amber-600">{formatRupiah(selectedInvoiceForView.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Terms and notes */}
              <div className="border-t border-slate-200 pt-3 text-[10px] text-slate-500 space-y-1">
                <div><b>Instruksi Pembayaran:</b> {selectedInvoiceForView.paymentTerms}</div>
                {selectedInvoiceForView.notes && <div><b>Catatan:</b> {selectedInvoiceForView.notes}</div>}
              </div>
            </div>

            {/* Print and WhatsApp buttons */}
            <div className="flex items-center justify-end gap-2 mt-4 no-print">
              <button
                onClick={() => openWhatsAppReminder(selectedInvoiceForView)}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <Share2 className="w-4 h-4" />
                <span>Kirim Link Tagihan ke WhatsApp</span>
              </button>

              <button
                onClick={() => window.print()}
                className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow"
              >
                <Printer className="w-4 h-4" />
                <span>Cetak Faktur Resmi</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
