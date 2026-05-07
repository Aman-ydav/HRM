import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui'
import { Gift, Users, TrendingUp, MessageSquare, Zap, Clock, ArrowRight, Github } from 'lucide-react'

function LandingPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: Clock,
      title: 'Attendance Tracking',
      description: 'Real-time check-in/check-out with automated reporting and analytics',
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Gift,
      title: 'Reward Management',
      description: 'Give and receive rewards, track bonus history, and celebrate achievements',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: TrendingUp,
      title: 'Performance Reviews',
      description: 'Comprehensive performance analytics and peer feedback system',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: MessageSquare,
      title: 'Feedback System',
      description: '360-degree feedback collection and analysis for continuous improvement',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: Zap,
      title: 'AI Insights',
      description: 'Smart recommendations powered by Google Gemini AI',
      color: 'from-yellow-500 to-orange-500',
    },
    {
      icon: Users,
      title: 'Admin Dashboard',
      description: 'Manage employees, oversee rewards, and view system analytics',
      color: 'from-slate-500 to-gray-500',
    },
  ]

  const developers = [
    { name: 'Aman', role: 'Developer' },
    { name: 'Cancy', role: 'Developer' },
    { name: 'Harshit', role: 'Developer' },
    { name: 'Manveer', role: 'Developer' },
    { name: 'Kamlesh', role: 'Developer' },
  ]

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,_rgba(249,115,22,0.12),_transparent_32%),radial-gradient(circle_at_bottom_right,_rgba(45,212,191,0.08),_transparent_28%),#050505] text-white">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-3xl font-bold tracking-tight text-orange-500">HRM</div>
          <div className="flex gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/login')}
              className="text-gray-300 hover:text-white"
            >
              Login
            </Button>
            <Button
              variant="primary"
              onClick={() => navigate('/register')}
            >
              Register
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-6 mb-20">
          <div className="inline-block px-4 py-2 bg-orange-500/10 border border-orange-500/20 rounded-full">
            <span className="text-sm text-orange-400">Employee Reward System Platform</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold leading-tight">
            Empower Your Workforce with{' '}
            <span className="bg-gradient-to-r from-orange-500 via-red-400 to-pink-500 bg-clip-text text-transparent">
              Smart Rewards
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A comprehensive human resource management system that combines attendance tracking, performance reviews, 
            rewards management, and AI-powered insights to drive employee engagement and organizational success.
          </p>
          <div className="flex gap-4 justify-center pt-4">
            <Button
              variant="primary"
              onClick={() => navigate('/login')}
              className="flex items-center gap-2"
            >
              Get Started <ArrowRight size={18} />
            </Button>
            <Button
              variant="secondary"
              onClick={() => window.scrollTo({ top: document.getElementById('features')?.offsetTop || 0, behavior: 'smooth' })}
            >
              Explore Features
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-20 py-16 border-t border-b border-white/10">
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-500 mb-2">46+</div>
            <p className="text-gray-400">API Endpoints</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-500 mb-2">100%</div>
            <p className="text-gray-400">Secure (JWT Auth)</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-500 mb-2">3</div>
            <p className="text-gray-400">User Roles</p>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-500 mb-2">Real-time</div>
            <p className="text-gray-400">Analytics</p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Powerful Features</h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            Everything you need to manage employee rewards and performance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon
            return (
              <div
                key={idx}
                className="group p-8 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 transition-all hover:border-orange-500/30"
              >
                <div className={`inline-block p-4 rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                  <Icon size={24} className="text-white" />
                </div>
                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            )
          })}
        </div>
      </section>

      {/* Demo Credentials Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="bg-gradient-to-r from-orange-500/10 via-transparent to-purple-500/10 border border-white/10 rounded-2xl p-12">
          <h2 className="text-3xl font-bold mb-8 text-center">Try It Out</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-black/40 rounded-xl p-6 border border-white/5">
              <div className="text-orange-500 font-bold mb-3">Admin Account</div>
              <p className="text-gray-400 text-sm mb-4">Full system access and management</p>
              <div className="space-y-2 text-sm font-mono text-gray-300">
                <div>📧 <span className="text-orange-400">admin@hrm.com</span></div>
                <div>🔑 <span className="text-orange-400">admin123</span></div>
              </div>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-white/5">
              <div className="text-green-500 font-bold mb-3">HR Manager Account</div>
              <p className="text-gray-400 text-sm mb-4">Manage rewards and approvals</p>
              <div className="space-y-2 text-sm font-mono text-gray-300">
                <div>📧 <span className="text-green-400">hr@hrm.com</span></div>
                <div>🔑 <span className="text-green-400">hr123</span></div>
              </div>
            </div>
            <div className="bg-black/40 rounded-xl p-6 border border-white/5">
              <div className="text-blue-500 font-bold mb-3">Employee Account</div>
              <p className="text-gray-400 text-sm mb-4">Personal dashboard and rewards</p>
              <div className="space-y-2 text-sm font-mono text-gray-300">
                <div>📧 <span className="text-blue-400">john.doe@hrm.com</span></div>
                <div>🔑 <span className="text-blue-400">john123</span></div>
              </div>
            </div>
          </div>
          <div className="text-center mt-8">
            <Button variant="primary" onClick={() => navigate('/login')} className="flex items-center gap-2 mx-auto">
              Login to Dashboard <ArrowRight size={18} />
            </Button>
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Built with Modern Tech</h2>
          <p className="text-gray-400 text-lg">Production-ready stack with security and performance in mind</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">⚙️</span>
              Backend
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Node.js + Express.js
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                MongoDB Atlas
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                JWT Authentication
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Google Gemini AI
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Brevo Email Service
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-xl font-bold text-orange-500 mb-6 flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">🎨</span>
              Frontend
            </h3>
            <ul className="space-y-3 text-gray-400">
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                React 19.2.5 + Vite
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Tailwind CSS v3
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                React Router v6
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                shadcn/ui Components
              </li>
              <li className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-orange-500" />
                Lucide React Icons
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-4">Built by Expert Developers</h2>
          <p className="text-gray-400 text-lg">A collaborative team of 5 passionate developers</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-6 mb-12">
          {developers.map((dev, idx) => (
            <div key={idx} className="text-center group">
              <div className="w-24 h-24 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-orange-500/30 to-purple-500/30 border border-white/10 group-hover:border-orange-500/30 flex items-center justify-center transition-all group-hover:scale-110">
                <span className="text-4xl font-bold text-orange-500">{dev.name[0]}</span>
              </div>
              <h3 className="text-lg font-bold">{dev.name}</h3>
              <p className="text-gray-400 text-sm">{dev.role}</p>
            </div>
          ))}
        </div>

        <div className="bg-gradient-to-r from-orange-500/10 to-purple-500/10 border border-white/10 rounded-2xl p-8 text-center">
          <h3 className="text-2xl font-bold mb-2">Made with ❤️ by the Team</h3>
          <p className="text-gray-400 mb-6">
            This project showcases our expertise in full-stack development, cloud infrastructure, 
            AI integration, and user experience design.
          </p>
          <div className="flex justify-center gap-4">
            <Button variant="ghost" className="flex items-center gap-2">
              <Github size={18} />
              GitHub Repository
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-center">
          <p className="text-gray-400 mb-2">
            © 2026 Employee Reward System. All rights reserved.
          </p>
          <p className="text-gray-500 text-sm">
            Built by Aman, Cancy, Harshit, Manveer, and Kamlesh
          </p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage
