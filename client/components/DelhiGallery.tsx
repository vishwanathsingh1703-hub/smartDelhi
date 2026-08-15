"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Sparkles,
} from "lucide-react";

type GalleryItem = {
  id: number;
  title: string;
  location: string;
  description: string;
  image: string;
  accent: string;
};

const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "India Gate",
    location: "New Delhi",
    description:
      "A timeless symbol of Delhi, reflecting the capital's history, identity and spirit.",
    image: "/images/delhi/india-gate.png",
    accent: "National Capital",
  },
  {
    id: 2,
    title: "Connaught Place",
    location: "Central Delhi",
    description:
      "The commercial and cultural heart of Delhi where heritage meets modern city life.",
    image: "/images/delhi/connaught-place.png",
    accent: "Urban Core",
  },
  {
    id: 3,
    title: "Lotus Temple",
    location: "South Delhi",
    description:
      "An architectural landmark representing Delhi's diversity, calm and modern character.",
    image: "/images/delhi/lotus-temple.png",
    accent: "South Delhi",
  },
  {
    id: 4,
    title: "Red Fort",
    location: "Old Delhi",
    description:
      "A defining piece of Delhi's heritage connecting the historic capital with today's city.",
    image: "/images/delhi/red-fort.png",
    accent: "Historic Delhi",
  },
  {
    id: 5,
    title: "Delhi Metro",
    location: "Delhi NCR",
    description:
      "A fast-moving urban network connecting neighbourhoods and millions of daily journeys.",
    image: "/images/delhi/delhi-metro.png",
    accent: "Connected Delhi",
  },
];

export default function DelhiGallery() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const activeItem = galleryItems[activeIndex];

  const nextSlide = () => {
    setActiveIndex((current) =>
      current === galleryItems.length - 1 ? 0 : current + 1
    );
  };

  const previousSlide = () => {
    setActiveIndex((current) =>
      current === 0 ? galleryItems.length - 1 : current - 1
    );
  };

  useEffect(() => {
    if (isPaused) return;

    const interval = window.setInterval(() => {
      setActiveIndex((current) =>
        current === galleryItems.length - 1 ? 0 : current + 1
      );
    }, 5000);

    return () => window.clearInterval(interval);
  }, [isPaused]);

  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-28 lg:py-32">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[5%] top-[18%] h-[420px] w-[420px] rounded-full bg-cyan-500/[0.055] blur-[130px]" />

        <div className="absolute right-[5%] bottom-[8%] h-[420px] w-[420px] rounded-full bg-blue-600/[0.06] blur-[130px]" />

        <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* =========================================================
          MAIN
      ========================================================= */}

      <div className="relative z-10 mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
        {/* =======================================================
            HEADER
        ======================================================= */}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.25 }}
          transition={{
            duration: 0.7,
            ease: [0.22, 1, 0.36, 1],
          }}
          className="mb-12 lg:mb-14"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/[0.05] px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-cyan-300">
            <Sparkles className="h-3 w-3" />
            Discover Delhi
          </div>
        </motion.div>

        {/* =======================================================
            CONTENT GRID
        ======================================================= */}

        <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
          {/* =====================================================
              LEFT — SLIDING IMAGE WINDOW
          ===================================================== */}

          <motion.div
            initial={{ opacity: 0, x: -35 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.85,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:col-span-7"
          >
            <div
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
              className="group relative"
            >
              {/* Ambient glow */}

              <div className="pointer-events-none absolute -inset-8 rounded-[42px] bg-cyan-400/[0.06] blur-[55px] transition-opacity duration-700 group-hover:opacity-100" />

              {/* Main image window */}

              <div className="relative overflow-hidden rounded-[30px] border border-white/[0.10] bg-[#07111f] shadow-[0_40px_120px_rgba(0,0,0,0.55)] sm:rounded-[36px]">
                <div className="relative h-[390px] overflow-hidden sm:h-[500px] lg:h-[560px]">
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={activeItem.id}
                      initial={{
                        opacity: 0,
                        scale: 1.045,
                        x: 18,
                      }}
                      animate={{
                        opacity: 1,
                        scale: 1,
                        x: 0,
                      }}
                      exit={{
                        opacity: 0,
                        scale: 1.015,
                        x: -12,
                      }}
                      transition={{
                        duration: 0.75,
                        ease: [0.22, 1, 0.36, 1],
                      }}
                      className="absolute inset-0"
                    >
                      <Image
                        src={activeItem.image}
                        alt={`${activeItem.title}, ${activeItem.location}`}
                        fill
                        priority={activeIndex === 0}
                        sizes="(max-width: 1024px) 100vw, 60vw"
                        className="object-cover"
                      />

                      {/* Cinematic overlays */}

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/30 via-transparent to-black/10" />

                      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-cyan-400/[0.05] via-transparent to-blue-500/[0.05]" />
                    </motion.div>
                  </AnimatePresence>

                  {/* Top badge */}

                  <div className="absolute left-5 top-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/30 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-white/90 backdrop-blur-xl sm:left-7 sm:top-7">
                    <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.9)]" />
                    Delhi · Live City
                  </div>

                  {/* Image information */}

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`info-${activeItem.id}`}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{
                        duration: 0.4,
                        ease: "easeOut",
                      }}
                      className="absolute bottom-7 left-5 right-5 sm:bottom-9 sm:left-7 sm:right-7"
                    >
                      <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-300">
                        <MapPin className="h-3 w-3" />
                        {activeItem.location}
                      </div>

                      <h3 className="mt-2 text-3xl font-bold tracking-[-0.035em] text-white sm:text-4xl">
                        {activeItem.title}
                      </h3>

                      <div className="mt-2 text-[10px] uppercase tracking-[0.18em] text-white/40">
                        {activeItem.accent}
                      </div>
                    </motion.div>
                  </AnimatePresence>

                  {/* Counter */}

                  <div className="absolute bottom-7 right-5 text-right sm:bottom-9 sm:right-7">
                    <span className="text-sm font-semibold text-white">
                      {String(activeIndex + 1).padStart(2, "0")}
                    </span>

                    <span className="mx-1 text-white/25">/</span>

                    <span className="text-sm text-white/35">
                      {String(galleryItems.length).padStart(2, "0")}
                    </span>
                  </div>
                </div>

                {/* =================================================
                    CONTROL BAR
                ================================================= */}

                <div className="flex items-center gap-4 border-t border-white/[0.07] bg-[#07111f]/95 px-5 py-4 backdrop-blur-xl sm:px-7 sm:py-5">
                  {/* Progress */}

                  <div className="flex flex-1 items-center gap-2">
                    {galleryItems.map((item, index) => (
                      <button
                        key={item.id}
                        type="button"
                        aria-label={`Show ${item.title}`}
                        onClick={() => setActiveIndex(index)}
                        className="group/indicator flex h-6 flex-1 items-center"
                      >
                        <span
                          className={[
                            "block h-[2px] w-full rounded-full transition-all duration-500",
                            index === activeIndex
                              ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.75)]"
                              : "bg-white/15 group-hover/indicator:bg-white/30",
                          ].join(" ")}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Controls */}

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={previousSlide}
                      aria-label="Previous image"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-white/70 transition-all duration-300 hover:border-cyan-400/30 hover:bg-white/10 hover:text-white"
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={nextSlide}
                      aria-label="Next image"
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300 transition-all duration-300 hover:bg-cyan-400/10 hover:text-white"
                    >
                      <ArrowRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* =====================================================
              RIGHT — CONTENT
          ===================================================== */}

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{
              duration: 0.85,
              delay: 0.1,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="lg:col-span-5"
          >
            <div className="flex items-center gap-3 text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-400">
              <span className="h-px w-8 bg-cyan-400" />
              The Capital
            </div>

            <h2 className="mt-5 text-4xl font-bold leading-[0.98] tracking-[-0.045em] text-white sm:text-5xl lg:text-[58px]">
              A City That is
              <br />
              the Heartbeat
              <br />
              <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
                of Millions.
              </span>
            </h2>

            {/* Dynamic description */}

            <AnimatePresence mode="wait">
              <motion.p
                key={activeItem.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.35 }}
                className="mt-6 max-w-md text-sm leading-7 text-slate-400 sm:text-base"
              >
                {activeItem.description}
              </motion.p>
            </AnimatePresence>

            {/* Current location */}

            <div className="mt-8 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-400/20 bg-cyan-400/[0.06] text-cyan-300">
                <MapPin className="h-4 w-4" />
              </div>

              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Currently exploring
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={`location-${activeItem.id}`}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.25 }}
                    className="mt-0.5 text-sm font-semibold text-white"
                  >
                    {activeItem.title}, {activeItem.location}
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>

            {/* Stats */}

            <div className="mt-9 grid max-w-md grid-cols-3 gap-3">
              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20">
                <div className="text-lg font-bold text-white">272</div>
                <div className="mt-1 text-[9px] uppercase tracking-wider text-slate-500">
                  Wards
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20">
                <div className="text-lg font-bold text-cyan-300">24/7</div>
                <div className="mt-1 text-[9px] uppercase tracking-wider text-slate-500">
                  Intelligence
                </div>
              </div>

              <div className="rounded-2xl border border-white/[0.08] bg-white/[0.025] px-4 py-4 transition-all duration-300 hover:-translate-y-1 hover:border-cyan-400/20">
                <div className="text-lg font-bold text-emerald-300">
                  LIVE
                </div>
                <div className="mt-1 text-[9px] uppercase tracking-wider text-slate-500">
                  City Data
                </div>
              </div>
            </div>

            {/* Small status */}

            <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.18em] text-slate-500">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
              Exploring Delhi in real time
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}