import React, { useEffect, useRef, useState } from 'react';

interface Node {
  id: string;
  name: string;
  x: number; // 0 to 1
  y: number; // 0 to 1
  level: 'PHC' | 'DISTRICT' | 'STATE' | 'NATIONAL';
  status: 'HEALTHY' | 'WARNING' | 'CRITICAL';
  connections: string[];
}

export const HeroNetworkCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [hoveredNode, setHoveredNode] = useState<Node | null>(null);
  const [tickerStage, setTickerStage] = useState<'STOCK' | 'FORECAST' | 'ALERT' | 'TRANSFER'>('STOCK');

  // Cycle ticker stage every 2.5 seconds
  useEffect(() => {
    const stages: Array<'STOCK' | 'FORECAST' | 'ALERT' | 'TRANSFER'> = ['STOCK', 'FORECAST', 'ALERT', 'TRANSFER'];
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % stages.length;
      setTickerStage(stages[idx]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || 800);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 600);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = canvas.parentElement?.clientWidth || 800;
      height = canvas.height = canvas.parentElement?.clientHeight || 600;
    };
    window.addEventListener('resize', handleResize);

    // Realistic topological nodes across Eastern Corridor & Apex Hub
    const nodes: Node[] = [
      { id: 'delhi', name: 'National Health Apex Hub (New Delhi)', x: 0.35, y: 0.28, level: 'NATIONAL', status: 'HEALTHY', connections: ['bhubaneswar', 'kolkata', 'ranchi'] },
      { id: 'bhubaneswar', name: 'State Directorate (Bhubaneswar)', x: 0.65, y: 0.58, level: 'STATE', status: 'HEALTHY', connections: ['cuttack', 'puri', 'balasore', 'berhampur', 'sambalpur', 'delhi'] },
      { id: 'cuttack', name: 'District HQ (Cuttack)', x: 0.67, y: 0.55, level: 'DISTRICT', status: 'CRITICAL', connections: ['bhubaneswar', 'salipur', 'banki', 'choudwar'] },
      { id: 'salipur', name: 'PHC Cuttack Rural (Salipur)', x: 0.70, y: 0.54, level: 'PHC', status: 'CRITICAL', connections: ['cuttack'] },
      { id: 'chandaka', name: 'PHC Bhubaneswar North (Chandaka)', x: 0.63, y: 0.59, level: 'PHC', status: 'HEALTHY', connections: ['bhubaneswar'] },
      { id: 'banki', name: 'PHC Banki Flood-Prone', x: 0.65, y: 0.53, level: 'PHC', status: 'WARNING', connections: ['cuttack'] },
      { id: 'choudwar', name: 'PHC Choudwar Industrial', x: 0.68, y: 0.52, level: 'PHC', status: 'HEALTHY', connections: ['cuttack'] },
      { id: 'puri', name: 'PHC Puri Sadar (Coastal)', x: 0.66, y: 0.65, level: 'PHC', status: 'HEALTHY', connections: ['bhubaneswar'] },
      { id: 'balasore', name: 'PHC Balasore Coastal', x: 0.73, y: 0.46, level: 'PHC', status: 'WARNING', connections: ['bhubaneswar', 'kolkata'] },
      { id: 'berhampur', name: 'PHC Berhampur Ganjam', x: 0.61, y: 0.68, level: 'PHC', status: 'HEALTHY', connections: ['bhubaneswar', 'vizag'] },
      { id: 'sambalpur', name: 'PHC Sambalpur Burla', x: 0.54, y: 0.50, level: 'PHC', status: 'HEALTHY', connections: ['bhubaneswar', 'ranchi'] },
      { id: 'kolkata', name: 'West Bengal State Node (Kolkata)', x: 0.78, y: 0.44, level: 'STATE', status: 'HEALTHY', connections: ['kakdwip', 'delhi'] },
      { id: 'kakdwip', name: 'PHC Kakdwip Delta', x: 0.79, y: 0.49, level: 'PHC', status: 'WARNING', connections: ['kolkata'] },
      { id: 'ranchi', name: 'Jharkhand State Node (Ranchi)', x: 0.60, y: 0.42, level: 'STATE', status: 'HEALTHY', connections: ['delhi', 'bhubaneswar'] },
      { id: 'vizag', name: 'Andhra Coastal Node (Visakhapatnam)', x: 0.58, y: 0.74, level: 'STATE', status: 'HEALTHY', connections: ['berhampur'] }
    ];

    // Data packets travelling along connections
    interface Packet {
      fromId: string;
      toId: string;
      progress: number;
      speed: number;
      color: string;
    }

    const packets: Packet[] = [
      { fromId: 'chandaka', toId: 'bhubaneswar', progress: 0.1, speed: 0.007, color: '#00F2FE' },
      { fromId: 'bhubaneswar', toId: 'cuttack', progress: 0.4, speed: 0.009, color: '#00F2FE' },
      { fromId: 'cuttack', toId: 'salipur', progress: 0.7, speed: 0.008, color: '#F59E0B' },
      { fromId: 'delhi', toId: 'bhubaneswar', progress: 0.2, speed: 0.004, color: '#10B981' },
      { fromId: 'kolkata', toId: 'balasore', progress: 0.5, speed: 0.006, color: '#00F2FE' }
    ];

    // Ambient floating particles
    const particles = Array.from({ length: 45 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      radius: Math.random() * 1.5 + 0.5,
      alpha: Math.random() * 0.5 + 0.2
    }));

    let mouseX = width / 2;
    let mouseY = height / 2;
    let targetAngle = 0;
    let currentAngle = 0;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseX = e.clientX - rect.left;
      mouseY = e.clientY - rect.top;
      targetAngle = ((mouseX / width) - 0.5) * 0.12;

      // Check node hover
      let found: Node | null = null;
      for (const node of nodes) {
        const nx = node.x * width;
        const ny = node.y * height;
        const dist = Math.hypot(mouseX - nx, mouseY - ny);
        if (dist < 18) {
          found = node;
          break;
        }
      }
      setHoveredNode(found);
    };
    canvas.addEventListener('mousemove', handleMouseMove);

    let tick = 0;

    const render = () => {
      tick++;
      currentAngle += (targetAngle - currentAngle) * 0.05;

      ctx.clearRect(0, 0, width, height);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(15, 32, 59, 0.4)';
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Draw floating ambient particles
      ctx.fillStyle = '#00F2FE';
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = width;
        if (p.x > width) p.x = 0;
        if (p.y < 0) p.y = height;
        if (p.y > height) p.y = 0;

        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1.0;

      // Draw connection lines between nodes
      ctx.lineWidth = 1.2;
      for (const node of nodes) {
        const x1 = node.x * width + Math.sin(tick * 0.02 + node.y * 5) * 2;
        const y1 = node.y * height;

        for (const connId of node.connections) {
          const target = nodes.find(n => n.id === connId);
          if (target) {
            const x2 = target.x * width + Math.sin(tick * 0.02 + target.y * 5) * 2;
            const y2 = target.y * height;

            const grad = ctx.createLinearGradient(x1, y1, x2, y2);
            grad.addColorStop(0, 'rgba(0, 242, 254, 0.22)');
            grad.addColorStop(1, 'rgba(37, 99, 235, 0.15)');

            ctx.strokeStyle = grad;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }

      // Animate flowing data packets
      for (const packet of packets) {
        packet.progress += packet.speed;
        if (packet.progress >= 1.0) packet.progress = 0;

        const from = nodes.find(n => n.id === packet.fromId);
        const to = nodes.find(n => n.id === packet.toId);
        if (from && to) {
          const px = (from.x + (to.x - from.x) * packet.progress) * width;
          const py = (from.y + (to.y - from.y) * packet.progress) * height;

          ctx.fillStyle = packet.color;
          ctx.shadowColor = packet.color;
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(px, py, 3, 0, Math.PI * 2);
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }

      // Draw Nodes
      for (const node of nodes) {
        const nx = node.x * width + Math.sin(tick * 0.02 + node.y * 5) * 2;
        const ny = node.y * height;

        const isCrit = node.status === 'CRITICAL';
        const isWarn = node.status === 'WARNING';
        const color = isCrit ? '#EF4444' : (isWarn ? '#F59E0B' : '#00F2FE');
        const radius = node.level === 'NATIONAL' ? 8 : (node.level === 'STATE' ? 6 : (node.level === 'DISTRICT' ? 5 : 4));

        // Pulsing glow aura
        const pulse = Math.sin(tick * 0.05 + nx) * 3;
        ctx.fillStyle = color;
        ctx.globalAlpha = isCrit ? 0.35 : 0.2;
        ctx.beginPath();
        ctx.arc(nx, ny, radius + 4 + pulse, 0, Math.PI * 2);
        ctx.fill();

        // Node center
        ctx.globalAlpha = 1.0;
        ctx.shadowColor = color;
        ctx.shadowBlur = isCrit ? 15 : 8;
        ctx.beginPath();
        ctx.arc(nx, ny, radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Label for major hubs
        if (node.level === 'NATIONAL' || node.level === 'STATE' || isCrit) {
          ctx.fillStyle = '#E2E8F0';
          ctx.font = '10px "JetBrains Mono", monospace';
          ctx.fillText(node.name.split(' (')[0], nx + radius + 6, ny + 3);
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      canvas.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative w-full h-[520px] rounded-2xl overflow-hidden border border-slate-800 bg-background-deep/90 shadow-glass">
      <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />

      {/* Floating Telemetry Callout Card */}
      <div className="absolute top-4 left-4 bg-background-panel/90 border border-cyan-500/30 rounded-xl p-3.5 backdrop-blur-md max-w-xs shadow-glow-cyan text-xs">
        <div className="flex items-center justify-between gap-2 mb-2 font-mono">
          <span className="text-[10px] uppercase font-bold text-cyan-400 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-cyan-400 animate-ping" />
            LIVE TELEMETRY STREAM
          </span>
          <span className="text-[10px] text-slate-500">60 FPS</span>
        </div>

        <div className="space-y-1.5 font-mono text-[11px]">
          <div className="flex justify-between text-slate-300">
            <span>NODES MONITORED:</span>
            <span className="text-white font-bold">1,284 PHCs</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>NETWORK LATENCY:</span>
            <span className="text-emerald-400 font-bold">14ms</span>
          </div>
          <div className="flex justify-between text-slate-300">
            <span>FLOW PIPELINE:</span>
            <span className="text-cyan-300 font-bold uppercase tracking-wider">{tickerStage}</span>
          </div>
        </div>

        {/* Dynamic Workflow Progress Indicator */}
        <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono">
          <span className={tickerStage === 'STOCK' ? 'text-cyan-400 font-bold' : 'text-slate-500'}>STOCK</span>
          <span className="text-slate-600">→</span>
          <span className={tickerStage === 'FORECAST' ? 'text-cyan-400 font-bold' : 'text-slate-500'}>FORECAST</span>
          <span className="text-slate-600">→</span>
          <span className={tickerStage === 'ALERT' ? 'text-amber-400 font-bold' : 'text-slate-500'}>ALERT</span>
          <span className="text-slate-600">→</span>
          <span className={tickerStage === 'TRANSFER' ? 'text-emerald-400 font-bold' : 'text-slate-500'}>TRANSFER</span>
        </div>
      </div>

      {/* Floating Demo Indicators Bottom Right */}
      <div className="absolute bottom-4 right-4 bg-background-panel/90 border border-slate-700/60 rounded-xl p-3 backdrop-blur-md text-[11px] font-mono text-slate-300 space-y-1 hidden sm:block">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-400" />
          <span>Surplus Hub: Chandaka (+35 Days)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          <span>Shortage Node: Salipur (4 Days Remaining)</span>
        </div>
        <div className="text-[10px] text-slate-500 pt-1 border-t border-slate-800">
          DEMO NETWORK • SYNTHETIC VISUALIZATION
        </div>
      </div>

      {/* Interactive Tooltip on Node Hover */}
      {hoveredNode && (
        <div className="absolute top-4 right-4 bg-background-card/95 border border-cyan-400/50 rounded-xl p-3 shadow-glow-cyan text-xs font-mono max-w-xs animate-in fade-in duration-100">
          <div className="text-white font-bold text-sm mb-1">{hoveredNode.name}</div>
          <div className="text-slate-300">Level: <span className="text-cyan-400 uppercase">{hoveredNode.level}</span></div>
          <div className="text-slate-300">
            Status:{' '}
            <span className={hoveredNode.status === 'CRITICAL' ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
              {hoveredNode.status}
            </span>
          </div>
          <div className="text-[10px] text-slate-400 mt-1">Inter-node connections: {hoveredNode.connections.length}</div>
        </div>
      )}
    </div>
  );
};
