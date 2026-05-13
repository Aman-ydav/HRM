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
    <div className="min-h-screen bg-white text-slate-900">
      <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white backdrop-blur-xl shadow-sm">
        <div className="w-full px-4 sm:px-6 lg:px-10 h-16 flex items-center justify-between">
          <div className="text-3xl font-bold tracking-tight text-orange-600">HRM</div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/login')} className="text-slate-600 hover:text-slate-900">
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
          <h1 className="text-4xl md:text-6xl font-bold leading-tight text-slate-900">
            Employee Reward and Performance Platform
          </h1>
          <p className="text-lg md:text-xl text-slate-600">
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

      <section id="features" className="w-full px-4 sm:px-6 lg:px-10 py-12 lg:py-16 border-t border-slate-200 bg-slate-50">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">Features</h2>
          <p className="text-slate-600 mt-3">Everything needed to run modern HR reward workflows.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {features.map((feature, idx) => {
            const Icon = feature.icon

            return (
              <div key={idx} className="group p-6 rounded-2xl border border-slate-200 bg-white hover:shadow-md transition-all">
                <div className={`inline-block p-3 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-105 transition-transform`}>
                  <Icon size={22} className="text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-slate-900">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-10 py-12 lg:py-16 border-t border-slate-200">
        <div className="mb-10 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900">How It Works</h2>
          <p className="text-slate-600 mt-3">Simple flow for both employees and admin team.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {flow.map((step, idx) => {
            const Icon = step.icon

            return (
              <div key={idx} className="p-6 rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="w-11 h-11 rounded-xl bg-orange-100 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-orange-600" />
                </div>
                <p className="text-xs tracking-[0.2em] text-orange-600 mb-2">STEP {idx + 1}</p>
                <h3 className="text-lg font-semibold mb-2 text-slate-900">{step.title}</h3>
                <p className="text-slate-600">{step.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      <section className="w-full px-4 sm:px-6 lg:px-10 py-12 lg:py-16 border-t border-slate-200">
        <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-orange-50 via-white to-sky-50 p-8 md:p-10 text-center">
          <h2 className="text-3xl font-bold mb-3 text-slate-900">Built by 5 Developers</h2>
          <p className="text-slate-600 text-lg mb-6">
            This app is built by Aman, Cancy, Harshit, Manveer, and Kamlesh.
          </p>
          <p className="text-slate-600 max-w-3xl mx-auto">
            We designed this system to support role-based operations, cleaner HR workflows, and reliable analytics.
          </p>
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-50 mt-10">
        <div className="w-full px-4 sm:px-6 lg:px-10 py-8 text-center">
          <p className="text-slate-600">Copyright 2026 HRM Employee Reward System</p>
          <p className="text-slate-500 text-sm mt-1">Built by Aman, Cancy, Harshit, Manveer, and Kamlesh</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
