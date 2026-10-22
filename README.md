# TechOps Deck: Live Technical Support Diorama

A 3D isometric operational dashboard for Technical Support Teams, driven in real-time by Google Calendar schedules. Inspired by the AgentDeck diorama style.

## 🚀 Features
- **Isometric 3D Diorama** (Three.js): Clean pastel low-poly world.
- **Support Team Zones**:
  - 💻 **Online Remote Support**: Multi-monitor desks for customer tickets & telemetry.
  - 🔧 **Inverter & EV Charger Lab**: Hardware repair workbenches, test instruments, and EV charger commissioning.
  - 🚚 **Field Dispatch Bay**: Equipment crates and traffic cones.
  - 👥 **War Room**: Escalations and shift handover table.
  - ☕ **Break Lounge**: Yellow retro vending machine & coffee bar.
- **Google Calendar Sync**:
  - Supports **Single Master Team Google Calendar** iCal feed (`.ics`).
  - Automatically identifies agents from `ATTENDEE`, `ORGANIZER`, or title brackets `[Name]`.
  - Extracts customer name, product/equipment, and `TicketID=...`.
  - One-click Google Maps site navigation and Google Meet join links.

## 📦 Deployment to Vercel
1. Import this repository into [Vercel](https://vercel.com).
2. Vercel automatically detects `vercel.json` and builds the static assets + serverless functions.
3. Your app is live 24/7 with zero hosting fees!
