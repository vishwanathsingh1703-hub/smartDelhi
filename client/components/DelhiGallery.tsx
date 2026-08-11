"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
    ArrowLeft,
    ArrowRight,
    MapPin,
    Sparkles,
} from "lucide-react";

const galleryItems = [
    {
        id: 1,
        title: "India Gate",
        location: "New Delhi",
        description:
            "A timeless symbol of Delhi, standing at the heart of the capital and reflecting the city's history, identity and spirit.",
        image: "/images/delhi/india-gate.png",
        accent: "National Capital",
    },
    {
        id: 2,
        title: "Connaught Place",
        location: "Central Delhi",
        description:
            "The iconic circular heart of Delhi where heritage architecture meets modern commerce, culture and everyday city life.",
        image: "/images/delhi/connaught-place.png",
        accent: "Urban Core",
    },
    {
        id: 3,
        title: "Lotus Temple",
        location: "South Delhi",
        description:
            "An architectural landmark surrounded by calm landscapes, representing Delhi's diverse culture and modern character.",
        image: "/images/delhi/lotus-temple.png",
        accent: "South Delhi",
    },
    {
        id: 4,
        title: "Red Fort",
        location: "Old Delhi",
        description:
            "A monumental piece of Delhi's heritage that continues to connect the historic capital with the India of today.",
        image: "/images/delhi/red-fort.png",
        accent: "Historic Delhi",
    },
    {
        id: 5,
        title: "Delhi Metro",
        location: "Delhi NCR",
        description:
            "The city's fast-moving urban network connecting neighbourhoods, communities and millions of daily journeys.",
        image: "/images/delhi/delhi-metro.png",
        accent: "Connected Delhi",
    },
];

export default function DelhiGallery() {
    const [activeIndex, setActiveIndex] = useState(0);
    const [isPaused, setIsPaused] = useState(false);

    const activeItem = galleryItems[activeIndex];

    const nextSlide = () => {
        setActiveIndex((prev) => (prev + 1) % galleryItems.length);
    };

    const previousSlide = () => {
        setActiveIndex(
            (prev) =>
                (prev - 1 + galleryItems.length) %
                galleryItems.length
        );
    };

    useEffect(() => {
        if (isPaused) return;

        const timer = setInterval(() => {
            nextSlide();
        }, 5000);

        return () => clearInterval(timer);
    }, [isPaused]);

    return (
        <section
            className="
        relative
        w-full
        py-20
        sm:py-24
        lg:py-28
        overflow-hidden
      "
        >
            {/* =====================================================
          AMBIENT BACKGROUND
      ====================================================== */}

            <div className="absolute inset-0 pointer-events-none">
                <div
                    className="
            absolute
            left-[8%]
            top-[20%]
            w-[420px]
            h-[420px]
            rounded-full
            bg-cyan-500/[0.06]
            blur-[120px]
          "
                />

                <div
                    className="
            absolute
            right-[5%]
            bottom-[10%]
            w-[380px]
            h-[380px]
            rounded-full
            bg-blue-600/[0.07]
            blur-[120px]
          "
                />

                <div
                    className="
            absolute
            inset-x-0
            bottom-0
            h-px
            bg-gradient-to-r
            from-transparent
            via-white/10
            to-transparent
          "
                />
            </div>

            {/* =====================================================
          MAIN CONTAINER
      ====================================================== */}

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

                {/* =================================================
            SECTION HEADER
        ================================================= */}

                <motion.div
                    initial={{
                        opacity: 0,
                        y: 20,
                    }}
                    whileInView={{
                        opacity: 1,
                        y: 0,
                    }}
                    viewport={{
                        once: true,
                        amount: 0.2,
                    }}
                    transition={{
                        duration: 0.7,
                    }}
                    className="mb-10 lg:mb-12"
                >
                    <div
                        className="
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-full
              border
              border-cyan-400/20
              bg-cyan-400/[0.05]
              text-cyan-300
              text-[10px]
              font-semibold
              tracking-[0.22em]
              uppercase
            "
                    >
                        <Sparkles className="w-3 h-3" />
                        Discover Delhi
                    </div>
                </motion.div>

                {/* =================================================
            GALLERY GRID
        ================================================= */}

                <div
                    className="
            grid
            grid-cols-1
            lg:grid-cols-12
            gap-8
            lg:gap-12
            items-center
          "
                >

                    {/* =================================================
              LEFT — IMAGE GALLERY
          ================================================= */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            x: -30,
                        }}
                        whileInView={{
                            opacity: 1,
                            x: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: 0.8,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="lg:col-span-7"
                    >

                        <div
                            onMouseEnter={() => setIsPaused(true)}
                            onMouseLeave={() => setIsPaused(false)}
                            className="
                group
                relative
                overflow-hidden
                rounded-[30px]
                sm:rounded-[36px]
                border
                border-white/[0.10]
                bg-[#07111f]
                shadow-[0_35px_100px_rgba(0,0,0,0.45)]
              "
                        >

                            {/* IMAGE */}

                            <div
                                className="
                  relative
                  h-[390px]
                  sm:h-[500px]
                  lg:h-[560px]
                  overflow-hidden
                "
                            >

                                <AnimatePresence mode="sync">

                                    <motion.div
                                        key={activeItem.id}
                                        initial={{
                                            opacity: 0,
                                            scale: 1.06,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            scale: 1,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            scale: 1.02,
                                        }}
                                        transition={{
                                            duration: 1,
                                            ease: "easeInOut",
                                        }}
                                        className="absolute inset-0"
                                    >

                                        <Image
                                            src={activeItem.image}
                                            alt={`${activeItem.title}, ${activeItem.location}`}
                                            fill
                                            priority={activeIndex === 0}
                                            sizes="(max-width: 1024px) 100vw, 60vw"
                                            className="object-cover transition-transform duration-[5000ms] ease-linear group-hover:scale-[1.03]"
                                        />

                                    </motion.div>

                                </AnimatePresence>

                                {/* DARK CINEMATIC OVERLAY */}

                                <div
                                    className="
                    absolute
                    inset-0
                    bg-gradient-to-t
                    from-black/85
                    via-black/20
                    to-black/10
                  "
                                />

                                <div
                                    className="
                    absolute
                    inset-0
                    bg-gradient-to-r
                    from-black/25
                    via-transparent
                    to-black/10
                  "
                                />

                                {/* TOP BADGE */}

                                <div
                                    className="
                    absolute
                    top-5
                    left-5
                    sm:top-7
                    sm:left-7
                    inline-flex
                    items-center
                    gap-2
                    px-3
                    py-1.5
                    rounded-full
                    border
                    border-white/15
                    bg-black/30
                    backdrop-blur-xl
                    text-white/90
                    text-[10px]
                    uppercase
                    tracking-[0.18em]
                    font-medium
                  "
                                >
                                    <span
                                        className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-cyan-400
                      shadow-[0_0_10px_rgba(34,211,238,0.9)]
                    "
                                    />

                                    Delhi · Live City
                                </div>

                                {/* IMAGE INFORMATION */}

                                <AnimatePresence mode="wait">

                                    <motion.div
                                        key={activeItem.id}
                                        initial={{
                                            opacity: 0,
                                            y: 15,
                                        }}
                                        animate={{
                                            opacity: 1,
                                            y: 0,
                                        }}
                                        exit={{
                                            opacity: 0,
                                            y: -10,
                                        }}
                                        transition={{
                                            duration: 0.45,
                                        }}
                                        className="
                      absolute
                      left-5
                      right-5
                      bottom-6
                      sm:left-7
                      sm:right-7
                      sm:bottom-8
                    "
                                    >

                                        <div
                                            className="
                        flex
                        items-center
                        gap-2
                        text-cyan-300
                        text-[10px]
                        uppercase
                        tracking-[0.2em]
                        font-semibold
                      "
                                        >
                                            <MapPin className="w-3 h-3" />

                                            {activeItem.location}
                                        </div>

                                        <h3
                                            className="
                        mt-2
                        text-3xl
                        sm:text-4xl
                        font-bold
                        tracking-tight
                        text-white
                      "
                                        >
                                            {activeItem.title}
                                        </h3>

                                    </motion.div>

                                </AnimatePresence>

                                {/* SLIDE COUNTER */}

                                <div
                                    className="
                    absolute
                    right-5
                    bottom-6
                    sm:right-7
                    sm:bottom-8
                    text-right
                  "
                                >
                                    <div className="text-white text-sm font-semibold">
                                        {String(activeIndex + 1).padStart(2, "0")}
                                        <span className="text-white/30 mx-1">/</span>
                                        <span className="text-white/40">
                                            {String(galleryItems.length).padStart(2, "0")}
                                        </span>
                                    </div>
                                </div>

                            </div>

                            {/* =================================================
                  BOTTOM CONTROL BAR
              ================================================== */}

                            <div
                                className="
                  relative
                  flex
                  items-center
                  justify-between
                  gap-4
                  px-5
                  py-4
                  sm:px-7
                  sm:py-5
                  bg-[#07111f]/95
                  backdrop-blur-xl
                  border-t
                  border-white/[0.07]
                "
                            >

                                {/* PROGRESS */}

                                <div className="flex items-center gap-2 flex-1">

                                    {galleryItems.map((item, index) => (
                                        <button
                                            key={item.id}
                                            type="button"
                                            aria-label={`Show ${item.title}`}
                                            onClick={() => setActiveIndex(index)}
                                            className="group/indicator flex-1 h-6 flex items-center"
                                        >
                                            <span
                                                className={`
                          block
                          w-full
                          h-[2px]
                          rounded-full
                          transition-all
                          duration-500
                          ${index === activeIndex
                                                        ? "bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.7)]"
                                                        : "bg-white/15 group-hover/indicator:bg-white/30"
                                                    }
                        `}
                                            />
                                        </button>
                                    ))}

                                </div>

                                {/* ARROWS */}

                                <div className="flex items-center gap-2">

                                    <button
                                        type="button"
                                        onClick={previousSlide}
                                        aria-label="Previous image"
                                        className="
                      w-9
                      h-9
                      rounded-full
                      border
                      border-white/10
                      bg-white/[0.04]
                      flex
                      items-center
                      justify-center
                      text-white/70
                      hover:text-white
                      hover:bg-white/10
                      hover:border-cyan-400/30
                      transition-all
                    "
                                    >
                                        <ArrowLeft className="w-4 h-4" />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={nextSlide}
                                        aria-label="Next image"
                                        className="
                      w-9
                      h-9
                      rounded-full
                      border
                      border-cyan-400/20
                      bg-cyan-400/[0.06]
                      flex
                      items-center
                      justify-center
                      text-cyan-300
                      hover:text-white
                      hover:bg-cyan-400/10
                      transition-all
                    "
                                    >
                                        <ArrowRight className="w-4 h-4" />
                                    </button>

                                </div>

                            </div>

                        </div>

                    </motion.div>

                    {/* =================================================
              RIGHT — CONTENT
          ================================================= */}

                    <motion.div
                        initial={{
                            opacity: 0,
                            x: 30,
                        }}
                        whileInView={{
                            opacity: 1,
                            x: 0,
                        }}
                        viewport={{
                            once: true,
                            amount: 0.2,
                        }}
                        transition={{
                            duration: 0.8,
                            delay: 0.1,
                            ease: [0.22, 1, 0.36, 1],
                        }}
                        className="
              lg:col-span-5
              flex
              flex-col
              justify-center
            "
                    >

                        {/* EYEBROW */}

                        <div
                            className="
                flex
                items-center
                gap-3
                text-[10px]
                uppercase
                tracking-[0.25em]
                text-cyan-400
                font-semibold
              "
                        >
                            <span
                                className="
                  w-8
                  h-px
                  bg-cyan-400
                "
                            />

                            The Capital
                        </div>

                        {/* HEADING */}

                        <h2
                            className="
                mt-5
                text-4xl
                sm:text-5xl
                lg:text-[58px]
                font-bold
                leading-[0.98]
                tracking-[-0.045em]
                text-white
              "
                        >
                            A City That is the Heartbrat
                            <br />

                            <span
                                className="
                  text-transparent
                  bg-clip-text
                  bg-gradient-to-r
                  from-cyan-300
                  via-blue-400
                  to-indigo-400
                "
                            >
                                of Million
                            </span>

                            <br />

                            Stories.
                        </h2>

                        {/* DESCRIPTION */}

                        <AnimatePresence mode="wait">

                            <motion.p
                                key={activeItem.id}
                                initial={{
                                    opacity: 0,
                                    y: 8,
                                }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                }}
                                exit={{
                                    opacity: 0,
                                    y: -8,
                                }}
                                transition={{
                                    duration: 0.35,
                                }}
                                className="
                  mt-6
                  max-w-md
                  text-sm
                  sm:text-base
                  leading-7
                  text-slate-400
                "
                            >
                                {activeItem.description}
                            </motion.p>

                        </AnimatePresence>

                        {/* ACTIVE LOCATION */}

                        <div
                            className="
                mt-8
                flex
                items-center
                gap-3
              "
                        >

                            <div
                                className="
                  w-10
                  h-10
                  rounded-xl
                  border
                  border-cyan-400/20
                  bg-cyan-400/[0.06]
                  flex
                  items-center
                  justify-center
                  text-cyan-300
                "
                            >
                                <MapPin className="w-4 h-4" />
                            </div>

                            <div>

                                <div
                                    className="
                    text-[10px]
                    uppercase
                    tracking-[0.16em]
                    text-slate-500
                  "
                                >
                                    Currently exploring
                                </div>

                                <div
                                    className="
                    mt-0.5
                    text-sm
                    font-semibold
                    text-white
                  "
                                >
                                    {activeItem.title}, {activeItem.location}
                                </div>

                            </div>

                        </div>

                        {/* STATS */}

                        <div
                            className="
                grid
                grid-cols-3
                gap-3
                mt-9
                max-w-md
              "
                        >

                            <div
                                className="
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-4
                  py-4
                "
                            >
                                <div className="text-lg font-bold text-white">
                                    272
                                </div>

                                <div
                                    className="
                    mt-1
                    text-[9px]
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                                >
                                    Wards
                                </div>
                            </div>

                            <div
                                className="
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-4
                  py-4
                "
                            >
                                <div className="text-lg font-bold text-cyan-300">
                                    24/7
                                </div>

                                <div
                                    className="
                    mt-1
                    text-[9px]
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                                >
                                    Intelligence
                                </div>
                            </div>

                            <div
                                className="
                  rounded-2xl
                  border
                  border-white/[0.08]
                  bg-white/[0.025]
                  px-4
                  py-4
                "
                            >
                                <div className="text-lg font-bold text-emerald-300">
                                    LIVE
                                </div>

                                <div
                                    className="
                    mt-1
                    text-[9px]
                    uppercase
                    tracking-wider
                    text-slate-500
                  "
                                >
                                    City Data
                                </div>
                            </div>

                        </div>

                        {/* CTA */}

                        <div className="mt-8">

                            <button
                                type="button"
                                className="
                  group
                  inline-flex
                  items-center
                  gap-3
                  rounded-xl
                  bg-gradient-to-r
                  from-cyan-500
                  to-blue-600
                  px-5
                  py-3
                  text-sm
                  font-semibold
                  text-white
                  shadow-[0_12px_35px_rgba(14,165,233,0.25)]
                  transition-all
                  duration-300
                  hover:-translate-y-0.5
                  hover:shadow-[0_18px_45px_rgba(14,165,233,0.35)]
                "
                            >
                                Explore Delhi

                                <ArrowRight
                                    className="
                    w-4
                    h-4
                    transition-transform
                    duration-300
                    group-hover:translate-x-1
                  "
                                />

                            </button>

                        </div>

                    </motion.div>

                </div>

            </div>
        </section>
    );
}