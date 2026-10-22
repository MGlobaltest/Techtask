import React, { useState } from 'react';
import { 
  X, 
  UserPlus, 
  Trash2, 
  Save, 
  Calendar, 
  HelpCircle, 
  Check, 
  Wrench, 
  Monitor, 
  Truck 
} from 'lucide-react';

const COLOR_PRESETS = [
  '#ea580c', // Coral/Orange
  '#0284c7', // Sky Blue
  '#16a34a', // Emerald Green
  '#9333ea', // Purple
  '#d97706', // Amber
  '#0d9488', // Teal
  '#e11d48', // Rose
  '#4f46e5'  // Indigo
];

export default function TeamManagerModal({
  isOpen,
  onClose,
  agents = [],
  masterCalendarUrl = '',
  onSaveMasterCalendar,
  onSaveAgent,
  onDeleteAgent
}) {
  const [editingAgent, setEditingAgent] = useState(null);
  const [masterUrlInput, setMasterUrlInput] = useState(masterCalendarUrl);
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [type, setType] = useState('onsite');
  const [avatarColor, setAvatarColor] = useState(COLOR_PRESETS[0]);
  const [calendarUrl, setCalendarUrl] = useState('');
  const [showIcalHelp, setShowIcalHelp] = useState(false);

  // Keep input in sync with incoming prop
  React.useEffect(() => {
    setMasterUrlInput(masterCalendarUrl);
  }, [masterCalendarUrl]);

  if (!isOpen) return null;

  const startAddNew = () => {
    setEditingAgent({ isNew: true });
    setName('');
    setRole('Inverter Support Engineer');
    setType('onsite');
    setAvatarColor(COLOR_PRESETS[Math.floor(Math.random() * COLOR_PRESETS.length)]);
    setCalendarUrl('');
  };

  const startEdit = (agent) => {
    setEditingAgent(agent);
    setName(agent.name);
    setRole(agent.role);
    setType(agent.type || 'onsite');
    setAvatarColor(agent.avatarColor || COLOR_PRESETS[0]);
    setCalendarUrl(agent.calendarUrl || '');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    onSaveAgent({
      id: editingAgent?.id,
      name,
      role,
      type,
      avatarColor,
      calendarUrl
    });

    setEditingAgent(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-2xl rounded-3xl p-6 shadow-2xl border border-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Technical Support Team Roster
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage agents, avatars, and connect live Google Calendar feeds.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {!editingAgent ? (
            <>
              {/* Single Master Team Calendar (All-In-One) */}
              <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-sky-50 p-4 rounded-2xl border border-emerald-200">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Single Master Team Google Calendar
                    </span>
                  </div>
                  <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                    Recommended
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 mb-2.5 leading-relaxed">
                  Have <strong>ONE</strong> Google Calendar for the whole team? Paste its iCal link below. The system automatically reads all events, extracts the agent name from the event title (e.g. <code>[Alex Chen] Inverter Repair</code> or <code>Sarah: Online Ticket</code>), and animates the entire team!
                </p>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={masterUrlInput}
                    onChange={(e) => setMasterUrlInput(e.target.value)}
                    placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => onSaveMasterCalendar && onSaveMasterCalendar(masterUrlInput)}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-sm transition-all flex items-center gap-1.5 shrink-0 active:scale-95"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save & Sync</span>
                  </button>
                </div>
              </div>

              {/* Add New Agent Button */}
              <button
                onClick={startAddNew}
                className="w-full py-3 px-4 rounded-2xl border-2 border-dashed border-emerald-300 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 font-semibold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.99]"
              >
                <UserPlus className="w-4 h-4" />
                <span>Add Technical Support Member</span>
              </button>

              {/* Agent List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {agents.map((agent) => (
                  <div
                    key={agent.id}
                    className="glass-card rounded-2xl p-4 flex items-center justify-between group hover:border-slate-300 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
                        style={{ backgroundColor: agent.avatarColor || '#0284c7' }}
                      >
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 text-sm">
                          {agent.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {agent.role}
                        </div>
                        <div className="flex items-center gap-1.5 mt-1 text-[10px] font-medium text-slate-400">
                          {agent.type === 'onsite' && <span className="text-orange-600 font-semibold">● Inverter Hardware</span>}
                          {agent.type === 'online' && <span className="text-sky-600 font-semibold">● Online Cases</span>}
                          {agent.type === 'field' && <span className="text-emerald-600 font-semibold">● Field Service</span>}
                          {agent.calendarUrl ? (
                            <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                              <Check className="w-3 h-3" /> Cal Synced
                            </span>
                          ) : (
                            <span className="text-slate-400">Demo Cal</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                      <button
                        onClick={() => startEdit(agent)}
                        className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-600 text-xs font-semibold"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => onDeleteAgent(agent.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            /* Edit / Create Form */
            <form onSubmit={handleSubmit} className="space-y-4 bg-slate-50/70 p-5 rounded-2xl border border-slate-200">
              <div className="font-bold text-slate-800 text-sm pb-1 border-b border-slate-200">
                {editingAgent.isNew ? 'New Team Member' : `Edit ${editingAgent.name}`}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Member Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Chen"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">
                    Job Title / Role
                  </label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    placeholder="e.g. Senior Inverter Specialist"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Primary Specialty */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Primary Specialty & Task Zone
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('onsite')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      type === 'onsite'
                        ? 'bg-orange-50 border-orange-400 text-orange-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Wrench className="w-3.5 h-3.5" />
                    <span>Inverter Hardware</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('online')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      type === 'online'
                        ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Monitor className="w-3.5 h-3.5" />
                    <span>Online Support</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('field')}
                    className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-1.5 transition-all ${
                      type === 'field'
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Field Dispatch</span>
                  </button>
                </div>
              </div>

              {/* Avatar Color Picker */}
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">
                  Avatar Color
                </label>
                <div className="flex items-center gap-2">
                  {COLOR_PRESETS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setAvatarColor(color)}
                      className={`w-7 h-7 rounded-xl transition-all ${
                        avatarColor === color ? 'ring-2 ring-slate-800 scale-110 shadow-sm' : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Google Calendar iCal Feed URL */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-600 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-sky-500" />
                    <span>Google Calendar iCal URL (Optional)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowIcalHelp(!showIcalHelp)}
                    className="text-[11px] text-sky-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <HelpCircle className="w-3 h-3" />
                    <span>How to find URL?</span>
                  </button>
                </div>

                {showIcalHelp && (
                  <div className="mb-2 p-3 bg-sky-50 rounded-xl text-xs text-sky-900 border border-sky-200 leading-relaxed">
                    <strong>To get an agent's Google Calendar feed:</strong>
                    <ol className="list-decimal pl-4 mt-1 space-y-1 text-[11px]">
                      <li>Open Google Calendar on desktop.</li>
                      <li>In the left sidebar, click the three dots next to the agent's calendar $\rightarrow$ <em>Settings and sharing</em>.</li>
                      <li>Scroll to <strong>Integrate calendar</strong> and copy the <strong>Secret address in iCal format</strong>.</li>
                      <li>Paste the URL here. The diorama will read their live schedule automatically!</li>
                    </ol>
                  </div>
                )}

                <input
                  type="url"
                  value={calendarUrl}
                  onChange={(e) => setCalendarUrl(e.target.value)}
                  placeholder="https://calendar.google.com/calendar/ical/.../basic.ics"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white font-mono text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Leave blank to use the built-in realistic simulation engine for this agent.
                </span>
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setEditingAgent(null)}
                  className="px-4 py-2 rounded-xl hover:bg-slate-200/80 text-slate-600 text-xs font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Save Member</span>
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <span>{agents.length} Technical Support Agents Configured</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
