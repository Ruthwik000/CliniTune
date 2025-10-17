import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <div className="min-h-screen relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/4101143/pexels-photo-4101143.jpeg)'
          }}
        >
          {/* Dark overlay for better text readability */}
          <div className="absolute inset-0 bg-black/50"></div>
        </div>

        {/* Header */}
        <header className="relative z-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
            <div className="flex justify-between items-center py-4 sm:py-6 lg:py-8">
              <Link href="/" className="text-xl sm:text-2xl lg:text-3xl font-light text-white tracking-wide">
                CliniTune
              </Link>
              <nav className="hidden md:flex items-center space-x-6 lg:space-x-8 xl:space-x-10">
                <Link href="#features" className="text-white/80 hover:text-white text-sm lg:text-base font-light transition-colors hover:underline underline-offset-4">
                  Features
                </Link>
                <Link href="#about" className="text-white/80 hover:text-white text-sm lg:text-base font-light transition-colors hover:underline underline-offset-4">
                  About
                </Link>
                <Link href="/auth/login" className="text-white/80 hover:text-white text-sm lg:text-base font-light transition-colors hover:underline underline-offset-4">
                  Sign In
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-white/10 border border-white/20 text-white hover:bg-white hover:text-gray-900 backdrop-blur-sm px-4 lg:px-6 py-2 lg:py-3 text-sm lg:text-base font-light rounded-full transition-all duration-300">
                    Get Started
                  </Button>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Content */}
        <main className="relative z-10 flex items-center min-h-screen py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
            <div className="max-w-4xl mx-auto text-center lg:text-left lg:mx-0 xl:max-w-5xl">
              {/* Badge */}
              <div className="inline-block mb-4 sm:mb-6 lg:mb-8">
                <span className="text-xs sm:text-sm lg:text-base font-light text-white/70 uppercase tracking-wider px-3 py-1 lg:px-4 lg:py-2 bg-white/10 rounded-full backdrop-blur-sm">
                  AI-Powered Healthcare Platform
                </span>
              </div>
              
              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-6xl font-light text-white mb-6 sm:mb-8 leading-tight">
                Transforming Mental Health Care with AI-Driven Solutions
              </h1>
              
              {/* Description */}
              <p className="text-base sm:text-lg lg:text-xl text-white/80 mb-8 sm:mb-10 font-light leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Streamline your therapy practice with intelligent patient engagement, automated workflows, and comprehensive analytics designed for modern healthcare professionals.
              </p>
              
              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 max-w-md mx-auto lg:mx-0">
                <Link href="/auth/login" className="flex-1">
                  <Button className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                    Sign In
                  </Button>
                </Link>
                <Link href="/auth/signup" className="flex-1">
                  <Button variant="outline" className="w-full bg-white/10 border border-white/20 text-white hover:bg-white/20 backdrop-blur-sm px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Menu Button */}
        <div className="md:hidden fixed top-4 right-4 z-20">
          <Link href="/auth/signup">
            <Button size="sm" className="bg-white/10 border border-white/20 text-white hover:bg-white hover:text-gray-900 backdrop-blur-sm px-4 py-2 text-sm font-light rounded-full transition-all duration-300">
              Get Started
            </Button>
          </Link>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-16 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-4 sm:mb-6">
              Platform Features
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto font-light leading-relaxed px-4">
              Comprehensive AI-powered tools designed to revolutionize mental health practice management 
              and enhance patient engagement through intelligent automation
            </p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-10 lg:gap-12">
            {/* Feature 1 */}
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-100 transition-colors">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">AI Wellness Chat</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Intelligent conversational AI that provides 24/7 patient support, mental health check-ins, 
                and personalized therapeutic guidance between sessions
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-green-100 transition-colors">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Smart Appointment System</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Automated scheduling with intelligent conflict detection, patient reminders, 
                and seamless integration with your existing calendar systems
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-purple-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-100 transition-colors">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Practice Analytics</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Comprehensive dashboard with patient progress tracking, treatment effectiveness metrics, 
                and practice performance insights to optimize care delivery
              </p>
            </div>

            {/* Feature 4 */}
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-red-100 transition-colors">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.031 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">HIPAA Compliance</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Enterprise-grade security with full HIPAA compliance, end-to-end encryption, 
                and comprehensive audit trails to protect sensitive patient information
              </p>
            </div>

            {/* Feature 5 */}
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-orange-100 transition-colors">
                <svg className="w-8 h-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Therapeutic Task Management</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Assign, track, and monitor therapeutic activities and homework assignments 
                with automated progress updates and patient engagement metrics
              </p>
            </div>

            {/* Feature 6 */}
            <div className="text-center group hover:scale-105 transition-transform duration-300">
              <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:bg-teal-100 transition-colors">
                <svg className="w-8 h-8 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-4">Patient Care Coordination</h3>
              <p className="text-gray-600 font-light leading-relaxed">
                Centralized patient management system with comprehensive treatment history, 
                progress notes, and seamless clinician-patient communication tools
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 sm:py-20 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="text-center lg:text-left">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-light text-gray-900 mb-6 sm:mb-8">
                About CliniTune
              </h2>
              <p className="text-lg sm:text-xl text-gray-600 mb-6 sm:mb-8 font-light leading-relaxed">
                CliniTune is an AI-powered platform specifically designed for mental health professionals 
                to streamline practice management and enhance patient engagement through intelligent automation.
              </p>
              <p className="text-base sm:text-lg text-gray-600 mb-8 sm:mb-10 font-light leading-relaxed">
                Our comprehensive solution includes AI-driven patient communication, smart scheduling, 
                therapeutic task management, and detailed analytics - all while maintaining the highest 
                standards of security and HIPAA compliance for mental healthcare practices.
              </p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-gray-100 mt-12 lg:mt-0">
              <h3 className="text-xl sm:text-2xl font-medium text-gray-900 mb-4 sm:mb-6 text-center lg:text-left">Transform Your Practice Today</h3>
              <p className="text-gray-600 mb-6 sm:mb-8 font-light leading-relaxed text-center lg:text-left">
                Join mental health professionals who are already using CliniTune to provide better patient care 
                while reducing administrative overhead.
              </p>
              <div className="space-y-3 sm:space-y-4">
                <Link href="/auth/signup" className="block">
                  <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 sm:py-4 text-sm sm:text-base font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href="/auth/login" className="block">
                  <Button variant="outline" className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 py-3 sm:py-4 text-sm sm:text-base font-medium rounded-full transition-all duration-300">
                    Sign In to Dashboard
                  </Button>
                </Link>
              </div>
              <div className="mt-4 sm:mt-6 text-center text-xs sm:text-sm text-gray-500 font-light">
                No credit card required • Full HIPAA compliance • 30-day free trial
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}