import React, { useState, useEffect } from "react";
import { Search, FileText, Shield, Clock, TrendingUp, Check, Menu, X, ChevronRight, Star, Zap, Lock } from "lucide-react";

export default function FileWiseLanding() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
      setMobileMenuOpen(false);
    }
  };

  return (
  <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
    {/* Navigation */}
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
    scrolled ? 'bg-white/90 backdrop-blur-lg shadow-lg' : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => scrollToSection('home')}>
            <div className="relative group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl flex items-center justify-center transform transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg">
                <svg viewBox="0 0 24 24" className="w-8 h-8 text-white" fill="currentColor">
                  <path d="M12 2C10 2 8 3 8 5v2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-2V5c0-2-2-3-4-3zm0 2c1 0 2 .5 2 1v2h-4V5c0-.5 1-1 2-1z"/>
                  <circle cx="10" cy="12" r="1.5"/>
                  <circle cx="14" cy="12" r="1.5"/>
                  <path d="M12 16c-1.5 0-2.5-.5-3-1h6c-.5.5-1.5 1-3 1z"/>
                </svg>
              </div>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-900 to-blue-700 bg-clip-text text-transparent">
                FileWise
              </span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button
            onClick={() => scrollToSection('home')}
            className={`font-medium transition-colors ${
            activeSection === 'home' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'
            }`}
            >
              Home
            </button>
            <button
            onClick={() => scrollToSection('features')}
            className={`font-medium transition-colors ${
            activeSection === 'features' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'
            }`}
            >
              Features
            </button>
            <button
            onClick={() => scrollToSection('about')}
            className={`font-medium transition-colors ${
            activeSection === 'about' ? 'text-blue-700' : 'text-gray-700 hover:text-blue-700'
            }`}
            >
              About
            </button>
            <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl">
              Sign In
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button
          className="md:hidden p-2 rounded-lg hover:bg-gray-100"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
        <div className="md:hidden mt-4 pb-4 space-y-3 border-t border-gray-200 pt-4">
          <button
          onClick={() => scrollToSection('home')}
          className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 font-medium"
          >
            Home
          </button>
          <button
          onClick={() => scrollToSection('features')}
          className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 font-medium"
          >
            Features
          </button>
          <button
          onClick={() => scrollToSection('about')}
          className="block w-full text-left px-4 py-2 rounded-lg hover:bg-gray-100 font-medium"
          >
            About
          </button>
          <button className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl">
            Sign Up
          </button>
        </div>
        )}
      </div>
    </nav>

    {/* Hero Section */}
    <section id="home" className="pt-32 pb-20 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-8 animate-fade-in">
            <div className="inline-block">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  📱 Smart Receipt Management
                </span>
            </div>

            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
              Never Lose a
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Receipt Again
                </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed">
              FileWise helps you organize, store, and manage all your receipts, warranties, and important documents in one secure place. Say goodbye to clutter and hello to financial clarity.
            </p>

            <div className="space-y-4">
              <p className="text-lg text-gray-700 leading-relaxed">
                Track your expenses effortlessly with our intelligent categorization system. Get instant access to any receipt when you need it for returns, warranties, or tax purposes. Our smart organization keeps everything at your fingertips.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Built with security in mind, FileWise encrypts all your sensitive documents and provides automatic backup. Whether you're managing personal finances or business expenses, we've got you covered.
              </p>
              <p className="text-lg text-gray-700 leading-relaxed">
                Join thousands of users who have simplified their financial document management. Start organizing smarter today with FileWise's powerful features and intuitive interface.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all transform hover:scale-105 shadow-xl hover:shadow-2xl flex items-center justify-center gap-2">
                Start Free Trial
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button className="px-8 py-4 bg-white text-gray-900 font-bold rounded-xl hover:bg-gray-50 transition-all border-2 border-gray-200 hover:border-blue-300 shadow-lg">
                Watch Demo
              </button>
            </div>

            <div className="flex items-center gap-8 pt-4">
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 border-2 border-white"></div>
                  ))}
                </div>
                <span className="text-sm text-gray-600 font-medium">10k+ happy users</span>
              </div>
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                ))}
                <span className="ml-2 text-sm text-gray-600 font-medium">4.9/5 rating</span>
              </div>
            </div>
          </div>

          {/* Right Content - Visual */}
          <div className="relative">
            <div className="relative z-10 bg-white rounded-2xl shadow-2xl p-8 transform hover:scale-105 transition-transform duration-300">
              <div className="aspect-square bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-10 left-10 w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
                  <div className="absolute bottom-10 right-10 w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse delay-150"></div>
                </div>

                {/* Main visual */}
                <svg viewBox="0 0 200 200" className="w-full h-full">
                  {/* Receipt icon */}
                  <rect x="60" y="40" width="80" height="120" rx="8" fill="white" stroke="#1e40af" strokeWidth="3"/>
                  <line x1="70" y1="60" x2="130" y2="60" stroke="#3b82f6" strokeWidth="2"/>
                  <line x1="70" y1="75" x2="110" y2="75" stroke="#60a5fa" strokeWidth="2"/>
                  <line x1="70" y1="90" x2="125" y2="90" stroke="#60a5fa" strokeWidth="2"/>
                  <line x1="70" y1="105" x2="105" y2="105" stroke="#60a5fa" strokeWidth="2"/>
                  <rect x="70" y="125" width="60" height="20" rx="4" fill="#3b82f6"/>

                  {/* Checkmark */}
                  <circle cx="150" cy="50" r="20" fill="#10b981" className="animate-bounce"/>
                  <path d="M 142 50 L 148 56 L 158 44" stroke="white" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Floating cards */}
            <div className="absolute -top-6 -right-6 bg-white rounded-xl shadow-xl p-4 animate-float">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Check className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Saved</div>
                  <div className="font-bold text-gray-900">2,847</div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 animate-float-delayed">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <div className="text-xs text-gray-500">Auto-Sorted</div>
                  <div className="font-bold text-gray-900">100%</div>
                </div>
              </div>
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
            <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Effortless Organization
              </span>
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Everything you need to manage your receipts and documents efficiently
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <div className="group p-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Search className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Fast Search</h3>
            <p className="text-gray-600 leading-relaxed">
              Find any receipt instantly with our powerful AI-powered search. Search by store name, date, amount, or category in seconds.
            </p>
          </div>

          {/* Feature 2 */}
          <div className="group p-8 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-green-600 to-green-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <FileText className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Auto-Categorize</h3>
            <p className="text-gray-600 leading-relaxed">
              Receipts are automatically sorted into categories like groceries, electronics, dining, and more. Stay organized without lifting a finger.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="group p-8 bg-gradient-to-br from-purple-50 to-violet-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Shield className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Secure Storage</h3>
            <p className="text-gray-600 leading-relaxed">
              Your documents are encrypted and stored securely in the cloud. Access them anywhere, anytime with complete peace of mind.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="group p-8 bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-orange-600 to-orange-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Warranty Tracking</h3>
            <p className="text-gray-600 leading-relaxed">
              Never miss a warranty expiration date. Get automatic reminders before your warranties expire so you can make claims in time.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="group p-8 bg-gradient-to-br from-pink-50 to-rose-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-pink-600 to-pink-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Expense Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              Visualize your spending patterns with detailed charts and reports. Make smarter financial decisions with data-driven insights.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="group p-8 bg-gradient-to-br from-cyan-50 to-blue-50 rounded-2xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
            <div className="w-14 h-14 bg-gradient-to-br from-cyan-600 to-cyan-700 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-lg">
              <Lock className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Coupon Keeper</h3>
            <p className="text-gray-600 leading-relaxed">
              Export your receipts and expenses in tax-ready format. Simplify tax season with organized, categorized financial records.
            </p>
          </div>
        </div>
      </div>
    </section>

    {/* About Section */}
    <section id="about" className="py-20 px-6 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6">
            <div className="inline-block">
                <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  About FileWise
                </span>
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
              Built for Modern
              <span className="block bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                  Financial Management
                </span>
            </h2>

            <div className="space-y-4 text-lg text-gray-600 leading-relaxed">
              <p>
                FileWise was born from a simple idea: managing receipts and financial documents shouldn't be complicated. We've built a platform that combines powerful organization tools with an intuitive interface that anyone can use.
              </p>
              <p>
                Our team of developers and financial experts worked together to create a solution that addresses real-world problems. From small business owners to busy families, FileWise adapts to your needs.
              </p>
              <p>
                With cutting-edge AI technology, military-grade encryption, and a user-first design philosophy, we're changing how people interact with their financial documents. Join our growing community and experience the difference.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6 pt-6">
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">10K+</div>
                <div className="text-sm text-gray-600">Active Users</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">1M+</div>
                <div className="text-sm text-gray-600">Receipts Stored</div>
              </div>
              <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                <div className="text-3xl font-bold text-blue-600 mb-1">99.9%</div>
                <div className="text-sm text-gray-600">Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Content - Image/Visual */}
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl p-8 shadow-2xl">
              <div className="bg-white rounded-xl p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                    <svg viewBox="0 0 24 24" className="w-10 h-10 text-white" fill="currentColor">
                      <path d="M12 2C10 2 8 3 8 5v2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-2V5c0-2-2-3-4-3zm0 2c1 0 2 .5 2 1v2h-4V5c0-.5 1-1 2-1z"/>
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
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Make receipt management effortless for everyone</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Provide enterprise-grade security to all users</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <p className="text-gray-700">Continuously innovate with user feedback</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
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
    <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-indigo-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6">
          Ready to Get Organized?
        </h2>
        <p className="text-xl text-blue-100 mb-8">
          Start your free trial today. No credit card required.
        </p>
        <button className="px-10 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-gray-50 transition-all transform hover:scale-105 shadow-2xl text-lg">
          Start Free Trial
        </button>
        <p className="text-blue-100 mt-4">14-day free trial • Cancel anytime • No credit card needed</p>
      </div>
    </section>

    {/* Footer */}
    <footer className="bg-gray-900 text-gray-300 py-12 px-6">
      <div className="max-w-7xl mx-auto text-center">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
            <svg viewBox="0 0 24 24" className="w-6 h-6 text-white" fill="currentColor">
              <path d="M12 2C10 2 8 3 8 5v2H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V9c0-1.1-.9-2-2-2h-2V5c0-2-2-3-4-3zm0 2c1 0 2 .5 2 1v2h-4V5c0-.5 1-1 2-1z"/>
              <circle cx="10" cy="12" r="1.5"/>
              <circle cx="14" cy="12" r="1.5"/>
              <path d="M12 16c-1.5 0-2.5-.5-3-1h6c-.5.5-1.5 1-3 1z"/>
            </svg>
          </div>
          <span className="text-2xl font-bold text-white">FileWise</span>
        </div>
        <p className="text-gray-400 mb-2">© 2025 FileWise. All rights reserved.</p>
        <p className="text-sm text-gray-500">Making financial organization simple and secure.</p>
      </div>
    </footer>

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