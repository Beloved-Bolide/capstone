import React, { useState, useEffect } from 'react'
import {
  Search,
  FileText,
  Shield,
  Clock,
  TrendingUp,
  Check,
  Menu,
  X,
  ChevronRight,
  Zap,
  Lock
} from 'lucide-react'
import { Link } from 'react-router'


export default function FileWiseLanding () {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [activeSection, setActiveSection] = useState('home')

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
      setActiveSection(id)
      setMobileMenuOpen(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-cyan-50 to-indigo-50">

      {/* Hero Section */}
      <section id="home" className="pt-8 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8 animate-fade-in">
              <div className="inline-block">
                <span className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">
                  📱 Smart Receipt Management
                </span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Never Lose a
                <span className="block bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                  Receipt Again
                </span>
              </h1>

              <p className="text-xl text-gray-600 leading-relaxed">
                FileWise helps you organize, store, and manage all your receipts, warranties, and important documents in
                one secure place. Say goodbye to clutter and hello to financial clarity.
              </p>

              <div className="space-y-4">
                <p className="text-lg text-gray-700 leading-relaxed">
                  Track your expenses effortlessly with our intelligent categorization system. Get instant access to any
                  receipt when you need it for returns, warranties, or tax purposes. Our smart organization keeps
                  everything at your fingertips.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Built with security in mind, FileWise encrypts all your sensitive documents and provides automatic
                  backup. Whether you're managing personal finances or business expenses, we've got you covered.
                </p>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Join thousands of users who have simplified their financial document management. Start organizing
                  smarter today with FileWise's powerful features and intuitive interface.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/sign-up"
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-600 to-cyan-700 text-white font-bold rounded-lg hover:from-cyan-700 hover:to-cyan-800 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
                  Start Free Trial
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform"/>
                </Link>

              </div>


            </div>

            {/* Right Content - Landing Page Image */}
            <div className="relative h-108">
              <div className="relative z-10 bg-white rounded-sm shadow-2xl overflow-hidden transform hover:scale-105 transition-transform duration-300 h-full w-full">
                <img
                  src="/db.png"
                  alt="FileWise Dashboard Preview"
                  className="w-full h-full object-cover object-left"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Powerful Features for
              <span className="block bg-gradient-to-r from-cyan-600 to-cyan-700 bg-clip-text text-transparent">
                Effortless Organization
              </span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Everything you need to manage your receipts and documents efficiently
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div
              className="group p-8 bg-gradient-to-br from-cyan-50 to-indigo-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div
                className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Search className="w-7 h-7 text-white"/>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Fast Search</h3>
              <p className="text-gray-600 leading-relaxed">
                Find any receipt instantly with our powerful search. Search by store name, date, amount, or
                category in seconds.
              </p>
            </div>

            {/* Feature 2 */}
            <div
              className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div
                className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <FileText className="w-7 h-7 text-white"/>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Auto-Categorize</h3>
              <p className="text-gray-600 leading-relaxed">
                Receipts are automatically sorted into categories like groceries, electronics, dining, and more. Stay
                organized without lifting a finger.
              </p>
            </div>

            {/* Feature 3 */}
            <div
              className="group p-8 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div
                className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Shield className="w-7 h-7 text-white"/>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure Storage</h3>
              <p className="text-gray-600 leading-relaxed">
                Your documents are encrypted and stored securely in the cloud. Access them anywhere, anytime with
                complete peace of mind.
              </p>
            </div>

            {/* Feature 4 */}
            <div
              className="group p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div
                className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-700 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Clock className="w-7 h-7 text-white"/>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Warranty Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Never miss a warranty expiration date. Get automatic reminders before your warranties expire so you can
                make claims in time.
              </p>
            </div>

            {/* Feature 5 */}
            <div
              className="group p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div
                className="w-14 h-14 bg-gradient-to-br from-pink-600 to-pink-700 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <TrendingUp className="w-7 h-7 text-white"/>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Expense Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Visualize your spending patterns with detailed charts and reports. Make smarter financial decisions with
                data-driven insights.
              </p>
            </div>

            {/* Feature 6 */}
            <div
              className="group p-8 bg-gradient-to-br from-cyan-50 to-cyan-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
              <div
                className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
                <Lock className="w-7 h-7 text-white"/>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">Coupon Keeper</h3>
              <p className="text-gray-600 leading-relaxed">
                Organize digital or scanned coupons with expiry notifications, so users never miss a saving opportunity.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-20 px-6 bg-gradient-to-br from-slate-50 to-cyan-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-6">
              <div className="inline-block">
                <span className="px-4 py-2 bg-cyan-100 text-cyan-700 rounded-full text-sm font-semibold">
                  About FileWise
                </span>
              </div>

              <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
                Built for Modern
                <span className="block bg-gradient-to-r from-cyan-600 to-cyan-800 bg-clip-text text-transparent">
                  Financial Management
                </span>
              </h2>

              <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
                <p>
                  FileWise was born from a simple idea: managing receipts and financial documents shouldn't be
                  complicated. We've built a platform that combines powerful organization tools with an intuitive
                  interface that anyone can use.
                </p>
                <p>
                  Our team of developers and financial experts worked together to create a solution that addresses
                  real-world problems. From small business owners to busy families, FileWise adapts to your needs.
                </p>
                <p>
                  With cutting-edge AI technology, military-grade encryption, and a user-first design philosophy, we're
                  changing how people interact with their financial documents. Join our growing community and experience
                  the difference.
                </p>
              </div>


            </div>

            {/* Right Content - Image/Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-2xl p-8 shadow-2xl">
                <div className="bg-white rounded-lg p-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <div
                      className="w-16 h-16 bg-gradient-to-br from-cyan-600 to-cyan-800 rounded-lg flex items-center justify-center shadow-lg">
                      <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                        <path
                          d="M12 2C10 2 8 3 8 5v2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-2V5c0-2-2-3-4-3zm0 2c1 0 2 .5 2 1v2h-4V5c0-.5 1-1 2-1z"/>
                        <circle cx="10" cy="12" r="1.5"/>
                        <circle cx="14" cy="12" r="1.5"/>
                        <path d="M12 16c-1.5 0-2.5-.5-3-1h6c-.5.5-1.5 1-3 1z"/>
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-xl text-gray-900">Our Mission</h4>
                      <p className="text-gray-600">Simplifying financial organization</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"/>
                      <p className="text-gray-700">Make receipt management effortless for everyone</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"/>
                      <p className="text-gray-700">Provide enterprise-grade security to all users</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"/>
                      <p className="text-gray-700">Continuously innovate with user feedback</p>
                    </div>
                    <div className="flex items-start gap-3">
                      <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5"/>
                      <p className="text-gray-700">Build tools that save time and reduce stress</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-cyan-600 to-cyan-800">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
            Ready to Get Organized?
          </h2>
          <p className="text-xl text-cyan-100 mb-8">
            Start your free trial today. No credit card required.
          </p>
          <button
            className="px-10 py-4 bg-white text-cyan-600 font-bold rounded-lg hover:bg-gray-50 transition-all transform hover:scale-105 shadow-2xl text-lg">
            Start Free Trial
          </button>
          <p className="text-cyan-100 mt-4">14-day free trial • Cancel anytime • No credit card needed</p>
        </div>
      </section>



      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float 3s ease-in-out infinite;
          animation-delay: 1.5s;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
      `}</style>
    </div>
  );
}