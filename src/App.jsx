import React, { useState, useEffect, useCallback } from 'react';
import DioramaCanvas, { ROOM_DEFINITIONS } from './components/DioramaCanvas.jsx';
import HeaderHUD from './components/HeaderHUD.jsx';
import AgentInspector from './components/AgentInspector.jsx';
import TeamManagerModal from './components/TeamManagerModal.jsx';
import DispatchOverrideModal from './components/DispatchOverrideModal.jsx';
import { 
  Users, 
  Layers, 
  Wrench, 
  Monitor, 
  Truck, 
  Coffee, 
  Compass,
  CheckCircle,
  Sparkles
} from 'lucide-react';

export default function App() {
  const [agents, setAgents] = useState([]);
  const [masterCalendarUrl, setMasterCalendarUrl] = useState('');
  const [selectedAgentId, setSelectedAgentId] = useState(null);
  const [isTeamModalOpen, setIsTeamModalOpen] = useState(false);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);
  const [dispatchTargetAgent, setDispatchTargetAgent] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [notification, setNotification] = useState(null);

  // Show a temporary banner notification
  const showToast = (msg, type = 'info') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  // Fetch settings with localStorage persistence for Vercel/cloud hosting
  const fetchSettings = useCallback(async () => {
    const savedLocal = localStorage.getItem('masterCalendarUrl');
    if (savedLocal) setMasterCalendarUrl(savedLocal);

    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        const url = data.masterCalendarUrl || savedLocal || '';
        setMasterCalendarUrl(url);
        if (url) localStorage.setItem('masterCalendarUrl', url);
      }
    } catch (e) {
      console.warn('Could not fetch settings from API, using local storage fallback.', e);
    }
  }, []);

  // Fetch all agents from backend
  const fetchAgents = useCallback(async () => {
    try {
      const res = await fetch('/api/agents');
      if (res.ok) {
        const data = await res.json();
        setAgents(data);
      }
    } catch (err) {
      console.warn('Backend /api/agents unreachable, using local fallback:', err.message);
    }
  }, []);

  useEffect(() => {
    fetchAgents();
    fetchSettings();
    // Auto sync check every 25 seconds
    const interval = setInterval(fetchAgents, 25000);
    return () => clearInterval(interval);
  }, [fetchAgents, fetchSettings]);

  // Google Calendar Sync
  const handleSyncCalendar = async (customUrl) => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/calendar/sync', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterCalendarUrl: customUrl || masterCalendarUrl })
      });
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents);
        showToast(`Calendar sync complete! Synced ${data.updatedCount} active events.`, 'success');
      }
    } catch (err) {
      showToast('Calendar sync failed to reach server.', 'error');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSaveMasterCalendar = async (url) => {
    setMasterCalendarUrl(url);
    if (url) localStorage.setItem('masterCalendarUrl', url);
    else localStorage.removeItem('masterCalendarUrl');

    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ masterCalendarUrl: url })
      });
      handleSyncCalendar(url);
    } catch (e) {
      showToast('Master calendar URL saved.', 'info');
      handleSyncCalendar(url);
    }
  };

  // Quick Simulation Tick
  const handleSimulateTick = async () => {
    try {
      const res = await fetch('/api/simulation/simulate-case', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents);
        setSelectedAgentId(data.updatedAgent.id);
        showToast(`New Live Event: ${data.updatedAgent.name} assigned to "${data.updatedAgent.currentTask.title}"`, 'success');
      }
    } catch (err) {
      showToast('Simulation trigger failed', 'error');
    }
  };

  // Mark Case Resolved
  const handleResolveCase = async (agentId) => {
    const targetAgent = agents.find(a => a.id === agentId);
    if (!targetAgent) return;

    try {
      const res = await fetch(`/api/agents/${agentId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Case Resolved & Verification Done',
          category: 'break',
          room: 'lounge',
          inverterModel: targetAgent.currentTask?.inverterModel,
          faultCode: 'Resolved / Normal Operation',
          notes: 'Case successfully diagnosed and solved.'
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchAgents();
        showToast(`🎉 Case resolved by ${targetAgent.name}! Moving to recharge lounge.`, 'success');
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Save / Update Team Member
  const handleSaveAgent = async (agentData) => {
    try {
      const res = await fetch('/api/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(agentData)
      });
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents);
        showToast('Team member saved successfully!', 'success');
      }
    } catch (err) {
      showToast('Failed to save team member', 'error');
    }
  };

  // Delete Team Member
  const handleDeleteAgent = async (agentId) => {
    try {
      const res = await fetch(`/api/agents/${agentId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setAgents(data.agents);
        if (selectedAgentId === agentId) setSelectedAgentId(null);
        showToast('Agent removed.', 'info');
      }
    } catch (err) {
      showToast('Failed to delete agent', 'error');
    }
  };

  // Manual Dispatch
  const handleDispatch = async (agentId, dispatchPayload) => {
    try {
      const res = await fetch(`/api/agents/${agentId}/override`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dispatchPayload)
      });
      const data = await res.json();
      if (data.success) {
        fetchAgents();
        setSelectedAgentId(agentId);
        showToast(`Dispatched to ${dispatchPayload.title}`, 'success');
      }
    } catch (err) {
      showToast('Dispatch failed', 'error');
    }
  };

  const selectedAgent = agents.find(a => a.id === selectedAgentId);

  return (
    <div className="relative w-screen h-screen overflow-hidden select-none bg-[#dce6e0]">
      {/* 1. Top HUD (AgentDeck layout & stats) */}
      <HeaderHUD
        agents={agents}
        onOpenTeamManager={() => setIsTeamModalOpen(true)}
        onOpenDispatchModal={() => {
          setDispatchTargetAgent(selectedAgent || agents[0]);
          setIsDispatchModalOpen(true);
        }}
        onSyncCalendar={handleSyncCalendar}
        onSimulateTick={handleSimulateTick}
        isSyncing={isSyncing}
      />

      {/* 2. Interactive 3D Diorama Canvas */}
      <DioramaCanvas
        agents={agents}
        selectedAgentId={selectedAgentId}
        onSelectAgent={(id) => setSelectedAgentId(id)}
        onSelectRoom={(roomId) => {
          // Find first agent in that room or focus room
          const agentInRoom = agents.find(a => a.currentRoom === roomId);
          if (agentInRoom) setSelectedAgentId(agentInRoom.id);
        }}
      />

      {/* 3. Agent Inspector Slide-over */}
      {selectedAgent && (
        <AgentInspector
          agent={selectedAgent}
          onClose={() => setSelectedAgentId(null)}
          onResolveCase={handleResolveCase}
          onOpenOverride={(agent) => {
            setDispatchTargetAgent(agent);
            setIsDispatchModalOpen(true);
          }}
        />
      )}

      {/* 4. Bottom Roster & Quick Jump Bar (Faithful to reference layout) */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
        <div className="glass-panel px-4 py-2.5 rounded-2xl flex items-center gap-2 pointer-events-auto shadow-xl border border-white/90">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider pr-2 border-r border-slate-200 hidden sm:block">
            Support Team
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto max-w-[80vw]">
            {agents.map((agent) => {
              const isSelected = agent.id === selectedAgentId;
              return (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                    isSelected
                      ? 'bg-slate-900 text-white shadow-md scale-105'
                      : 'bg-white/80 hover:bg-white text-slate-700 hover:shadow-sm border border-slate-200/60'
                  }`}
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: agent.avatarColor || '#0284c7' }}
                  />
                  <span>{agent.name.split(' ')[0]}</span>
                  {agent.status === 'onsite' && <Wrench className="w-3 h-3 text-orange-500" />}
                  {agent.status === 'online' && <Monitor className="w-3 h-3 text-sky-500" />}
                  {agent.status === 'field' && <Truck className="w-3 h-3 text-emerald-500" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 5. Notification Toast */}
      {notification && (
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-40 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="glass-panel px-4 py-2 rounded-xl text-xs font-semibold text-slate-800 border border-white/80 shadow-lg flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>{notification.msg}</span>
          </div>
        </div>
      )}

      {/* 6. Modals */}
      <TeamManagerModal
        isOpen={isTeamModalOpen}
        onClose={() => setIsTeamModalOpen(false)}
        agents={agents}
        masterCalendarUrl={masterCalendarUrl}
        onSaveMasterCalendar={handleSaveMasterCalendar}
        onSaveAgent={handleSaveAgent}
        onDeleteAgent={handleDeleteAgent}
      />

      <DispatchOverrideModal
        isOpen={isDispatchModalOpen}
        onClose={() => setIsDispatchModalOpen(false)}
        agents={agents}
        initialAgent={dispatchTargetAgent}
        onDispatch={handleDispatch}
      />
    </div>
  );
}
