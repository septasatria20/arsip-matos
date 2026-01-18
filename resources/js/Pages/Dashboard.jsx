import React from 'react';
import { 
  FileText, Clock, CheckCircle, AlertCircle, 
  ArrowUpRight, Plus, FilePlus, Activity,
  Calendar, Package, DollarSign, TrendingUp, TrendingDown
} from 'lucide-react';

// Import Laravel Asli (Aktifkan ini)
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link } from '@inertiajs/react';

// Grafik Bar Chart Sederhana (lebih kontras dan selalu terlihat)
const SimpleBarChart = ({ data }) => {
  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        Belum ada data surat masuk tahun ini.
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.letters || 0), 1);
  const scale = 180 / maxVal; // tinggi maksimum 180px
  const hasData = data.some(d => d.letters > 0);

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-64 w-full gap-2 px-2">
        {data.map((item, idx) => {
          const letters = item.letters || 0;
          const approved = item.approved || 0;

          // Pakai skala pixel agar selalu terlihat
          const totalHeightPx = letters > 0 ? Math.max(letters * scale, 16) : 6;
          const approvedHeightPx = letters > 0 ? Math.max((approved / letters) * totalHeightPx, approved > 0 ? 8 : 0) : 0;

          return (
            <div key={idx} className="flex flex-col items-center flex-1 min-w-0">
              <div className="relative w-full h-56 flex items-end justify-center group">
                {/* Tooltip */}
                {letters > 0 && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-3 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-10">
                    {item.month}: {letters} Surat ({approved} Approved)
                  </div>
                )}

                {/* Track bar */}
                <div className="w-5 sm:w-6 bg-slate-100 rounded-lg overflow-hidden relative flex items-end">
                  {/* Total bar */}
                  <div
                    style={{ height: `${totalHeightPx}px` }}
                    className="w-full bg-indigo-200/80 rounded-t-lg relative transition-all duration-200"
                  >
                    {/* Approved portion */}
                    {approvedHeightPx > 0 && (
                      <div
                        style={{ height: `${approvedHeightPx}px` }}
                        className="w-full absolute bottom-0 left-0 bg-indigo-600 rounded-t-lg"
                      ></div>
                    )}
                  </div>
                </div>
              </div>

              {/* Month label */}
              <span className="text-xs text-slate-600 font-medium mt-3">{item.month}</span>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-200 rounded border border-indigo-300"></div>
          <span className="text-sm text-slate-600">Total Surat</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-indigo-600 rounded"></div>
          <span className="text-sm text-slate-600">Approved</span>
        </div>
      </div>

      {!hasData && (
        <div className="text-center mt-4 text-sm text-slate-400 bg-slate-50 py-3 rounded-lg">
          Belum ada data surat untuk tahun ini. Mulai buat surat untuk melihat statistik.
        </div>
      )}
    </div>
  );
};

// Grafik Batang untuk Event Per Bulan
const EventBarChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-slate-400 text-center py-8">Tidak ada data event</div>;

  const maxVal = Math.max(...data.map(d => d.total || 0), 1);
  const scale = 180 / maxVal;

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-64 w-full gap-2 px-2">
        {data.map((item, idx) => {
          const total = item.total || 0;
          const heightPx = total > 0 ? Math.max(total * scale, 16) : 6;

          return (
            <div key={idx} className="flex flex-col items-center flex-1 min-w-0">
              <div className="relative w-full h-56 flex items-end justify-center group">
                {total > 0 && (
                  <div className="absolute -top-12 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs py-1 px-3 rounded-lg whitespace-nowrap pointer-events-none shadow-lg z-10">
                    {item.month}: {total} Event
                  </div>
                )}
                <div className="w-5 sm:w-6 bg-slate-100 rounded-lg overflow-hidden relative flex items-end">
                  <div
                    style={{ height: `${heightPx}px` }}
                    className="w-full bg-purple-500 rounded-t-lg transition-all duration-200"
                  ></div>
                </div>
              </div>
              <span className="text-xs text-slate-600 font-medium mt-3">{item.month}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Grafik Combo (Bar + Line) untuk Budgeting Income
const BudgetingIncomeChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-slate-400 text-center py-8">Tidak ada data pemasukan</div>;

  const [hoveredBar, setHoveredBar] = React.useState(null);

  // Ambil nilai maksimum untuk scaling
  const maxVal = Math.max(
    ...data.map(d => Math.max(d.income_budget || 0, d.income || 0)),
    1000000
  );
  const scale = 180 / maxVal;

  // Format Rupiah
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const formatShort = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val;
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-72 w-full gap-1 px-2 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-slate-400 pr-2">
          <span>{formatShort(maxVal)}</span>
          <span>{formatShort(maxVal * 0.75)}</span>
          <span>{formatShort(maxVal * 0.5)}</span>
          <span>{formatShort(maxVal * 0.25)}</span>
          <span>0</span>
        </div>

        <div className="ml-12 flex-1 h-full relative">
          <svg className="absolute inset-0 w-full h-64" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((pct) => (
              <line
                key={pct}
                x1="0"
                y1={`${100 - pct}%`}
                x2="100%"
                y2={`${100 - pct}%`}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            ))}

            {/* Line Chart untuk Trend */}
            <polyline
              fill="none"
              stroke="#10b981"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={data
                .map((item, idx) => {
                  const x = ((idx + 0.5) / data.length) * 100;
                  const y = 100 - ((item.income || 0) / maxVal * 100);
                  return `${x}%,${y}%`;
                })
                .join(' ')}
            />

            {/* Dots pada line */}
            {data.map((item, idx) => {
              const x = ((idx + 0.5) / data.length) * 100;
              const y = 100 - ((item.income || 0) / maxVal * 100);
              return (
                <circle
                  key={`dot-${idx}`}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Bar Chart Container */}
          <div className="relative h-64 flex items-end justify-between">
            {data.map((item, idx) => {
              const budgetHeight = Math.max((item.income_budget || 0) * scale, 4);
              const actualHeight = Math.max((item.income || 0) * scale, 4);
              const isExceeded = (item.income || 0) >= (item.income_budget || 0);

              return (
                <div key={idx} className="flex flex-col items-center flex-1 min-w-0 relative group">
                  {/* Tooltip */}
                  {hoveredBar === idx && (
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-20 shadow-lg">
                      <div className="font-semibold mb-1">{item.month}</div>
                      <div className="text-green-200">Target: {formatRupiah(item.income_budget || 0)}</div>
                      <div className="text-green-300 font-bold">Actual: {formatRupiah(item.income || 0)}</div>
                      <div className={isExceeded ? 'text-green-400' : 'text-amber-300'}>
                        {isExceeded ? '✓ Tercapai' : '⚠ Kurang'}
                      </div>
                    </div>
                  )}

                  <div 
                    className="relative w-full flex gap-1 items-end h-64 px-1"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Target Budget Bar (Abu-abu/Hijau muda) */}
                    <div className="flex-1 bg-slate-200 rounded-t transition-all duration-200 group-hover:bg-slate-300" style={{ height: `${budgetHeight}px` }}></div>
                    
                    {/* Actual Income Bar (Hijau) */}
                    <div className={`flex-1 rounded-t transition-all duration-200 ${isExceeded ? 'bg-green-600 group-hover:bg-green-700' : 'bg-green-500 group-hover:bg-green-600'}`} style={{ height: `${actualHeight}px` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex justify-between mt-2 ml-12">
        {data.map((item, idx) => (
          <span key={idx} className="text-xs text-slate-600 font-medium flex-1 text-center">{item.month}</span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded border border-slate-300"></div>
          <span className="text-sm text-slate-600">Target Budget</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span className="text-sm text-slate-600">Pemasukan Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow"></div>
          <span className="text-sm text-slate-600">Trend Line</span>
        </div>
      </div>
    </div>
  );
};

// Grafik Combo (Bar + Line) untuk Budgeting Expense
const BudgetingExpenseChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-slate-400 text-center py-8">Tidak ada data pengeluaran</div>;

  const [hoveredBar, setHoveredBar] = React.useState(null);

  // Ambil nilai maksimum untuk scaling
  const maxVal = Math.max(
    ...data.map(d => Math.max(d.expense_budget || 0, d.expense || 0)),
    1000000
  );
  const scale = 180 / maxVal;

  // Format Rupiah
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  const formatShort = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val;
  };

  return (
    <div className="w-full">
      <div className="flex items-end justify-between h-72 w-full gap-1 px-2 relative">
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-12 flex flex-col justify-between text-xs text-slate-400 pr-2">
          <span>{formatShort(maxVal)}</span>
          <span>{formatShort(maxVal * 0.75)}</span>
          <span>{formatShort(maxVal * 0.5)}</span>
          <span>{formatShort(maxVal * 0.25)}</span>
          <span>0</span>
        </div>

        <div className="ml-12 flex-1 h-full relative">
          <svg className="absolute inset-0 w-full h-64" preserveAspectRatio="none">
            {/* Grid lines */}
            {[0, 25, 50, 75, 100].map((pct) => (
              <line
                key={pct}
                x1="0"
                y1={`${100 - pct}%`}
                x2="100%"
                y2={`${100 - pct}%`}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            ))}

            {/* Line Chart untuk Trend */}
            <polyline
              fill="none"
              stroke="#ef4444"
              strokeWidth="2.5"
              strokeLinejoin="round"
              strokeLinecap="round"
              points={data
                .map((item, idx) => {
                  const x = ((idx + 0.5) / data.length) * 100;
                  const y = 100 - ((item.expense || 0) / maxVal * 100);
                  return `${x}%,${y}%`;
                })
                .join(' ')}
            />

            {/* Dots pada line */}
            {data.map((item, idx) => {
              const x = ((idx + 0.5) / data.length) * 100;
              const y = 100 - ((item.expense || 0) / maxVal * 100);
              return (
                <circle
                  key={`dot-${idx}`}
                  cx={`${x}%`}
                  cy={`${y}%`}
                  r="4"
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth="2"
                />
              );
            })}
          </svg>

          {/* Bar Chart Container */}
          <div className="relative h-64 flex items-end justify-between">
            {data.map((item, idx) => {
              const budgetHeight = Math.max((item.expense_budget || 0) * scale, 4);
              const actualHeight = Math.max((item.expense || 0) * scale, 4);
              const isOverBudget = (item.expense || 0) > (item.expense_budget || 0);

              return (
                <div key={idx} className="flex flex-col items-center flex-1 min-w-0 relative group">
                  {/* Tooltip */}
                  {hoveredBar === idx && (
                    <div className="absolute -top-20 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-2 px-3 rounded-lg whitespace-nowrap z-20 shadow-lg">
                      <div className="font-semibold mb-1">{item.month}</div>
                      <div className="text-red-200">Limit: {formatRupiah(item.expense_budget || 0)}</div>
                      <div className="text-red-300 font-bold">Actual: {formatRupiah(item.expense || 0)}</div>
                      <div className={isOverBudget ? 'text-amber-300' : 'text-green-400'}>
                        {isOverBudget ? '⚠ Over Budget' : '✓ Aman'}
                      </div>
                    </div>
                  )}

                  <div 
                    className="relative w-full flex gap-1 items-end h-64 px-1"
                    onMouseEnter={() => setHoveredBar(idx)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Budget Limit Bar (Abu-abu/Merah muda) */}
                    <div className="flex-1 bg-slate-200 rounded-t transition-all duration-200 group-hover:bg-slate-300" style={{ height: `${budgetHeight}px` }}></div>
                    
                    {/* Actual Expense Bar (Merah) */}
                    <div className={`flex-1 rounded-t transition-all duration-200 ${isOverBudget ? 'bg-red-700 group-hover:bg-red-800' : 'bg-red-500 group-hover:bg-red-600'}`} style={{ height: `${actualHeight}px` }}></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Month labels */}
      <div className="flex justify-between mt-2 ml-12">
        {data.map((item, idx) => (
          <span key={idx} className="text-xs text-slate-600 font-medium flex-1 text-center">{item.month}</span>
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-slate-200 rounded border border-slate-300"></div>
          <span className="text-sm text-slate-600">Budget Limit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span className="text-sm text-slate-600">Pengeluaran Actual</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full border-2 border-white shadow"></div>
          <span className="text-sm text-slate-600">Trend Line</span>
        </div>
      </div>
    </div>
  );
};

// Grafik Garis untuk Budgeting (DEPRECATED - diganti dengan 2 grafik terpisah di atas)
const BudgetingLineChart = ({ data }) => {
  if (!data || data.length === 0) return <div className="text-slate-400 text-center py-8">Tidak ada data budgeting</div>;

  const [hoveredPoint, setHoveredPoint] = React.useState(null);

  const maxVal = Math.max(
    ...data.map(d => Math.max(d.income || 0, d.expense || 0)),
    1000000
  );
  const scale = 180 / maxVal;

  // Format Rupiah lengkap
  const formatRupiah = (val) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(val);
  };

  // Format Rupiah singkat untuk Y-axis
  const formatShort = (val) => {
    if (val >= 1000000000) return `${(val / 1000000000).toFixed(1)}B`;
    if (val >= 1000000) return `${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `${(val / 1000).toFixed(0)}K`;
    return val;
  };

  // Hitung total
  const totalIncome = data.reduce((sum, item) => sum + (item.income || 0), 0);
  const totalExpense = data.reduce((sum, item) => sum + (item.expense || 0), 0);

  return (
    <div className="w-full">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 p-4 rounded-xl border border-green-100">
          <div className="text-xs text-green-600 font-medium mb-1">Total Pemasukan</div>
          <div className="text-lg font-bold text-green-700">{formatRupiah(totalIncome)}</div>
        </div>
        <div className="bg-red-50 p-4 rounded-xl border border-red-100">
          <div className="text-xs text-red-600 font-medium mb-1">Total Pengeluaran</div>
          <div className="text-lg font-bold text-red-700">{formatRupiah(totalExpense)}</div>
        </div>
        <div className={`${totalIncome >= totalExpense ? 'bg-blue-50 border-blue-100' : 'bg-amber-50 border-amber-100'} p-4 rounded-xl border`}>
          <div className={`text-xs ${totalIncome >= totalExpense ? 'text-blue-600' : 'text-amber-600'} font-medium mb-1`}>Selisih</div>
          <div className={`text-lg font-bold ${totalIncome >= totalExpense ? 'text-blue-700' : 'text-amber-700'}`}>{formatRupiah(totalIncome - totalExpense)}</div>
        </div>
      </div>

      <div className="relative h-64 w-full">
        {/* Tooltip */}
        {hoveredPoint && (
          <div 
            className="absolute bg-slate-800 text-white text-xs py-2 px-3 rounded-lg shadow-lg z-10 pointer-events-none transition-opacity duration-100"
            style={{
              left: `${hoveredPoint.x}px`,
              top: `${hoveredPoint.y}px`,
              transform: 'translate(-50%, -120%)'
            }}
          >
            <div className="font-semibold mb-1">{hoveredPoint.month}</div>
            <div className="text-green-300">Pemasukan: {formatRupiah(hoveredPoint.income)}</div>
            <div className="text-red-300">Pengeluaran: {formatRupiah(hoveredPoint.expense)}</div>
          </div>
        )}

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-400 pr-2">
          <span>{formatShort(maxVal)}</span>
          <span>{formatShort(maxVal * 0.75)}</span>
          <span>{formatShort(maxVal * 0.5)}</span>
          <span>{formatShort(maxVal * 0.25)}</span>
          <span>0</span>
        </div>

        <div className="ml-12 h-full">
          <svg className="w-full h-56" viewBox="0 0 600 200" preserveAspectRatio="none">
          {/* Grid lines */}
          {[0, 25, 50, 75, 100].map((pct) => (
            <line
              key={pct}
              x1="0"
              y1={200 - (pct * 2)}
              x2="600"
              y2={200 - (pct * 2)}
              stroke="#f1f5f9"
              strokeWidth="1"
            />
          ))}

          {/* Income line (green) */}
          <polyline
            fill="none"
            stroke="#10b981"
            strokeWidth="3"
            points={data
              .map((item, idx) => {
                const x = (idx / (data.length - 1)) * 600;
                const y = 200 - (item.income || 0) * scale;
                return `${x},${y}`;
              })
              .join(' ')}
          />

          {/* Expense line (red) */}
          <polyline
            fill="none"
            stroke="#ef4444"
            strokeWidth="3"
            points={data
              .map((item, idx) => {
                const x = (idx / (data.length - 1)) * 600;
                const y = 200 - (item.expense || 0) * scale;
                return `${x},${y}`;
              })
              .join(' ')}
          />

          {/* Income dots */}
          {data.map((item, idx) => {
            const x = (idx / (data.length - 1)) * 600;
            const y = 200 - (item.income || 0) * scale;
            return (
              <circle 
                key={`income-${idx}`}
                cx={x} 
                cy={y} 
                r="5" 
                fill="#10b981" 
                className="cursor-pointer hover:r-7 transition-all"
                onMouseEnter={(e) => {
                  const rect = e.target.closest('svg').getBoundingClientRect();
                  const xPos = rect.left + (x / 600) * rect.width;
                  const yPos = rect.top + (y / 200) * rect.height;
                  setHoveredPoint({ x: xPos - rect.left + 48, y: yPos - rect.top, month: item.month, income: item.income, expense: item.expense });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}

          {/* Expense dots */}
          {data.map((item, idx) => {
            const x = (idx / (data.length - 1)) * 600;
            const y = 200 - (item.expense || 0) * scale;
            return (
              <circle 
                key={`expense-${idx}`}
                cx={x} 
                cy={y} 
                r="5" 
                fill="#ef4444" 
                className="cursor-pointer hover:r-7 transition-all"
                onMouseEnter={(e) => {
                  const rect = e.target.closest('svg').getBoundingClientRect();
                  const xPos = rect.left + (x / 600) * rect.width;
                  const yPos = rect.top + (y / 200) * rect.height;
                  setHoveredPoint({ x: xPos - rect.left + 48, y: yPos - rect.top, month: item.month, income: item.income, expense: item.expense });
                }}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            );
          })}
        </svg>

        {/* Month labels */}
        <div className="flex justify-between mt-2">
          {data.map((item, idx) => (
            <span key={idx} className="text-xs text-slate-600 font-medium">{item.month}</span>
          ))}
        </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-slate-100">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span className="text-sm text-slate-600 font-medium">Pemasukan</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span className="text-sm text-slate-600 font-medium">Pengeluaran</span>
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-slate-500 text-sm font-medium mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color} bg-opacity-10`}>
        <Icon size={22} className={`${color.replace('bg-', 'text-')}`} />
      </div>
    </div>
  </div>
);

export default function Dashboard({ auth, statsData, chartData, recentActivities, userRole, availableYears, selectedYear, eventsChartData, budgetingChartData }) {
  const role = userRole || auth?.user?.role || 'manager';
  const isAdmin = role === 'admin';
  
  // Data sudah dikirim dari Controller, tidak perlu fallback dummy lagi
  const stats = statsData || {};
  const chart = chartData || [];
  const recent = recentActivities || [];
  const years = availableYears || [new Date().getFullYear()];
  const currentYear = selectedYear || new Date().getFullYear();
  const [eventYear, setEventYear] = React.useState(currentYear);
  const [budgetYear, setBudgetYear] = React.useState(currentYear);
  const [loadingEvents, setLoadingEvents] = React.useState(false);
  const [loadingBudget, setLoadingBudget] = React.useState(false);
  const [eventsChart, setEventsChart] = React.useState(eventsChartData || []);
  const [budgetingChart, setBudgetingChart] = React.useState(budgetingChartData || []);

  // Debug: Log data untuk melihat apa yang diterima
  console.log('Dashboard Data:', { stats, chart, recent, role, years, currentYear, eventsChart, budgetingChart });
  
  // Handle year change for letter stats
  const handleYearChange = (year) => {
    window.location.href = `?year=${year}`;
  };

  // Handle year change for events chart
  const handleEventYearChange = async (year) => {
    setEventYear(year);
    setLoadingEvents(true);
    try {
      const response = await fetch(`/dashboard/events-chart?year=${year}`);
      const data = await response.json();
      setEventsChart(data);
    } catch (error) {
      console.error('Error fetching events chart:', error);
    } finally {
      setLoadingEvents(false);
    }
  };

  // Handle year change for budgeting chart
  const handleBudgetYearChange = async (year) => {
    setBudgetYear(year);
    setLoadingBudget(true);
    try {
      const response = await fetch(`/dashboard/budgeting-chart?year=${year}`);
      const data = await response.json();
      setBudgetingChart(data);
    } catch (error) {
      console.error('Error fetching budgeting chart:', error);
    } finally {
      setLoadingBudget(false);
    }
  };

  // Helper format rupiah
  const formatRupiah = (amount) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
  };

  // Data Kartu untuk Admin
  const adminCards = [
    { 
      title: "Total Dokumen Saya", 
      value: stats.total_letters + stats.total_events, 
      icon: FileText, 
      color: "bg-blue-500",
      subtitle: `${stats.total_letters} surat, ${stats.total_events} laporan`
    },
    { 
      title: "Menunggu Approval", 
      value: stats.pending_letters + stats.pending_events, 
      icon: Clock, 
      color: "bg-amber-500",
      subtitle: "Menunggu respon Manager"
    },
    { 
      title: "Disetujui", 
      value: stats.approved_letters + stats.approved_events, 
      icon: CheckCircle, 
      color: "bg-green-500",
      subtitle: "Siap didownload / dicetak"
    },
    { 
      title: "Ditolak / Revisi", 
      value: stats.rejected_letters, 
      icon: AlertCircle, 
      color: "bg-red-500",
      subtitle: "Perlu Anda perbaiki"
    },
  ];

  // Data Kartu untuk Manager
  const managerCards = [
    { 
      title: "Total Surat Masuk", 
      value: stats.total_letters, 
      icon: FileText, 
      color: "bg-blue-500",
      subtitle: `${stats.pending_letters} menunggu approval`
    },
    { 
      title: "Laporan Event", 
      value: stats.total_events, 
      icon: Calendar, 
      color: "bg-purple-500",
      subtitle: `${stats.approved_events} approved`
    },
    { 
      title: "Inventaris Marcom", 
      value: stats.total_inventory, 
      icon: Package, 
      color: "bg-green-500",
      subtitle: `${stats.damaged_condition} rusak`
    },
    { 
      title: "Budget Status", 
      value: formatRupiah(stats.total_income - stats.total_expense), 
      icon: DollarSign, 
      color: stats.total_income >= stats.total_expense ? "bg-green-500" : "bg-red-500",
      subtitle: `${stats.pending_transactions} pending`
    },
  ];

  const cards = isAdmin ? adminCards : managerCards;

  return (
    <AuthenticatedLayout user={auth.user} title="Dashboard">
      <Head title="Dashboard" />
      
      <div className="max-w-7xl mx-auto animate-fade-in pb-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-800 mb-2">
            {isAdmin ? `Halo, ${auth.user.name}!` : 'Dashboard Manager'}
          </h1>
          <p className="text-slate-500">
            {isAdmin 
              ? 'Pantau status pengajuan surat dan laporan kegiatan Anda di sini.' 
              : 'Ringkasan aktivitas dan persetujuan dokumen.'}
          </p>
        </div>

        {/* Grid Statistik */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Kolom Kiri: Grafik */}
          <div className="lg:col-span-2 space-y-8">
             {/* Grafik Surat Masuk */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                  <h3 className="font-bold text-slate-800 text-lg">
                    {isAdmin ? 'Aktivitas Upload Saya' : 'Statistik Surat Masuk'}
                  </h3>
                  
                  {/* Year Filter Dropdown - Fixed width to prevent overlap */}
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                    <select 
                      value={currentYear}
                      onChange={(e) => handleYearChange(e.target.value)}
                      className="text-sm border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer hover:border-slate-300 transition-colors min-w-[100px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat"
                    >
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <SimpleBarChart data={chart} />
             </div>

             {/* Grafik Event per Bulan */}
             {eventsChart && eventsChart.length > 0 && (
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                 <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                   <h3 className="font-bold text-slate-800 text-lg">Jumlah Event per Bulan</h3>
                   <div className="flex items-center gap-2">
                     <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                     <select 
                       value={eventYear}
                       onChange={(e) => handleEventYearChange(e.target.value)}
                       disabled={loadingEvents}
                       className="text-sm border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent cursor-pointer hover:border-slate-300 transition-colors min-w-[100px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat disabled:opacity-50"
                     >
                       {years.map(year => (
                         <option key={year} value={year}>{year}</option>
                       ))}
                     </select>
                   </div>
                 </div>
                 {loadingEvents ? (
                   <div className="h-64 flex items-center justify-center text-slate-400">Loading...</div>
                 ) : (
                   <EventBarChart data={eventsChart} />
                 )}
               </div>
             )}

             {/* Grafik Budgeting untuk Manager/Co-Manager */}
             {!isAdmin && budgetingChart && budgetingChart.length > 0 && (
               <>
                 {/* Grafik Pemasukan */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                   <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                     <div>
                       <h3 className="font-bold text-slate-800 text-lg flex items-center">
                         <TrendingUp size={20} className="mr-2 text-green-600" />
                         Target vs Pemasukan Bulanan
                       </h3>
                       <p className="text-xs text-slate-500 mt-1">Perbandingan target budget dengan pemasukan aktual</p>
                     </div>
                     <div className="flex items-center gap-2">
                       <Calendar size={16} className="text-slate-400 flex-shrink-0" />
                       <select 
                         value={budgetYear}
                         onChange={(e) => handleBudgetYearChange(e.target.value)}
                         disabled={loadingBudget}
                         className="text-sm border border-slate-200 rounded-lg pl-3 pr-8 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer hover:border-slate-300 transition-colors min-w-[100px] appearance-none bg-[url('data:image/svg+xml;charset=UTF-8,%3csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27currentColor%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3e%3cpolyline points=%276 9 12 15 18 9%27%3e%3c/polyline%3e%3c/svg%3e')] bg-[length:16px] bg-[right_8px_center] bg-no-repeat disabled:opacity-50"
                       >
                         {years.map(year => (
                           <option key={year} value={year}>{year}</option>
                         ))}
                       </select>
                     </div>
                   </div>
                   {loadingBudget ? (
                     <div className="h-64 flex items-center justify-center text-slate-400">Loading...</div>
                   ) : (
                     <BudgetingIncomeChart data={budgetingChart} />
                   )}
                 </div>

                 {/* Grafik Pengeluaran */}
                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                   <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
                     <div>
                       <h3 className="font-bold text-slate-800 text-lg flex items-center">
                         <TrendingDown size={20} className="mr-2 text-red-600" />
                         Budget vs Pengeluaran Bulanan
                       </h3>
                       <p className="text-xs text-slate-500 mt-1">Perbandingan budget limit dengan pengeluaran aktual</p>
                     </div>
                     <div className="text-sm text-slate-500 font-medium">{budgetYear}</div>
                   </div>
                   {loadingBudget ? (
                     <div className="h-64 flex items-center justify-center text-slate-400">Loading...</div>
                   ) : (
                     <BudgetingExpenseChart data={budgetingChart} />
                   )}
                 </div>
               </>
             )}
          </div>

          {/* Kolom Kanan: Cards */}
          <div className="space-y-6">
             {/* Cards untuk Manager */}
             {!isAdmin && (
               <>
                  {/* Status Overview */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Status Approval</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-amber-500 mr-3"></div>
                          <span className="text-sm text-slate-600">Pending</span>
                        </div>
                        <span className="font-bold text-slate-800">{stats.pending_letters + stats.pending_events}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-green-500 mr-3"></div>
                          <span className="text-sm text-slate-600">Approved</span>
                        </div>
                        <span className="font-bold text-slate-800">{stats.approved_letters + stats.approved_events}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="w-3 h-3 rounded-full bg-red-500 mr-3"></div>
                          <span className="text-sm text-slate-600">Rejected</span>
                        </div>
                        <span className="font-bold text-slate-800">{stats.rejected_letters}</span>
                      </div>
                    </div>
                  </div>

                  {/* Budget Overview */}
                  <div className="bg-gradient-to-br from-green-50 to-blue-50 p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Budget Overview</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Pemasukan</span>
                        <div className="flex items-center text-green-600 font-bold text-sm">
                          <TrendingUp size={16} className="mr-1" />
                          {formatRupiah(stats.total_income)}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-slate-600">Pengeluaran</span>
                        <div className="flex items-center text-red-600 font-bold text-sm">
                          <TrendingDown size={16} className="mr-1" />
                          {formatRupiah(stats.total_expense)}
                        </div>
                      </div>
                      <div className="pt-3 border-t border-slate-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-bold text-slate-700">Selisih</span>
                          <span className={`font-bold text-lg ${stats.total_income >= stats.total_expense ? 'text-green-600' : 'text-red-600'}`}>
                            {formatRupiah(stats.total_income - stats.total_expense)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Inventory Status */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Kondisi Inventaris</h3>
                    <div className="space-y-4">
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-600">Baik</span>
                          <span className="text-sm font-bold text-slate-800">{stats.good_condition}/{stats.total_inventory}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-green-500 h-2 rounded-full" style={{width: `${stats.total_inventory > 0 ? (stats.good_condition / stats.total_inventory * 100) : 0}%`}}></div>
                        </div>
                      </div>
                      <div>
                        <div className="flex justify-between mb-2">
                          <span className="text-sm text-slate-600">Rusak</span>
                          <span className="text-sm font-bold text-slate-800">{stats.damaged_condition}/{stats.total_inventory}</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2">
                          <div className="bg-red-500 h-2 rounded-full" style={{width: `${stats.total_inventory > 0 ? (stats.damaged_condition / stats.total_inventory * 100) : 0}%`}}></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold text-slate-800 mb-4">Quick Stats</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText size={18} className="text-blue-600 mr-3" />
                          <span className="text-sm text-slate-600">Total Documents</span>
                        </div>
                        <span className="font-bold text-slate-800">{stats.total_letters + stats.total_events}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <Package size={18} className="text-green-600 mr-3" />
                          <span className="text-sm text-slate-600">Total Items</span>
                        </div>
                        <span className="font-bold text-slate-800">{stats.total_inventory}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <AlertCircle size={18} className="text-amber-600 mr-3" />
                          <span className="text-sm text-slate-600">Needs Action</span>
                        </div>
                        <span className="font-bold text-amber-600">{stats.pending_letters + stats.pending_events + stats.pending_transactions}</span>
                      </div>
                    </div>
                  </div>
               </>
             )}

             {/* QUICK ACCESS (Khusus Admin) */}
             {isAdmin && (
               <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="font-bold text-slate-800 mb-4">Quick Access</h3>
                  <div className="space-y-3">
                    <Link href="/confirmation-letter" className="flex items-center p-4 bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-colors group">
                        <div className="p-2 bg-indigo-600 text-white rounded-lg mr-3"><FilePlus size={20} /></div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Buat Surat Baru</h4>
                          <p className="text-slate-500 text-xs">Generator atau upload manual</p>
                        </div>
                    </Link>
                    <Link href="/laporan-event" className="flex items-center p-4 bg-green-50 hover:bg-green-100 rounded-xl transition-colors group">
                        <div className="p-2 bg-green-600 text-white rounded-lg mr-3"><Activity size={20} /></div>
                        <div>
                          <h4 className="font-bold text-slate-800 text-sm">Lapor Kegiatan</h4>
                          <p className="text-slate-500 text-xs">Upload dokumentasi event</p>
                        </div>
                    </Link>
                  </div>
               </div>
             )}

             {/* Status Terkini - Pindah ke kolom kanan */}
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
               <div className="flex items-center justify-between mb-6">
                 <h3 className="font-bold text-slate-800 text-lg">Status Terkini</h3>
               </div>
            
            <div className="space-y-4">
              {recent.length > 0 ? (
                recent.map((activity, index) => (
                  <div key={index} className="flex items-start p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className={`mt-1 p-2 rounded-lg shrink-0 mr-4 ${
                      activity.status === 'Pending' ? 'bg-amber-100 text-amber-600' :
                      activity.status === 'Approved' ? 'bg-green-100 text-green-600' :
                      activity.status === 'Rejected' ? 'bg-red-100 text-red-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.status === 'Pending' ? <Clock size={18} /> : 
                       activity.status === 'Approved' ? <CheckCircle size={18} /> : 
                       <AlertCircle size={18} />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="text-sm font-bold text-slate-800 truncate">{activity.title}</h4>
                        <span className="text-xs text-slate-400 whitespace-nowrap ml-2">{activity.date}</span>
                      </div>
                      <p className="text-xs text-slate-500 mb-1 truncate">{activity.type}</p>
                      
                      {/* Status Badge */}
                      <div className="flex items-center">
                         <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium border ${
                           activity.status === 'Pending' ? 'bg-amber-50 border-amber-100 text-amber-600' :
                           activity.status === 'Approved' ? 'bg-green-50 border-green-100 text-green-600' :
                           activity.status === 'Info' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                           'bg-red-50 border-red-200 text-red-600'
                         }`}>
                           {activity.status}
                         </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-400 text-sm">
                  Belum ada aktivitas terbaru.
                </div>
              )}
            </div>
             </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}