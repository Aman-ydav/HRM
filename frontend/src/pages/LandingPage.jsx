import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { Gift, Users, TrendingUp, MessageSquare, Zap, Clock, ArrowRight, ShieldCheck, Workflow, BarChart3 } from 'lucide-react'

function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Daily check-in/check-out, monthly reports, and attendance analytics in one place.',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Gift,
      title: 'Reward Management',
      description: 'Assign, approve, and track points, bonuses, and achievements transparently.',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Performance Reviews',
      description: 'Track review history, compare ratings, and monitor growth over time.',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageSquare,
      title: 'Feedback System',
      description: 'Collect structured feedback and view analytics by category and positivity.',
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Zap,
      title: 'AI Insights',
      description: 'Get AI-driven recommendations for employee growth, fairness, and burnout risk.',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'Role-Based Dashboard',
      description: 'Separate flows for employee, HR manager, and admin with protected routes.',
      color: 'from-slate-500 to-gray-500',
    },
  ]

  const flow = [
    {
      icon: ShieldCheck,
      title: 'Secure Login',
      description: 'Users sign in with JWT-based authentication and role-level access checks.',
    },
    {
      icon: Workflow,
      title: 'Work by Role',
      description: 'Employees track personal activity while HR/Admin manage company-level actions.',
    },
    {
      icon: BarChart3,
      title: 'Insights and Reports',
      description: 'Dashboards aggregate attendance, rewards, and performance for fast decisions.',
    },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.08),_transparent_28%),#050505] text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="text-3xl font-bold tracking-tight text-orange-500">HRM</div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-gray-300 hover:text-white">
              Login
            </Button>
            <Button variant="primary" onClick={() => navigate('/register')}>
              Register
            </Button>
          </div>
        </div>
      </nav>

      <section className="w-full px-4 sm:px-6 lg:px-10 py-16 lg:py-20">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-bold leading-tight">
            Employee Reward and Performance Platform
          </h1>
          <p className="text-lg md:text-xl text-gray-300">
            Manage attendance, rewards, performance, feedback, and AI insights through one HRM system.
            Built to keep employee and admin workflows clean, secure, and role-specific.
          </p>
          <div className="flex flex-wrap gap-4 justify-center pt-2">
            <Button variant="primary" onClick={() => navigate('/login')} className="flex items-center gap-2">
              Open Dashboard <ArrowRight size={18} />
            </Button>
            <Button variant="secondary" onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              View Features
            </Button>
          </div>
        </div>
      </section>

      <section id="features" className="w-full px-4 sm:px-6 lg:px-10 py-12 lg:py-16 border-t border-white/10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">Features</h2>
          <p className="text-gray-400 mt-3">Everything needed to run modern HR reward workflows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon

            return (
              <div key={idx} className="group p-6 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all">
                <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-10 py-12 lg:py-16 border-t border-white/10">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
          <p className="text-gray-400 mt-3">Simple flow for both employees and admin team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {flow.map((step, idx) => {
            const Icon = step.icon

            return (
              <div key={idx} className="p-6 rounded-2xl border border-white/10 bg-gray-900/70">
                <div className="w-11 h-11 rounded-xl bg-orange-500/20 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-orange-400" />
                </div>
                <p className="text-xs tracking-[0.2em] text-orange-400 mb-2">STEP {idx + 1}</p>
                <h3 className="text-lg font-semibold mb-2">{step.title}</h3>
                <p className="text-gray-400">{step.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-10 py-12 lg:py-16 border-t border-white/10">
        <div className="rounded-2xl border border-white/10 bg-gradient-to-r from-orange-500/10 via-transparent to-teal-500/10 p-8 md:p-10 text-center">
          <h2 className="text-3xl font-bold mb-3">Built by 5 Developers</h2>
          <p className="text-gray-300 text-lg mb-6">
            This app is built by Aman, Cancy, Harshit, Manveer, and Kamlesh.
          </p>
          <p className="text-gray-400 max-w-3xl mx-auto">
            We designed this system to support role-based operations, cleaner HR workflows, and reliable analytics.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 bg-black/50 mt-10">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-8 text-center">
          <p className="text-gray-400">Copyright 2026 HRM Employee Reward System</p>
          <p className="text-gray-500 text-sm mt-1">Built by Aman, Cancy, Harshit, Manveer, and Kamlesh</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
