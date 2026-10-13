"use client";

import { create } from "zustand";

interface RegistrationModalState {
  isOpen: boolean;
  initialView: "options" | "categories";
  open: (view?: "options" | "categories") => void;
  close: () => void;
}

export const useRegistrationModal = create<RegistrationModalState>((set) => ({
  isOpen: false,
  initialView: "options",
  open: (view = "options") => set({ isOpen: true, initialView: view }),
  close: () => set({ isOpen: false }),
}));
