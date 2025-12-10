'use client'

import { useState } from 'react'
import { ChevronRight, CheckCircle, Star, Users, BarChart3, Shield, Zap, Globe, Smartphone, Bot, Database, ArrowRight } from 'lucide-react'

export default function LandingPage() {
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle email submission
    console.log('Email submitted:', email)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-sm border-b border-neutral-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-primary-600">FinanceAI Platform</h1>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-8">
                <a href="#features" className="text-neutral-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">Features</a>
                <a href="#pricing" className="text-neutral-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">Pricing</a>
                <a href="#testimonials" className="text-neutral-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">Testimonials</a>
                <a href="#contact" className="text-neutral-600 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">Contact</a>
                <button className="btn-primary ml-4">Get Started</button>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 bg-gradient-to-br from-primary-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-neutral-900 mb-6 text-balance">
              Transform Your Finance Operations with 
              <span className="text-primary-600 block">AI-Powered Automation</span>
            </h1>
            <p className="text-xl text-neutral-600 mb-8 max-w-3xl mx-auto text-balance">
              Streamline accounting, automate workflows, and gain real-time insights with our enterprise-grade platform featuring 30+ specialized business engines and 100% test coverage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="btn-primary text-lg px-8 py-4">
                Start Free Trial
                <ChevronRight className="ml-2 h-5 w-5" />
              </button>
              <button className="btn-secondary text-lg px-8 py-4">
                Watch Demo
              </button>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center items-center gap-8 text-sm text-neutral-500">
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-success-500" />
                <span>100% Test Coverage</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary-500" />
                <span>Enterprise Security</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-warning-500" />
                <span>30+ Business Engines</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">30+</div>
              <div className="text-neutral-600">Business Engines</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">100%</div>
              <div className="text-neutral-600">Test Coverage</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">99.9%</div>
              <div className="text-neutral-600">Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-primary-600 mb-2">500+</div>
              <div className="text-neutral-600">Happy Customers</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Everything You Need for Modern Finance Management
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              From accounting automation to advanced analytics, our platform provides all the tools you need to streamline your financial operations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Core Features */}
            <FeatureCard
              icon={<BarChart3 className="h-8 w-8 text-primary-600" />}
              title="Advanced Analytics"
              description="Real-time financial insights with AI-powered predictive analytics and custom reporting dashboards."
            />
            <FeatureCard
              icon={<Shield className="h-8 w-8 text-primary-600" />}
              title="Enterprise Security"
              description="Bank-grade security with blockchain audit trails, encrypted data, and compliance automation."
            />
            <FeatureCard
              icon={<Zap className="h-8 w-8 text-primary-600" />}
              title="Workflow Automation"
              description="Intelligent automation for invoices, payments, reconciliations, and approval processes."
            />
            <FeatureCard
              icon={<Smartphone className="h-8 w-8 text-primary-600" />}
              title="Mobile Ready"
              description="Native iOS/Android apps with offline capability and real-time synchronization."
            />
            <FeatureCard
              icon={<Bot className="h-8 w-8 text-primary-600" />}
              title="AI-Powered Insights"
              description="Smart document processing, automatic categorization, and intelligent recommendations."
            />
            <FeatureCard
              icon={<Database className="h-8 w-8 text-primary-600" />}
              title="Multi-Entity Support"
              description="Consolidate multiple entities, currencies, and jurisdictions with ease."
            />
          </div>

          {/* Business Engines Grid */}
          <div className="mt-16">
            <h3 className="text-2xl font-bold text-neutral-900 mb-8 text-center">30+ Specialized Business Engines</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {[
                'Ledger Management', 'GST Compliance', 'Audit Engine', 'Financial Reporting',
                'Billing & Invoicing', 'Customer Management', 'Vendor Management', 'Inventory Control',
                'Payroll Processing', 'Expense Management', 'Bank Reconciliation', 'Fixed Assets',
                'TDS/TCS Engine', 'AI Accountant', 'Analytics Dashboard', 'Document Intelligence',
                'Compliance Engine', 'Payment Processing', 'Budgeting & Forecasting', 'Multi-Currency',
                'Cash Flow Management', 'Contract Management', 'Cost Accounting', 'Tax Management',
                'Investment Tracking', 'Risk Management', 'Audit Trail', 'Workflow Automation',
                'Integration Hub', 'Mobile Applications', 'Real-time Collaboration', 'Blockchain Security'
              ].map((engine, index) => (
                <div key={index} className="bg-white p-4 rounded-lg shadow-sm border border-neutral-200 text-center">
                  <span className="text-sm font-medium text-neutral-700">{engine}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-center">
            <div>
              <h2 className="text-4xl font-bold text-neutral-900 mb- Choose Our6">
                Why Platform?
              </h2>
              <div className="space-y-6">
                <BenefitItem
                  title="Save 40+ Hours Per Week"
                  description="Automate repetitive tasks and focus on strategic decision-making instead of manual data entry."
                />
                <BenefitItem
                  title="Reduce Errors by 95%"
                  description="AI-powered validation and automated workflows eliminate human errors in financial processes."
                />
                <BenefitItem
                  title="Enterprise-Grade Security"
                  description="Blockchain-based audit trails, end-to-end encryption, and compliance automation built-in."
                />
                <BenefitItem
                  title="Scalable Architecture"
                  description="From startups to enterprises, our platform grows with your business needs."
                />
              </div>
            </div>
            <div className="mt-12 lg:mt-0">
              <div className="bg-gradient-to-br from-primary-500 to-blue-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-4">Ready to Transform Your Finance Operations?</h3>
                <p className="text-primary-100 mb-6">
                  Join hundreds of companies that have streamlined their financial processes with our platform.
                </p>
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-colors">
                    Start Free Trial
                  </button>
                  <button className="border border-white/30 text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-colors">
                    Schedule Demo
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Version 2.0 Preview */}
      <section className="py-20 bg-gradient-to-r from-purple-50 to-pink-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center bg-primary-100 text-primary-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Coming Q2 2024
            </div>
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Version 2.0: Next-Generation Features
            </h2>
            <p className="text-xl text-neutral-600 max-w-3xl mx-auto">
              Get ready for mobile apps, AI/ML features, blockchain integration, and real-time collaboration.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <VersionFeature
              icon={<Smartphone className="h-6 w-6" />}
              title="Mobile Apps"
              description="Native iOS/Android with offline capability"
            />
            <VersionFeature
              icon={<Bot className="h-6 w-6" />}
              title="AI/ML Features"
              description="Document intelligence and predictive analytics"
            />
            <VersionFeature
              icon={<Globe className="h-6 w-6" />}
              title="Blockchain Integration"
              description="Immutable audit trails and smart contracts"
            />
            <VersionFeature
              icon={<Users className="h-6 w-6" />}
              title="Real-time Collaboration"
              description="Live editing and video conferencing"
            />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Trusted by Industry Leaders
            </h2>
            <p className="text-xl text-neutral-600">
              See what our customers say about their experience
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <TestimonialCard
              quote="This platform transformed our accounting operations. We've reduced manual work by 60% and improved accuracy significantly."
              author="Sarah Johnson"
              role="CFO, TechCorp Inc."
              rating={5}
            />
            <TestimonialCard
              quote="The AI-powered features and real-time analytics give us insights we never had before. Highly recommended!"
              author="Michael Chen"
              role="Finance Director, GrowthCorp"
              rating={5}
            />
            <TestimonialCard
              quote="Outstanding platform with excellent support. The automated workflows have saved us countless hours every week."
              author="Emily Rodriguez"
              role="Controller, Enterprise Solutions"
              rating={5}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-neutral-600">
              Choose the plan that fits your business needs
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <PricingCard
              name="Starter"
              price="49"
              description="Perfect for small businesses"
              features={[
                "Up to 3 users",
                "10 business engines",
                "Basic reporting",
                "Email support",
                "Mobile app access"
              ]}
              popular={false}
            />
            <PricingCard
              name="Professional"
              price="149"
              description="Ideal for growing companies"
              features={[
                "Up to 10 users",
                "All 30+ business engines",
                "Advanced analytics",
                "Priority support",
                "Mobile & web apps",
                "API access"
              ]}
              popular={true}
            />
            <PricingCard
              name="Enterprise"
              price="Custom"
              description="For large organizations"
              features={[
                "Unlimited users",
                "All features included",
                "Custom integrations",
                "Dedicated support",
                "SLA guarantee",
                "On-premise deployment"
              ]}
              popular={false}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Transform Your Finance Operations?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Join hundreds of companies that have streamlined their financial processes with our platform.
          </p>
          
          <form onSubmit={handleSubmit} className="max-w-md mx-auto">
            <div className="flex flex-col sm:flex-row gap-4">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border border-primary-400 bg-white text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent"
                required
              />
              <button type="submit" className="bg-white text-primary-600 px-6 py-3 rounded-lg font-semibold hover:bg-neutral-50 transition-colors whitespace-nowrap">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5 inline" />
              </button>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-neutral-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-2xl font-bold text-primary-400 mb-4">FinanceAI Platform</h3>
              <p className="text-neutral-400 mb-4">
                Transforming finance operations with AI-powered automation and enterprise-grade security.
              </p>
              <div className="flex space-x-4">
                <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center">
                  <span className="text-sm font-bold">f</span>
                </div>
                <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center">
                  <span className="text-sm font-bold">t</span>
                </div>
                <div className="w-8 h-8 bg-neutral-800 rounded flex items-center justify-center">
                  <span className="text-sm font-bold">in</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Documentation</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#contact" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-neutral-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-neutral-800 mt-12 pt-8 text-center text-neutral-400">
            <p>&copy; 2024 FinanceAI Platform. All rights reserved. Built with ❤️ by MiniMax Agent</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Helper Components
function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="card">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-neutral-900 mb-3">{title}</h3>
      <p className="text-neutral-600">{description}</p>
    </div>
  )
}

function BenefitItem({ title, description }: { title: string, description: string }) {
  return (
    <div className="flex gap-4">
      <div className="flex-shrink-0">
        <CheckCircle className="h-6 w-6 text-success-500 mt-1" />
      </div>
      <div>
        <h4 className="font-semibold text-neutral-900 mb-1">{title}</h4>
        <p className="text-neutral-600">{description}</p>
      </div>
    </div>
  )
}

function VersionFeature({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
      <div className="text-primary-600 mb-3">{icon}</div>
      <h4 className="font-semibold text-neutral-900 mb-2">{title}</h4>
      <p className="text-sm text-neutral-600">{description}</p>
    </div>
  )
}

function TestimonialCard({ quote, author, role, rating }: { quote: string, author: string, role: string, rating: number }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-neutral-200">
      <div className="flex gap-1 mb-4">
        {[...Array(rating)].map((_, i) => (
          <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
        ))}
      </div>
      <p className="text-neutral-700 mb-4 italic">"{quote}"</p>
      <div>
        <div className="font-semibold text-neutral-900">{author}</div>
        <div className="text-sm text-neutral-600">{role}</div>
      </div>
    </div>
  )
}

function PricingCard({ name, price, description, features, popular }: { 
  name: string, 
  price: string, 
  description: string, 
  features: string[], 
  popular: boolean 
}) {
  return (
    <div className={`relative p-8 rounded-2xl border-2 ${popular ? 'border-primary-500 bg-primary-50' : 'border-neutral-200 bg-white'}`}>
      {popular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-primary-500 text-white px-4 py-1 rounded-full text-sm font-medium">Most Popular</span>
        </div>
      )}
      
      <div className="text-center mb-6">
        <h3 className="text-2xl font-bold text-neutral-900 mb-2">{name}</h3>
        <div className="mb-2">
          <span className="text-4xl font-bold text-neutral-900">${price}</span>
          {price !== 'Custom' && <span className="text-neutral-600">/month</span>}
        </div>
        <p className="text-neutral-600">{description}</p>
      </div>
      
      <ul className="space-y-3 mb-8">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-success-500 flex-shrink-0" />
            <span className="text-neutral-700">{feature}</span>
          </li>
        ))}
      </ul>
      
      <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
        popular 
          ? 'bg-primary-500 text-white hover:bg-primary-600' 
          : 'bg-neutral-100 text-neutral-900 hover:bg-neutral-200'
      }`}>
        {price === 'Custom' ? 'Contact Sales' : 'Start Free Trial'}
      </button>
    </div>
  )
}