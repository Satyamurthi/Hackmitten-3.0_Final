"use client";

import { useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchJson } from "@/lib/api-fetch";
import { resolveSponsors } from "@/data/sponsors";

export interface SponsorItem {
  id: string;
  name: string;
  logoUrl: string;
  websiteUrl: string | null;
  tier: string;
  customTier?: string | null;
  sortOrder?: number;
}

export function getSponsorLogoUrl(url: string | null | undefined): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("data:")) return url;
  if (url.startsWith("/images/")) return url;
  const backend = (process.env.NEXT_PUBLIC_BACKEND_API_ORIGIN || "https://hackmitten-3-0-api.mitt.edu.in").replace(/\/$/, "");
  if (url.startsWith("/api/")) return `${backend}${url}`;
  if (url.startsWith("/")) return `${backend}${url}`;
  return `${backend}/${url}`;
}

export function Sponsors() {
  const { data } = useQuery<{ sponsors?: SponsorItem[] }>({
    queryKey: ["public-sponsors"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/sponsors");
        if (res.ok) return await res.json();
      } catch {}
      const backend = (process.env.NEXT_PUBLIC_BACKEND_API_ORIGIN || "https://hackmitten-3-0-api.mitt.edu.in").replace(/\/$/, "");
      try {
        const res = await fetch(`${backend}/api/sponsors`);
        if (res.ok) return await res.json();
      } catch {}
      return { sponsors: [] };
    },
    staleTime: 30_000,
    refetchOnWindowFocus: true,
  });

  const staticSponsors: SponsorItem[] = resolveSponsors();
  const dbSponsors: SponsorItem[] = (data?.sponsors ?? []).map((s) => ({
    id: s.id,
    name: s.name,
    logoUrl: getSponsorLogoUrl(s.logoUrl),
    websiteUrl: s.websiteUrl ?? null,
    tier: s.tier,
    customTier: s.customTier ?? null,
    sortOrder: s.sortOrder ?? 0,
  }));

  // Merge static and dynamic sponsors: dynamic sponsors take precedence by name
  const sponsorMap = new Map<string, SponsorItem>();
  staticSponsors.forEach((s) => sponsorMap.set(s.name.toLowerCase().trim(), s));
  dbSponsors.forEach((s) => sponsorMap.set(s.name.toLowerCase().trim(), s));
  const sponsors = Array.from(sponsorMap.values());

  if (sponsors.length === 0) return null;

  // Department logos: only those marked as custom department
  const departmentLogos = sponsors.filter(
    (s) => s.tier === "CUSTOM" && (s.customTier?.toLowerCase().includes("department") || s.name === "CSE" || s.name === "AI&ML")
  );
  // All other sponsors (TITLE, PARTNER, custom sponsors) go to the 3D Globe!
  const sponsorLogos = sponsors.filter((s) => !departmentLogos.some((d) => d.id === s.id));

  const getDepartmentLogo = (department: SponsorItem) => {
    if (department.logoUrl) return getSponsorLogoUrl(department.logoUrl);
    const name = department.name.toLowerCase();
    if (name.includes("cse")) return "/images/sponsors/cse.png";
    if (name.includes("ai") || name.includes("ml")) return "/images/sponsors/aiml.png";
    return "";
  };

  return (
    <section id="sponsors" className="relative border-t border-white/5 py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-10">

        <div className="mb-10 md:mb-16">
          <h2 className="display text-4xl sm:text-6xl md:text-7xl font-bold leading-[0.95] tracking-tight text-white">
            BACKED BY
            <br />
            <span className="text-[#A8A8A8]">THE BEST.</span>
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
                  <div key={department.id} className="flex w-32 flex-col items-center sm:w-40 md:w-48">
                    <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-full bg-white p-3 shadow-xl sm:h-36 sm:w-36 md:h-44 md:w-44 transition-transform hover:scale-105">
                      {logo ? (
                        <img src={logo} alt={`${department.name} logo`} loading="lazy" className="h-full w-full rounded-full object-contain" />
                      ) : (
                        <span className="text-center text-sm sm:text-base font-bold text-black">{department.name}</span>
                      )}
                    </div>
                    <span className="mono mt-3 sm:mt-4 text-center text-xs sm:text-sm uppercase tracking-widest text-[#A8A8A8] font-medium">{department.name}</span>
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
   3D HOLOGRAPHIC APP SPHERE (DNA LAUNCHER STYLE 360° SQUIRCLE ORBIT)
================================================================ */

function SponsorGlobe({ sponsors }: { sponsors: SponsorItem[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(500);
  const [mounted, setMounted] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // 3D Rotation Angles (Yaw = Y-axis horizontal, Pitch = X-axis vertical)
  const [yaw, setYaw] = useState(0);
  const [pitch, setPitch] = useState(0.15);

  const rafRef = useRef<number>(0);
  const yawRef = useRef(0);
  const pitchRef = useRef(0.15);
  const velXRef = useRef(0);
  const velYRef = useRef(0);

  const dragRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    lastX: 0,
    lastY: 0,
    prevT: 0,
    isDragging: false,
  });

  // Responsive dimensions - enlarged for maximum visual impact & crisp logos
  const SIZE = Math.max(340, Math.min(containerWidth, 680));
  const R = Math.round(SIZE * 0.42);
  const ICON_SIZE = Math.max(54, Math.min(92, Math.round(SIZE * 0.14)));

  // Dense 28-point Fibonacci sphere distribution for rich, seamless 3D volume
  const totalPoints = 28;
  const sphereSlots = Array.from({ length: totalPoints }, (_, i) => {
    const phi = Math.acos(1 - (2 * (i + 0.5)) / totalPoints);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const sponsor = sponsors[i % sponsors.length];
    return { id: `sphere-slot-${i}`, phi, theta, sponsor };
  });

  // Track responsive container width
  useEffect(() => {
    setMounted(true);
    if (!containerRef.current) return;

    const el = containerRef.current;
    const updateSize = () => {
      const w = el.clientWidth || (typeof window !== "undefined" ? window.innerWidth - 32 : 680);
      setContainerWidth(Math.min(w, 720));
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

  // Physics animation loop: ONLY moves when dragged or when coasting from user flick (ZERO auto-rotation)
  useEffect(() => {
    if (!mounted) return;
    let last = performance.now();

    function frame(now: number) {
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;

      if (!dragRef.current.active) {
        // Friction decay on flick velocity
        velXRef.current *= 0.91;
        velYRef.current *= 0.91;

        // Stop completely when velocity is minimal (NO continuous self-rotation)
        if (Math.abs(velXRef.current) < 0.0001) velXRef.current = 0;
        if (Math.abs(velYRef.current) < 0.0001) velYRef.current = 0;

        // Only rotate if user has flicked it
        if (velXRef.current !== 0 || velYRef.current !== 0) {
          yawRef.current += velXRef.current * dt;
          pitchRef.current += velYRef.current * dt;
          pitchRef.current = Math.max(-1.4, Math.min(1.4, pitchRef.current));
        }
      }

      setYaw(yawRef.current);
      setPitch(pitchRef.current);
      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [mounted]);

  // Pointer drag interactions (supports desktop mouse + mobile touch)
  function onPointerDown(e: React.PointerEvent) {
    dragRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      lastX: e.clientX,
      lastY: e.clientY,
      prevT: performance.now(),
      isDragging: false,
    };
    velXRef.current = 0;
    velYRef.current = 0;
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!dragRef.current.active) return;

    const dx = e.clientX - dragRef.current.lastX;
    const dy = e.clientY - dragRef.current.lastY;
    const totalDist = Math.hypot(e.clientX - dragRef.current.startX, e.clientY - dragRef.current.startY);

    if (!dragRef.current.isDragging && totalDist > 4) {
      dragRef.current.isDragging = true;
      try {
        (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      } catch {}
    }

    if (dragRef.current.isDragging) {
      const now = performance.now();
      const dt = Math.max(0.008, (now - dragRef.current.prevT) / 1000);

      // Direct 1:1 trackball spherical rotation
      yawRef.current += dx * 0.007;
      pitchRef.current -= dy * 0.007;
      pitchRef.current = Math.max(-1.4, Math.min(1.4, pitchRef.current));

      // Velocity for smooth release flick
      velXRef.current = (dx / dt) * 0.0035;
      velYRef.current = (-dy / dt) * 0.0035;

      dragRef.current.lastX = e.clientX;
      dragRef.current.lastY = e.clientY;
      dragRef.current.prevT = now;
    }
  }

  function onPointerUp(e: React.PointerEvent) {
    dragRef.current.active = false;
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
  }

  // 3D Perspective Projection + Surface Normal Curvature
  function project(phi: number, theta: number, curYaw: number, curPitch: number) {
    const x0 = R * Math.sin(phi) * Math.cos(theta);
    const y0 = R * Math.cos(phi);
    const z0 = R * Math.sin(phi) * Math.sin(theta);

    // Rotate around Y-axis (Yaw)
    const cosY = Math.cos(curYaw);
    const sinY = Math.sin(curYaw);
    const x1 = x0 * cosY + z0 * sinY;
    const y1 = y0;
    const z1 = -x0 * sinY + z0 * cosY;

    // Rotate around X-axis (Pitch)
    const cosP = Math.cos(curPitch);
    const sinP = Math.sin(curPitch);
    const x2 = x1;
    const y2 = y1 * cosP - z1 * sinP;
    const z2 = y1 * sinP + z1 * cosP;

    // Surface normal vector for spherical edge tilt
    const normX = x2 / R;
    const normY = y2 / R;

    // Perspective projection
    const camDist = R * 2.5;
    const perspective = camDist / (camDist - z2);
    const scale = Math.max(0.42, Math.min(1.15, perspective));
    const opacity = Math.max(0.25, Math.min(1, (z2 + R * 1.15) / (R * 2.15)));

    return {
      sx: x2,
      sy: y2,
      normX,
      normY,
      scale,
      opacity,
      z: z2,
    };
  }

  const projectedItems = sphereSlots
    .map((slot, index) => ({
      ...slot,
      index,
      ...project(slot.phi, slot.theta, yaw, pitch),
    }))
    .sort((a, b) => a.z - b.z);

  return (
    <div ref={containerRef} className="w-full flex flex-col items-center select-none">
      <div
        className="relative mx-auto cursor-grab active:cursor-grabbing touch-none select-none"
        style={{
          width: SIZE,
          height: SIZE,
          maxWidth: "100%",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {/* Subtle center ambient core glow (space wallpaper shines through) */}
        <div
          className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{
            width: R * 1.5,
            height: R * 1.5,
            background:
              "radial-gradient(circle, rgba(255,255,255,0.14) 0%, rgba(216,58,67,0.08) 38%, transparent 70%)",
          }}
        />

        {/* 3D Floating Squircle App Icons conforming to sphere surface */}
        {mounted &&
          projectedItems.map(({ id, sx, sy, normX, normY, scale, opacity, z, sponsor, index }) => {
            const logoSize = Math.round(ICON_SIZE * scale);
            const isFront = z > 0;
            const isHov = hoveredIndex === index;

            return (
              <div
                key={id}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                onClick={() => {
                  if (sponsor.websiteUrl) {
                    window.open(sponsor.websiteUrl, "_blank", "noopener,noreferrer");
                  }
                }}
                className={`absolute flex items-center justify-center rounded-[22%] bg-white select-none transition-all ${
                  sponsor.websiteUrl ? "cursor-pointer" : ""
                }`}
                style={{
                  width: logoSize,
                  height: logoSize,
                  left: Math.round(SIZE / 2 + sx - logoSize / 2),
                  top: Math.round(SIZE / 2 + sy - logoSize / 2),
                  opacity: isHov ? 1 : opacity,
                  zIndex: Math.round(scale * 120),
                  boxShadow: isHov
                    ? "0 0 28px rgba(216,58,67,0.9), 0 8px 24px rgba(0,0,0,0.8)"
                    : isFront
                    ? `0 6px 18px rgba(0,0,0,${0.55 * scale}), 0 0 ${Math.round(10 * scale)}px rgba(216,58,67,${0.25 * scale})`
                    : "0 2px 8px rgba(0,0,0,0.4)",
                  transform: isHov
                    ? `scale(1.22) rotateY(${normX * 36}deg) rotateX(${-normY * 36}deg)`
                    : `scale(1) rotateY(${normX * 36}deg) rotateX(${-normY * 36}deg)`,
                  transformOrigin: "center center",
                  transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out",
                }}
                title={sponsor.name}
              >
                {/* Clean squircle app container */}
                <div className="h-full w-full p-2 flex items-center justify-center overflow-hidden rounded-[22%]">
                  {sponsor.logoUrl ? (
                    <img
                      src={getSponsorLogoUrl(sponsor.logoUrl)}
                      alt={sponsor.name}
                      draggable={false}
                      className="h-full w-full object-contain pointer-events-none"
                      onError={(e) => {
                        const target = e.currentTarget;
                        if (!target.dataset.fallback) {
                          target.dataset.fallback = "true";
                          target.src = sponsor.logoUrl;
                        }
                      }}
                    />
                  ) : (
                    <span className="text-center font-bold text-[9px] leading-tight text-gray-900 line-clamp-2">
                      {sponsor.name}
                    </span>
                  )}
                </div>

                {/* Floating Sponsor Info Tooltip on Hover */}
                {isHov && (
                  <div className="pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-black/90 border border-white/20 px-2.5 py-1 font-mono text-[10px] uppercase tracking-wider text-white shadow-xl z-50 flex items-center gap-1.5">
                    <span className="font-bold text-[#D83A43]">{sponsor.name}</span>
                    <span className="text-[#A8A8A8] text-[8px]">({sponsor.tier})</span>
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* Orbit Instruction */}
      <div className="mt-4 flex items-center gap-2 mono text-[10px] uppercase tracking-widest text-[#A8A8A8]/60">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#D83A43]" />
        <span>360° Sphere • Drag to rotate</span>
      </div>
    </div>
  );
}
