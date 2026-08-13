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
<section className="relative z-10 py-28 lg:py-36 overflow-hidden">

  <div className="max-w-7xl mx-auto px-6">

    <div className="grid lg:grid-cols-[0.88fr_1.12fr] gap-16 xl:gap-24 items-center">


      {/* =========================================================
          LEFT — PREMIUM EDITORIAL CONTENT
      ========================================================= */}

      <motion.div
        initial={{ opacity: 0, x: -45 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, amount: 0.25 }}
        transition={{
          duration: 0.9,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="relative"
      >

        {/* SMALL EYEBROW */}

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay: 0.15,
          }}
          className="flex items-center gap-3"
        >

          <span className="h-px w-10 bg-cyan-400/70" />

          <span className="text-[10px] uppercase tracking-[0.38em] text-cyan-400">
            Our Technology
          </span>

        </motion.div>


        {/* =====================================================
            MAIN HEADING
        ===================================================== */}

        <h2 className="mt-7 text-[42px] sm:text-[50px] lg:text-[55px] xl:text-[64px] leading-[0.98] tracking-[-0.055em] font-semibold text-white">

          <motion.span
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.75,
              delay: 0.2,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="block"
          >
            One platform.
          </motion.span>


          <motion.span
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.75,
              delay: 0.32,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="
              relative
              block
              mt-2
              bg-gradient-to-r
              from-cyan-300
              via-blue-400
              to-cyan-300
              bg-[length:200%_auto]
              bg-clip-text
              text-transparent
              animate-[gradientMove_5s_ease-in-out_infinite]
            "
          >
            Multiple intelligence
          </motion.span>


          <motion.span
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{
              duration: 0.75,
              delay: 0.44,
              ease: [0.22, 1, 0.36, 1],
            }}
            className="block text-white"
          >
            layers.
          </motion.span>

        </h2>


        {/* DESCRIPTION */}

        <motion.p
          initial={{ opacity: 0, y: 22 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.7,
            delay: 0.58,
            ease: "easeOut",
          }}
          className="
            mt-8
            max-w-lg
            text-[15px]
            sm:text-base
            leading-8
            text-slate-400
          "
        >
          SmartDELHI brings together artificial intelligence, real-time GIS,
          citizen workflows and civic operations into one intelligent
          operating layer for the city.
        </motion.p>


        {/* =====================================================
            TECHNOLOGY LIST
        ===================================================== */}

        <div className="mt-9 space-y-3">

          {[
            "Artificial Intelligence",
            "Real-time GIS Intelligence",
            "Citizen Complaint Management",
            "Worker Task Management",
            "Ward Performance Analytics",
            "Predictive Civic Intelligence",
          ].map((item, index) => (

            <motion.div
              key={item}
              initial={{
                opacity: 0,
                x: -18,
              }}
              whileInView={{
                opacity: 1,
                x: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.5,
                delay: 0.68 + index * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="
                group
                flex
                items-center
                gap-4
                w-fit
                cursor-default
              "
            >

              <span
                className="
                  relative
                  flex
                  items-center
                  justify-center
                  w-5
                  h-5
                  rounded-full
                  border
                  border-cyan-400/30
                  transition-all
                  duration-500
                  group-hover:border-cyan-300/80
                  group-hover:bg-cyan-400/10
                "
              >

                <span
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-cyan-400
                    shadow-[0_0_10px_rgba(34,211,238,0.8)]
                    transition-transform
                    duration-500
                    group-hover:scale-150
                  "
                />

              </span>


              <span
                className="
                  text-sm
                  text-slate-400
                  transition-all
                  duration-500
                  group-hover:text-white
                  group-hover:translate-x-1
                "
              >
                {item}
              </span>

            </motion.div>

          ))}

        </div>


        {/* SMALL BOTTOM INDICATOR */}

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{
            delay: 1.15,
            duration: 0.7,
          }}
          className="mt-10 flex items-center gap-3"
        >

          <span className="relative flex h-2 w-2">

            <span className="absolute inset-0 rounded-full bg-cyan-400 animate-ping opacity-40" />

            <span className="relative h-2 w-2 rounded-full bg-cyan-400" />

          </span>

          <span className="text-[9px] uppercase tracking-[0.28em] text-slate-600">
            Intelligence infrastructure
          </span>

        </motion.div>

      </motion.div>



      {/* =========================================================
          RIGHT — CINEMATIC INTELLIGENCE VISUAL
      ========================================================= */}

      <motion.div
        initial={{
          opacity: 0,
          x: 60,
          scale: 0.94,
        }}
        whileInView={{
          opacity: 1,
          x: 0,
          scale: 1,
        }}
        viewport={{
          once: true,
          amount: 0.2,
        }}
        transition={{
          duration: 1,
          ease: [0.22, 1, 0.36, 1],
        }}
        className="
          relative
          min-h-[520px]
          sm:min-h-[580px]
          flex
          items-center
          justify-center
        "
      >

        {/* =====================================================
            AMBIENT LIGHT
        ===================================================== */}

        <div
          className="
            absolute
            left-1/2
            top-1/2
            -translate-x-1/2
            -translate-y-1/2
            w-[430px]
            h-[430px]
            rounded-full
            bg-cyan-400/[0.07]
            blur-[120px]
            pointer-events-none
          "
        />

        <div
          className="
            absolute
            right-[5%]
            top-[15%]
            w-52
            h-52
            rounded-full
            bg-blue-600/[0.07]
            blur-[100px]
            pointer-events-none
          "
        />


        {/* =====================================================
            MAIN VISUAL STAGE
        ===================================================== */}

        <div
          className="
            relative
            w-full
            max-w-[680px]
            h-[480px]
            sm:h-[540px]
          "
        >


          {/* =================================================
              OUTER ORBIT
          ================================================= */}

          <motion.div
            animate={{
              rotate: 360,
            }}
            transition={{
              duration: 32,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              w-[330px]
              h-[330px]
              sm:w-[400px]
              sm:h-[400px]
              rounded-full
              border
              border-cyan-400/[0.08]
            "
          >

            <span
              className="
                absolute
                left-1/2
                -top-1
                -translate-x-1/2
                w-2
                h-2
                rounded-full
                bg-cyan-300
                shadow-[0_0_18px_rgba(34,211,238,0.9)]
              "
            />

          </motion.div>


          {/* =================================================
              SECOND ORBIT
          ================================================= */}

          <motion.div
            animate={{
              rotate: -360,
            }}
            transition={{
              duration: 24,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              w-[245px]
              h-[245px]
              sm:w-[300px]
              sm:h-[300px]
              rounded-full
              border
              border-blue-400/[0.10]
            "
          >

            <span
              className="
                absolute
                right-[-3px]
                top-1/2
                -translate-y-1/2
                w-1.5
                h-1.5
                rounded-full
                bg-blue-400
                shadow-[0_0_15px_rgba(59,130,246,0.9)]
              "
            />

          </motion.div>


          {/* =================================================
              CENTER INTELLIGENCE CORE
          ================================================= */}

          <motion.div
            animate={{
              y: [0, -8, 0],
            }}
            transition={{
              duration: 5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="
              absolute
              left-1/2
              top-1/2
              -translate-x-1/2
              -translate-y-1/2
              z-20
            "
          >

            {/* CORE GLOW */}

            <div
              className="
                absolute
                -inset-16
                rounded-full
                bg-cyan-400/[0.08]
                blur-[55px]
              "
            />


            {/* CORE */}

            <div
              className="
                relative
                w-[150px]
                h-[150px]
                sm:w-[175px]
                sm:h-[175px]
                rounded-full
                border
                border-cyan-300/20
                bg-[#07111e]/80
                backdrop-blur-xl
                shadow-[0_0_80px_rgba(34,211,238,0.12)]
                flex
                items-center
                justify-center
              "
            >

              {/* INNER RING */}

              <div
                className="
                  absolute
                  inset-5
                  rounded-full
                  border
                  border-cyan-400/20
                "
              />

              <div
                className="
                  absolute
                  inset-10
                  rounded-full
                  bg-cyan-400/[0.05]
                  border
                  border-cyan-300/30
                "
              />


              {/* CORE TEXT */}

              <div className="relative z-10 text-center">

                <div className="text-[8px] uppercase tracking-[0.32em] text-cyan-400/70">
                  SmartDELHI
                </div>

                <div className="mt-2 text-xl sm:text-2xl font-semibold tracking-[-0.04em] text-white">
                  Intelligence
                </div>

                <div className="mt-1 text-[9px] text-slate-500">
                  Core System
                </div>

              </div>

            </div>

          </motion.div>


          {/* =================================================
              FLOATING INTELLIGENCE NODES
          ================================================= */}

          {[
            {
              left: "8%",
              top: "20%",
              title: "AI",
              subtitle: "Detection",
            },
            {
              right: "5%",
              top: "17%",
              title: "GIS",
              subtitle: "Live Mapping",
            },
            {
              left: "4%",
              bottom: "18%",
              title: "CITIZEN",
              subtitle: "Engagement",
            },
            {
              right: "4%",
              bottom: "15%",
              title: "WARD",
              subtitle: "Analytics",
            },
          ].map((node, index) => (

            <motion.div
              key={node.title}
              initial={{
                opacity: 0,
                scale: 0.8,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                delay: 0.55 + index * 0.12,
                duration: 0.6,
              }}
              animate={{
                y: [0, index % 2 === 0 ? -7 : 7, 0],
              }}
              className="
                absolute
                z-10
                w-[112px]
                sm:w-[128px]
                px-4
                py-3
                rounded-2xl
                border
                border-white/[0.08]
                bg-[#07111d]/70
                backdrop-blur-xl
                shadow-[0_20px_50px_rgba(0,0,0,0.35)]
              "
              style={{
                left: node.left,
                right: node.right,
                top: node.top,
                bottom: node.bottom,
              }}
            >

              <div className="flex items-center gap-2">

                <span
                  className="
                    w-1.5
                    h-1.5
                    rounded-full
                    bg-cyan-400
                    shadow-[0_0_10px_rgba(34,211,238,0.9)]
                  "
                />

                <span className="text-[9px] font-semibold tracking-[0.16em] text-white">
                  {node.title}
                </span>

              </div>

              <div className="mt-1.5 text-[8px] text-slate-500">
                {node.subtitle}
              </div>

            </motion.div>

          ))}


          {/* =================================================
              CONNECTION LINES
          ================================================= */}

          <div className="absolute inset-0 pointer-events-none">

            <div
              className="
                absolute
                left-[22%]
                top-[31%]
                w-[25%]
                h-px
                bg-gradient-to-r
                from-cyan-400/0
                via-cyan-400/30
                to-cyan-400/0
                rotate-[25deg]
              "
            />

            <div
              className="
                absolute
                right-[20%]
                top-[30%]
                w-[24%]
                h-px
                bg-gradient-to-r
                from-cyan-400/0
                via-blue-400/30
                to-blue-400/0
                rotate-[-25deg]
              "
            />

            <div
              className="
                absolute
                left-[20%]
                bottom-[29%]
                w-[25%]
                h-px
                bg-gradient-to-r
                from-cyan-400/0
                via-cyan-400/25
                to-cyan-400/0
                rotate-[-25deg]
              "
            />

            <div
              className="
                absolute
                right-[19%]
                bottom-[27%]
                w-[25%]
                h-px
                bg-gradient-to-r
                from-blue-400/0
                via-blue-400/25
                to-blue-400/0
                rotate-[25deg]
              "
            />

          </div>


          {/* =================================================
              SCANNING BEAM
          ================================================= */}

          <motion.div
            animate={{
              y: ["-10%", "110%"],
            }}
            transition={{
              duration: 6,
              repeat: Infinity,
              ease: "linear",
            }}
            className="
              absolute
              left-[15%]
              right-[15%]
              top-0
              h-24
              bg-gradient-to-b
              from-transparent
              via-cyan-400/[0.045]
              to-transparent
              blur-[8px]
              pointer-events-none
            "
          />


          {/* =================================================
              BOTTOM LABEL
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            whileInView={{
              opacity: 1,
              y: 0,
            }}
            viewport={{
              once: true,
            }}
            transition={{
              delay: 1,
              duration: 0.6,
            }}
            className="
              absolute
              bottom-2
              left-1/2
              -translate-x-1/2
              whitespace-nowrap
              flex
              items-center
              gap-2
              text-[8px]
              uppercase
              tracking-[0.3em]
              text-slate-600
            "
          >

            <span className="w-1 h-1 rounded-full bg-emerald-400" />

            Connected civic intelligence

          </motion.div>

        </div>

      </motion.div>

    </div>

  </div>


  {/* =========================================================
      LOCAL KEYFRAMES
  ========================================================= */}

  <style jsx>{`
    @keyframes gradientMove {
      0% {
        background-position: 0% 50%;
      }

      50% {
        background-position: 100% 50%;
      }

      100% {
        background-position: 0% 50%;
      }
    }
  `}</style>

</section>
    );
}