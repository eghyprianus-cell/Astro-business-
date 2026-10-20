import React, { useState } from 'react';
import { Product, Transaction } from '../../types/business';
import { CONSTELLATION_CONFIG, formatRupiah } from '../../utils/formatters';
import { Sparkles, ArrowUpRight } from 'lucide-react';

interface ConstellationChartProps {
  products: Product[];
  transactions: Transaction[];
  onSelectProduct?: (product: Product) => void;
}

export const ConstellationChart: React.FC<ConstellationChartProps> = ({
  products,
  transactions,
  onSelectProduct,
}) => {
  const [activeProductId, setActiveProductId] = useState<string | null>(null);

  // Calculate sold qty & revenue per product
  const productStats = products.map((prod) => {
    let soldQty = 0;
    let revenue = 0;
    transactions.forEach((tx) => {
      tx.items.forEach((item) => {
        if (item.productId === prod.id) {
          soldQty += item.quantity;
          revenue += item.subtotal;
        }
      });
    });
    return {
      product: prod,
      soldQty,
      revenue,
    };
  });

  // Top 6 products for the constellation map
  const topNodes = [...productStats]
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6);

  // Geometric positions on a 100x100 relative SVG coordinate system (like an astrology constellation)
  const nodePositions = [
    { x: 50, y: 18 },  // Polaris / Center top
    { x: 22, y: 38 },  // Orion left
    { x: 78, y: 34 },  // Sirius right
    { x: 34, y: 72 },  // Andromeda bottom-left
    { x: 70, y: 78 },  // Cassiopeia bottom-right
    { x: 50, y: 52 },  // Core / Nucleus
  ];

  // Connecting celestial lines
  const constellationBonds = [
    [0, 1],
    [0, 2],
    [1, 5],
    [2, 5],
    [1, 3],
    [2, 4],
    [3, 5],
    [4, 5],
    [3, 4],
  ];

  const maxRevenue = Math.max(...topNodes.map((n) => n.revenue), 100000);
  const activeNode = topNodes.find((n) => n.product.id === activeProductId) || topNodes[0];

  return (
    <div className="relative rounded-2xl cosmic-glass p-5 border border-amber-500/15 overflow-hidden">
      {/* Decorative cosmic aura */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-violet-600/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-base font-semibold text-slate-100 tracking-wide font-cosmic">
              Peta Konstelasi Penjualan
            </h3>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Jaringan orbit omset produk terlaris di Astro Business
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-amber-400/90 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interaktif</span>
        </div>
      </div>

      {/* Constellation SVG Canvas */}
      <div className="relative w-full aspect-[16/10] sm:aspect-[2/1] max-h-72 flex items-center justify-center">
        <svg
          viewBox="0 0 100 95"
          className="w-full h-full overflow-visible drop-shadow-[0_0_12px_rgba(124,58,237,0.3)]"
        >
          <defs>
            <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="bondGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(245, 158, 11, 0.4)" />
              <stop offset="50%" stopColor="rgba(168, 85, 247, 0.3)" />
              <stop offset="100%" stopColor="rgba(56, 189, 248, 0.4)" />
            </linearGradient>
          </defs>

          {/* Background Orbit Ring */}
          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="rgba(255, 255, 255, 0.05)"
            strokeDasharray="2 3"
          />
          <circle
            cx="50"
            cy="50"
            r="22"
            fill="none"
            stroke="rgba(245, 158, 11, 0.08)"
            strokeDasharray="3 4"
          />

          {/* Connection Lines (Constellation Bonds) */}
          {constellationBonds.map(([fromIdx, toIdx], idx) => {
            if (fromIdx >= topNodes.length || toIdx >= topNodes.length) return null;
            const fromPos = nodePositions[fromIdx];
            const toPos = nodePositions[toIdx];
            const isHighlight =
              activeNode &&
              (topNodes[fromIdx]?.product.id === activeNode.product.id ||
                topNodes[toIdx]?.product.id === activeNode.product.id);

            return (
              <line
                key={`bond-${idx}`}
                x1={fromPos.x}
                y1={fromPos.y}
                x2={toPos.x}
                y2={toPos.y}
                stroke={isHighlight ? '#fbbf24' : 'rgba(255, 255, 255, 0.16)'}
                strokeWidth={isHighlight ? 1.2 : 0.6}
                strokeDasharray={isHighlight ? 'none' : '1.5 2'}
                className="transition-all duration-300"
              />
            );
          })}

          {/* Constellation Star Nodes */}
          {topNodes.map((item, idx) => {
            const pos = nodePositions[idx];
            const isSelected = activeNode?.product.id === item.product.id;
            const radius = 3.5 + (item.revenue / maxRevenue) * 3;
            const cfg = CONSTELLATION_CONFIG[item.product.constellationTag] || CONSTELLATION_CONFIG.Polaris;

            return (
              <g
                key={item.product.id}
                className="cursor-pointer group"
                onClick={() => {
                  setActiveProductId(item.product.id);
                  if (onSelectProduct) onSelectProduct(item.product);
                }}
              >
                {/* Outer pulsing ring for selected or top node */}
                {isSelected && (
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={radius + 4}
                    fill="none"
                    stroke="#fbbf24"
                    strokeWidth="0.8"
                    opacity="0.8"
                    className="animate-ping"
                    style={{ animationDuration: '3s' }}
                  />
                )}

                {/* Halo aura */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius + 2.5}
                  fill={cfg.glow}
                  opacity={isSelected ? 0.9 : 0.4}
                  className="transition-opacity duration-300"
                />

                {/* Core Star Body */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius}
                  fill={isSelected ? '#ffffff' : '#f8fafc'}
                  stroke="#fbbf24"
                  strokeWidth={isSelected ? '1.5' : '0.8'}
                />

                {/* Star center dot */}
                <circle
                  cx={pos.x}
                  cy={pos.y}
                  r={radius * 0.45}
                  fill={isSelected ? '#f59e0b' : '#38bdf8'}
                />

                {/* Label text */}
                <text
                  x={pos.x}
                  y={pos.y + radius + 4.5}
                  textAnchor="middle"
                  className="text-[3.2px] fill-slate-300 font-medium select-none pointer-events-none drop-shadow"
                >
                  {item.product.name.split(' ')[0]}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Active Node Detail Card */}
      {activeNode && (
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300 font-bold text-sm">
              ★
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-slate-200">
                  {activeNode.product.name}
                </span>
                <span className="text-[10px] text-amber-300 font-mono">
                  ({activeNode.product.constellationTag})
                </span>
              </div>
              <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                <span>Terjual: <b className="text-slate-200">{activeNode.soldQty} {activeNode.product.unit}</b></span>
                <span>·</span>
                <span>Stok: <b className={activeNode.product.stock <= activeNode.product.minStock ? 'text-rose-400' : 'text-slate-200'}>{activeNode.product.stock}</b></span>
              </div>
            </div>
          </div>

          <div className="text-right">
            <div className="text-[10px] text-slate-400">Total Omset</div>
            <div className="text-sm font-bold text-amber-400 font-cosmic">
              {formatRupiah(activeNode.revenue)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
