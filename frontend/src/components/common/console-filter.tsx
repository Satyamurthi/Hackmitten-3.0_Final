"use client";

if (typeof window !== "undefined") {
  const origWarn = console.warn;
  console.warn = (...args: any[]) => {
    const text = typeof args[0] === "string" ? args[0] : "";
    if (
      text.includes("THREE.Clock: This module has been deprecated") ||
      text.includes("Clock: This module has been deprecated") ||
      text.includes("fdprocessedid")
    ) {
      return;
    }
    origWarn.apply(console, args);
  };

  const origError = console.error;
  console.error = (...args: any[]) => {
    const str = args
      .map((a) => (typeof a === "string" ? a : typeof a === "object" && a !== null ? JSON.stringify(a) : ""))
      .join(" ");

    if (str.includes("fdprocessedid") || (str.includes("hydrat") && str.includes("browser extension"))) {
      return;
    }
    origError.apply(console, args);
  };
}

export function ConsoleFilter() {
  return null;
}
