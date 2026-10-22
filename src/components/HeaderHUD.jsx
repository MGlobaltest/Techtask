import React, { useState, useEffect } from 'react';
import { 
  Wrench, 
  Monitor, 
  Truck, 
  Users, 
  Coffee, 
  RefreshCw, 
  Plus, 
  Settings, 
  Sparkles,
  Zap
} from 'lucide-react';

export default function HeaderHUD({
  agents = [],
  onOpenTeamManager,
  onOpenDispatchModal,
  onSyncCalendar,
  onSimulateTick,
  isSyncing
}) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Compute status metrics
  const counts = {
    online: agents.filter(a => a.status === 'online').length,
    onsite: agents.filter(a => a.status === 'onsite').length,
    field: agents.filter(a => a.status === 'field').length,
    meeting: agents.filter(a => a.status === 'meeting').length,
    break: agents.filter(a => a.status === 'break').length,
  };

  const formattedTime = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });

  return (
    <header className="absolute top-0 left-0 right-0 z-20 pointer-events-none p-4">
      <div className="max-w-7xl mx-auto flex flex-col gap-2.5">
        {/* Top Navbar Row */}
        <div className="glass-panel rounded-2xl px-5 py-3 pointer-events-auto flex items-center justify-between shadow-lg">
          {/* Logo & Branding (AgentDeck Reference Style) */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-800">AgentDeck</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                  Live Operations
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Technical Support, EV Chargers & Inverter Operations
              </p>
            </div>
          </div>

          {/* Center: Live Calendar Clock & Subtitle */}
          <div className="hidden md:flex flex-col items-center">
            <div className="flex items-center gap-2 font-mono text-sm font-semibold text-slate-700 bg-slate-100/80 px-3 py-1 rounded-lg border border-slate-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
              <span>{formattedDate}</span>
              <span className="text-slate-400">|</span>
              <span className="text-emerald-700 font-bold">{formattedTime}</span>
            </div>
            <span className="text-[11px] text-slate-400 mt-0.5 font-medium">
              Google Calendar Sync Active
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {/* Quick Simulate Trigger */}
            <button
              onClick={onSimulateTick}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/80 text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="Trigger a new realistic support case / calendar change"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simulate Case</span>
            </button>

            {/* Manual Dispatch Override */}
            <button
              onClick={onOpenDispatchModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/80 text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="Manual Agent Dispatch"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Dispatch</span>
            </button>

            {/* Google Calendar Sync */}
            <button
              onClick={onSyncCalendar}
              disabled={isSyncing}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 hover:bg-sky-100 border border-sky-200/80 text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="Refresh Google Calendar iCal feeds"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync Cal</span>
            </button>

            {/* Team Manager Settings */}
            <button
              onClick={onOpenTeamManager}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-semibold shadow-sm transition-all active:scale-95"
              title="Configure Team & Calendar URLs"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Team Settings</span>
            </button>
          </div>
        </div>

        {/* Operational Status Metrics Pills (Faithful to Reference image bottom/top counts) */}
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2 pointer-events-auto overflow-x-auto pb-1">
            {/* Online Remote Cases */}
            <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium text-slate-700 border border-sky-100">
              <div className="w-5 h-5 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center">
                <Monitor className="w-3 h-3" />
              </div>
              <span>Online Cases:</span>
              <span className="font-bold text-sky-600 font-mono text-sm">{counts.online}</span>
            </div>

            {/* On-Site Inverter & EV Repairs */}
            <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium text-slate-700 border border-orange-100">
              <div className="w-5 h-5 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
                <Wrench className="w-3 h-3" />
              </div>
              <span>Hardware & Commissioning:</span>
              <span className="font-bold text-orange-600 font-mono text-sm">{counts.onsite}</span>
            </div>

            {/* Field Service Dispatch */}
            <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium text-slate-700 border border-emerald-100">
              <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <Truck className="w-3 h-3" />
              </div>
              <span>Field Dispatch:</span>
              <span className="font-bold text-emerald-600 font-mono text-sm">{counts.field}</span>
            </div>

            {/* War Room / Sync */}
            <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium text-slate-700 border border-purple-100">
              <div className="w-5 h-5 rounded-lg bg-purple-100 text-purple-600 flex items-center justify-center">
                <Users className="w-3 h-3" />
              </div>
              <span>Meeting:</span>
              <span className="font-bold text-purple-600 font-mono text-sm">{counts.meeting}</span>
            </div>

            {/* Break Lounge */}
            <div className="glass-pill px-3 py-1.5 rounded-xl flex items-center gap-2 text-xs font-medium text-slate-700 border border-amber-100">
              <div className="w-5 h-5 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                <Coffee className="w-3 h-3" />
              </div>
              <span>On Break:</span>
              <span className="font-bold text-amber-600 font-mono text-sm">{counts.break}</span>
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-2 pointer-events-auto">
            <span className="text-[11px] text-slate-500 font-medium italic">
              💡 Tip: Click on any 3D agent or workbench to inspect live case details
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
