'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900">
      <nav className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="text-2xl font-bold text-white">HR Platform</div>
          <div className="space-x-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="btn-primary"
              >
                Dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-white hover:text-primary-200 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn bg-white text-primary-700 hover:bg-primary-50"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className="container mx-auto px-6 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Modern Recruitment
            <br />
            <span className="text-primary-300">Made Simple</span>
          </h1>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto">
            Streamline your hiring process with our comprehensive HR platform.
            Post vacancies, manage applications, and schedule interviews all in one place.
          </p>
          <div className="space-x-4">
            <Link
              href="/register"
              className="btn bg-white text-primary-700 hover:bg-primary-50 text-lg px-8 py-3"
            >
              Start Hiring
            </Link>
            <Link
              href="/vacancies"
              className="btn border-2 border-white text-white hover:bg-white/10 text-lg px-8 py-3"
            >
              Browse Jobs
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <FeatureCard
            icon="📋"
            title="Post Vacancies"
            description="Create detailed job postings with requirements, salary ranges, and company information."
          />
          <FeatureCard
            icon="👥"
            title="Manage Applications"
            description="Review applications, track candidate status, and manage the hiring pipeline efficiently."
          />
          <FeatureCard
            icon="📅"
            title="Schedule Interviews"
            description="Coordinate interviews, collect feedback, and make informed hiring decisions."
          />
        </div>

        <div className="mt-20 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            Real-time Updates
          </h2>
          <p className="text-primary-100 max-w-xl mx-auto">
            Get instant notifications when candidates apply or when your application status changes.
            Stay connected with the hiring process in real-time.
          </p>
        </div>
      </main>

      <footer className="container mx-auto px-6 py-8 border-t border-primary-700/50">
        <div className="text-center text-primary-300 text-sm">
          HR Recruitment Platform - University Project
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-white mb-2">{title}</h3>
      <p className="text-primary-100">{description}</p>
    </div>
  );
}
