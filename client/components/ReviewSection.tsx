"use client";

import { motion } from "framer-motion";
import {
  Star,
  BadgeCheck,
  Quote,
  ThumbsUp,
  MapPin,
  MessageCircle,
  TrendingUp,
} from "lucide-react";

const reviews = [
  {
    name: "Ananya Sharma",
    location: "Rohini, Delhi",
    rating: 5,
    review:
      "SmartDELHI makes reporting civic issues incredibly simple. I reported a garbage issue and could actually track its progress.",
    avatar: "AS",
    color: "from-cyan-400 to-blue-500",
    verified: true,
  },
  {
    name: "Rahul Mehta",
    location: "Dwarka, Delhi",
    rating: 4,
    review:
      "The live city information and complaint tracking make the whole experience feel much more transparent.",
    avatar: "RM",
    color: "from-violet-400 to-indigo-500",
    verified: true,
  },
  {
    name: "Priya Verma",
    location: "Saket, Delhi",
    rating: 5,
    review:
      "Clean interface, useful information and very easy complaint reporting. This is exactly the kind of civic platform Delhi needs.",
    avatar: "PV",
    color: "from-emerald-400 to-teal-500",
    verified: true,
  },
  {
    name: "Arjun Kapoor",
    location: "Janakpuri, Delhi",
    rating: 4,
    review:
      "The dashboard gives a much better understanding of what is happening around the city. Very impressive concept.",
    avatar: "AK",
    color: "from-orange-400 to-red-500",
    verified: true,
  },
  {
    name: "Neha Singh",
    location: "Lajpat Nagar, Delhi",
    rating: 4,
    review:
      "I really like the combination of maps, civic reporting and real-time information. Everything feels connected.",
    avatar: "NS",
    color: "from-pink-400 to-rose-500",
    verified: true,
  },
  {
    name: "Vikram Rao",
    location: "Pitampura, Delhi",
    rating: 5,
    review:
      "A modern approach to citizen services. The experience is fast, clean and much more engaging than traditional complaint portals.",
    avatar: "VR",
    color: "from-sky-400 to-cyan-500",
    verified: true,
  },
];

const ratingBreakdown = [
  { stars: 5, percentage: 62 },
  { stars: 4, percentage: 24 },
  { stars: 3, percentage: 9 },
  { stars: 2, percentage: 3 },
  { stars: 1, percentage: 2 },
];

function Stars({
  rating,
  size = 15,
}: {
  rating: number;
  size?: number;
}) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          size={size}
          strokeWidth={1.8}
          className={
            star <= rating
              ? "fill-amber-400 text-amber-400"
              : "text-slate-700"
          }
        />
      ))}
    </div>
  );
}

export default function ReviewSection() {
  return (
    <section className="relative w-full overflow-hidden py-24 sm:py-28">

      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[8%] top-[18%] h-72 w-72 rounded-full bg-cyan-500/[0.06] blur-[110px]" />
        <div className="absolute right-[5%] bottom-[10%] h-80 w-80 rounded-full bg-blue-600/[0.07] blur-[120px]" />
        <div className="absolute left-1/2 top-1/2 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/[0.035] blur-[130px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.8 }}
          className="mb-12 text-center"
        >
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-400/15 bg-cyan-400/[0.05] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.25em] text-cyan-300 backdrop-blur-xl">
            <MessageCircle className="h-3.5 w-3.5" />
            Citizen Voice
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            Trusted by the{" "}
            <span className="bg-gradient-to-r from-cyan-300 via-blue-400 to-indigo-400 bg-clip-text text-transparent">
              People of Delhi
            </span>
          </h2>

          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-slate-400 sm:text-base">
            Real experiences from citizens using SmartDELHI to report,
            track and understand civic issues across the city.
          </p>
        </motion.div>

        {/* Rating overview */}
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative mb-14 overflow-hidden rounded-[30px] border border-white/[0.09] bg-[#07101d]/80 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-2xl sm:p-8"
        >

          {/* top glow */}
          <div className="absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

          <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12">

            {/* Main rating */}
            <div className="text-center md:col-span-4 md:border-r md:border-white/[0.07] md:pr-8">

              <div className="flex items-end justify-center gap-2">
                <span className="text-6xl font-bold tracking-[-0.06em] text-white">
                  4.1
                </span>

                <span className="mb-2 text-sm text-slate-500">
                  / 5
                </span>
              </div>

              <div className="mt-3 flex justify-center">
                <Stars rating={4} size={19} />
              </div>

              <div className="mt-3 text-xs text-slate-400">
                Based on citizen experiences
              </div>

              <div className="mt-5 flex items-center justify-center gap-2 text-[11px] text-emerald-400">
                <TrendingUp className="h-3.5 w-3.5" />
                <span>Strong citizen satisfaction</span>
              </div>
            </div>

            {/* Rating bars */}
            <div className="md:col-span-5">

              <div className="space-y-3">
                {ratingBreakdown.map((item, index) => (
                  <div
                    key={item.stars}
                    className="flex items-center gap-3"
                  >
                    <div className="flex w-10 items-center gap-1 text-[11px] text-slate-400">
                      <span>{item.stars}</span>
                      <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                    </div>

                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-white/[0.05]">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{
                          width: `${item.percentage}%`,
                        }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 1,
                          delay: index * 0.08,
                          ease: [0.22, 1, 0.36, 1],
                        }}
                        className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500"
                      />
                    </div>

                    <span className="w-8 text-right text-[10px] text-slate-500">
                      {item.percentage}%
                    </span>
                  </div>
                ))}
              </div>

            </div>

            {/* Verified community */}
            <div className="md:col-span-3 md:border-l md:border-white/[0.07] md:pl-8">

              <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-5">

                <div className="flex -space-x-3">
                  {reviews.slice(0, 5).map((review) => (
                    <div
                      key={review.name}
                      className={`flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#07101d] bg-gradient-to-br ${review.color} text-[10px] font-bold text-white shadow-lg`}
                    >
                      {review.avatar}
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex items-center gap-2">
                  <BadgeCheck className="h-4 w-4 text-cyan-400" />
                  <span className="text-xs font-medium text-white">
                    Citizen verified
                  </span>
                </div>

                <p className="mt-2 text-[11px] leading-5 text-slate-500">
                  Voices from communities across Delhi.
                </p>

              </div>

            </div>

          </div>
        </motion.div>

        {/* Review cards */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

          {reviews.map((review, index) => (
            <motion.article
              key={review.name}
              initial={{
                opacity: 0,
                y: 35,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
                amount: 0.15,
              }}
              transition={{
                duration: 0.7,
                delay: index * 0.08,
              }}
              whileHover={{
                y: -7,
              }}
              className="group relative overflow-hidden rounded-[26px] border border-white/[0.08] bg-[#07101d]/75 p-6 backdrop-blur-xl transition-all duration-500 hover:border-cyan-400/20 hover:bg-[#091524]/90 hover:shadow-[0_25px_70px_rgba(14,165,233,0.10)]"
            >

              {/* hover glow */}
              <div className="pointer-events-none absolute -right-20 -top-20 h-40 w-40 rounded-full bg-cyan-400/[0.08] blur-[50px] opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Quote */}
              <div className="absolute right-5 top-5 text-cyan-400/[0.10] transition-colors duration-500 group-hover:text-cyan-400/[0.18]">
                <Quote className="h-12 w-12" />
              </div>

              {/* User */}
              <div className="relative flex items-center gap-3">

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${review.color} text-xs font-bold text-white shadow-lg`}
                >
                  {review.avatar}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="truncate text-sm font-semibold text-white">
                      {review.name}
                    </h3>

                    {review.verified && (
                      <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-cyan-400" />
                    )}
                  </div>

                  <div className="mt-0.5 flex items-center gap-1 text-[10px] text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {review.location}
                  </div>
                </div>

              </div>

              {/* Rating */}
              <div className="relative mt-5 flex items-center justify-between">
                <Stars rating={review.rating} size={14} />

                <span className="text-[10px] font-medium text-slate-600">
                  Verified experience
                </span>
              </div>

              {/* Review */}
              <p className="relative mt-5 text-sm leading-6 text-slate-300">
                “{review.review}”
              </p>

              {/* Bottom */}
              <div className="relative mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">

                <div className="flex items-center gap-2 text-[10px] text-slate-500">
                  <ThumbsUp className="h-3.5 w-3.5" />
                  Helpful
                </div>

                <div className="text-[10px] text-slate-600">
                  Delhi citizen
                </div>

              </div>

            </motion.article>
          ))}

        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="mt-10 text-center"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/[0.08] bg-white/[0.025] px-5 py-3 text-xs text-slate-400 backdrop-blur-xl">
            <BadgeCheck className="h-4 w-4 text-cyan-400" />
            <span>Your voice helps build a better Delhi</span>
          </div>
        </motion.div>

      </div>
    </section>
  );
}