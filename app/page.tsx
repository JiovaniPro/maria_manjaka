"use client";

import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-black font-sans text-white dark:bg-black">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="typewriter text-3xl font-extrabold tracking-wide">
          <span>Bienvenue sur la plateforme de gestion de Maria Manjaka 67 HA</span>
        </h1>
        <p>"Ny fitiavako ny tranonao no maharitra ny aiko"</p> <i>Mark 15:6</i>
        <Link
          href="/connexion"
          className="rounded-full border border-white px-8 py-3 text-base font-semibold tracking-wide text-white transition hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 cursor-pointer"
        >
          Commencer <span aria-hidden="true">&rarr;</span>
        </Link>
      </div>
      <style jsx>{`
        .typewriter span {
          display: inline-block;
          border-right: 0.15em solid #fff;
          white-space: nowrap;
          overflow: hidden;
          animation: typing 6s steps(70, end) infinite, caret 0.75s step-end infinite;
        }

        @keyframes typing {
          0% {
            width: 0;
          }
          40%,
          60% {
            width: 100%;
          }
          100% {
            width: 0;
          }
        }

        @keyframes caret {
          0%,
          50% {
            border-color: rgba(255, 255, 255, 0.9);
          }
          51%,
          100% {
            border-color: transparent;
          }
        }
      `}</style>
    </div>
  );
}
