import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';

// Room layout definitions (coordinates in 3D scene)
export const ROOM_DEFINITIONS = {
  online_support: {
    id: 'online_support',
    name: 'Online Remote Support',
    subtitle: 'Diagnostic & Telemetry',
    color: '#0284c7', // Sky blue
    wallColor: '#bae6fd',
    center: [-7, 0, -6],
    slots: [
      { pos: [-8.5, 0, -7], rot: 0, type: 'desk' },
      { pos: [-5.5, 0, -7], rot: 0, type: 'desk' },
      { pos: [-8.5, 0, -4.5], rot: Math.PI, type: 'desk' },
      { pos: [-5.5, 0, -4.5], rot: Math.PI, type: 'desk' }
    ]
  },
  workshop: {
    id: 'workshop',
    name: 'Inverter Repair Workshop',
    subtitle: 'Hardware & Bench Testing',
    color: '#ea580c', // Bright orange/coral
    wallColor: '#fed7aa',
    center: [7, 0, -6],
    slots: [
      { pos: [5.5, 0, -7], rot: 0, type: 'bench' },
      { pos: [8.5, 0, -7], rot: 0, type: 'bench' },
      { pos: [5.5, 0, -4.5], rot: Math.PI, type: 'bench' },
      { pos: [8.5, 0, -4.5], rot: Math.PI, type: 'bench' }
    ]
  },
  war_room: {
    id: 'war_room',
    name: 'War Room & Sync',
    subtitle: 'Escalation & Shift Handover',
    color: '#9333ea', // Purple
    wallColor: '#e9d5ff',
    center: [0, 0, -6],
    slots: [
      { pos: [-1.2, 0, -6.5], rot: Math.PI / 2, type: 'seat' },
      { pos: [1.2, 0, -6.5], rot: -Math.PI / 2, type: 'seat' },
      { pos: [-1.2, 0, -5], rot: Math.PI / 2, type: 'seat' },
      { pos: [1.2, 0, -5], rot: -Math.PI / 2, type: 'seat' }
    ]
  },
  field_dispatch: {
    id: 'field_dispatch',
    name: 'Field Dispatch Bay',
    subtitle: 'On-Site Service & Gear Prep',
    color: '#16a34a', // Green
    wallColor: '#bbf7d0',
    center: [7, 0, 4.5],
    slots: [
      { pos: [6, 0, 3.5], rot: -Math.PI / 4, type: 'field' },
      { pos: [8, 0, 5], rot: 0, type: 'field' },
      { pos: [5.5, 0, 5.5], rot: Math.PI / 4, type: 'field' }
    ]
  },
  lounge: {
    id: 'lounge',
    name: 'Coffee & Break Lounge',
    subtitle: 'Recharge & Rest Station',
    color: '#d97706', // Amber
    wallColor: '#fde68a',
    center: [-7, 0, 4.5],
    slots: [
      { pos: [-8, 0, 4], rot: 0, type: 'couch' },
      { pos: [-6, 0, 4], rot: 0, type: 'couch' },
      { pos: [-7.5, 0, 6], rot: -Math.PI / 2, type: 'vending' }
    ]
  },
  reception: {
    id: 'reception',
    name: 'Operations Reception',
    subtitle: 'Lobby & Case Intake',
    color: '#0d9488', // Teal
    wallColor: '#99f6e4',
    center: [0, 0, 4.5],
    slots: [
      { pos: [0, 0, 4], rot: 0, type: 'reception' },
      { pos: [-1.8, 0, 5.5], rot: -Math.PI / 2, type: 'bench_seat' },
      { pos: [1.8, 0, 5.5], rot: Math.PI / 2, type: 'bench_seat' }
    ]
  }
};

export default function DioramaCanvas({
  agents = [],
  selectedAgentId,
  onSelectAgent,
  onSelectRoom
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef(null);
  const rendererRef = useRef(null);
  const cameraRef = useRef(null);
  const agentMeshesRef = useRef(new Map());
  const raycasterRef = useRef(new THREE.Raycaster());
  const mouseRef = useRef(new THREE.Vector2());

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // 1. Scene setup with soft pastel background
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#dce6e0');
    sceneRef.current = scene;

    // 2. Orthographic Camera for true Isometric projection
    const aspect = width / height;
    const d = 14;
    const camera = new THREE.OrthographicCamera(
      -d * aspect,
      d * aspect,
      d,
      -d,
      1,
      1000
    );
    // True isometric 30-45 deg view
    camera.position.set(22, 24, 22);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    // 3. Renderer with antialiasing and soft shadows
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Lighting: Soft ambient + key directional light for cute pastel shadows
    const ambientLight = new THREE.AmbientLight('#ffffff', 0.85);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight('#fffaf0', 0.95);
    dirLight.position.set(25, 40, 20);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.width = 2048;
    dirLight.shadow.mapSize.height = 2048;
    dirLight.shadow.camera.near = 10;
    dirLight.shadow.camera.far = 80;
    dirLight.shadow.camera.left = -20;
    dirLight.shadow.camera.right = 20;
    dirLight.shadow.camera.top = 20;
    dirLight.shadow.camera.bottom = -20;
    dirLight.shadow.bias = -0.0005;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight('#e0f2fe', 0.4);
    fillLight.position.set(-20, 20, -20);
    scene.add(fillLight);

    // 5. Build Environment: Floors, Partitions, Props
    buildEnvironment(scene);

    // 6. Camera Orbit & Drag Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let cameraOffset = new THREE.Vector3(0, 0, 0);

    const handleMouseDown = (e) => {
      if (e.button === 0 || e.button === 2) {
        isDragging = true;
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouseRef.current.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1;
      mouseRef.current.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1;

      if (isDragging) {
        const dx = (e.clientX - prevMouse.x) * 0.025;
        const dy = (e.clientY - prevMouse.y) * 0.025;
        // Pan orthographic camera
        camera.position.x -= (dx - dy);
        camera.position.z += (dx + dy);
        prevMouse = { x: e.clientX, y: e.clientY };
      }
    };

    const handleMouseUp = (e) => {
      if (!isDragging) return;
      isDragging = false;
      const moveDist = Math.hypot(e.clientX - prevMouse.x, e.clientY - prevMouse.y);
      if (moveDist < 5) {
        // Raycast check for agent or room click
        raycasterRef.current.setFromCamera(mouseRef.current, camera);
        const intersects = raycasterRef.current.intersectObjects(scene.children, true);
        if (intersects.length > 0) {
          // Check for agent mesh
          let hitAgentId = null;
          for (const hit of intersects) {
            let obj = hit.object;
            while (obj) {
              if (obj.userData?.agentId) {
                hitAgentId = obj.userData.agentId;
                break;
              }
              obj = obj.parent;
            }
            if (hitAgentId) break;
          }

          if (hitAgentId && onSelectAgent) {
            onSelectAgent(hitAgentId);
            return;
          }

          // Check for room click
          for (const hit of intersects) {
            let obj = hit.object;
            while (obj) {
              if (obj.userData?.roomId) {
                if (onSelectRoom) onSelectRoom(obj.userData.roomId);
                return;
              }
              obj = obj.parent;
            }
          }
        }
      }
    };

    const handleWheel = (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 1.08 : 0.92;
      camera.zoom = Math.max(0.6, Math.min(camera.zoom / zoomFactor, 2.2));
      camera.updateProjectionMatrix();
    };

    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('wheel', handleWheel, { passive: false });

    // 7. Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      const asp = w / h;
      camera.left = -d * asp;
      camera.right = d * asp;
      camera.top = d;
      camera.bottom = -d;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    // 8. Animation Loop
    let clock = new THREE.Clock();
    let animFrameId;

    const animate = () => {
      animFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Animate agent idle motions
      agentMeshesRef.current.forEach((meshGroup, agentId) => {
        if (!meshGroup) return;

        // Subtle breathing / bobbing
        const speed = meshGroup.userData.animSpeed || 2.5;
        const bob = Math.sin(elapsedTime * speed + (meshGroup.userData.phase || 0)) * 0.04;
        meshGroup.position.y = (meshGroup.userData.baseY || 0) + Math.max(0, bob);

        // Action-specific animations
        const actionType = meshGroup.userData.actionType;
        const head = meshGroup.userData.headMesh;
        const leftArm = meshGroup.userData.leftArm;
        const rightArm = meshGroup.userData.rightArm;

        if (actionType === 'online' && leftArm && rightArm) {
          // Typing on computer keyboard
          leftArm.rotation.x = -0.6 + Math.sin(elapsedTime * 9) * 0.15;
          rightArm.rotation.x = -0.6 + Math.cos(elapsedTime * 9.5) * 0.15;
          if (head) head.rotation.y = Math.sin(elapsedTime * 0.8) * 0.1;
        } else if (actionType === 'onsite' && rightArm) {
          // Holding probe / screwdriver and working on inverter
          rightArm.rotation.x = -0.8 + Math.sin(elapsedTime * 6) * 0.3;
          if (leftArm) leftArm.rotation.x = -0.5 + Math.cos(elapsedTime * 4) * 0.1;
          if (head) head.rotation.x = 0.2 + Math.sin(elapsedTime * 3) * 0.08;
        } else if (actionType === 'break' && head) {
          // Relaxing / looking around
          head.rotation.y = Math.sin(elapsedTime * 0.5) * 0.25;
        }

        // Selection highlight ring bounce
        const ring = meshGroup.userData.selectionRing;
        if (ring) {
          ring.visible = meshGroup.userData.isSelected;
          if (ring.visible) {
            ring.rotation.z += 0.03;
            ring.scale.setScalar(1 + Math.sin(elapsedTime * 5) * 0.08);
          }
        }
      });

      // Oscilloscope screen glowing waveform pulse
      const oscScreen = scene.getObjectByName('oscScreen');
      if (oscScreen && oscScreen.material) {
        oscScreen.material.emissiveIntensity = 0.8 + Math.sin(elapsedTime * 8) * 0.25;
      }

      // Computer monitor flicker
      const compScreens = scene.getObjectsByProperty('isCompScreen', true);
      compScreens.forEach((scr, idx) => {
        if (scr.material) {
          scr.material.emissiveIntensity = 0.7 + Math.sin(elapsedTime * 4 + idx) * 0.1;
        }
      });

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('wheel', handleWheel);
      if (renderer.domElement && renderer.domElement.parentNode) {
        renderer.domElement.parentNode.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Update Agents in Scene whenever agents array or selection changes
  useEffect(() => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Track slots used per room
    const roomSlotCounter = {
      online_support: 0,
      workshop: 0,
      war_room: 0,
      field_dispatch: 0,
      lounge: 0,
      reception: 0
    };

    agents.forEach((agent, index) => {
      let group = agentMeshesRef.current.get(agent.id);

      const targetRoomKey = agent.currentRoom || 'online_support';
      const roomDef = ROOM_DEFINITIONS[targetRoomKey] || ROOM_DEFINITIONS.online_support;
      const slotIndex = (roomSlotCounter[targetRoomKey] || 0) % roomDef.slots.length;
      roomSlotCounter[targetRoomKey] = (roomSlotCounter[targetRoomKey] || 0) + 1;
      const slot = roomDef.slots[slotIndex];

      const isSelected = agent.id === selectedAgentId;

      if (!group) {
        // Create 3D stylized cute agent avatar
        group = createAgentMesh(agent);
        group.userData = {
          agentId: agent.id,
          actionType: agent.status || 'online',
          animSpeed: 2 + (index % 3) * 0.4,
          phase: index * 1.3,
          isSelected,
          targetPos: new THREE.Vector3(slot.pos[0], 0, slot.pos[2]),
          targetRot: slot.rot
        };
        group.position.set(slot.pos[0], 0, slot.pos[2]);
        group.rotation.y = slot.rot;
        scene.add(group);
        agentMeshesRef.current.set(agent.id, group);
      } else {
        // Update position and metadata
        group.userData.isSelected = isSelected;
        group.userData.actionType = agent.status || 'online';
        group.userData.targetPos = new THREE.Vector3(slot.pos[0], 0, slot.pos[2]);
        group.userData.targetRot = slot.rot;

        // Smoothly glide to new room
        group.position.set(slot.pos[0], 0, slot.pos[2]);
        group.rotation.y = slot.rot;

        // Update colors if changed
        if (group.userData.bodyMesh && agent.avatarColor) {
          group.userData.bodyMesh.material.color.set(agent.avatarColor);
        }
      }
    });

    // Remove deleted agents
    const currentAgentIds = new Set(agents.map(a => a.id));
    agentMeshesRef.current.forEach((mesh, id) => {
      if (!currentAgentIds.has(id)) {
        scene.remove(mesh);
        agentMeshesRef.current.delete(id);
      }
    });
  }, [agents, selectedAgentId]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden">
      {/* 3D WebGL Canvas */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Room Label Overlays for Instant Clarity */}
      <div className="absolute top-4 left-6 pointer-events-none flex gap-2">
        <div className="glass-pill px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm border border-white/80">
          <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse"></span>
          Online Support Pods
        </div>
        <div className="glass-pill px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm border border-white/80">
          <span className="w-2.5 h-2.5 rounded-full bg-orange-500"></span>
          Inverter & EV Charger Lab
        </div>
        <div className="glass-pill px-3 py-1.5 rounded-full text-xs font-semibold text-slate-700 flex items-center gap-1.5 shadow-sm border border-white/80">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
          Field Dispatch
        </div>
      </div>

      {/* Camera Reset & Help Button */}
      <div className="absolute bottom-6 right-6 flex items-center gap-2">
        <button
          onClick={() => {
            if (cameraRef.current) {
              cameraRef.current.position.set(22, 24, 22);
              cameraRef.current.lookAt(0, 0, 0);
              cameraRef.current.zoom = 1;
              cameraRef.current.updateProjectionMatrix();
            }
          }}
          className="glass-panel px-3 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-sky-600 hover:bg-white shadow-md transition-all flex items-center gap-1.5"
          title="Reset Isometric Camera"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Reset View
        </button>
      </div>
    </div>
  );
}

// -------------------------------------------------------------
// 3D Procedural Modeling Helpers (Environment, Rooms & Props)
// -------------------------------------------------------------
function buildEnvironment(scene) {
  // 1. Base Platform Floor with Pastel Grid Tiles (Like reference picture)
  const floorGeo = new THREE.BoxGeometry(26, 0.4, 22);
  const floorMat = new THREE.MeshStandardMaterial({
    color: '#edf4ef', // Clean pastel hospital floor
    roughness: 0.6,
    metalness: 0.05
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.position.y = -0.2;
  floor.receiveShadow = true;
  scene.add(floor);

  // Subtle floor tile seams
  const gridHelper = new THREE.GridHelper(26, 26, '#cbd5e1', '#e2e8f0');
  gridHelper.position.y = 0.01;
  scene.add(gridHelper);

  // Outer Edge Trim
  const edgeGeo = new THREE.BoxGeometry(26.6, 0.6, 22.6);
  const edgeMat = new THREE.MeshStandardMaterial({ color: '#cbd5e1', roughness: 0.8 });
  const edge = new THREE.Mesh(edgeGeo, edgeMat);
  edge.position.y = -0.35;
  scene.add(edge);

  // Build Room Dividers (Soft pastel top trim like reference image)
  createPartitionWall(scene, [-7, 0, -1], [12, 1.4, 0.3], '#93c5fd', '#38bdf8'); // Divider below online lab
  createPartitionWall(scene, [7, 0, -1], [12, 1.4, 0.3], '#fdba74', '#fb923c'); // Divider below workshop
  createPartitionWall(scene, [-0.5, 0, -6], [0.3, 1.4, 10], '#e2e8f0', '#94a3b8'); // Center divider top
  createPartitionWall(scene, [0.5, 0, -6], [0.3, 1.4, 10], '#e2e8f0', '#94a3b8');
  createPartitionWall(scene, [-0.5, 0, 4.5], [0.3, 1.4, 11], '#e2e8f0', '#94a3b8'); // Center divider bottom
  createPartitionWall(scene, [0.5, 0, 4.5], [0.3, 1.4, 11], '#e2e8f0', '#94a3b8');

  // -------------------------------------------------------------
  // ROOM 1: ONLINE TECH SUPPORT (Multi-monitors, Desks, Terminals)
  // -------------------------------------------------------------
  createComputerWorkstation(scene, [-8.5, 0, -7.5], 0);
  createComputerWorkstation(scene, [-5.5, 0, -7.5], 0);
  createComputerWorkstation(scene, [-8.5, 0, -4.0], Math.PI);
  createComputerWorkstation(scene, [-5.5, 0, -4.0], Math.PI);

  // Room banner card
  createRoomSign(scene, [-7, 2.2, -10.5], 'ONLINE SUPPORT LAB', '#0284c7');

  // -------------------------------------------------------------
  // ROOM 2: INVERTER REPAIR WORKSHOP (Workbenches, Inverters, Scopes)
  // -------------------------------------------------------------
  createInverterWorkbench(scene, [5.5, 0, -7.5], 0, 'Hybrid 10kW');
  createInverterWorkbench(scene, [8.5, 0, -7.5], 0, 'Solar 5kW Pro');
  createInverterWorkbench(scene, [5.5, 0, -4.0], Math.PI, 'MicroInverter Bench');
  createInverterWorkbench(scene, [8.5, 0, -4.0], Math.PI, 'Central 50kW Test');

  // Commercial EV Charger Test Station (Dedicated for EV Charger Commissioning!)
  createEVChargerPedestal(scene, [10.8, 0, -5.8]);

  // Spare parts shelving unit against back wall
  createPartsShelf(scene, [7, 0, -10.4]);
  createRoomSign(scene, [7, 2.2, -10.5], 'INVERTER & EV CHARGER LAB', '#ea580c');

  // -------------------------------------------------------------
  // ROOM 3: WAR ROOM & ESCALATIONS (Meeting Table & Screen)
  // -------------------------------------------------------------
  createWarRoom(scene, [0, 0, -6]);

  // -------------------------------------------------------------
  // ROOM 4: FIELD DISPATCH BAY (Service Gear & Cones)
  // -------------------------------------------------------------
  createFieldDispatchBay(scene, [7, 0, 4.5]);
  createRoomSign(scene, [7, 2.2, 10.5], 'FIELD SERVICE DISPATCH', '#16a34a');

  // -------------------------------------------------------------
  // ROOM 5: RECEPTION & LOBBY (Reception counter, chairs, arcade/vending)
  // -------------------------------------------------------------
  createReceptionLobby(scene, [0, 0, 4.5]);

  // -------------------------------------------------------------
  // ROOM 6: COFFEE & BREAK LOUNGE (Vending machine, coffee, plant)
  // -------------------------------------------------------------
  createLoungeArea(scene, [-7, 0, 4.5]);
  createRoomSign(scene, [-7, 2.2, 10.5], 'BREAK & RECHARGE LOUNGE', '#d97706');
}

// Partition wall with colored rounded coping on top
function createPartitionWall(scene, pos, size, bodyColor, topColor) {
  const wallGroup = new THREE.Group();

  const bodyGeo = new THREE.BoxGeometry(size[0], size[1], size[2]);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: bodyColor,
    roughness: 0.5,
    metalness: 0.1
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = size[1] / 2;
  body.castShadow = true;
  body.receiveShadow = true;
  wallGroup.add(body);

  // Colored top cap
  const topGeo = new THREE.BoxGeometry(size[0] + 0.1, 0.15, size[2] + 0.1);
  const topMat = new THREE.MeshStandardMaterial({
    color: topColor,
    roughness: 0.3,
    metalness: 0.2
  });
  const top = new THREE.Mesh(topGeo, topMat);
  top.position.y = size[1] + 0.075;
  top.castShadow = true;
  wallGroup.add(top);

  wallGroup.position.set(pos[0], pos[1], pos[2]);
  scene.add(wallGroup);
}

// Online Computer Desk with Glowing Dual Displays
function createComputerWorkstation(scene, pos, rot) {
  const deskGroup = new THREE.Group();

  // Clean White Desk
  const deskTopGeo = new THREE.BoxGeometry(2.2, 0.1, 1.2);
  const deskMat = new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.4 });
  const deskTop = new THREE.Mesh(deskTopGeo, deskMat);
  deskTop.position.y = 1.0;
  deskTop.castShadow = true;
  deskTop.receiveShadow = true;
  deskGroup.add(deskTop);

  // Legs
  const legGeo = new THREE.CylinderGeometry(0.04, 0.04, 1.0);
  const legMat = new THREE.MeshStandardMaterial({ color: '#94a3b8', metalness: 0.5 });
  [
    [-1.0, 0.5, -0.5],
    [1.0, 0.5, -0.5],
    [-1.0, 0.5, 0.5],
    [1.0, 0.5, 0.5]
  ].forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(lx, ly, lz);
    leg.castShadow = true;
    deskGroup.add(leg);
  });

  // Dual Computer Monitors with Glowing Screens
  const monitorGeo = new THREE.BoxGeometry(0.9, 0.55, 0.04);
  const monitorBezelMat = new THREE.MeshStandardMaterial({ color: '#1e293b' });
  const screenMat = new THREE.MeshStandardMaterial({
    color: '#0284c7',
    emissive: '#38bdf8',
    emissiveIntensity: 0.7,
    roughness: 0.2
  });

  // Left Monitor (Terminal/Diagnostic code)
  const leftMon = new THREE.Mesh(monitorGeo, monitorBezelMat);
  leftMon.position.set(-0.48, 1.45, -0.3);
  leftMon.rotation.y = 0.15;
  leftMon.castShadow = true;
  deskGroup.add(leftMon);

  const leftScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.48), screenMat);
  leftScreen.position.set(-0.48, 1.45, -0.278);
  leftScreen.rotation.y = 0.15;
  leftScreen.isCompScreen = true;
  deskGroup.add(leftScreen);

  // Right Monitor (Live Inverter Telemetry Graph)
  const rightMon = new THREE.Mesh(monitorGeo, monitorBezelMat);
  rightMon.position.set(0.48, 1.45, -0.3);
  rightMon.rotation.y = -0.15;
  rightMon.castShadow = true;
  deskGroup.add(rightMon);

  const rightScreenMat = new THREE.MeshStandardMaterial({
    color: '#059669',
    emissive: '#34d399',
    emissiveIntensity: 0.7,
    roughness: 0.2
  });
  const rightScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.82, 0.48), rightScreenMat);
  rightScreen.position.set(0.48, 1.45, -0.278);
  rightScreen.rotation.y = -0.15;
  rightScreen.isCompScreen = true;
  deskGroup.add(rightScreen);

  // Keyboard & Mouse
  const kb = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.02, 0.22),
    new THREE.MeshStandardMaterial({ color: '#334155' })
  );
  kb.position.set(0, 1.06, 0.1);
  deskGroup.add(kb);

  // Ergonomic Office Chair
  const chairGroup = new THREE.Group();
  const seat = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.1, 0.7),
    new THREE.MeshStandardMaterial({ color: '#475569', roughness: 0.7 })
  );
  seat.position.y = 0.65;
  chairGroup.add(seat);

  const backrest = new THREE.Mesh(
    new THREE.BoxGeometry(0.7, 0.7, 0.08),
    new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.7 })
  );
  backrest.position.set(0, 1.05, 0.32);
  chairGroup.add(backrest);

  chairGroup.position.set(0, 0, 0.85);
  deskGroup.add(chairGroup);

  deskGroup.position.set(pos[0], pos[1], pos[2]);
  deskGroup.rotation.y = rot;
  scene.add(deskGroup);
}

// Inverter Hardware Repair Workbench (The star of technical hardware testing!)
function createInverterWorkbench(scene, pos, rot, modelName) {
  const benchGroup = new THREE.Group();

  // Heavy Duty Industrial Workbench
  const benchTop = new THREE.Mesh(
    new THREE.BoxGeometry(2.4, 0.12, 1.4),
    new THREE.MeshStandardMaterial({ color: '#e2e8f0', roughness: 0.3, metalness: 0.2 })
  );
  benchTop.position.y = 1.0;
  benchTop.castShadow = true;
  benchTop.receiveShadow = true;
  benchGroup.add(benchTop);

  // Steel Bench Legs
  const legGeo = new THREE.BoxGeometry(0.1, 1.0, 0.1);
  const legMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.7 });
  [
    [-1.1, 0.5, -0.6],
    [1.1, 0.5, -0.6],
    [-1.1, 0.5, 0.6],
    [1.1, 0.5, 0.6]
  ].forEach(([lx, ly, lz]) => {
    const leg = new THREE.Mesh(legGeo, legMat);
    leg.position.set(lx, ly, lz);
    benchGroup.add(leg);
  });

  // -------------------------------------------------------------
  // 3D INVERTER PRODUCT MODEL ON BENCH (Detailed solar/power inverter)
  // -------------------------------------------------------------
  const inverterGroup = new THREE.Group();

  // Main Inverter Metal Enclosure (Matte metallic grey/white with brand color)
  const invBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.35, 0.75),
    new THREE.MeshStandardMaterial({
      color: '#f1f5f9',
      roughness: 0.35,
      metalness: 0.4
    })
  );
  invBody.position.y = 0.18;
  invBody.castShadow = true;
  inverterGroup.add(invBody);

  // Inverter Side Cooling Heat Sink Fins
  const finGeo = new THREE.BoxGeometry(0.04, 0.3, 0.7);
  const finMat = new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.8 });
  [-0.47, 0.47].forEach((fx) => {
    const fin = new THREE.Mesh(finGeo, finMat);
    fin.position.set(fx, 0.18, 0);
    inverterGroup.add(fin);
  });

  // Inverter Front LCD Status Panel & Error LEDs
  const lcdScreen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.35, 0.18),
    new THREE.MeshStandardMaterial({
      color: '#0f172a',
      emissive: '#38bdf8',
      emissiveIntensity: 0.65
    })
  );
  lcdScreen.position.set(0, 0.22, 0.38);
  inverterGroup.add(lcdScreen);

  // Red/Green Status Indicator Light
  const ledLight = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 8, 8),
    new THREE.MeshStandardMaterial({
      color: '#ef4444',
      emissive: '#f87171',
      emissiveIntensity: 0.9
    })
  );
  ledLight.position.set(0.25, 0.22, 0.38);
  inverterGroup.add(ledLight);

  // Red DC Isolator Rotary Switch on the side
  const switchKnob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.06, 0.06, 0.06),
    new THREE.MeshStandardMaterial({ color: '#dc2626', roughness: 0.3 })
  );
  switchKnob.rotation.z = Math.PI / 2;
  switchKnob.position.set(-0.48, 0.18, 0.2);
  inverterGroup.add(switchKnob);

  inverterGroup.position.set(0.2, 1.06, 0.1);
  benchGroup.add(inverterGroup);

  // -------------------------------------------------------------
  // BENCH INSTRUMENT 1: DIGITAL OSCILLOSCOPE (Showing Sine Wave)
  // -------------------------------------------------------------
  const oscGroup = new THREE.Group();
  const oscBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.65, 0.45, 0.4),
    new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.5 })
  );
  oscBody.position.y = 0.23;
  oscBody.castShadow = true;
  oscGroup.add(oscBody);

  // Oscilloscope CRT/LCD Screen with waveform
  const oscScreenMat = new THREE.MeshStandardMaterial({
    color: '#022c22',
    emissive: '#10b981', // Glowing green trace
    emissiveIntensity: 0.85
  });
  const oscScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.3), oscScreenMat);
  oscScreen.name = 'oscScreen';
  oscScreen.position.set(-0.04, 0.25, 0.205);
  oscGroup.add(oscScreen);

  // Oscilloscope Control Knobs
  const knobMat = new THREE.MeshStandardMaterial({ color: '#e2e8f0' });
  [
    [0.22, 0.32, 0.205],
    [0.22, 0.20, 0.205],
    [0.22, 0.10, 0.205]
  ].forEach(([kx, ky, kz]) => {
    const knob = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.03), knobMat);
    knob.rotation.x = Math.PI / 2;
    knob.position.set(kx, ky, kz);
    oscGroup.add(knob);
  });

  oscGroup.position.set(-0.75, 1.06, -0.25);
  benchGroup.add(oscGroup);

  // -------------------------------------------------------------
  // BENCH INSTRUMENT 2: DIGITAL MULTIMETER (Yellow Rugged Case)
  // -------------------------------------------------------------
  const dmm = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.08, 0.35),
    new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.4 }) // Fluke yellow
  );
  dmm.position.set(-0.15, 1.1, -0.3);
  benchGroup.add(dmm);

  // Multimeter probes (red and black wires going to inverter)
  const probeWire = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.4),
    new THREE.MeshStandardMaterial({ color: '#ef4444' })
  );
  probeWire.rotation.z = Math.PI / 3;
  probeWire.position.set(0.05, 1.1, -0.1);
  benchGroup.add(probeWire);

  // Anti-static ESD Mat on workbench surface
  const esdMat = new THREE.Mesh(
    new THREE.PlaneGeometry(1.4, 1.0),
    new THREE.MeshStandardMaterial({ color: '#0284c7', roughness: 0.9 })
  );
  esdMat.rotation.x = -Math.PI / 2;
  esdMat.position.set(0.2, 1.061, 0.05);
  benchGroup.add(esdMat);

  benchGroup.position.set(pos[0], pos[1], pos[2]);
  benchGroup.rotation.y = rot;
  scene.add(benchGroup);
}

// Commercial EV Charger Test Station / Pedestal
function createEVChargerPedestal(scene, pos) {
  const chargerGroup = new THREE.Group();

  // Mounting Pedestal Post
  const post = new THREE.Mesh(
    new THREE.BoxGeometry(0.35, 1.4, 0.25),
    new THREE.MeshStandardMaterial({ color: '#334155', roughness: 0.4 })
  );
  post.position.y = 0.7;
  post.castShadow = true;
  chargerGroup.add(post);

  // Main EV Charger Wallbox / Enclosure (Glossy Clean White)
  const box = new THREE.Mesh(
    new THREE.BoxGeometry(0.55, 0.8, 0.35),
    new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.2, metalness: 0.2 })
  );
  box.position.set(0, 1.3, 0.05);
  box.castShadow = true;
  chargerGroup.add(box);

  // Status Screen / UI Display
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(0.3, 0.22),
    new THREE.MeshStandardMaterial({
      color: '#0284c7',
      emissive: '#38bdf8',
      emissiveIntensity: 0.85
    })
  );
  screen.position.set(0, 1.45, 0.23);
  chargerGroup.add(screen);

  // Glowing Charging Status Ring (Green / Cyan Pulse)
  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.12, 0.02, 16, 32),
    new THREE.MeshStandardMaterial({
      color: '#10b981',
      emissive: '#34d399',
      emissiveIntensity: 0.9
    })
  );
  ring.position.set(0, 1.15, 0.23);
  chargerGroup.add(ring);

  // Charging Cable Coil & Connector
  const cable = new THREE.Mesh(
    new THREE.TorusGeometry(0.16, 0.03, 12, 24),
    new THREE.MeshStandardMaterial({ color: '#0f172a', roughness: 0.8 })
  );
  cable.position.set(0.32, 1.1, 0);
  cable.rotation.y = Math.PI / 2;
  chargerGroup.add(cable);

  chargerGroup.position.set(pos[0], pos[1], pos[2]);
  scene.add(chargerGroup);
}

// Spare Parts / Inverter Component Shelving Unit
function createPartsShelf(scene, pos) {
  const shelfGroup = new THREE.Group();

  const frameMat = new THREE.MeshStandardMaterial({ color: '#475569', metalness: 0.6 });
  const woodMat = new THREE.MeshStandardMaterial({ color: '#fed7aa', roughness: 0.8 });

  // Shelves
  [0.5, 1.2, 1.9, 2.6].forEach((y) => {
    const board = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.08, 0.8), woodMat);
    board.position.y = y;
    board.castShadow = true;
    shelfGroup.add(board);
  });

  // Vertical steel posts
  [
    [-1.75, 1.5, -0.35],
    [1.75, 1.5, -0.35],
    [-1.75, 1.5, 0.35],
    [1.75, 1.5, 0.35]
  ].forEach(([px, py, pz]) => {
    const post = new THREE.Mesh(new THREE.BoxGeometry(0.08, 2.8, 0.08), frameMat);
    post.position.set(px, py, pz);
    shelfGroup.add(post);
  });

  // Component Storage Bins (IGBT modules, capacitors, microcontrollers)
  const binColors = ['#0284c7', '#ea580c', '#16a34a', '#eab308'];
  for (let i = 0; i < 6; i++) {
    const bin = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.25, 0.5),
      new THREE.MeshStandardMaterial({ color: binColors[i % binColors.length] })
    );
    bin.position.set(-1.2 + i * 0.5, 1.35, 0);
    shelfGroup.add(bin);
  }

  shelfGroup.position.set(pos[0], pos[1], pos[2]);
  scene.add(shelfGroup);
}

// War Room / Shift Handover Conference
function createWarRoom(scene, pos) {
  const roomGroup = new THREE.Group();

  // Oval Conference Table
  const table = new THREE.Mesh(
    new THREE.CylinderGeometry(1.6, 1.6, 0.1, 32),
    new THREE.MeshStandardMaterial({ color: '#f8fafc', roughness: 0.3 })
  );
  table.position.y = 1.0;
  table.castShadow = true;
  roomGroup.add(table);

  // Table base
  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.6, 0.95, 16),
    new THREE.MeshStandardMaterial({ color: '#64748b', metalness: 0.5 })
  );
  base.position.y = 0.5;
  roomGroup.add(base);

  // Whiteboard / Incident Dashboard on Back Wall
  const board = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 1.6, 0.08),
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 })
  );
  board.position.set(0, 2.3, -4.5);
  roomGroup.add(board);

  // Board Frame
  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(3.1, 1.7, 0.06),
    new THREE.MeshStandardMaterial({ color: '#94a3b8' })
  );
  frame.position.set(0, 2.3, -4.52);
  roomGroup.add(frame);

  roomGroup.position.set(pos[0], pos[1], pos[2]);
  scene.add(roomGroup);
}

// Field Dispatch Bay (Service Van Parking, Traffic Cones, Safety Gear)
function createFieldDispatchBay(scene, pos) {
  const bayGroup = new THREE.Group();

  // Striped Hazard Floor Decal (Yellow & Black diagonal warning stripes)
  const hazardFloor = new THREE.Mesh(
    new THREE.PlaneGeometry(5.0, 3.5),
    new THREE.MeshStandardMaterial({ color: '#fef08a', roughness: 0.7 })
  );
  hazardFloor.rotation.x = -Math.PI / 2;
  hazardFloor.position.set(0, 0.02, 0);
  bayGroup.add(hazardFloor);

  // Orange Traffic Cones (High-visibility for on-site field visits)
  const coneMat = new THREE.MeshStandardMaterial({ color: '#ea580c', roughness: 0.4 });
  const stripeMat = new THREE.MeshStandardMaterial({ color: '#ffffff' });

  [[-1.8, 0, -1.2], [-1.8, 0, 1.2]].forEach(([cx, cy, cz]) => {
    const cone = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.55, 16), coneMat);
    cone.position.set(cx, 0.28, cz);
    cone.castShadow = true;
    bayGroup.add(cone);

    const base = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.04, 0.4), coneMat);
    base.position.set(cx, 0.02, cz);
    bayGroup.add(base);
  });

  // Heavy Duty Field Flight Case / Toolkit (for Inverter Replacement)
  const caseBox = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 0.55, 0.65),
    new THREE.MeshStandardMaterial({ color: '#1e293b', roughness: 0.5, metalness: 0.3 })
  );
  caseBox.position.set(1.4, 0.28, -0.6);
  caseBox.castShadow = true;
  bayGroup.add(caseBox);

  // High-Voltage Safety Hardhat on case
  const hat = new THREE.Mesh(
    new THREE.SphereGeometry(0.15, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.5),
    new THREE.MeshStandardMaterial({ color: '#facc15', roughness: 0.3 })
  );
  hat.position.set(1.4, 0.6, -0.6);
  bayGroup.add(hat);

  bayGroup.position.set(pos[0], pos[1], pos[2]);
  scene.add(bayGroup);
}

// Reception & Lobby
function createReceptionLobby(scene, pos) {
  const lobby = new THREE.Group();

  // Curved Modern Reception Desk (Mint Teal like the reference image!)
  const desk = new THREE.Mesh(
    new THREE.BoxGeometry(2.8, 1.1, 0.9),
    new THREE.MeshStandardMaterial({ color: '#0d9488', roughness: 0.4 })
  );
  desk.position.set(0, 0.55, 0);
  desk.castShadow = true;
  lobby.add(desk);

  // Counter Top
  const counterTop = new THREE.Mesh(
    new THREE.BoxGeometry(3.0, 0.1, 1.05),
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.2 })
  );
  counterTop.position.set(0, 1.1, 0);
  lobby.add(counterTop);

  // Waiting Benches (Coral/Warm Grey like reference screenshot)
  const benchMat = new THREE.MeshStandardMaterial({ color: '#f97316' });
  [-1.8, 1.8].forEach((bx) => {
    const seat = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.45, 0.6), benchMat);
    seat.position.set(bx, 0.25, 2.0);
    seat.castShadow = true;
    lobby.add(seat);
  });

  lobby.position.set(pos[0], pos[1], pos[2]);
  scene.add(lobby);
}

// Break & Coffee Lounge (Featuring the iconic vending machine & coffee spot!)
function createLoungeArea(scene, pos) {
  const lounge = new THREE.Group();

  // 1. Retro Yellow Vending Machine (Faithful homage to the reference image!)
  const vendGroup = new THREE.Group();
  const vendBody = new THREE.Mesh(
    new THREE.BoxGeometry(0.9, 1.8, 0.8),
    new THREE.MeshStandardMaterial({ color: '#eab308', roughness: 0.3 })
  );
  vendBody.position.y = 0.9;
  vendBody.castShadow = true;
  vendGroup.add(vendBody);

  // Glass Window
  const glass = new THREE.Mesh(
    new THREE.PlaneGeometry(0.7, 0.9),
    new THREE.MeshStandardMaterial({ color: '#38bdf8', emissive: '#0284c7', emissiveIntensity: 0.4 })
  );
  glass.position.set(0, 1.15, 0.41);
  vendGroup.add(glass);

  // Soda Cans inside
  const canColors = ['#ef4444', '#10b981', '#3b82f6'];
  for (let c = 0; c < 3; c++) {
    const can = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.06, 0.14),
      new THREE.MeshStandardMaterial({ color: canColors[c] })
    );
    can.position.set(-0.2 + c * 0.2, 0.9, 0.2);
    vendGroup.add(can);
  }

  vendGroup.position.set(-2.5, 0, -1.0);
  lounge.add(vendGroup);

  // 2. Coffee Counter with Espresso Machine
  const coffeeBar = new THREE.Mesh(
    new THREE.BoxGeometry(1.6, 1.0, 0.8),
    new THREE.MeshStandardMaterial({ color: '#475569' })
  );
  coffeeBar.position.set(0, 0.5, -1.0);
  lounge.add(coffeeBar);

  const espressoMachine = new THREE.Mesh(
    new THREE.BoxGeometry(0.5, 0.45, 0.4),
    new THREE.MeshStandardMaterial({ color: '#dc2626', metalness: 0.6 })
  );
  espressoMachine.position.set(0, 1.25, -1.0);
  lounge.add(espressoMachine);

  // 3. Water Cooler (with Blue Jug)
  const coolerBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.2, 0.2, 0.9),
    new THREE.MeshStandardMaterial({ color: '#ffffff' })
  );
  coolerBase.position.set(1.4, 0.45, -1.0);
  lounge.add(coolerBase);

  const waterBottle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.18, 0.16, 0.5),
    new THREE.MeshStandardMaterial({ color: '#38bdf8', transparent: true, opacity: 0.7 })
  );
  waterBottle.position.set(1.4, 1.1, -1.0);
  lounge.add(waterBottle);

  // 4. Potted Plant (Monstera / Ficus)
  const pot = new THREE.Mesh(
    new THREE.CylinderGeometry(0.25, 0.18, 0.4),
    new THREE.MeshStandardMaterial({ color: '#fed7aa' })
  );
  pot.position.set(2.4, 0.2, 1.5);
  lounge.add(pot);

  const plantLeaves = new THREE.Mesh(
    new THREE.DodecahedronGeometry(0.35),
    new THREE.MeshStandardMaterial({ color: '#16a34a', roughness: 0.8 })
  );
  plantLeaves.position.set(2.4, 0.55, 1.5);
  lounge.add(plantLeaves);

  lounge.position.set(pos[0], pos[1], pos[2]);
  scene.add(lounge);
}

// Floating Room Sign
function createRoomSign(scene, pos, text, color) {
  const group = new THREE.Group();

  const plaque = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.45, 0.1),
    new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.3 })
  );
  plaque.castShadow = true;
  group.add(plaque);

  const topStripe = new THREE.Mesh(
    new THREE.BoxGeometry(3.6, 0.08, 0.12),
    new THREE.MeshStandardMaterial({ color: color })
  );
  topStripe.position.y = 0.2;
  group.add(topStripe);

  group.position.set(pos[0], pos[1], pos[2]);
  scene.add(group);
}

// -------------------------------------------------------------
// 3D Stylized Cute Agent Avatar (Chibi Character Model)
// -------------------------------------------------------------
function createAgentMesh(agent) {
  const agentGroup = new THREE.Group();
  agentGroup.userData = { agentId: agent.id };

  // Character Body / Jacket (Team colored)
  const bodyGeo = new THREE.CylinderGeometry(0.26, 0.3, 0.65, 16);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: agent.avatarColor || '#0284c7',
    roughness: 0.4
  });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.y = 0.6;
  body.castShadow = true;
  agentGroup.add(body);
  agentGroup.userData.bodyMesh = body;

  // Neck Collar
  const collar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.16, 0.08),
    new THREE.MeshStandardMaterial({ color: '#ffffff' })
  );
  collar.position.y = 0.95;
  agentGroup.add(collar);

  // Head (Cute rounded chibi head)
  const headGeo = new THREE.SphereGeometry(0.28, 20, 20);
  const skinMat = new THREE.MeshStandardMaterial({
    color: '#ffdfba', // Warm skin tone
    roughness: 0.6
  });
  const head = new THREE.Mesh(headGeo, skinMat);
  head.position.y = 1.25;
  head.castShadow = true;
  agentGroup.add(head);
  agentGroup.userData.headMesh = head;

  // Hair
  const hairGeo = new THREE.SphereGeometry(0.3, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.55);
  const hairMat = new THREE.MeshStandardMaterial({
    color: agent.hairColor || '#1e293b',
    roughness: 0.8
  });
  const hair = new THREE.Mesh(hairGeo, hairMat);
  hair.position.y = 1.28;
  hair.rotation.x = -0.15;
  agentGroup.add(hair);

  // Eyes (Two cute dots)
  const eyeMat = new THREE.MeshBasicMaterial({ color: '#0f172a' });
  const eyeGeo = new THREE.SphereGeometry(0.035, 8, 8);

  const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
  leftEye.position.set(-0.09, 1.24, 0.26);
  agentGroup.add(leftEye);

  const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
  rightEye.position.set(0.09, 1.24, 0.26);
  agentGroup.add(rightEye);

  // Arms (for typing & repair animations)
  const armGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35);
  const armMat = new THREE.MeshStandardMaterial({ color: agent.avatarColor || '#0284c7' });

  const leftArm = new THREE.Mesh(armGeo, armMat);
  leftArm.position.set(-0.32, 0.65, 0.08);
  agentGroup.add(leftArm);
  agentGroup.userData.leftArm = leftArm;

  const rightArm = new THREE.Mesh(armGeo, armMat);
  rightArm.position.set(0.32, 0.65, 0.08);
  agentGroup.add(rightArm);
  agentGroup.userData.rightArm = rightArm;

  // Legs / Feet
  const legMat = new THREE.MeshStandardMaterial({ color: '#334155' });
  const legGeo = new THREE.BoxGeometry(0.12, 0.3, 0.16);

  const leftLeg = new THREE.Mesh(legGeo, legMat);
  leftLeg.position.set(-0.12, 0.15, 0);
  agentGroup.add(leftLeg);

  const rightLeg = new THREE.Mesh(legGeo, legMat);
  rightLeg.position.set(0.12, 0.15, 0);
  agentGroup.add(rightLeg);

  // Selection Highlight Ring on floor
  const ringGeo = new THREE.RingGeometry(0.45, 0.55, 32);
  const ringMat = new THREE.MeshBasicMaterial({
    color: '#0284c7',
    side: THREE.DoubleSide
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = -Math.PI / 2;
  ring.position.y = 0.02;
  ring.visible = false;
  agentGroup.add(ring);
  agentGroup.userData.selectionRing = ring;

  // Floating Status Pill Sprite (Name & Role above head)
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 70;
  const ctx = canvas.getContext('2d');

  // Background rounded pill
  ctx.fillStyle = 'rgba(255, 255, 255, 0.95)';
  roundRect(ctx, 4, 4, 248, 62, 20);
  ctx.fill();

  ctx.lineWidth = 4;
  ctx.strokeStyle = agent.avatarColor || '#0284c7';
  ctx.stroke();

  // Status dot
  ctx.beginPath();
  ctx.arc(28, 35, 10, 0, Math.PI * 2);
  ctx.fillStyle = agent.avatarColor || '#0284c7';
  ctx.fill();

  // Text
  ctx.font = 'bold 22px system-ui, sans-serif';
  ctx.fillStyle = '#0f172a';
  ctx.fillText(agent.name.split(' ')[0], 48, 42);

  const texture = new THREE.CanvasTexture(canvas);
  const spriteMat = new THREE.SpriteMaterial({ map: texture });
  const sprite = new THREE.Sprite(spriteMat);
  sprite.scale.set(1.4, 0.42, 1);
  sprite.position.y = 1.95;
  agentGroup.add(sprite);

  return agentGroup;
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}
