"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Maximize2,
  Minimize2,
  Shield,
  Activity,
  Database,
  Brain,
  Bell,
  MapPin,
  BarChart3,
  Lock,
  Zap,
  Users,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Globe,
  Server,
  Cpu,
} from "lucide-react"

const slides = [
  {
    id: 1,
    type: "title",
    title: "Real-Time Fraud Detection System",
    subtitle: "FraudGuard - Powered by Kafka, Spark & Machine Learning",
    description: "A comprehensive solution for detecting and preventing fraudulent transactions in real-time",
    icon: Shield,
  },
  {
    id: 2,
    type: "content",
    title: "Project Overview",
    icon: Activity,
    points: [
      "Real-time transaction monitoring and fraud detection system",
      "Processes thousands of transactions per second with <15ms latency",
      "ML-based risk scoring with 95%+ accuracy",
      "Multi-channel support: Online, POS, ATM, Mobile, Bank Transfer",
      "Comprehensive alerting system with SMS, Email, and OTP verification",
      "Geographic visualization of fraud hotspots",
    ],
  },
  {
    id: 3,
    type: "architecture",
    title: "System Architecture",
    icon: Server,
    components: [
      { name: "Apache Kafka v3.5", description: "Message streaming & event processing", icon: Database },
      { name: "Apache Spark v3.4", description: "Real-time data processing pipeline", icon: Zap },
      { name: "ML Model v2.3.1", description: "Fraud detection & risk scoring", icon: Brain },
      { name: "Next.js Dashboard", description: "Real-time monitoring interface", icon: BarChart3 },
    ],
  },
  {
    id: 4,
    type: "features",
    title: "Key Features",
    icon: CheckCircle,
    features: [
      { name: "Real-Time Processing", description: "Sub-15ms transaction analysis", icon: Zap },
      { name: "ML Risk Scoring", description: "6-factor fraud probability calculation", icon: Brain },
      { name: "Multi-Factor Auth", description: "OTP verification for high-risk transactions", icon: Lock },
      { name: "Card Management", description: "Instant card blocking & unblocking", icon: CreditCard },
      { name: "Geo-Location Tracking", description: "Impossible travel detection", icon: Globe },
      { name: "Alert System", description: "SMS, Email & Push notifications", icon: Bell },
    ],
  },
  {
    id: 5,
    type: "mlmodel",
    title: "ML Fraud Detection Engine",
    icon: Brain,
    factors: [
      { name: "Velocity Score", weight: "15%", description: "Transaction frequency analysis" },
      { name: "Amount Anomaly", weight: "20%", description: "Unusual transaction amounts" },
      { name: "Location Anomaly", weight: "20%", description: "Geographic risk assessment" },
      { name: "Time Anomaly", weight: "15%", description: "Off-hours transaction detection" },
      { name: "Merchant Risk", weight: "25%", description: "High-risk merchant identification" },
      { name: "Device Risk", weight: "10%", description: "Device fingerprint analysis" },
    ],
  },
  {
    id: 6,
    type: "dashboard",
    title: "Dashboard Modules",
    icon: BarChart3,
    modules: [
      { name: "Live Dashboard", description: "Real-time metrics & transaction feed" },
      { name: "Manual Check", description: "Single transaction fraud analysis" },
      { name: "CSV Upload", description: "Bulk transaction processing" },
      { name: "User Tracking", description: "User behavior monitoring" },
      { name: "Fraud Map", description: "Geographic visualization" },
      { name: "Alert Center", description: "Notification management" },
      { name: "Card Management", description: "Block/unblock cards" },
      { name: "Analytics", description: "Trend analysis & reports" },
    ],
  },
  {
    id: 7,
    type: "alerts",
    title: "Intelligent Alert System",
    icon: Bell,
    alertTypes: [
      { severity: "Critical", color: "bg-red-500", action: "Block card immediately + Alert user" },
      { severity: "High", color: "bg-orange-500", action: "Require OTP verification" },
      { severity: "Medium", color: "bg-yellow-500", action: "Flag for manual review" },
      { severity: "Low", color: "bg-green-500", action: "Log and monitor" },
    ],
    notifications: ["SMS Alerts", "Email Notifications", "Push Notifications", "In-App Alerts"],
  },
  {
    id: 8,
    type: "security",
    title: "Security Features",
    icon: Lock,
    securityItems: [
      { name: "OTP Verification", description: "6-digit code for high-risk transactions" },
      { name: "Card Blocking", description: "Instant freeze on suspicious activity" },
      { name: "Impossible Travel", description: "Detect physically impossible movements" },
      { name: "Device Fingerprinting", description: "Track and verify user devices" },
      { name: "IP Monitoring", description: "Track suspicious IP addresses" },
      { name: "KYC Integration", description: "Verify user identity status" },
    ],
  },
  {
    id: 9,
    type: "metrics",
    title: "Performance Metrics",
    icon: BarChart3,
    stats: [
      { label: "Processing Latency", value: "<15ms", description: "Average transaction analysis time" },
      { label: "Fraud Detection Rate", value: "95%+", description: "True positive identification" },
      { label: "False Positive Rate", value: "<2%", description: "Minimal customer friction" },
      { label: "Uptime", value: "99.99%", description: "High availability system" },
      { label: "Throughput", value: "10K+ TPS", description: "Transactions per second" },
      { label: "Coverage", value: "20+ Cities", description: "Indian cities monitored" },
    ],
  },
  {
    id: 10,
    type: "tech",
    title: "Technology Stack",
    icon: Cpu,
    stack: [
      { category: "Frontend", items: ["Next.js 15", "React", "TypeScript", "Tailwind CSS", "shadcn/ui"] },
      { category: "Backend", items: ["Apache Kafka", "Apache Spark", "Python", "REST APIs"] },
      { category: "ML/AI", items: ["Scikit-learn", "TensorFlow", "Custom Rules Engine"] },
      { category: "Visualization", items: ["Recharts", "Interactive Maps", "Real-time Charts"] },
    ],
  },
  {
    id: 11,
    type: "usecases",
    title: "Use Cases",
    icon: Users,
    cases: [
      { name: "Banking & Finance", description: "Credit/Debit card fraud prevention" },
      { name: "E-commerce", description: "Online payment fraud detection" },
      { name: "Digital Wallets", description: "Mobile payment security" },
      { name: "Insurance", description: "Claims fraud identification" },
      { name: "Telecom", description: "Subscription fraud prevention" },
      { name: "Government", description: "Benefits fraud detection" },
    ],
  },
  {
    id: 12,
    type: "conclusion",
    title: "Summary",
    icon: Shield,
    summary: [
      "Real-time fraud detection with sub-15ms latency",
      "ML-powered risk scoring with 6 fraud factors",
      "Comprehensive alert system with multiple channels",
      "Geographic tracking with impossible travel detection",
      "Card management with instant blocking capability",
      "Scalable architecture using Kafka & Spark",
    ],
    cta: "Protecting transactions, one at a time.",
  },
  {
    id: 13,
    type: "thankyou",
    title: "Thank You",
    subtitle: "Questions?",
    contact: {
      project: "FraudGuard - Real-Time Fraud Detection System",
      tech: "Built with Next.js, Kafka, Spark & ML",
    },
  },
]

export default function PresentationPage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const nextSlide = () => {
    if (currentSlide < slides.length - 1) {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const prevSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1)
    }
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header Controls */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-emerald-400" />
            <span className="font-bold text-lg">FraudGuard Presentation</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <Button variant="outline" size="sm" onClick={toggleFullscreen} className="border-slate-600 text-slate-300 hover:bg-slate-700">
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Slide Area */}
      <div className="pt-16 pb-24 min-h-screen flex items-center justify-center px-4">
        <div className="w-full max-w-6xl">
          {/* Title Slide */}
          {slide.type === "title" && (
            <div className="text-center space-y-8 animate-in fade-in duration-500">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 mb-8">
                <Shield className="h-16 w-16 text-white" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {slide.title}
              </h1>
              <p className="text-2xl md:text-3xl text-slate-300">{slide.subtitle}</p>
              <p className="text-lg text-slate-400 max-w-2xl mx-auto">{slide.description}</p>
              <div className="flex items-center justify-center gap-8 pt-8 text-sm text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Apache Kafka v3.5
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-cyan-400 animate-pulse" />
                  Apache Spark v3.4
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-blue-400 animate-pulse" />
                  ML Model v2.3.1
                </div>
              </div>
            </div>
          )}

          {/* Content Slide */}
          {slide.type === "content" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-12">
                {slide.icon && <slide.icon className="h-12 w-12 text-emerald-400" />}
                <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
              </div>
              <div className="grid gap-4">
                {slide.points?.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700 animate-in slide-in-from-left duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CheckCircle className="h-6 w-6 text-emerald-400 mt-0.5 shrink-0" />
                    <span className="text-xl text-slate-200">{point}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Architecture Slide */}
          {slide.type === "architecture" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-12">
                {slide.icon && <slide.icon className="h-12 w-12 text-emerald-400" />}
                <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                {slide.components?.map((comp, index) => (
                  <Card
                    key={index}
                    className="bg-slate-800/50 border-slate-700 animate-in zoom-in duration-500"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <CardContent className="p-6 flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
                        <comp.icon className="h-8 w-8 text-emerald-400" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white mb-2">{comp.name}</h3>
                        <p className="text-slate-400">{comp.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="mt-8 p-6 rounded-lg bg-slate-800/30 border border-slate-700">
                <div className="flex items-center justify-center gap-4 flex-wrap">
                  <div className="px-4 py-2 rounded bg-emerald-500/20 border border-emerald-500/30 text-emerald-400">
                    Transaction Input
                  </div>
                  <ChevronRight className="h-6 w-6 text-slate-500" />
                  <div className="px-4 py-2 rounded bg-cyan-500/20 border border-cyan-500/30 text-cyan-400">
                    Kafka Stream
                  </div>
                  <ChevronRight className="h-6 w-6 text-slate-500" />
                  <div className="px-4 py-2 rounded bg-blue-500/20 border border-blue-500/30 text-blue-400">
                    Spark Processing
                  </div>
                  <ChevronRight className="h-6 w-6 text-slate-500" />
                  <div className="px-4 py-2 rounded bg-purple-500/20 border border-purple-500/30 text-purple-400">
                    ML Analysis
                  </div>
                  <ChevronRight className="h-6 w-6 text-slate-500" />
                  <div className="px-4 py-2 rounded bg-red-500/20 border border-red-500/30 text-red-400">
                    Fraud Alert
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Features Slide */}
          {slide.type === "features" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-12">
                {slide.icon && <slide.icon className="h-12 w-12 text-emerald-400" />}
                <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slide.features?.map((feature, index) => (
                  <Card
                    key={index}
                    className="bg-slate-800/50 border-slate-700 hover:border-emerald-500/50 transition-colors animate-in zoom-in duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CardContent className="p-6 text-center">
                      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30 mb-4">
                        <feature.icon className="h-8 w-8 text-emerald-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white mb-2">{feature.name}</h3>
                      <p className="text-sm text-slate-400">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* ML Model Slide */}
          {slide.type === "mlmodel" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-12">
                {slide.icon && <slide.icon className="h-12 w-12 text-emerald-400" />}
                <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slide.factors?.map((factor, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 animate-in slide-in-from-bottom duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-white">{factor.name}</h3>
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-bold">
                        {factor.weight}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{factor.description}</p>
                    <div className="mt-4 h-2 rounded-full bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full"
                        style={{ width: factor.weight }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-6 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
                <p className="text-center text-lg text-slate-300">
                  <span className="text-emerald-400 font-bold">Risk Score = </span>
                  Sum of all weighted factors (0-100)
                  <span className="text-slate-400 ml-4">|</span>
                  <span className="text-red-400 ml-4">Fraud if Score &gt;= 50</span>
                </p>
              </div>
            </div>
          )}

          {/* Dashboard Modules Slide */}
          {slide.type === "dashboard" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-12">
                {slide.icon && <slide.icon className="h-12 w-12 text-emerald-400" />}
                <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {slide.modules?.map((module, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-colors animate-in zoom-in duration-500"
                    style={{ animationDelay: `${index * 75}ms` }}
                  >
                    <h3 className="font-bold text-white mb-2">{module.name}</h3>
                    <p className="text-sm text-slate-400">{module.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Alerts Slide */}
          {slide.type === "alerts" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-12">
                {slide.icon && <slide.icon className="h-12 w-12 text-emerald-400" />}
                <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-6">Severity Levels</h3>
                  {slide.alertTypes?.map((alert, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700 animate-in slide-in-from-left duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div className={`w-4 h-4 rounded-full ${alert.color}`} />
                      <div>
                        <span className="font-bold text-white">{alert.severity}</span>
                        <p className="text-sm text-slate-400">{alert.action}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white mb-6">Notification Channels</h3>
                  {slide.notifications?.map((notification, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700 animate-in slide-in-from-right duration-500"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <Bell className="h-5 w-5 text-emerald-400" />
                      <span className="text-white">{notification}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Security Slide */}
          {slide.type === "security" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-12">
                {slide.icon && <slide.icon className="h-12 w-12 text-emerald-400" />}
                <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {slide.securityItems?.map((item, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 animate-in zoom-in duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <Lock className="h-8 w-8 text-emerald-400 mb-4" />
                    <h3 className="font-bold text-white mb-2">{item.name}</h3>
                    <p className="text-sm text-slate-400">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Metrics Slide */}
          {slide.type === "metrics" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-12">
                {slide.icon && <slide.icon className="h-12 w-12 text-emerald-400" />}
                <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slide.stats?.map((stat, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 text-center animate-in zoom-in duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                      {stat.value}
                    </div>
                    <h3 className="font-bold text-white mb-1">{stat.label}</h3>
                    <p className="text-sm text-slate-400">{stat.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tech Stack Slide */}
          {slide.type === "tech" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-12">
                {slide.icon && <slide.icon className="h-12 w-12 text-emerald-400" />}
                <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {slide.stack?.map((category, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 animate-in slide-in-from-bottom duration-500"
                    style={{ animationDelay: `${index * 150}ms` }}
                  >
                    <h3 className="font-bold text-emerald-400 mb-4">{category.category}</h3>
                    <div className="space-y-2">
                      {category.items.map((item, i) => (
                        <div
                          key={i}
                          className="px-3 py-2 rounded bg-slate-700/50 text-sm text-slate-300"
                        >
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Use Cases Slide */}
          {slide.type === "usecases" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-12">
                {slide.icon && <slide.icon className="h-12 w-12 text-emerald-400" />}
                <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {slide.cases?.map((useCase, index) => (
                  <div
                    key={index}
                    className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-emerald-500/50 transition-colors animate-in zoom-in duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <h3 className="font-bold text-white mb-2">{useCase.name}</h3>
                    <p className="text-sm text-slate-400">{useCase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Conclusion Slide */}
          {slide.type === "conclusion" && (
            <div className="animate-in fade-in duration-500">
              <div className="flex items-center gap-4 mb-12">
                {slide.icon && <slide.icon className="h-12 w-12 text-emerald-400" />}
                <h2 className="text-4xl md:text-5xl font-bold">{slide.title}</h2>
              </div>
              <div className="grid gap-4 mb-12">
                {slide.summary?.map((point, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-4 rounded-lg bg-slate-800/50 border border-slate-700 animate-in slide-in-from-left duration-500"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <CheckCircle className="h-6 w-6 text-emerald-400 shrink-0" />
                    <span className="text-lg text-slate-200">{point}</span>
                  </div>
                ))}
              </div>
              <div className="text-center p-8 rounded-lg bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/30">
                <p className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                  {slide.cta}
                </p>
              </div>
            </div>
          )}

          {/* Thank You Slide */}
          {slide.type === "thankyou" && (
            <div className="text-center space-y-8 animate-in fade-in duration-500">
              <div className="inline-flex items-center justify-center w-32 h-32 rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 mb-8">
                <Shield className="h-16 w-16 text-white" />
              </div>
              <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
                {slide.title}
              </h1>
              <p className="text-3xl text-slate-300">{slide.subtitle}</p>
              <div className="pt-8 space-y-4 text-slate-400">
                <p className="text-lg">{slide.contact?.project}</p>
                <p className="text-sm">{slide.contact?.tech}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Slide Navigation Dots */}
      <div className="fixed bottom-20 left-0 right-0 flex justify-center gap-2 px-4">
        <div className="flex gap-1.5 p-2 rounded-full bg-slate-800/80 backdrop-blur-sm border border-slate-700">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                index === currentSlide
                  ? "bg-emerald-400 w-8"
                  : "bg-slate-600 hover:bg-slate-500"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/80 backdrop-blur-sm border-t border-slate-700">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Button
            onClick={prevSlide}
            disabled={currentSlide === 0}
            variant="outline"
            className="border-slate-600 text-slate-300 hover:bg-slate-700 disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>
          <div className="flex items-center gap-2">
            <a href="/" className="text-sm text-emerald-400 hover:underline">
              View Dashboard
            </a>
          </div>
          <Button
            onClick={nextSlide}
            disabled={currentSlide === slides.length - 1}
            className="bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-50"
          >
            Next
            <ChevronRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
