export type ConstellationTag = 
  | 'Polaris' 
  | 'Orion' 
  | 'Sirius' 
  | 'Cassiopeia' 
  | 'Andromeda' 
  | 'Pegasus' 
  | 'Centaurus';

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  minStock: number;
  unit: string;
  constellationTag: ConstellationTag;
  description?: string;
  iconType?: string;
  isPopular?: boolean;
}

export type StockMovementType = 'IN' | 'OUT';

export type StockMovementReason =
  | 'RESTOCK_PEMBELIAN'
  | 'PENJUALAN_POS'
  | 'BARANG_RUSAK'
  | 'RETUR_SUPPLIER'
  | 'PENYESUAIAN_STOK'
  | 'SAMPEL_PROMOSI';

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  type: StockMovementType;
  quantity: number;
  date: string;
  reason: StockMovementReason;
  notes?: string;
  performedBy: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  discountPercent?: number;
}

export type PaymentMethod = 
  | 'TUNAI' 
  | 'QRIS_STELLAR' 
  | 'TRANSFER_BANK' 
  | 'TEMPO_PIUTANG';

export interface TransactionItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  items: TransactionItem[];
  subtotal: number;
  discountAmount: number;
  taxAmount: number;
  total: number;
  profit: number;
  paymentMethod: PaymentMethod;
  cashReceived?: number;
  cashChange?: number;
  customerId?: string;
  customerName: string;
  customerPhone?: string;
  cashierName: string;
  notes?: string;
  status: 'COMPLETED' | 'CANCELLED';
}

export type ExpenseCategory =
  | 'Operasional Rutin'
  | 'Bahan Baku & Stok'
  | 'Gaji & Honorarium'
  | 'Pemasaran & Iklan Orbit'
  | 'Peralatan & Perawatan'
  | 'Logistik & Ekspedisi'
  | 'Administrasi & Pajak'
  | 'Lainnya';

export interface Expense {
  id: string;
  date: string;
  category: ExpenseCategory | string;
  amount: number;
  description: string;
  paymentMethod: string;
  recordedBy: string;
}

export type IncomeCategory =
  | 'Penjualan Tambahan'
  | 'Jasa & Konsultasi'
  | 'Sponsorship & Kemitraan'
  | 'Injeksi Modal Usaha'
  | 'Pendapatan Lainnya';

export interface Income {
  id: string;
  date: string;
  category: IncomeCategory | string;
  amount: number;
  description: string;
  paymentMethod: string;
  recordedBy: string;
}

export type CustomerTier = 'SUPERNOVA_VIP' | 'PULSAR_GOLD' | 'NEBULA_REGULAR' | 'BINTANG_BARU';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address?: string;
  tier: CustomerTier;
  totalSpend: number;
  totalTransactions: number;
  joinedDate: string;
  lastVisitDate?: string;
  preferences?: string;
  tags?: string[];
  favoriteProduct?: string;
  notes?: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  date: string;
  dueDate: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress?: string;
  items: InvoiceItem[];
  subtotal: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
  status: 'LUNAS' | 'MENUNGGU' | 'JATUH_TEMPO';
  paymentTerms: string;
  notes?: string;
}

export interface BusinessTarget {
  monthlyRevenueTarget: number;
  monthlyProfitTarget: number;
  monthlyTransactionsTarget: number;
  targetMonth: string;
}

export interface StoreProfile {
  name: string;
  tagline: string;
  address: string;
  phone: string;
  email: string;
  currency: string;
  taxRatePercent: number;
  receiptHeader: string;
  receiptFooter: string;
  cashierName: string;
  initialCapital: number;
  initialCapitalDate: string;
  businessTarget?: BusinessTarget;
}

