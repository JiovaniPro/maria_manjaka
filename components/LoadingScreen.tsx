"use client";

import { useEffect, useState } from "react";

export function LoadingScreen() {
  const [bars, setBars] = useState([20, 40, 60, 80]);

  useEffect(() => {
    const interval = setInterval(() => {
      setBars((prev) => {
        const newBars = [...prev];
        const randomIndex = Math.floor(Math.random() * 4);
        newBars[randomIndex] = Math.random() * 80 + 20;
        return newBars;
      });
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-zinc-50">
      <div className="text-center">
        <div className="mb-6 flex items-center justify-center gap-3">
          <svg
            viewBox="0 0 24 24"
            className="h-12 w-12 text-black"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M12 2v6m-4-2 4-4 4 4M5 22v-7l7-5 7 5v7z" strokeLinecap="round" />
          </svg>
          <div className="text-2xl font-bold uppercase tracking-[0.2em]">
            MARIA MANJAKA 67 HA
          </div>
        </div>
        <div className="flex items-end justify-center gap-2" style={{ height: 50 }}>
          {bars.map((height, index) => (
            <div
              key={index}
              className="w-3 rounded-full bg-black transition-all duration-300 ease-in-out"
              style={{ height: `${height}%` }}
            />
          ))}
        </div>
        <p className="mt-6 text-sm text-black/60">Chargement en cours...</p>
      </div>
    </div>
  );
}