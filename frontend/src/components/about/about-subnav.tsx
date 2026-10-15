"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export const ABOUT_TABS = [
  { id: "overview", label: "01 // OVERVIEW", href: "/about" },
  { id: "pipeline", label: "02 // PIPELINE", href: "/about/pipeline" },
  { id: "topology", label: "03 // TOPOLOGY", href: "/about/topology" },
  { id: "rewards", label: "04 // REWARDS", href: "/about/rewards" },
  { id: "rules", label: "05 // RULES", href: "/about/rules" },
  { id: "team", label: "06 // TEAM", href: "/about/team" },
  { id: "faq", label: "07 // FAQ", href: "/about/faq" },
];

export function AboutSubNav() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/about") {
      return pathname === "/about" || pathname === "/about/overview";
    }
    return pathname === href;
  };

  return (
    <div className="border-b border-white/[0.08] bg-[#070707]/90 backdrop-blur-xl py-3 px-4 sm:px-8 text-xs font-mono overflow-x-auto scrollbar-none z-30 relative flex items-center justify-start lg:justify-center gap-2">
      {ABOUT_TABS.map((tab) => {
        const active = isActive(tab.href);
        return (
          <Link
            key={tab.id}
            href={tab.href}
            className={`px-3.5 py-1.5 rounded-lg transition-all border whitespace-nowrap ${
              active
                ? "bg-[#D83A43]/20 text-white border-[#D83A43]/50 shadow-[0_0_15px_-3px_rgba(216,58,67,0.4)] font-semibold"
                : "text-[#A8A8A8] hover:text-white border-transparent hover:border-white/10 hover:bg-white/[0.04]"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
