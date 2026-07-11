import { 
  DollarSign, TrendingUp, Gift 
} from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip } from 'recharts';
import { UserProfile, Investment } from '../types';

interface EarningsTabProps {
  profile: UserProfile;
  investments: Investment[];
  onClaimDaily: (investment: Investment) => void;
}

export default function EarningsTab({ 
  profile,
  investments, 
  onClaimDaily,
}: EarningsTabProps) {

  const investmentsSafe = investments || [];
  const activeInvestments = investmentsSafe.filter(inv => inv.status === 'active');
  const completedInvestments = investmentsSafe.filter(inv => inv.status === 'completed');

  // Prepare chart data based on transactions or mock values if empty
  const chartData = [
    { day: 'Day 1', amount: profile.totalEarned * 0.1 },
    { day: 'Day 2', amount: profile.totalEarned * 0.25 },
    { day: 'Day 3', amount: profile.totalEarned * 0.45 },
    { day: 'Day 4', amount: profile.totalEarned * 0.65 },
    { day: 'Day 5', amount: profile.totalEarned * 0.8 },
    { day: 'Day 6', amount: profile.totalEarned * 0.95 },
    { day: 'Day 7', amount: profile.totalEarned },
  ];

  return (
    <div className="space-y-6 max-w-lg mx-auto pb-8 animate-in fade-in duration-300">
      {/* Yield summary header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-3xs flex justify-between items-center">
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
            Total Interest Yielded
          </span>
          <div className="flex items-baseline space-x-1">
            <span className="text-2xl font-black font-mono text-emerald-600">
              {profile.totalEarned.toLocaleString()}
            </span>
            <span className="text-xs font-black text-emerald-800 font-mono">ETB</span>
          </div>
        </div>
        <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700">
          <TrendingUp className="w-5 h-5 shrink-0" />
        </div>
      </div>

      {/* Analytics Chart */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-3xs space-y-4">
        <div className="flex justify-between items-center border-b border-slate-100 pb-2">
          <h3 className="text-[10px] font-black uppercase text-[#0A3D91] tracking-widest">
            Yield Acceleration Curve
          </h3>
          <span className="text-[9px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
            +5% Cap APY Standard
          </span>
        </div>

        <div className="h-44 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="day" stroke="#94A3B8" fontSize={9} tickLine={false} />
              <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} />
              <Tooltip formatter={(value) => [`${Number(value).toFixed(1)} ETB`, 'Earnings']} contentStyle={{ background: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '10px' }} />
              <Area type="monotone" dataKey="amount" stroke="#10B981" strokeWidth={2} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Active Investments Tracker */}
      <div className="space-y-3">
        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">
          Active Yield Generators ({activeInvestments.length})
        </h3>

        {activeInvestments.length === 0 ? (
          <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-2">
            <DollarSign className="w-8 h-8 text-slate-400 mx-auto animate-pulse-subtle" />
            <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">No Active Tiers Found</p>
            <p className="text-[10px] text-slate-400 font-medium max-w-xs mx-auto">
              Choose an investment level in the Invest tab and submit CBE receipts to activate daily yield streams.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {activeInvestments.map((inv) => {
              const progressPercentage = Math.min((inv.daysElapsed / inv.durationDays) * 100, 100);
              // Calculate daily claimable amount
              const claimableNow = inv.capital * inv.dailyRate;
              
              return (
                <div key={inv.id} className="p-5 rounded-3xl bg-white border border-slate-200 shadow-3xs space-y-4">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-2.5">
                    <div>
                      <span className="text-[10px] font-black uppercase text-[#0A3D91] tracking-wide block">
                        {inv.planName}
                      </span>
                      <span className="text-[9px] text-slate-500 font-mono block mt-0.5">
                        Working Capital: {inv.capital.toLocaleString()} ETB
                      </span>
                    </div>
                    
                    <button
                      onClick={() => onClaimDaily(inv)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-[9px] font-black uppercase tracking-wider active:scale-95 transition-all shadow-md shadow-emerald-500/10 flex items-center space-x-1 cursor-pointer"
                    >
                      <Gift className="w-3.5 h-3.5 shrink-0" />
                      <span>Claim (+{claimableNow.toLocaleString()} ETB)</span>
                    </button>
                  </div>

                  {/* Progress bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[9px] font-black uppercase tracking-wider text-slate-500">
                      <span>Cycle Completion ({inv.daysElapsed}/{inv.durationDays} Days)</span>
                      <span>{progressPercentage.toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-[#0A3D91] h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-50 text-[10.5px]">
                    <div className="flex justify-between items-center text-slate-600 font-bold">
                      <span>Daily Yield Rate:</span>
                      <span className="font-mono text-[#0a3d91]">{(inv.dailyRate * 100).toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between items-center text-slate-600 font-bold">
                      <span>Total Yielded:</span>
                      <span className="font-mono text-emerald-700 font-black">+{inv.earningsEarned.toLocaleString()} ETB</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Completed Investments */}
      {completedInvestments.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">
            Completed Cycles ({completedInvestments.length})
          </h3>
          <div className="space-y-2">
            {completedInvestments.map((inv) => (
              <div key={inv.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center text-[11px]">
                <div className="space-y-0.5">
                  <span className="font-black text-slate-700 uppercase block">{inv.planName}</span>
                  <span className="text-[9px] text-slate-500 font-mono block">Capital: {inv.capital.toLocaleString()} ETB</span>
                </div>
                <div className="text-right">
                  <span className="text-emerald-700 font-black font-mono block">+{inv.totalExpectedReturn.toLocaleString()} ETB</span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-slate-400 block">Completed ✓</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
