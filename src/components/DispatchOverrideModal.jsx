import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Wrench, 
  Monitor, 
  Truck, 
  Users, 
  Coffee,
  Sparkles 
} from 'lucide-react';

const PRESET_CASES = [
  {
    title: 'Inverter Repair: SolarMax 10K - Fault E04 IGBT Gate Driver Overcurrent',
    category: 'onsite',
    room: 'workshop',
    inverterModel: 'SolarMax 10K Hybrid',
    faultCode: 'E04: IGBT Overcurrent',
    notes: 'Testing gate driver waveform with oscilloscope. Replacing blown SMD resistor.'
  },
  {
    title: 'Remote Case #TS-912: Customer Inverter Telemetry Frequency Disconnect',
    category: 'online',
    room: 'online_support',
    inverterModel: 'EcoPower 5.5kW Micro-String',
    faultCode: 'Grid Frequency Drift (51.2Hz)',
    notes: 'Live remote parameter adjustment via cloud management portal.'
  },
  {
    title: 'Emergency On-Site Field Visit: Industrial 100kW Inverter Ground Fault',
    category: 'field',
    room: 'field_dispatch',
    inverterModel: 'SunGiant 100kW 3-Phase',
    faultCode: 'Isolation Resistance < 20kOhm',
    notes: 'Preparing insulation tester and replacement MPPT surge protection modules.'
  },
  {
    title: 'Weekly Inverter Engineering & Case Review Standup',
    category: 'meeting',
    room: 'war_room',
    inverterModel: 'Multiple Units',
    faultCode: 'Team Review',
    notes: 'Reviewing recent field fault trends and firmware release v3.4.'
  },
  {
    title: 'Recharge & Coffee Break',
    category: 'break',
    room: 'lounge',
    inverterModel: 'N/A',
    faultCode: 'Break',
    notes: 'Taking 15 minutes at the refreshment lounge.'
  }
];

export default function DispatchOverrideModal({
  isOpen,
  onClose,
  agents = [],
  initialAgent,
  onDispatch
}) {
  const [selectedAgentId, setSelectedAgentId] = useState(
    initialAgent?.id || (agents[0]?.id || '')
  );
  const [category, setCategory] = useState('onsite');
  const [inverterModel, setInverterModel] = useState('SolarMax 10K Hybrid');
  const [faultCode, setFaultCode] = useState('E04: Overcurrent');
  const [title, setTitle] = useState('Hardware Repair: Solar Inverter Gate Driver');
  const [notes, setNotes] = useState('Bench testing voltage rails with oscilloscope.');

  if (!isOpen) return null;

  const applyPreset = (preset) => {
    setCategory(preset.category);
    setTitle(preset.title);
    setInverterModel(preset.inverterModel);
    setFaultCode(preset.faultCode);
    setNotes(preset.notes);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedAgentId) return;

    let room = 'online_support';
    if (category === 'onsite') room = 'workshop';
    if (category === 'field') room = 'field_dispatch';
    if (category === 'meeting') room = 'war_room';
    if (category === 'break') room = 'lounge';

    onDispatch(selectedAgentId, {
      title,
      category,
      room,
      inverterModel,
      faultCode,
      notes,
      priority: category === 'onsite' || category === 'field' ? 'High' : 'Normal'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-6 shadow-2xl border border-white max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-500" />
              <span>Dispatch Agent / Test Case</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Instantly assign an agent to a specific task or inverter repair.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto py-4 space-y-4">
          {/* Agent Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Select Agent
            </label>
            <select
              value={selectedAgentId}
              onChange={(e) => setSelectedAgentId(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-white text-sm text-slate-800 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              {agents.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — ({a.role})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Presets */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">
              Quick Scenario Presets
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_CASES.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-[11px] font-semibold text-slate-700 transition-colors"
                >
                  {preset.category === 'onsite' ? '🔧 Inverter Repair' : preset.category === 'online' ? '💻 Online Ticket' : preset.category === 'field' ? '🚚 Field Bay' : '☕ Rest'}
                </button>
              ))}
            </div>
          </div>

          {/* Task Type & Zone */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Task Zone & Theme
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setCategory('onsite')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  category === 'onsite'
                    ? 'bg-orange-50 border-orange-400 text-orange-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Wrench className="w-4 h-4 text-orange-600" />
                <div className="text-left">
                  <div>Inverter Repair</div>
                  <div className="text-[10px] opacity-75">Hardware Workbench</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory('online')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  category === 'online'
                    ? 'bg-sky-50 border-sky-400 text-sky-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Monitor className="w-4 h-4 text-sky-600" />
                <div className="text-left">
                  <div>Online Support</div>
                  <div className="text-[10px] opacity-75">Computer Terminal</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory('field')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  category === 'field'
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Truck className="w-4 h-4 text-emerald-600" />
                <div className="text-left">
                  <div>Field Dispatch</div>
                  <div className="text-[10px] opacity-75">Service Prep Bay</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setCategory('break')}
                className={`py-2 px-3 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
                  category === 'break'
                    ? 'bg-amber-50 border-amber-400 text-amber-700 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-600'
                }`}
              >
                <Coffee className="w-4 h-4 text-amber-600" />
                <div className="text-left">
                  <div>Break Lounge</div>
                  <div className="text-[10px] opacity-75">Rest & Recharge</div>
                </div>
              </button>
            </div>
          </div>

          {/* Details */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Case / Event Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Inverter Product Model
              </label>
              <input
                type="text"
                value={inverterModel}
                onChange={(e) => setInverterModel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1">
                Fault Code / Metric
              </label>
              <input
                type="text"
                value={faultCode}
                onChange={(e) => setFaultCode(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Diagnostic Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-none"
            />
          </div>

          {/* Submit */}
          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl hover:bg-slate-100 text-slate-600 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-md shadow-emerald-600/20 flex items-center gap-1.5 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Dispatch Now</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
