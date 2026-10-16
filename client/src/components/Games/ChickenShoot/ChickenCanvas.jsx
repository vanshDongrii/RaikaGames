import React, { useRef, useEffect } from 'react';

export default function ChickenCanvas({
  onTargetClick,
  lastShotOutcome,
  isShooting,
}) {
  const canvasRef = useRef(null);
  const stateRef = useRef({
    targets: [],
    particles: [],
    floatingTexts: [],
    crosshair: { x: 200, y: 150, targetX: 200, targetY: 150 },
    muzzleFlash: 0,
    screenShake: 0,
    lastTime: performance.now(),
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Handle high DPI
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Initial targets setup across 3 shooting lanes
    const width = canvas.getBoundingClientRect().width;
    const height = canvas.getBoundingClientRect().height;

    stateRef.current.targets = [
      // Lane 1: Top (Fast / Rare / Epic)
      {
        id: 1,
        tier: 'gold',
        name: 'Golden Phoenix',
        mult: 'x100',
        multVal: 100,
        x: width * 0.1,
        y: height * 0.22,
        speed: 1.8,
        direction: 1,
        color: '#fbbf24',
        accent: '#f59e0b',
        radius: 20,
        bobPhase: 0,
        hitCooldown: 0,
      },
      {
        id: 2,
        tier: 'red',
        name: 'Mech Chicken',
        mult: 'x24',
        multVal: 24,
        x: width * 0.7,
        y: height * 0.22,
        speed: -1.6,
        direction: -1,
        color: '#ef4444',
        accent: '#dc2626',
        radius: 22,
        bobPhase: 1,
        hitCooldown: 0,
      },
      // Lane 2: Middle (Medium / Rare)
      {
        id: 3,
        tier: 'purple',
        name: 'Cyber Chicken',
        mult: 'x12',
        multVal: 12,
        x: width * 0.25,
        y: height * 0.50,
        speed: 1.4,
        direction: 1,
        color: '#a855f7',
        accent: '#7e22ce',
        radius: 24,
        bobPhase: 2,
        hitCooldown: 0,
      },
      {
        id: 4,
        tier: 'blue',
        name: 'Hunter Chicken',
        mult: 'x3.0',
        multVal: 3.0,
        x: width * 0.85,
        y: height * 0.50,
        speed: -1.3,
        direction: -1,
        color: '#3b82f6',
        accent: '#2563eb',
        radius: 25,
        bobPhase: 3,
        hitCooldown: 0,
      },
      // Lane 3: Bottom (Common)
      {
        id: 5,
        tier: 'green',
        name: 'Farm Chicken',
        mult: 'x1.5',
        multVal: 1.5,
        x: width * 0.15,
        y: height * 0.78,
        speed: 1.1,
        direction: 1,
        color: '#10b981',
        accent: '#059669',
        radius: 26,
        bobPhase: 4,
        hitCooldown: 0,
      },
      {
        id: 6,
        tier: 'green',
        name: 'Farm Chicken',
        mult: 'x1.2',
        multVal: 1.2,
        x: width * 0.65,
        y: height * 0.78,
        speed: -1.0,
        direction: -1,
        color: '#10b981',
        accent: '#059669',
        radius: 26,
        bobPhase: 5,
        hitCooldown: 0,
      },
    ];

    let animationId;

    const render = (time) => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const state = stateRef.current;

      ctx.save();

      // Screen shake
      if (state.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * state.screenShake * 8;
        const shakeY = (Math.random() - 0.5) * state.screenShake * 8;
        ctx.translate(shakeX, shakeY);
        state.screenShake *= 0.88;
        if (state.screenShake < 0.05) state.screenShake = 0;
      }

      // Background - Range Gallery
      ctx.clearRect(0, 0, w, h);

      // Cyber Range Background Gradient
      const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
      skyGrad.addColorStop(0, '#0c101d');
      skyGrad.addColorStop(0.5, '#13192c');
      skyGrad.addColorStop(1, '#1e2439');
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, w, h);

      // Subtle target grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Shooting Rails (3 lanes)
      const lanes = [h * 0.22, h * 0.50, h * 0.78];
      lanes.forEach((laneY, idx) => {
        // Rail track
        ctx.fillStyle = '#181f33';
        ctx.fillRect(0, laneY + 12, w, 8);
        ctx.fillStyle = '#2a3556';
        ctx.fillRect(0, laneY + 14, w, 3);

        // Distance marker
        ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
        ctx.font = '9px "JetBrains Mono", monospace';
        ctx.fillText(`LANE ${idx + 1} // DIST: ${15 + idx * 10}M`, 10, laneY + 10);
      });

      // Update & Draw Targets
      state.targets.forEach((t) => {
        // Movement
        t.x += t.speed;
        if (t.direction > 0 && t.x > w + 40) {
          t.x = -40;
        } else if (t.direction < 0 && t.x < -40) {
          t.x = w + 40;
        }

        // Bobbing animation
        t.bobPhase += 0.08;
        const currentY = t.y + Math.sin(t.bobPhase) * 4;

        if (t.hitCooldown > 0) {
          t.hitCooldown -= 0.05;
        }

        ctx.save();
        ctx.translate(t.x, currentY);

        // Target Aura / Glow for Rare Targets
        if (t.tier === 'gold' || t.tier === 'red' || t.tier === 'purple') {
          ctx.beginPath();
          ctx.arc(0, 0, t.radius + 6, 0, Math.PI * 2);
          ctx.fillStyle = t.color + '22';
          ctx.fill();
        }

        // Target Body (Chicken vector shape)
        ctx.beginPath();
        ctx.ellipse(0, 0, t.radius, t.radius * 0.85, 0, 0, Math.PI * 2);
        ctx.fillStyle = t.hitCooldown > 0 ? '#ffffff' : t.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = t.accent;
        ctx.stroke();

        // Eye
        const eyeX = t.direction > 0 ? 8 : -8;
        ctx.beginPath();
        ctx.arc(eyeX, -5, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.beginPath();
        ctx.arc(eyeX + (t.direction > 0 ? 1 : -1), -5, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#000000';
        ctx.fill();

        // Beak
        ctx.beginPath();
        if (t.direction > 0) {
          ctx.moveTo(t.radius - 2, -3);
          ctx.lineTo(t.radius + 8, 1);
          ctx.lineTo(t.radius - 2, 4);
        } else {
          ctx.moveTo(-t.radius + 2, -3);
          ctx.lineTo(-t.radius - 8, 1);
          ctx.lineTo(-t.radius + 2, 4);
        }
        ctx.closePath();
        ctx.fillStyle = '#f59e0b';
        ctx.fill();

        // Comb / Crown on head
        ctx.beginPath();
        ctx.arc(0, -t.radius + 2, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#ef4444';
        ctx.fill();

        // Multiplier Pill Badge above target
        const pillWidth = 46;
        const pillHeight = 16;
        const pillY = -t.radius - 16;

        ctx.fillStyle = 'rgba(10, 13, 20, 0.85)';
        ctx.beginPath();
        ctx.roundRect(-pillWidth / 2, pillY, pillWidth, pillHeight, 5);
        ctx.fill();
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = t.color;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 10px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(t.mult, 0, pillY + pillHeight / 2);

        ctx.restore();
      });

      // Update & Draw Particles (Exploding feathers / sparks)
      for (let i = state.particles.length - 1; i >= 0; i--) {
        const p = state.particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.15; // Gravity
        p.life -= 0.025;
        p.rotation += p.vRot;

        if (p.life <= 0) {
          state.particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = Math.max(0, p.life);

        if (p.type === 'feather') {
          // Feather shape
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.ellipse(0, 0, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.type === 'coin') {
          // Gold coin
          ctx.fillStyle = '#fbbf24';
          ctx.beginPath();
          ctx.arc(0, 0, p.size, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Spark
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        }

        ctx.restore();
      }

      // Update & Draw Floating Multiplier Texts
      for (let i = state.floatingTexts.length - 1; i >= 0; i--) {
        const ft = state.floatingTexts[i];
        ft.y -= 1.2;
        ft.alpha -= 0.02;

        if (ft.alpha <= 0) {
          state.floatingTexts.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = ft.alpha;
        ctx.font = '900 18px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.shadowColor = ft.won ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)';
        ctx.shadowBlur = 10;
        ctx.fillStyle = ft.won ? '#34d399' : '#f87171';
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // Muzzle Flash Effect from bottom
      if (state.muzzleFlash > 0) {
        ctx.save();
        ctx.globalAlpha = state.muzzleFlash;
        const grad = ctx.createRadialGradient(w / 2, h, 10, w / 2, h, 140);
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.3, '#f59e0b');
        grad.addColorStop(1, 'transparent');
        ctx.fillStyle = grad;
        ctx.fillRect(0, h - 140, w, 140);

        // Gun cross laser line to target
        ctx.strokeStyle = 'rgba(255, 230, 100, 0.7)';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        ctx.moveTo(w / 2, h - 20);
        ctx.lineTo(state.crosshair.x, state.crosshair.y);
        ctx.stroke();

        ctx.restore();
        state.muzzleFlash -= 0.12;
      }

      // Interactive Crosshairs Reticle
      // Smooth interpolation towards pointer
      state.crosshair.x += (state.crosshair.targetX - state.crosshair.x) * 0.25;
      state.crosshair.y += (state.crosshair.targetY - state.crosshair.y) * 0.25;

      const chX = state.crosshair.x;
      const chY = state.crosshair.y;

      ctx.save();
      ctx.translate(chX, chY);

      // Outer ring
      ctx.strokeStyle = isShooting ? '#ef4444' : '#10b981';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, 18, 0, Math.PI * 2);
      ctx.stroke();

      // Laser center pip
      ctx.fillStyle = isShooting ? '#ef4444' : '#00ffcc';
      ctx.beginPath();
      ctx.arc(0, 0, 3, 0, Math.PI * 2);
      ctx.fill();

      // Crosshair notches
      ctx.strokeStyle = isShooting ? '#ef4444' : '#10b981';
      ctx.lineWidth = 1.5;
      [-26, 18].forEach(pos => {
        ctx.beginPath();
        ctx.moveTo(pos, 0);
        ctx.lineTo(pos + 8, 0);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(0, pos);
        ctx.lineTo(0, pos + 8);
        ctx.stroke();
      });

      ctx.restore();

      ctx.restore();
      animationId = requestAnimationFrame(render);
    };

    animationId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, []);

  // Handle incoming shot outcomes from game engine
  useEffect(() => {
    if (!lastShotOutcome) return;

    const state = stateRef.current;
    state.muzzleFlash = 1.0;
    state.screenShake = lastShotOutcome.won ? 1.0 : 0.4;

    // Find nearest or matching target to crosshair
    let hitTarget = state.targets[0];
    let minDist = 999999;
    state.targets.forEach((t) => {
      const dist = Math.hypot(t.x - state.crosshair.x, t.y - state.crosshair.y);
      if (dist < minDist) {
        minDist = dist;
        hitTarget = t;
      }
    });

    if (hitTarget) {
      hitTarget.hitCooldown = 1.0;

      // Spawn blast particles
      const count = lastShotOutcome.won ? 35 : 12;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 6 + 2;
        state.particles.push({
          x: hitTarget.x,
          y: hitTarget.y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 2,
          size: Math.random() * 6 + 3,
          color: hitTarget.color,
          type: Math.random() > 0.4 ? 'feather' : 'coin',
          life: 1.0,
          rotation: Math.random() * Math.PI * 2,
          vRot: (Math.random() - 0.5) * 0.2,
        });
      }

      // Add floating outcome text
      state.floatingTexts.push({
        x: hitTarget.x,
        y: hitTarget.y - 20,
        text: lastShotOutcome.won
          ? `+${lastShotOutcome.multiplier}X (+$${lastShotOutcome.payout.toFixed(2)})`
          : 'DEFLECTED (0X)',
        won: lastShotOutcome.won,
        alpha: 1.0,
      });
    }
  }, [lastShotOutcome]);

  // Pointer move / touch tracking
  const handlePointerMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    stateRef.current.crosshair.targetX = x;
    stateRef.current.crosshair.targetY = y;
  };

  const handlePointerDown = (e) => {
    handlePointerMove(e);
    if (onTargetClick) {
      // Find if clicked near a target
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;

      let clickedTarget = null;
      for (const t of stateRef.current.targets) {
        if (Math.hypot(t.x - clickX, t.y - clickY) < t.radius + 15) {
          clickedTarget = t;
          break;
        }
      }
      onTargetClick(clickedTarget);
    }
  };

  return (
    <div className="relative w-full aspect-[16/10] sm:aspect-[16/9] rounded-2xl overflow-hidden border border-raika-border shadow-2xl bg-black cursor-crosshair touch-none select-none">
      <canvas
        ref={canvasRef}
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        className="w-full h-full block"
      />
      {/* Aim Hint */}
      <div className="absolute top-2 right-2 text-[10px] font-mono text-gray-400 bg-black/60 backdrop-blur-md px-2 py-0.5 rounded border border-white/5 pointer-events-none">
        TAP TARGET TO SHOOT
      </div>
    </div>
  );
}
