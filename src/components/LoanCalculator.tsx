import React, { useState, useEffect } from 'react';
import { Calculator, Percent, Calendar, Coins, ArrowRight, TrendingUp, Info } from 'lucide-react';

interface LoanCalculatorProps {
  onApplySettings?: (amount: number, tenure: number) => void;
  isEligible: boolean;
}

export default function LoanCalculator({ onApplySettings, isEligible }: LoanCalculatorProps) {
  const [calcAmount, setCalcAmount] = useState<number>(50000);
  const [calcTenure, setCalcTenure] = useState<number>(6);
  const [applied, setApplied] = useState<boolean>(false);

  // Constants
  const MIN_AMOUNT = 30000;
  const MAX_AMOUNT = 1000000;
  const STEP = 10000;
  const FLAT_MONTH_RATE = 0.015; // 1.5%

  const totalInterest = calcAmount * FLAT_MONTH_RATE * calcTenure;
  const totalRepayment = calcAmount + totalInterest;
  const monthlyInstallment = totalRepayment / calcTenure;

  // Generate simulated schedule dates
  const getSimulatedSchedule = () => {
    const list = [];
    const baseDate = new Date();
    let currentBalance = totalRepayment;

    for (let i = 1; i <= calcTenure; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(baseDate.getMonth() + i);
      const installmentAmount = monthlyInstallment;
      currentBalance -= installmentAmount;
      if (currentBalance < 0 || i === calcTenure) {
        currentBalance = 0;
      }

      list.push({
        month: i,
        dueDate: dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: '2-digit' }),
        principal: calcAmount / calcTenure,
        interest: calcAmount * FLAT_MONTH_RATE,
        installment: installmentAmount,
        remainingBalance: currentBalance
      });
    }
    return list;
  };

  const schedule = getSimulatedSchedule();

  const handleApply = () => {
    if (onApplySettings) {
      onApplySettings(calcAmount, calcTenure);
      setApplied(true);
      setTimeout(() => setApplied(false), 2000);
    }
  };

  return (
    <div id="loan-calculator" className="bg-slate-50/80 p-5 rounded-2xl border border-slate-205/60 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200/60 pb-2.5">
        <div className="flex items-center space-x-2">
          <div className="p-1 bg-[#0A3D91] text-white rounded-lg">
            <Calculator className="w-3.5 h-3.5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-black text-slate-400 uppercase block tracking-wider leading-none">Interactive Simulator</span>
            <h5 className="text-[11.5px] font-bold text-[#0A3D91] leading-tight">Liquidity Repayment Calculator</h5>
          </div>
        </div>
        <div className="flex items-center space-x-1 text-[8.5px] font-bold font-mono text-[#0A3D91] bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
          <Percent className="w-2.5 h-2.5 text-[#0A3D91] animate-pulse" />
          <span>1.5% FLAT / MONTH</span>
        </div>
      </div>

      {/* Dropdown Selector for Loan Amount */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono font-bold">
          <span className="text-slate-500 uppercase tracking-widest">Calculated Principal</span>
          <span className="text-[#0A3D91] text-xs font-black">{calcAmount.toLocaleString()} ETB</span>
        </div>
        
        <select
          value={calcAmount}
          onChange={(e) => setCalcAmount(Number(e.target.value))}
          className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-[#0A3D91] focus:outline-none focus:border-[#0A3D91] font-mono font-bold transition-colors cursor-pointer"
        >
          {[30000, 50000, 100000, 150000, 200000, 250000, 500000, 1000000].map((val) => (
            <option key={val} value={val}>
              {val.toLocaleString()} ETB
            </option>
          ))}
        </select>
        
        {/* Dynamic Buttons for quick select inside range */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[30000, 50000, 100000, 150000, 200000, 250000, 500000, 1000000].map((val) => (
            <button
              key={val}
              type="button"
              onClick={() => setCalcAmount(val)}
              className={`px-2 py-0.5 text-[8.5px] font-bold rounded-lg border transition-all cursor-pointer ${
                calcAmount === val
                  ? 'bg-[#0A3D91] border-[#0A3D91] text-white font-black'
                  : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100/60'
              }`}
            >
              {val >= 1000000 ? '1M' : `${val / 1000}k`} ETB
            </button>
          ))}
        </div>
      </div>

      {/* Selector for Loan Term (Tenure) */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center text-[10px] font-mono font-bold">
          <span className="text-slate-500 uppercase tracking-widest">Repayment Term</span>
          <span className="text-[#0A3D91] text-xs font-black">{calcTenure} Months</span>
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {[3, 6, 9, 12].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => setCalcTenure(term)}
              className={`py-1.5 text-[10px] font-bold rounded-xl border transition-all cursor-pointer ${
                calcTenure === term
                  ? 'bg-[#0A3D91] border-[#0A3D91] text-white shadow-sm'
                  : 'bg-white border-slate-200 text-slate-650 hover:bg-slate-100/60'
              }`}
            >
              {term} Months
            </button>
          ))}
        </div>
      </div>

      {/* Dynamic Summary Cards */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <div className="p-2.5 bg-white border border-slate-200/70 rounded-xl space-y-0.5">
          <span className="text-[8px] font-bold text-slate-400 font-mono uppercase block">Monthly Installment</span>
          <span className="text-sm font-black text-emerald-600 font-mono tracking-tight">
            {Math.round(monthlyInstallment).toLocaleString()} <span className="text-[9px]">ETB</span>
          </span>
          <div className="text-[7.5px] text-slate-400 font-medium font-sans">
            P: {Math.round(calcAmount / calcTenure).toLocaleString()} | I: {Math.round(calcAmount * FLAT_MONTH_RATE).toLocaleString()}
          </div>
        </div>

        <div className="p-2.5 bg-white border border-slate-200/70 rounded-xl space-y-0.5">
          <span className="text-[8px] font-bold text-slate-400 font-mono uppercase block">Total Flat Interest</span>
          <span className="text-sm font-black text-[#0A3D91] font-mono tracking-tight">
            {Math.round(totalInterest).toLocaleString()} <span className="text-[9px]">ETB</span>
          </span>
          <div className="text-[7.5px] text-[#0A3D91] font-bold font-sans">
            Total Payback: {Math.round(totalRepayment).toLocaleString()} ETB
          </div>
        </div>
      </div>

      {/* Structured Repayment Schedule Preview */}
      <div className="space-y-1.5 bg-white border border-slate-200/80 p-3 rounded-xl">
        <div className="flex justify-between items-center text-[8.5px] font-bold text-slate-400 font-mono pb-1.5 border-b border-slate-100 uppercase tracking-widest">
          <span className="flex items-center space-x-1">
            <Calendar className="w-2.5 h-2.5 text-[#0A3D91]" />
            <span>Projected Monthly Installments</span>
          </span>
          <span>Balance</span>
        </div>

        <div className="space-y-1 max-h-[140px] overflow-y-auto pr-0.5 scrollbar-thin">
          {schedule.map((inst) => (
            <div key={inst.month} className="flex justify-between items-center p-1.5 rounded-lg hover:bg-slate-50 transition-all border border-slate-100/60 text-[9px] font-sans">
              <div className="flex flex-col">
                <span className="font-extrabold text-[#0D2B60] font-mono">Month {inst.month} </span>
                <span className="text-[7.5px] text-slate-400 font-mono uppercase font-bold">{inst.dueDate}</span>
              </div>
              <div className="text-right">
                <span className="font-black text-emerald-600 font-mono block">{Math.round(inst.installment).toLocaleString()} ETB</span>
                <span className="text-[7.5px] text-slate-450 font-mono">
                  Bal: {Math.round(inst.remainingBalance).toLocaleString()} ETB
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action button to apply settings to deployment screen if eligible */}
      {onApplySettings && (
        <div className="pt-1">
          {isEligible ? (
            <button
              onClick={handleApply}
              className={`w-full py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-xl transition-all active:scale-95 flex items-center justify-center space-x-1.5 cursor-pointer shadow-sm ${
                applied
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-[#0A3D91] hover:bg-[#072A66] text-white'
              }`}
            >
              {applied ? (
                <>
                  <span>Applied Securely ✓</span>
                </>
              ) : (
                <>
                  <span>Apply Parameters to Form</span>
                  <ArrowRight className="w-3 h-3" />
                </>
              )}
            </button>
          ) : (
            <div className="flex items-start space-x-1.5 p-2 bg-amber-50 rounded-xl border border-amber-100 text-[8.5px] text-amber-850 font-semibold leading-normal">
              <Info className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
              <span>
                Repayments calculated here can be applied to the form once you satisfy the eligibility requirements (VIP Level 3+ Plan & ID verified status).
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
