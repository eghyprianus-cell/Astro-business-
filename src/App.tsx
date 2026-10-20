/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  Product,
  Transaction,
  Expense,
  Income,
  StockMovement,
  Customer,
  Invoice,
  StoreProfile,
} from './types/business';
import {
  INITIAL_PRODUCTS,
  INITIAL_TRANSACTIONS,
  INITIAL_EXPENSES,
  INITIAL_INCOMES,
  INITIAL_STOCK_MOVEMENTS,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_STORE_PROFILE,
} from './data/initialData';
import { AndroidShell, TabType } from './components/layout/AndroidShell';
import { StarfieldCanvas } from './components/cosmic/StarfieldCanvas';
import { DashboardTab } from './components/dashboard/DashboardTab';
import { PosTab } from './components/pos/PosTab';
import { InventoryTab } from './components/inventory/InventoryTab';
import { FinanceTab } from './components/finance/FinanceTab';
import { AutomatedReportTab } from './components/reports/AutomatedReportTab';
import { InvoicingTab } from './components/invoicing/InvoicingTab';
import { SettingsModal } from './components/settings/SettingsModal';

const STORAGE_KEYS = {
  PRODUCTS: 'astro_biz_products_v1',
  TRANSACTIONS: 'astro_biz_transactions_v1',
  EXPENSES: 'astro_biz_expenses_v1',
  INCOMES: 'astro_biz_incomes_v1',
  MOVEMENTS: 'astro_biz_movements_v1',
  CUSTOMERS: 'astro_biz_customers_v1',
  INVOICES: 'astro_biz_invoices_v1',
  PROFILE: 'astro_biz_profile_v1',
  FRAME_MODE: 'astro_biz_frame_mode_v1',
};

export default function App() {
  // Load state from localStorage with fallback to initial data
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PRODUCTS);
      return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
    } catch {
      return INITIAL_PRODUCTS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
    } catch {
      return INITIAL_EXPENSES;
    }
  });

  const [incomes, setIncomes] = useState<Income[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INCOMES);
      return saved ? JSON.parse(saved) : INITIAL_INCOMES;
    } catch {
      return INITIAL_INCOMES;
    }
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MOVEMENTS);
      return saved ? JSON.parse(saved) : INITIAL_STOCK_MOVEMENTS;
    } catch {
      return INITIAL_STOCK_MOVEMENTS;
    }
  });

  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CUSTOMERS);
      return saved ? JSON.parse(saved) : INITIAL_CUSTOMERS;
    } catch {
      return INITIAL_CUSTOMERS;
    }
  });

  const [invoices, setInvoices] = useState<Invoice[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.INVOICES);
      return saved ? JSON.parse(saved) : INITIAL_INVOICES;
    } catch {
      return INITIAL_INVOICES;
    }
  });

  const [storeProfile, setStoreProfile] = useState<StoreProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
      return saved ? JSON.parse(saved) : INITIAL_STORE_PROFILE;
    } catch {
      return INITIAL_STORE_PROFILE;
    }
  });

  // UI Navigation states
  const [activeTab, setActiveTab] = useState<TabType>('dashboard');
  const [isAndroidFrameMode, setIsAndroidFrameMode] = useState<boolean>(() => {
    try {
      // By default on wide screens, frame mode provides high-fidelity Android experience
      const saved = localStorage.getItem(STORAGE_KEYS.FRAME_MODE);
      return saved !== null ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  // Modals controlled from anywhere
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isCreateProductOpen, setIsCreateProductOpen] = useState(false);
  const [isCreateExpenseOpen, setIsCreateExpenseOpen] = useState(false);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INCOMES, JSON.stringify(incomes));
  }, [incomes]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MOVEMENTS, JSON.stringify(stockMovements));
  }, [stockMovements]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CUSTOMERS, JSON.stringify(customers));
  }, [customers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVOICES, JSON.stringify(invoices));
  }, [invoices]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(storeProfile));
  }, [storeProfile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FRAME_MODE, JSON.stringify(isAndroidFrameMode));
  }, [isAndroidFrameMode]);

  // Handlers
  const handleCompleteTransaction = (tx: Transaction) => {
    // 1. Deduct product inventory stock & log stock movements
    const posMovements: StockMovement[] = [];
    setProducts((prevProducts) => {
      const productMap = new Map(prevProducts.map((p) => [p.id, { ...p }]));
      tx.items.forEach((item) => {
        const prod = productMap.get(item.productId);
        if (prod) {
          prod.stock = Math.max(0, prod.stock - item.quantity);
          posMovements.push({
            id: `mov-${Date.now()}-${item.productId}`,
            productId: item.productId,
            productName: item.productName,
            type: 'OUT',
            quantity: item.quantity,
            date: tx.date,
            reason: 'PENJUALAN_POS',
            notes: `Penjualan Kasir #${tx.invoiceNumber} (${tx.customerName})`,
            performedBy: tx.cashierName,
          });
        }
      });
      return Array.from(productMap.values());
    });

    if (posMovements.length > 0) {
      setStockMovements((prev) => [...posMovements, ...prev]);
    }

    // 2. Add transaction to top
    setTransactions((prev) => [tx, ...prev]);

    // 3. Update customer spend if applicable
    if (tx.customerId) {
      setCustomers((prevCustomers) =>
        prevCustomers.map((c) => {
          if (c.id === tx.customerId) {
            const newSpend = c.totalSpend + tx.total;
            const newCount = c.totalTransactions + 1;
            let tier = c.tier;
            if (newSpend >= 4000000) tier = 'SUPERNOVA_VIP';
            else if (newSpend >= 1500000) tier = 'PULSAR_GOLD';
            return {
              ...c,
              totalSpend: newSpend,
              totalTransactions: newCount,
              tier,
            };
          }
          return c;
        })
      );
    }
  };

  const handleAddProduct = (newProdData: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...newProdData,
      id: `prod-${Date.now()}`,
    };
    setProducts((prev) => [newProduct, ...prev]);

    // Record initial stock entry
    if (newProdData.stock > 0) {
      setStockMovements((prev) => [
        {
          id: `mov-${Date.now()}`,
          productId: newProduct.id,
          productName: newProduct.name,
          type: 'IN',
          quantity: newProdData.stock,
          date: new Date().toISOString(),
          reason: 'PENYESUAIAN_STOK',
          notes: 'Stok awal saat pendaftaran produk baru',
          performedBy: storeProfile.cashierName || 'Arya Kosmik',
        },
        ...prev,
      ]);
    }
  };

  const handleUpdateProduct = (updatedProd: Product) => {
    setProducts((prev) => prev.map((p) => (p.id === updatedProd.id ? updatedProd : p)));
  };

  const handleDeleteProduct = (productId: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const handleAddStockMovement = (movData: Omit<StockMovement, 'id'>) => {
    const newMovement: StockMovement = {
      ...movData,
      id: `mov-${Date.now()}`,
    };
    setStockMovements((prev) => [newMovement, ...prev]);

    // Apply delta to product stock
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id === movData.productId) {
          const delta = movData.type === 'IN' ? movData.quantity : -movData.quantity;
          return {
            ...p,
            stock: Math.max(0, p.stock + delta),
          };
        }
        return p;
      })
    );
  };

  const handleAddExpense = (newExpData: Omit<Expense, 'id'>) => {
    const newExpense: Expense = {
      ...newExpData,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
  };

  const handleAddIncome = (newIncData: Omit<Income, 'id'>) => {
    const newIncome: Income = {
      ...newIncData,
      id: `inc-${Date.now()}`,
    };
    setIncomes((prev) => [newIncome, ...prev]);
  };

  const handleAddCustomer = (
    newCustData: Omit<Customer, 'id' | 'totalSpend' | 'totalTransactions' | 'joinedDate'>
  ): Customer => {
    const newCustomer: Customer = {
      ...newCustData,
      id: `cust-${Date.now()}`,
      totalSpend: 0,
      totalTransactions: 0,
      joinedDate: new Date().toISOString().slice(0, 10),
    };
    setCustomers((prev) => [newCustomer, ...prev]);
    return newCustomer;
  };

  const handleUpdateCustomer = (updated: Customer) => {
    setCustomers((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
  };

  const handleDeleteCustomer = (customerId: string) => {
    setCustomers((prev) => prev.filter((c) => c.id !== customerId));
  };

  const handleAddInvoice = (newInvoice: Invoice) => {
    setInvoices((prev) => [newInvoice, ...prev]);
  };

  const handleUpdateInvoiceStatus = (invoiceId: string, status: Invoice['status']) => {
    setInvoices((prev) =>
      prev.map((inv) => (inv.id === invoiceId ? { ...inv, status } : inv))
    );
  };

  // Backup and Restore
  const handleExportAllData = () => {
    const fullBackup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      storeProfile,
      products,
      transactions,
      expenses,
      incomes,
      stockMovements,
      customers,
      invoices,
    };
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(fullBackup, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `astro-business-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const parsed = JSON.parse(content);
        if (parsed.products) setProducts(parsed.products);
        if (parsed.transactions) setTransactions(parsed.transactions);
        if (parsed.expenses) setExpenses(parsed.expenses);
        if (parsed.incomes) setIncomes(parsed.incomes);
        if (parsed.stockMovements) setStockMovements(parsed.stockMovements);
        if (parsed.customers) setCustomers(parsed.customers);
        if (parsed.invoices) setInvoices(parsed.invoices);
        if (parsed.storeProfile) setStoreProfile(parsed.storeProfile);
        alert('Data berhasil dipulihkan dari berkas cadangan!');
        setIsSettingsOpen(false);
      } catch (err) {
        alert('Format berkas JSON tidak valid.');
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    setProducts(INITIAL_PRODUCTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setExpenses(INITIAL_EXPENSES);
    setIncomes(INITIAL_INCOMES);
    setStockMovements(INITIAL_STOCK_MOVEMENTS);
    setCustomers(INITIAL_CUSTOMERS);
    setInvoices(INITIAL_INVOICES);
    setStoreProfile(INITIAL_STORE_PROFILE);
    localStorage.clear();
  };

  // Alerts calculation
  const criticalStockCount = products.filter((p) => p.stock <= p.minStock).length;
  const overdueInvoiceCount = invoices.filter((i) => i.status === 'JATUH_TEMPO').length;
  const totalAlerts = criticalStockCount + overdueInvoiceCount;

  return (
    <div className="min-h-screen bg-[#06070d] text-slate-100 flex flex-col relative font-sans">
      {/* Background Starfield Canvas */}
      <StarfieldCanvas />

      {/* Main Android Shell Frame */}
      <AndroidShell
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        storeProfile={storeProfile}
        isAndroidFrameMode={isAndroidFrameMode}
        onToggleFrameMode={() => setIsAndroidFrameMode((prev) => !prev)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        alertCount={totalAlerts}
      >
        {activeTab === 'dashboard' && (
          <DashboardTab
            products={products}
            transactions={transactions}
            expenses={expenses}
            onNavigateTab={setActiveTab}
            onOpenNewProductModal={() => {
              setActiveTab('inventory');
              setIsCreateProductOpen(true);
            }}
            onOpenNewExpenseModal={() => {
              setActiveTab('finance');
              setIsCreateExpenseOpen(true);
            }}
          />
        )}

        {activeTab === 'pos' && (
          <PosTab
            products={products}
            customers={customers}
            transactions={transactions}
            storeProfile={storeProfile}
            onCompleteTransaction={handleCompleteTransaction}
            onAddNewCustomer={(name, phone) =>
              handleAddCustomer({
                name,
                phone,
                email: '',
                tier: 'NEBULA_REGULAR',
              })
            }
          />
        )}

        {activeTab === 'inventory' && (
          <InventoryTab
            products={products}
            transactions={transactions}
            stockMovements={stockMovements}
            storeProfile={storeProfile}
            onAddProduct={handleAddProduct}
            onUpdateProduct={handleUpdateProduct}
            onDeleteProduct={handleDeleteProduct}
            onAddStockMovement={handleAddStockMovement}
            isCreateModalOpen={isCreateProductOpen}
            setIsCreateModalOpen={setIsCreateProductOpen}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceTab
            transactions={transactions}
            expenses={expenses}
            incomes={incomes}
            storeProfile={storeProfile}
            onAddExpense={handleAddExpense}
            onAddIncome={handleAddIncome}
            onUpdateStoreProfile={setStoreProfile}
            isCreateExpenseOpen={isCreateExpenseOpen}
            setIsCreateExpenseOpen={setIsCreateExpenseOpen}
          />
        )}

        {activeTab === 'reports' && (
          <AutomatedReportTab
            products={products}
            transactions={transactions}
            expenses={expenses}
            incomes={incomes}
            stockMovements={stockMovements}
            storeProfile={storeProfile}
            onUpdateStoreProfile={setStoreProfile}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'invoices' && (
          <InvoicingTab
            invoices={invoices}
            customers={customers}
            storeProfile={storeProfile}
            onAddInvoice={handleAddInvoice}
            onUpdateInvoiceStatus={handleUpdateInvoiceStatus}
            onAddCustomer={handleAddCustomer}
          />
        )}
      </AndroidShell>

      {/* Global Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        storeProfile={storeProfile}
        onUpdateStoreProfile={setStoreProfile}
        isAndroidFrameMode={isAndroidFrameMode}
        onToggleAndroidFrameMode={() => setIsAndroidFrameMode((prev) => !prev)}
        onExportAllData={handleExportAllData}
        onImportData={handleImportData}
        onResetDemoData={handleResetDemoData}
      />
    </div>
  );
}
