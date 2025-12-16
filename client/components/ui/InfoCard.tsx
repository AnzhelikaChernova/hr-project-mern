'use client';

import Link from 'next/link';
import React from 'react';
import { ArrowRight } from 'lucide-react';

interface Feature {
  text: string;
  icon?: JSX.Element;
}

interface InfoCardProps {
  title: string;
  text: string;
  features: Feature[];
  actionText: string;
  href: string;
  accent?: string;
}

export default function InfoCard({ title, text, features, actionText, href, accent }: InfoCardProps) {
  return (
    <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-md transition hover:shadow-lg">
      {/* Заголовок по центру */}
      <div className="flex flex-col items-center mb-6 text-center">
        <h3 className="text-2xl font-semibold text-slate-900">{title}</h3>
      </div>

      <p className="text-slate-600 mb-6 text-center">{text}</p>

      <ul className="space-y-3 text-slate-600 mb-8 ml-3">
        {features.map((f: Feature) => (
          <li key={f.text} className="flex items-center gap-2">
            {f.icon &&
              React.cloneElement(f.icon, {
                className: 'w-5 h-5',
                stroke: 'url(#icon-gradient)',
                strokeWidth: 2,
              })}
            <span>{f.text}</span>
          </li>
        ))}
      </ul>

      {/* Кнопка Sign in / на всю ширину */}
      <Link
        href={href}
        className="relative w-full px-5 py-2 rounded-xl text-sm font-medium text-blue-600 border border-blue-600
                  overflow-hidden flex items-center justify-center
                  transform hover:scale-105 hover:bg-blue-100 transition duration-500"
      >
        <span className="relative z-10 inline-flex items-center gap-2">
          {actionText}
          <ArrowRight size={16} />
        </span>
      </Link>

      {/* Градиент для иконок списка */}
      <svg style={{ height: 0 }}>
        <defs>
          <linearGradient id="icon-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#8B5CF6" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}
