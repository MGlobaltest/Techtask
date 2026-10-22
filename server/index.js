import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

// Settings store for Master Team Calendar
let appSettings = {
  masterCalendarUrl: '',
  lastSynced: null
};

// Default initial technical support team members
const INITIAL_TEAM = [
  {
    id: 'agent-tanatat',
    name: 'Tanatat Pornthepsiripong',
    role: 'Field Commissioning & EV Specialist',
    type: 'onsite',
    avatarColor: '#ea580c', // Vibrant Coral / Orange
    hairColor: '#1e293b',
    email: 'tanatat.por@mglobalsourcing.net',
    calendarUrl: '',
    status: 'onsite',
    currentRoom: 'workshop',
    currentTask: {
      title: 'Commissioning - SCG INTERNATIONAL - Other',
      category: 'onsite',
      ticketId: '6986b05f',
      customer: 'SCG INTERNATIONAL',
      inverterModel: 'EV Charger (SCG Site)',
      faultCode: 'Support Commissioning EV Charger',
      location: 'https://maps.app.goo.gl/yzmYc97rsrQAAPmR9',
      priority: 'High',
      startTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 180 * 60 * 1000).toISOString(),
      notes: 'Support commissioning EV charger\n\nTicketID=6986b05f'
    },
    stats: { completedToday: 4, avgResolutionTime: '1h 10m' }
  },
  {
    id: 'agent-2',
    name: 'Sarah Miller',
    role: 'Online Support Lead (Tier 2)',
    type: 'online',
    avatarColor: '#0284c7', // Sky Blue
    hairColor: '#78350f',
    calendarUrl: '',
    status: 'online',
    currentRoom: 'online_support',
    currentTask: {
      title: 'Remote Case #ON-9421: Live Inverter Telemetry Diagnostic & Grid Disconnect',
      category: 'online',
      ticketId: 'CASE-9421',
      inverterModel: 'EcoPower 5.5kW Micro-Inverter string',
      faultCode: 'Grid Frequency Out of Range (51.2Hz)',
      priority: 'Urgent',
      startTime: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
      notes: 'Customer plant in Texas seeing recurring trip. Adjusting remote ride-through frequency parameter via web portal.'
    },
    stats: { completedToday: 8, avgResolutionTime: '18m' }
  },
  {
    id: 'agent-3',
    name: 'Kenji Sato',
    role: 'Field Service Dispatch Tech',
    type: 'field',
    avatarColor: '#16a34a', // Emerald Green
    hairColor: '#1e293b',
    calendarUrl: '',
    status: 'field',
    currentRoom: 'field_dispatch',
    currentTask: {
      title: 'Field Prep: Commercial 50kW Inverter Replacement & Safety Inspection',
      category: 'field',
      ticketId: 'FIELD-309',
      inverterModel: 'MegaVolt 50kW Commercial 3-Phase',
      faultCode: 'Ground Fault / Insulation Resistance < 50kOhm',
      priority: 'High',
      startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 50 * 60 * 1000).toISOString(),
      notes: 'Packing replacement MPPT surge arrestors, arc-flash gear, and high-voltage insulation tester.'
    },
    stats: { completedToday: 2, avgResolutionTime: '1h 15m' }
  },
  {
    id: 'agent-4',
    name: 'Elena Rostova',
    role: 'Inverter QA & Bench Tester',
    type: 'onsite',
    avatarColor: '#d97706', // Amber
    hairColor: '#b45309',
    calendarUrl: '',
    status: 'onsite',
    currentRoom: 'workshop',
    currentTask: {
      title: 'Bench Calibration: High-Efficiency DC-AC Conversion Waveform Check',
      category: 'onsite',
      ticketId: 'BENCH-882',
      inverterModel: 'SineWave Pro 3.6kW Inverter',
      faultCode: 'THD (Total Harmonic Distortion) > 4.5%',
      priority: 'Medium',
      startTime: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
      notes: 'Running pure sine wave harmonic analysis under 80% resistive load at test bench.'
    },
    stats: { completedToday: 4, avgResolutionTime: '35m' }
  },
  {
    id: 'agent-5',
    name: 'David Park',
    role: 'Technical Incident Coordinator',
    type: 'meeting',
    avatarColor: '#9333ea', // Purple
    hairColor: '#0f172a',
    calendarUrl: '',
    status: 'meeting',
    currentRoom: 'war_room',
    currentTask: {
      title: 'Shift Handover & Critical Solar Farm Inverter Incident Review',
      category: 'meeting',
      ticketId: 'SYNC-102',
      inverterModel: 'Cluster Utility Inverters (10x 100kW)',
      faultCode: 'Sync Conference',
      priority: 'Medium',
      startTime: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 25 * 60 * 1000).toISOString(),
      notes: 'Reviewing weekend dispatch schedules and emergency spare inverter inventory count.'
    },
    stats: { completedToday: 5, avgResolutionTime: '25m' }
  },
  {
    id: 'agent-6',
    name: 'Nadia Rayan',
    role: 'Tier 1 Online Support Specialist',
    type: 'online',
    avatarColor: '#0d9488', // Teal
    hairColor: '#475569',
    calendarUrl: '',
    status: 'break',
    currentRoom: 'lounge',
    currentTask: {
      title: 'Scheduled Coffee & Rest Break',
      category: 'break',
      ticketId: 'REST-01',
      inverterModel: 'N/A',
      faultCode: 'On Break',
      priority: 'Low',
      startTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
      endTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
      notes: 'Taking 20-min recharge at the team coffee lounge.'
    },
    stats: { completedToday: 7, avgResolutionTime: '12m' }
  }
];

// In-memory data store with file persistence
let agents = [...INITIAL_TEAM];
try {
  if (fs.existsSync(DATA_FILE)) {
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      agents = parsed;
    } else if (parsed && parsed.agents) {
      agents = parsed.agents;
      appSettings = parsed.settings || appSettings;
    }
  } else {
    saveData();
  }
} catch (e) {
  console.warn('Could not read saved data file, using defaults.', e.message);
}

function saveData() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify({ agents, settings: appSettings }, null, 2));
  } catch (err) {
    console.error('Failed to write data.json:', err);
  }
}

// Keyword & Task Classification Engine (Supports Commissioning, EV Chargers, Inverters, Tickets)
export function classifyTask(title = '', description = '', location = '') {
  const combined = `${title} ${description} ${location}`.toLowerCase();

  // On-Site Commissioning / EV Charger / Inverter Hardware fixes
  if (
    combined.includes('commissioning') ||
    combined.includes('ev charger') ||
    combined.includes('charger') ||
    combined.includes('maps.app.goo.gl') ||
    combined.includes('inverter') ||
    combined.includes('hardware') ||
    combined.includes('repair') ||
    combined.includes('fixing') ||
    combined.includes('bench') ||
    combined.includes('pcb') ||
    combined.includes('oscilloscope') ||
    combined.includes('igbt') ||
    combined.includes('multimeter') ||
    combined.includes('soldering') ||
    combined.includes('capacitor') ||
    combined.includes('testing') ||
    combined.includes('fault') ||
    combined.includes('overcurrent') ||
    combined.includes('calibration')
  ) {
    const isCommissioning = combined.includes('commissioning') || combined.includes('charger');
    return {
      category: 'onsite',
      status: 'onsite',
      room: 'workshop',
      label: isCommissioning ? 'On-Site Commissioning (EV Charger / Inverter)' : 'On-Site Inverter Repair'
    };
  }

  // Field dispatch & on-site client visit prep
  if (
    combined.includes('field') ||
    combined.includes('dispatch') ||
    combined.includes('site visit') ||
    combined.includes('truck') ||
    combined.includes('transit') ||
    combined.includes('prep gear')
  ) {
    return {
      category: 'field',
      status: 'field',
      room: 'field_dispatch',
      label: 'Field Service Dispatch'
    };
  }

  // Meeting / Sync / Standup / Google Meet
  if (
    combined.includes('meeting') ||
    combined.includes('meet.google.com') ||
    combined.includes('sync') ||
    combined.includes('standup') ||
    combined.includes('handover') ||
    combined.includes('briefing') ||
    combined.includes('review')
  ) {
    return {
      category: 'meeting',
      status: 'meeting',
      room: 'war_room',
      label: 'Team Sync & Meeting'
    };
  }

  // Break / Lunch / Coffee
  if (
    combined.includes('break') ||
    combined.includes('lunch') ||
    combined.includes('coffee') ||
    combined.includes('rest') ||
    combined.includes('recharge') ||
    combined.includes('off')
  ) {
    return {
      category: 'break',
      status: 'break',
      room: 'lounge',
      label: 'Rest & Coffee Break'
    };
  }

  // Default to Online Remote Support in front of computer
  return {
    category: 'online',
    status: 'online',
    room: 'online_support',
    label: 'Online Remote Support'
  };
}

// Lightweight iCal parser (supports Google Calendar secret/public iCal feeds)
async function fetchAndParseIcal(url) {
  try {
    const res = await fetch(url, { headers: { 'User-Agent': 'TechOpsDeck-Live/1.0' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();

    const events = [];
    const lines = text.split(/\r\n|\n|\r/);
    let inEvent = false;
    let currentEvent = {};

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      // Handle folded lines in iCal
      while (i + 1 < lines.length && (lines[i + 1].startsWith(' ') || lines[i + 1].startsWith('\t'))) {
        i++;
        line += lines[i].slice(1);
      }

      if (line.startsWith('BEGIN:VEVENT')) {
        inEvent = true;
        currentEvent = { attendees: [] };
      } else if (line.startsWith('END:VEVENT')) {
        inEvent = false;
        if (currentEvent.summary && currentEvent.dtstart) {
          events.push(currentEvent);
        }
      } else if (inEvent) {
        if (line.startsWith('SUMMARY:')) {
          currentEvent.summary = line.substring(8);
        } else if (line.startsWith('DESCRIPTION:')) {
          currentEvent.description = line.substring(12).replace(/\\n/g, '\n').replace(/\\,/g, ',');
        } else if (line.startsWith('LOCATION:')) {
          currentEvent.location = line.substring(9).replace(/\\,/g, ',');
        } else if (line.startsWith('ORGANIZER')) {
          const cnMatch = line.match(/CN=([^;:]+)/i);
          const mailMatch = line.match(/mailto:([^;:\s]+)/i);
          currentEvent.organizer = {
            name: cnMatch ? cnMatch[1] : (mailMatch ? mailMatch[1] : 'Organizer'),
            email: mailMatch ? mailMatch[1] : ''
          };
        } else if (line.startsWith('ATTENDEE')) {
          const cnMatch = line.match(/CN=([^;:]+)/i);
          const mailMatch = line.match(/mailto:([^;:\s]+)/i);
          if (cnMatch || mailMatch) {
            currentEvent.attendees.push({
              name: cnMatch ? cnMatch[1] : (mailMatch ? mailMatch[1] : 'Attendee'),
              email: mailMatch ? mailMatch[1] : ''
            });
          }
        } else if (line.startsWith('DTSTART')) {
          const match = line.match(/:(\d{8}T\d{6}Z?|\d{8})/);
          if (match) currentEvent.dtstart = match[1];
        } else if (line.startsWith('DTEND')) {
          const match = line.match(/:(\d{8}T\d{6}Z?|\d{8})/);
          if (match) currentEvent.dtend = match[1];
        }
      }
    }

    return events;
  } catch (err) {
    console.error('Failed to parse iCal feed:', err.message);
    return [];
  }
}

// Parse iCal date format to JS Date
function parseIcalDate(str) {
  if (!str) return null;
  // Format: 20261023T033000Z or 20261023
  if (str.length >= 8) {
    const year = parseInt(str.slice(0, 4), 10);
    const month = parseInt(str.slice(4, 6), 10) - 1;
    const day = parseInt(str.slice(6, 8), 10);
    if (str.includes('T')) {
      const timePart = str.split('T')[1];
      const hour = parseInt(timePart.slice(0, 2), 10);
      const min = parseInt(timePart.slice(2, 4), 10);
      const sec = parseInt(timePart.slice(4, 6), 10) || 0;
      if (str.endsWith('Z')) {
        return new Date(Date.UTC(year, month, day, hour, min, sec));
      }
      return new Date(year, month, day, hour, min, sec);
    }
    return new Date(year, month, day);
  }
  return null;
}

// Extract Ticket ID: matches TicketID=6986b05f or Ticket ID: ...
function extractTicketId(text = '') {
  const match = text.match(/(?:ticketid|ticket id|ticket_id|ticket)[=:\s]+([a-zA-Z0-9_-]+)/i);
  if (match) return match[1];
  return null;
}

// Extract Customer Name from title format e.g. "Commissioning - SCG INTERNATIONAL - Other"
function extractCustomer(summary = '') {
  const parts = summary.split(/\s*-\s*/);
  if (parts.length >= 2) {
    return parts[1].trim();
  }
  return null;
}

// Extract Equipment / Product (EV charger, Inverter, etc.)
function extractProduct(text = '') {
  if (/ev\s*charger|charger|charging/i.test(text)) return 'EV Charger System';
  if (/solarmax/i.test(text)) return 'SolarMax Inverter';
  if (/ecopower/i.test(text)) return 'EcoPower Inverter';
  if (/megavolt/i.test(text)) return 'MegaVolt 50kW Central';
  if (/sinewave/i.test(text)) return 'SineWave Pro Inverter';
  if (/inverter/i.test(text)) return 'Solar Inverter System';
  return 'EV / Power Hardware';
}

// Extract Agent Name from Attendees, Organizer, Summary, or Description
function extractAgentName(eventOrSummary, desc = '') {
  if (typeof eventOrSummary === 'object' && eventOrSummary !== null) {
    const event = eventOrSummary;
    // 1. Check Attendees list (Google Calendar guest list)
    if (event.attendees && event.attendees.length > 0) {
      const person = event.attendees.find(a => 
        !a.email.includes('resource.calendar.google.com') && 
        !a.email.includes('group.calendar.google.com')
      );
      if (person && person.name) return person.name;
    }

    // 2. Check Organizer
    if (event.organizer && event.organizer.name && !event.organizer.email.includes('group.calendar.google.com')) {
      return event.organizer.name;
    }

    return extractAgentName(event.summary || '', event.description || '');
  }

  const summary = eventOrSummary || '';
  const description = desc || '';

  // 3. Bracket format: [Tanatat] or (Tanatat)
  const bracketMatch = summary.match(/^\[([^\]]+)\]/);
  if (bracketMatch) return bracketMatch[1].trim();

  const parenMatch = summary.match(/^\(([^)]+)\)/);
  if (parenMatch) return parenMatch[1].trim();

  // 4. Prefix format: "Name: ..." or "Name - ..."
  const colonMatch = summary.match(/^([A-Z][a-zA-Z\s]{1,24}):\s*(.+)/);
  if (colonMatch) return colonMatch[1].trim();

  // 5. Description field: "Agent: Name" or "Created by: Name"
  const descMatch = description.match(/(?:agent|tech|technician|assignee|assigned to|created by):\s*([^\n\r,]+)/i);
  if (descMatch) return descMatch[1].trim();

  return null;
}

// Extract Inverter Model from text
function extractInverterModel(text = '') {
  const modelMatch = text.match(/(?:model|inverter):\s*([^\n\r,]+)/i);
  if (modelMatch) return modelMatch[1].trim();
  if (text.toLowerCase().includes('solarmax')) return 'SolarMax Inverter';
  if (text.toLowerCase().includes('ecopower')) return 'EcoPower Inverter';
  if (text.toLowerCase().includes('megavolt')) return 'MegaVolt 50kW Central';
  if (text.toLowerCase().includes('sinewave')) return 'SineWave Pro Inverter';
  return null;
}

// Extract Fault Code from text
function extractFaultCode(text = '') {
  const faultMatch = text.match(/(?:fault|error|code|symptom):\s*([^\n\r,]+)/i);
  if (faultMatch) return faultMatch[1].trim();
  const eMatch = text.match(/\b([EFE]\d{2,3})\b/i);
  if (eMatch) return `Fault ${eMatch[1].toUpperCase()}`;
  return null;
}

// API Routes
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/settings', (req, res) => {
  res.json(appSettings);
});

app.post('/api/settings', (req, res) => {
  const { masterCalendarUrl } = req.body;
  if (masterCalendarUrl !== undefined) {
    appSettings.masterCalendarUrl = masterCalendarUrl;
  }
  saveData();
  res.json({ success: true, settings: appSettings });
});

app.get('/api/agents', (req, res) => {
  res.json(agents);
});

app.post('/api/agents', (req, res) => {
  const newAgent = req.body;
  if (!newAgent.name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const existingIndex = agents.findIndex(a => a.id === newAgent.id);
  if (existingIndex >= 0) {
    agents[existingIndex] = { ...agents[existingIndex], ...newAgent };
  } else {
    const id = newAgent.id || `agent-${Date.now()}`;
    const classification = classifyTask(newAgent.currentTask?.title || 'Online Support');
    agents.push({
      id,
      name: newAgent.name,
      role: newAgent.role || 'Technical Support Specialist',
      type: newAgent.type || classification.category,
      avatarColor: newAgent.avatarColor || '#0284c7',
      hairColor: newAgent.hairColor || '#1e293b',
      calendarUrl: newAgent.calendarUrl || '',
      status: classification.status,
      currentRoom: classification.room,
      currentTask: newAgent.currentTask || {
        title: 'Online Remote Support & Ticket Handling',
        category: 'online',
        ticketId: `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
        inverterModel: 'Standard Solar Inverter 5kW',
        faultCode: 'Normal Operation',
        priority: 'Medium',
        startTime: new Date().toISOString(),
        endTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        notes: 'Handling live customer diagnostics in front of computer terminal.'
      },
      stats: { completedToday: 0, avgResolutionTime: '20m' }
    });
  }

  saveData();
  res.json({ success: true, agents });
});

app.delete('/api/agents/:id', (req, res) => {
  agents = agents.filter(a => a.id !== req.params.id);
  saveData();
  res.json({ success: true, agents });
});

app.post('/api/agents/:id/override', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (!agent) {
    return res.status(404).json({ error: 'Agent not found' });
  }

  const { title, room, category, inverterModel, faultCode, notes, priority } = req.body;
  const classification = classifyTask(title || '', notes || '');

  agent.status = category || classification.status;
  agent.currentRoom = room || classification.room;
  agent.currentTask = {
    title: title || agent.currentTask.title,
    category: category || classification.category,
    ticketId: agent.currentTask.ticketId || `CASE-${Math.floor(1000 + Math.random() * 9000)}`,
    inverterModel: inverterModel || agent.currentTask.inverterModel || 'Solar Inverter 5kW',
    faultCode: faultCode || agent.currentTask.faultCode || 'Diagnostic Active',
    priority: priority || agent.currentTask.priority || 'Medium',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 45 * 60 * 1000).toISOString(),
    notes: notes || agent.currentTask.notes || 'Status manually updated from dashboard.'
  };

  saveData();
  res.json({ success: true, agent });
});

// Trigger Google Calendar sync for Master Team Calendar AND individual agent feeds
app.post('/api/calendar/sync', async (req, res) => {
  const reqMasterUrl = req.body?.masterCalendarUrl || appSettings.masterCalendarUrl;
  if (req.body?.masterCalendarUrl !== undefined) {
    appSettings.masterCalendarUrl = req.body.masterCalendarUrl;
  }

  let updatedCount = 0;
  const now = new Date();

  // 1. Process Master Team Calendar (Single calendar containing all agent events)
  if (reqMasterUrl && reqMasterUrl.startsWith('http')) {
    const allEvents = await fetchAndParseIcal(reqMasterUrl);
    if (allEvents.length > 0) {
      // Group events by extracted agent name
      const agentEventsMap = new Map();

      for (const ev of allEvents) {
        const agentName = extractAgentName(ev);
        if (agentName) {
          const key = agentName.toLowerCase();
          if (!agentEventsMap.has(key)) agentEventsMap.set(key, { name: agentName, events: [] });
          agentEventsMap.get(key).events.push(ev);
        }
      }

      // Update or create agents based on their calendar events
      for (const [key, { name, events }] of agentEventsMap.entries()) {
        let bestEvent = events.find(e => {
          const start = parseIcalDate(e.dtstart);
          const end = parseIcalDate(e.dtend);
          return start && end && now >= start && now <= end;
        }) || events[0];

        if (bestEvent) {
          let agent = agents.find(a => 
            a.name.toLowerCase() === key || 
            a.name.toLowerCase().includes(key) || 
            key.includes(a.name.toLowerCase())
          );

          const classification = classifyTask(bestEvent.summary || '', bestEvent.description || '', bestEvent.location || '');
          const ticketId = extractTicketId(`${bestEvent.description} ${bestEvent.summary}`) || `TKT-${Math.floor(1000 + Math.random() * 9000)}`;
          const customer = extractCustomer(bestEvent.summary || '');
          const product = extractProduct(`${bestEvent.summary} ${bestEvent.description}`);
          const faultCode = extractFaultCode(`${bestEvent.summary} ${bestEvent.description}`) || (bestEvent.summary?.toLowerCase().includes('commissioning') ? 'Commissioning EV Charger' : 'Standard Diagnostics');

          if (!agent) {
            // Auto-create agent discovered on the team calendar!
            const newId = `agent-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
            const colors = ['#ea580c', '#0284c7', '#16a34a', '#9333ea', '#d97706', '#0d9488'];
            agent = {
              id: newId,
              name: name,
              role: classification.category === 'onsite' ? 'Field Commissioning Specialist' : 'Online Technical Support',
              type: classification.category,
              avatarColor: colors[agents.length % colors.length],
              hairColor: '#334155',
              calendarUrl: '',
              status: classification.status,
              currentRoom: classification.room,
              currentTask: {
                title: bestEvent.summary,
                category: classification.category,
                ticketId,
                customer,
                inverterModel: product,
                faultCode,
                location: bestEvent.location || '',
                priority: classification.category === 'onsite' ? 'High' : 'Normal',
                startTime: parseIcalDate(bestEvent.dtstart)?.toISOString() || new Date().toISOString(),
                endTime: parseIcalDate(bestEvent.dtend)?.toISOString() || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
                notes: bestEvent.description || 'Synced from Team Google Calendar.'
              },
              stats: { completedToday: 0, avgResolutionTime: '25m' }
            };
            agents.push(agent);
          } else {
            // Update existing agent
            agent.status = classification.status;
            agent.currentRoom = classification.room;
            agent.currentTask.title = bestEvent.summary;
            agent.currentTask.category = classification.category;
            agent.currentTask.ticketId = ticketId;
            if (customer) agent.currentTask.customer = customer;
            agent.currentTask.inverterModel = product;
            agent.currentTask.faultCode = faultCode;
            if (bestEvent.location) agent.currentTask.location = bestEvent.location;
            if (bestEvent.description) agent.currentTask.notes = bestEvent.description;
            if (bestEvent.dtstart) agent.currentTask.startTime = parseIcalDate(bestEvent.dtstart)?.toISOString() || agent.currentTask.startTime;
            if (bestEvent.dtend) agent.currentTask.endTime = parseIcalDate(bestEvent.dtend)?.toISOString() || agent.currentTask.endTime;
          }
          updatedCount++;
        }
      }
    }
  }

  // 2. Also process any individual agent calendar feeds if provided
  for (const agent of agents) {
    if (agent.calendarUrl && agent.calendarUrl.startsWith('http')) {
      const events = await fetchAndParseIcal(agent.calendarUrl);
      if (events.length > 0) {
        const active = events.find(e => {
          const start = parseIcalDate(e.dtstart);
          const end = parseIcalDate(e.dtend);
          return start && end && now >= start && now <= end;
        }) || events[0];

        const classification = classifyTask(active.summary || '', active.description || '');
        const inverterModel = extractInverterModel(`${active.summary} ${active.description}`);
        const faultCode = extractFaultCode(`${active.summary} ${active.description}`);

        agent.status = classification.status;
        agent.currentRoom = classification.room;
        agent.currentTask.title = active.summary || agent.currentTask.title;
        agent.currentTask.category = classification.category;
        if (inverterModel) agent.currentTask.inverterModel = inverterModel;
        if (faultCode) agent.currentTask.faultCode = faultCode;
        if (active.description) agent.currentTask.notes = active.description;
        updatedCount++;
      }
    }
  }

  appSettings.lastSynced = new Date().toISOString();
  saveData();
  res.json({ success: true, updatedCount, agents, settings: appSettings });
});

// Random scenario simulation tick (for demonstration & testing)
app.post('/api/simulation/simulate-case', (req, res) => {
  const randomAgent = agents[Math.floor(Math.random() * agents.length)];
  const scenarios = [
    {
      title: 'On-Site Inverter Repair: SolarMax 15K - Error E09 Bus Capacitors Bulging',
      category: 'onsite',
      room: 'workshop',
      inverterModel: 'SolarMax 15K Pro',
      faultCode: 'E09: High Voltage DC Bus Overvoltage',
      notes: 'Soldering replacement 450V low-ESR electrolytic capacitors at workbench.'
    },
    {
      title: 'Online Case: Remote Grid Frequency Ride-Through Adjustment via Cloud',
      category: 'online',
      room: 'online_support',
      inverterModel: 'SmartWave 6kW Residential',
      faultCode: 'Grid Frequency Drift (50.8Hz)',
      notes: 'Monitoring live telemetry curves and pushing cloud parameter updates.'
    },
    {
      title: 'Emergency On-Site Dispatch: Commercial Rooftop Inverter Arc Fault Trip',
      category: 'field',
      room: 'field_dispatch',
      inverterModel: 'SunGiant 100kW Central',
      faultCode: 'AFCI: Series Arc Fault Detected',
      notes: 'Equipping with thermal camera, dielectric gloves, and replacement DC combiner fuses.'
    },
    {
      title: 'Online Support Chat: Assisting Installer with CT Clamp Direction Phase Error',
      category: 'online',
      room: 'online_support',
      inverterModel: 'Hybrid Energy 8kW',
      faultCode: 'Reverse Power Flow Warning',
      notes: 'Guide technician over live screen-share to reverse secondary CT wiring polarity.'
    },
    {
      title: 'Team Coffee Break & Quick Rest',
      category: 'break',
      room: 'lounge',
      inverterModel: 'N/A',
      faultCode: 'Break Time',
      notes: 'Taking a 15-minute coffee and stretch break at the lounge.'
    }
  ];

  const pick = scenarios[Math.floor(Math.random() * scenarios.length)];
  randomAgent.status = pick.category;
  randomAgent.currentRoom = pick.room;
  randomAgent.currentTask = {
    title: pick.title,
    category: pick.category,
    ticketId: `TCK-${Math.floor(1000 + Math.random() * 9000)}`,
    inverterModel: pick.inverterModel,
    faultCode: pick.faultCode,
    priority: pick.category === 'onsite' || pick.category === 'field' ? 'High' : 'Normal',
    startTime: new Date().toISOString(),
    endTime: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    notes: pick.notes
  };

  saveData();
  res.json({ success: true, updatedAgent: randomAgent, agents });
});

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`TechOps Support Live Server listening on port ${PORT}`);
  });
}

export default app;
