'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  FileText,
  PlusCircle,
  Bell,
  MapPin,
  User,
  ChevronRight,
} from 'lucide-react';

const navigation = [
  {
    name: 'Overview',
    href: '/dashboard/citizen',
    icon: LayoutDashboard,
  },
  {
    name: 'My Complaints',
    href: '/dashboard/citizen/complaints',
    icon: FileText,
  },
  {
    name: 'Submit Complaint',
    href: '/dashboard/citizen/complaints/new',
    icon: PlusCircle,
  },
  {
    name: 'Notifications',
    href: '/dashboard/citizen/notifications',
    icon: Bell,
  },
  {
    name: 'Heatmap',
    href: '/dashboard/citizen/heatmap',
    icon: MapPin,
  },
  {
    name: 'Profile',
    href: '/dashboard/citizen/profile',
    icon: User,
  },
];

export default function CitizenSidebar() {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === '/dashboard/citizen') {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <aside className="w-full lg:w-64 shrink-0">
      <div className="sticky top-24">
        <div className="bg-gray-950/80 backdrop-blur-xl border border-blue-500/20 rounded-3xl p-4 shadow-xl">
          {/* Sidebar Header */}
          <div className="px-3 pb-4 mb-2 border-b border-white/5">
            <p className="text-[10px] uppercase font-bold tracking-[0.18em] text-gray-500">
              Citizen Portal
            </p>

            <h2 className="mt-1 text-sm font-bold text-white">
              Smart<span className="text-cyan-400">DELHI</span>
            </h2>
          </div>

          {/* Navigation */}
          <nav
            aria-label="Citizen navigation"
            className="space-y-1"
          >
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`
                    group flex items-center justify-between
                    px-3.5 py-3 rounded-xl
                    text-sm font-medium
                    transition-all duration-200
                    ${
                      active
                        ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 border border-cyan-400/40 text-cyan-300 shadow-lg shadow-cyan-500/5'
                        : 'border border-transparent text-gray-400 hover:text-white hover:bg-white/5 hover:border-white/10'
                    }
                  `}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className={`
                        w-4 h-4 shrink-0
                        ${
                          active
                            ? 'text-cyan-400'
                            : 'text-gray-500 group-hover:text-cyan-400'
                        }
                      `}
                    />

                    <span>{item.name}</span>
                  </span>

                  <ChevronRight
                    className={`
                      w-3.5 h-3.5 transition-transform
                      ${
                        active
                          ? 'text-cyan-400 translate-x-0'
                          : 'text-gray-600 -translate-x-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-0'
                      }
                    `}
                  />
                </Link>
              );
            })}
          </nav>

          {/* Civic Help Card */}
          <div className="mt-5 p-4 rounded-2xl bg-gradient-to-br from-blue-950/60 to-cyan-950/30 border border-blue-500/20">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-lg shadow-emerald-400/50" />

              <span className="text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                Civic Services Online
              </span>
            </div>

            <p className="text-[11px] leading-relaxed text-gray-400">
              Report civic issues and track their resolution directly from
              your citizen portal.
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}