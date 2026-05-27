"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { OceanDropletBurst } from "~/src/components/ocean/ocean-droplet-burst";
import { OceanScene } from "~/src/components/marketing/ocean-scene";
import { playOceanSplashSound } from "~/src/lib/ocean-splash-sound";

type OceanContextValue = {
  triggerSplash: () => void;
};

const OceanContext = createContext<OceanContextValue | null>(null);

export function useOcean() {
  const ctx = useContext(OceanContext);
  if (!ctx) {
    throw new Error("useOcean must be used within OceanProvider");
  }
  return ctx;
}

export function OceanProvider({ children }: { children: React.ReactNode }) {
  const [splashActive, setSplashActive] = useState(false);
  const [splashKey, setSplashKey] = useState(0);

  const triggerSplash = useCallback(() => {
    playOceanSplashSound();
    setSplashKey((k) => k + 1);
    setSplashActive(true);
    window.setTimeout(() => setSplashActive(false), 1400);
  }, []);

  useEffect(() => {
    document.documentElement.classList.add("ocean-app");
    return () => document.documentElement.classList.remove("ocean-app");
  }, []);

  return (
    <OceanContext.Provider value={{ triggerSplash }}>
      <OceanScene variant="ambient" />
      <OceanDropletBurst active={splashActive} burstKey={splashKey} />
      <div className="relative z-10 min-h-screen">{children}</div>
    </OceanContext.Provider>
  );
}
