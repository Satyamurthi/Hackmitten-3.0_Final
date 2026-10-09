"use client";

import { useEffect, useRef, useState } from "react";
import { resolveSponsors } from "@/data/sponsors";

type Sponsor = ReturnType<typeof resolveSponsors>[number];

export function Sponsors() {
  const sponsors = resolveSponsors();

  if (sponsors.length === 0) return null;

  const sponsorLogos = sponsors.filter((s) => s.tier !== "CUSTOM");
  const departmentLogos = sponsors.filter((s) => s.tier === "CUSTOM");

  const getDepartmentLogo = (department: Sponsor) => {
    if (department.logoUrl) return department.logoUrl;
    const name = department.name.toLowerCase();
    if (name.includes("cse")) return "/images/sponsors/cse.png";
    if (name.includes("ai") || name.includes("ml")) return "/images/sponsors/aiml.png";
    return "";
  };

  return (
    <section id="sponsors" className="relative border-t border-white/5 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10">

        <div className="mb-10 text-center md:mb-16">
          <div className="mono mb-4 text-xs uppercase tracking-[0.3em] text-[#B52A32]">/ Partners</div>
          <h2 className="display text-3xl font-bold leading-[0.95] tracking-tight text-white sm:text-5xl md:text-7xl">
            BACKED BY<br /><span className="text-[#A8A8A8]">THE BEST.</span>
          </h2>
        </div>

        {sponsorLogos.length > 0 && (
          <div className="mb-16 md:mb-24">
            <div className="mb-8 flex items-center gap-4">
              <span className="mono whitespace-nowrap text-[10px] uppercase tracking-widest text-[#A8A8A8]">SPONSORS</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <SponsorGlobe sponsors={sponsorLogos} />
          </div>
        )}

        {departmentLogos.length > 0 && (
          <div>
            <div className="mb-8 flex items-center gap-4">
              <span className="mono whitespace-nowrap text-[10px] uppercase tracking-widest text-[#A8A8A8]">DEPARTMENTS</span>
              <div className="h-px flex-1 bg-white/10" />
            </div>
            <div className="flex flex-wrap items-start justify-center gap-6 sm:gap-12 md:gap-24">
              {departmentLogos.map((department) => {
                const logo = getDepartmentLogo(department);
                return (
                  <div key={department.id} className="flex w-28 flex-col items-center sm:w-32 md:w-40">
                    <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-white p-2 shadow-lg sm:h-28 sm:w-28 md:h-36 md:w-36">
                      {logo ? (
                        <img src={logo} alt={`${department.name} logo`} loading="lazy" className="h-full w-full rounded-full object-contain" />
                      ) : (
                        <span className="text-center text-xs sm:text-sm font-bold text-black">{department.name}</span>
                      )}
                    </div>
                    <span className="mono mt-3 sm:mt-4 text-center text-[10px] sm:text-xs uppercase tracking-widest text-[#A8A8A8]">{department.name}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}

/* ================================================================
   SPONSOR GLOBE
================================================================ */

function SponsorGlobe({ sponsors }: { sponsors: Sponsor[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(500);

  const [mounted, setMounted] = useState(false);
  const [yaw, setYaw] = useState(0);
  const [hovered, setHovered] = useState<string | null>(null);

  const rafRef = useRef<number>(0);
  const yawRef = useRef(0);
  const velRef = useRef(0.18);
  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    prevX: 0,
    prevT: 0,
    isDraggingHorizontally: false,
  });
  const pitch = 0.42;

  // Responsive dimensions calculated from available container width
  const SIZE = Math.max(260, Math.min(containerWidth, 540));
  const R = Math.round(SIZE * 0.35);
  const LOGO_MAX = Math.max(44, Math.min(92, Math.round(SIZE * 0.165)));

  const n = sponsors.length;
  const positions = sponsors.map((_, i) => ({
    phi: Math.acos(1 - (2 * (i + 0.5)) / n),
    theta: Math.PI * (1 + Math.sqrt(5)) * i,
  }));

  // Track container width dynamically for perfect responsiveness on mobile / resize
  useEffect(() => {
    setMounted(true);
    if (!containerRef.current) return;

    const el = containerRef.current;
    const updateSize = () => {
      const w = el.clientWidth || window.innerWidth - 32;
      setContainerWidth(Math.min(w, 540));
    };

    updateSize();

    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    window.addEventListener("resize", updateSize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", updateSize);
    };
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let last = performance.now();
    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      if (!dragRef.current.active) {
        velRef.current *= 0.95;
        yawRef.current += (velRef.current + 0.6) * dt;
      }
      setYaw(yawRef.current);
      rafRef.current = requestAnimationFrame(frame);
    }
    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mounted]);

  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      prevX: e.clientX,
      prevT: performance.now(),
      isDraggingHorizontally: false,
    };
    velRef.current = 0;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current.active) return;
    const dx = e.clientX - dragRef.current.lastX;
    const totalDx = Math.abs(e.clientX - dragRef.current.startX);
    const totalDy = Math.abs(e.clientY - dragRef.current.startY);

    // If gesture is horizontal or mouse, lock pointer capture for smooth rotation
    if (!dragRef.current.isDraggingHorizontally && totalDx > 5 && totalDx > totalDy) {
      dragRef.current.isDraggingHorizontally = true;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    }

    if (dragRef.current.isDraggingHorizontally || e.pointerType === "mouse") {
      const dt = (performance.now() - dragRef.current.prevT) / 1000 || 0.016;
      velRef.current = (dx / dt) * 0.003;
      yawRef.current += dx * 0.005;
      dragRef.current.prevX = dragRef.current.lastX;
      dragRef.current.lastX = e.clientX;
      dragRef.current.prevT = performance.now();
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    dragRef.current.active = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }

  function project(phi: number, theta: number, currentYaw: number) {
    const x0 = R * Math.sin(phi) * Math.cos(theta);
    const y0 = R * Math.cos(phi);
    const z0 = R * Math.sin(phi) * Math.sin(theta);
    const x1 = x0 * Math.cos(currentYaw) + z0 * Math.sin(currentYaw);
    const z1 = -x0 * Math.sin(currentYaw) + z0 * Math.cos(currentYaw);
    const y2 = y0 * Math.cos(pitch) - z1 * Math.sin(pitch);
    const z2 = y0 * Math.sin(pitch) + z1 * Math.cos(pitch);
    const raw = (z2 + R * 1.6) / (R * 2.6);
    const scale = Math.pow(Math.max(0, raw), 0.45);
    return { sx: x1, sy: y2, scale, z: z2 };
  }

  const projected = positions
    .map(({ phi, theta }, i) => ({ ...project(phi, theta, yaw), sponsor: sponsors[i] }))
    .sort((a, b) => a.z - b.z);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center">
      <div
        className="relative mx-auto cursor-grab select-none active:cursor-grabbing touch-pan-y"
        style={{
          width: SIZE,
          height: SIZE,
          maxWidth: "100%",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <svg className="pointer-events-none absolute inset-0" width="100%" height="100%" viewBox={`0 0 ${SIZE} ${SIZE}`}>
          <defs>
            <radialGradient id="gg" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#B52A32" stopOpacity="0.12" />
              <stop offset="60%" stopColor="#B52A32" stopOpacity="0.03" />
              <stop offset="100%" stopColor="#000" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="shine" cx="38%" cy="32%" r="45%">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R + Math.max(8, SIZE * 0.025)} fill="none" stroke="#6b7280" strokeOpacity="0.12" strokeWidth={Math.max(8, SIZE * 0.025)} />
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="url(#gg)" />
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="url(#shine)" />
          <circle cx={SIZE / 2} cy={SIZE / 2} r={R} fill="none" stroke="#9ca3af" strokeOpacity="0.5" strokeWidth="2" />
          {[-0.65, -0.35, 0, 0.35, 0.65].map((t, i) => {
            const rx2 = R * Math.sqrt(1 - t * t);
            return <ellipse key={i} cx={SIZE / 2} cy={SIZE / 2 + R * t} rx={rx2} ry={rx2 * 0.28} fill="none" stroke="#9ca3af" strokeOpacity="0.22" strokeWidth="1" />;
          })}
          {[0, 45, 90, 135].map((deg, i) => (
            <ellipse key={i} cx={SIZE / 2} cy={SIZE / 2}
              rx={Math.max(1, R * Math.abs(Math.cos(deg * Math.PI / 180)))}
              ry={R} fill="none" stroke="#9ca3af" strokeOpacity="0.22" strokeWidth="1" />
          ))}
        </svg>

        {mounted && projected.map(({ sx, sy, scale, sponsor }) => {
          const s = Math.max(0.18, Math.min(1, scale));
          const logoSize = Math.round(LOGO_MAX * s);
          const isFront = s > 0.7;
          const isHov = hovered === sponsor.id;
          return (
            <div
              key={sponsor.id}
              onMouseEnter={() => setHovered(sponsor.id)}
              onMouseLeave={() => setHovered(null)}
              className="absolute flex items-center justify-center rounded-full bg-white shadow-sm"
              style={{
                width: logoSize,
                height: logoSize,
                left: Math.round(SIZE / 2 + sx - logoSize / 2),
                top: Math.round(SIZE / 2 + sy - logoSize / 2),
                opacity: 0.15 + s * 0.85,
                zIndex: Math.round(s * 100),
                boxShadow: isFront
                  ? `0 0 ${isHov ? 28 : 16}px ${isHov ? 6 : 3}px rgba(181,42,50,${isHov ? 0.75 : 0.5}), 0 4px 16px rgba(0,0,0,0.6)`
                  : "0 2px 6px rgba(0,0,0,0.3)",
                transition: "box-shadow 0.2s",
              }}
            >
              {sponsor.logoUrl ? (
                <img src={sponsor.logoUrl} alt={sponsor.name} draggable={false} className="h-[76%] w-[76%] object-contain" />
              ) : (
                <span className="px-1 text-center text-[7px] sm:text-[8px] font-bold leading-tight text-black">{sponsor.name}</span>
              )}
              {isHov && (
                <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-black/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-widest text-white">
                  {sponsor.name}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="mono mt-2 text-[9px] uppercase tracking-widest text-[#A8A8A8]/40">drag to rotate</p>
    </div>
  );
}
