import React from 'react';
import confetti from 'canvas-confetti';
import { 
  X, 
  Calendar, 
  Clock, 
  Cpu, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRightCircle, 
  FileText,
  Activity,
  Wrench,
  Monitor,
  Truck,
  Users,
  Coffee,
  MapPin,
  Video,
  ExternalLink,
  Zap,
  Building2
} from 'lucide-react';

export default function AgentInspector({
  agent,
  onClose,
  onResolveCase,
  onOpenOverride
}) {
  if (!agent) return null;

  const getStatusBadge = (status) => {
    switch (status) {
      case 'onsite':
        return {
          label: 'On-Site Inverter Repair',
          color: 'bg-orange-50 text-orange-700 border-orange-200',
          icon: <Wrench className="w-3.5 h-3.5" />
        };
      case 'online':
        return {
          label: 'Online Remote Support',
          color: 'bg-sky-50 text-sky-700 border-sky-200',
          icon: <Monitor className="w-3.5 h-3.5" />
        };
      case 'field':
        return {
          label: 'Field Dispatch & Transit',
          color: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          icon: <Truck className="w-3.5 h-3.5" />
        };
      case 'meeting':
        return {
          label: 'Team Sync & Meeting',
          color: 'bg-purple-50 text-purple-700 border-purple-200',
          icon: <Users className="w-3.5 h-3.5" />
        };
      case 'break':
        return {
          label: 'Break & Recharge',
          color: 'bg-amber-50 text-amber-700 border-amber-200',
          icon: <Coffee className="w-3.5 h-3.5" />
        };
      default:
        return {
          label: 'Active',
          color: 'bg-slate-50 text-slate-700 border-slate-200',
          icon: <Activity className="w-3.5 h-3.5" />
        };
    }
  };

  const statusBadge = getStatusBadge(agent.status);

  const handleResolve = () => {
    // Fire festive confetti
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
    if (onResolveCase) onResolveCase(agent.id);
  };

  return (
    <div className="absolute top-20 right-6 z-30 w-96 max-w-[calc(100vw-3rem)] animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="glass-panel rounded-3xl p-5 shadow-2xl border border-white/90">
        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-md"
              style={{ backgroundColor: agent.avatarColor || '#0284c7' }}
            >
              {agent.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base leading-tight">
                {agent.name}
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                {agent.role}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Badge */}
        <div className="mt-4 flex items-center justify-between">
          <div className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center gap-2 ${statusBadge.color}`}>
            {statusBadge.icon}
            <span>{statusBadge.label}</span>
          </div>

          <span className="text-[11px] font-mono text-slate-400">
            Room: {agent.currentRoom?.toUpperCase()}
          </span>
        </div>

        {/* Current Google Calendar Event Card */}
        <div className="mt-4 bg-slate-50/80 rounded-2xl p-4 border border-slate-200/60">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            <Calendar className="w-3.5 h-3.5 text-sky-500" />
            <span>Google Calendar Live Event</span>
          </div>
          <p className="text-sm font-semibold text-slate-800 leading-snug">
            {agent.currentTask?.title || 'General Technical Duty'}
          </p>

          <div className="flex items-center gap-2 mt-2.5 text-xs text-slate-500 font-medium">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Active until {agent.currentTask?.endTime ? new Date(agent.currentTask.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Next Sync'}</span>
          </div>
        </div>

        {/* Inverter Hardware & Diagnostic Details (Highlighted!) */}
        {agent.currentTask?.inverterModel && agent.currentTask.inverterModel !== 'N/A' && (
          <div className="mt-3 bg-gradient-to-br from-amber-50/70 to-orange-50/50 rounded-2xl p-4 border border-orange-200/60">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-xs font-bold text-orange-700 uppercase tracking-wider">
                <Cpu className="w-3.5 h-3.5 text-orange-600" />
                <span>Product Under Diagnostic</span>
              </div>
              <span className="px-2 py-0.5 rounded-md bg-orange-200/60 text-orange-800 text-[10px] font-extrabold uppercase">
                {agent.currentTask.priority || 'High'} Priority
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              {agent.currentTask?.customer && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    Customer / Client:
                  </span>
                  <span className="font-bold text-slate-800">{agent.currentTask.customer}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Equipment / Product:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                  {agent.currentTask.inverterModel}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-500 font-medium">Task / Status:</span>
                <span className="font-mono font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                  {agent.currentTask.faultCode}
                </span>
              </div>

              {agent.currentTask?.ticketId && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-500 font-medium">Ticket ID:</span>
                  <span className="font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                    {agent.currentTask.ticketId}
                  </span>
                </div>
              )}

              {/* On-Site Location / Google Maps Link */}
              {agent.currentTask?.location && (
                <div className="pt-2 border-t border-orange-200/50 flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-500" />
                    Site Location:
                  </span>
                  <a
                    href={agent.currentTask.location.startsWith('http') ? agent.currentTask.location : `https://${agent.currentTask.location}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sky-600 hover:text-sky-700 font-semibold underline flex items-center gap-0.5 text-[11px]"
                  >
                    <span>Open in Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              {/* Google Meet Link */}
              {agent.currentTask?.meetUrl && (
                <div className="pt-1 flex items-center justify-between">
                  <span className="text-slate-500 font-medium flex items-center gap-1">
                    <Video className="w-3.5 h-3.5 text-amber-500" />
                    Google Meet:
                  </span>
                  <a
                    href={agent.currentTask.meetUrl.startsWith('http') ? agent.currentTask.meetUrl : `https://${agent.currentTask.meetUrl}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-amber-700 hover:text-amber-800 font-semibold underline flex items-center gap-0.5 text-[11px]"
                  >
                    <span>Join Meeting</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>

            {agent.currentTask?.notes && (
              <div className="mt-3 pt-2.5 border-t border-orange-200/60">
                <div className="flex items-start gap-1.5 text-[11px] text-slate-600">
                  <FileText className="w-3.5 h-3.5 text-orange-500 mt-0.5 shrink-0" />
                  <span>{agent.currentTask.notes}</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Stats Row */}
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <div className="text-xs text-slate-400 font-medium">Resolved Today</div>
            <div className="text-base font-extrabold text-slate-800 font-mono">
              {agent.stats?.completedToday ?? 0}
            </div>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100">
            <div className="text-xs text-slate-400 font-medium">Avg Resolution</div>
            <div className="text-base font-extrabold text-slate-800 font-mono">
              {agent.stats?.avgResolutionTime ?? '24m'}
            </div>
          </div>
        </div>

        {/* Interactive Action Buttons */}
        <div className="mt-5 flex gap-2">
          <button
            onClick={handleResolve}
            className="flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Mark Resolved</span>
          </button>

          <button
            onClick={() => onOpenOverride(agent)}
            className="py-2.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs border border-slate-200/80 flex items-center justify-center gap-1.5 transition-all active:scale-95"
            title="Dispatch agent to another room or task"
          >
            <ArrowRightCircle className="w-4 h-4" />
            <span>Dispatch</span>
          </button>
        </div>
      </div>
    </div>
  );
}
