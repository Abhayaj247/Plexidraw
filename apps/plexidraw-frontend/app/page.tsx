"use client"

import React from "react";

import { ArrowRight, Palette, Users, Zap, Pen, Play, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { motion } from "framer-motion"
import Link from "next/link"
import { ThemeToggle } from "@/components/theme-toggle"

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
    },
  },
}

const scaleUp = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: "easeOut" as const },
  },
}

const itemFadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
}

const floatingAnimation = {
  y: [0, -10, 0],
  transition: {
    duration: 3,
    repeat: Number.POSITIVE_INFINITY,
    ease: "easeInOut" as const,
  },
}

function AnimatedSection({
  children,
  className = "",
  id = "",
}: {
  children: React.ReactNode
  className?: string
  id?: string
}) {
  return (
    <motion.section
      id={id}
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={stagger}
    >
      {children}
    </motion.section>
  )
}

export default function PlexidrawLanding() {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-background via-background to-muted/20 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 pointer-events-none">
        <motion.div
          className="absolute top-20 left-10 w-32 h-32 bg-gradient-to-br from-purple-400/10 to-pink-400/10 rounded-full blur-xl"
          animate={floatingAnimation}
        />
        <motion.div
          className="absolute top-40 right-20 w-24 h-24 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-xl"
          animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 1 } }}
        />
        <motion.div
          className="absolute bottom-40 left-20 w-40 h-40 bg-gradient-to-br from-pink-400/10 to-purple-400/10 rounded-full blur-xl"
          animate={{ ...floatingAnimation, transition: { ...floatingAnimation.transition, delay: 2 } }}
        />
      </div>

      {/* Header */}
      <motion.header
        className="fixed top-0 left-0 w-full px-4 lg:px-6 h-16 flex items-center border-b z-50 bg-background/80 backdrop-blur-md shadow-lg transition-all duration-300"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
      >
        <motion.div className="flex items-center justify-center" whileHover={{ scale: 1.05 }}>
          <motion.div
            className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center mr-3 shadow-lg"
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Palette className="h-5 w-5 text-white" />
          </motion.div>
          <span className="font-bold text-2xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Plexidraw
          </span>
        </motion.div>
        <nav className="ml-auto flex items-center gap-6 sm:gap-8">
          <motion.div whileHover={{ scale: 1.05 }} className="hidden md:block">
            <Link
              className="text-sm font-medium hover:text-purple-600 transition-colors text-muted-foreground relative group"
              href="#features"
            >
              Features
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300" />
            </Link>
          </motion.div>
          <motion.div whileHover={{ scale: 1.05 }} className="hidden md:block">
            <Link
              className="text-sm font-medium hover:text-purple-600 transition-colors text-muted-foreground relative group"
              href="#how-it-works"
            >
              How it Works
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-600 to-pink-600 group-hover:w-full transition-all duration-300" />
            </Link>
          </motion.div>
          <ThemeToggle />
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/signin">
                <Button variant="ghost" size="sm" className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer">
                  Sign In
                </Button>
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/signup">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-lg hover:shadow-xl transition-all duration-200 cursor-pointer"
                >
                  Sign Up
                </Button>
              </Link>
            </motion.div>
          </div>
        </nav>
      </motion.header>

      <main className="flex-1 relative z-10 pt-20">
        {/* Hero Section */}
        <section className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-br from-background via-muted/10 to-purple-50/20 dark:to-purple-950/20 relative">
          <div className="w-full px-4 md:px-6 text-center relative">
            <motion.div
              className="flex flex-col justify-center space-y-6 max-w-4xl mx-auto text-center"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="space-y-4">
                <motion.h1
                  className="text-4xl font-bold tracking-tighter sm:text-6xl xl:text-7xl/none bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 bg-clip-text text-transparent leading-tight pb-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3, duration: 1 }}
                >
                  Draw, Create & Collaborate
                </motion.h1>
                <motion.p
                  className="mx-auto max-w-[800px] text-muted-foreground md:text-xl lg:text-2xl leading-relaxed"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5, duration: 0.8 }}
                >
                  Bring your ideas to life with Plexidraw's intuitive drawing tools. Sketch, diagram, and collaborate in
                  real-time with your team like never before.
                </motion.p>
              </div>
              <motion.div
                className="flex flex-col gap-4 min-[400px]:flex-row justify-center mt-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7, duration: 0.8 }}
              >
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="/draw">
                    <Button
                      size="lg"
                      className="px-10 py-6 text-lg cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 shadow-xl hover:shadow-2xl transition-all duration-300 rounded-xl"
                    >
                      Start Drawing Free
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{
                          repeat: Number.POSITIVE_INFINITY,
                          repeatDelay: 2,
                          duration: 0.8,
                        }}
                      >
                        <ArrowRight className="ml-3 h-5 w-5" />
                      </motion.div>
                    </Button>
                  </Link>
                </motion.div>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link href="#demo">
                    <Button
                      variant="outline"
                      size="lg"
                      className="px-10 py-6 text-lg cursor-pointer border-2 border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <Play className="mr-3 h-5 w-5" />
                      Watch Demo
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <AnimatedSection id="features" className="w-full py-16 md:py-28 lg:py-36 bg-muted/30 relative">
          <div className="px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-16">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full text-sm font-medium text-blue-700 dark:text-blue-300"
                variants={fadeIn}
              >
                <Zap className="h-4 w-4" />
                Powerful Features
              </motion.div>
              <motion.h2 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground" variants={fadeIn}>
                Features That Spark Creativity
              </motion.h2>
              <motion.p
                className="max-w-[900px] text-muted-foreground md:text-xl lg:text-2xl leading-relaxed"
                variants={fadeIn}
              >
                Everything you need to create, collaborate, and bring your ideas to life with professional-grade tools.
              </motion.p>
            </div>
            <motion.div
              className="mx-auto grid max-w-6xl items-center gap-8 py-12 lg:grid-cols-3"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div
                className="group flex flex-col items-center space-y-6 rounded-2xl border bg-card/80 backdrop-blur-sm p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
                variants={scaleUp}
                whileHover={{
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(147, 51, 234, 0.15)",
                }}
              >
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg group-hover:shadow-xl transition-all duration-300"
                  whileHover={{ rotate: 10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Pen className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-card-foreground">Intuitive Drawing</h3>
                <p className="text-center text-muted-foreground leading-relaxed">
                  Create beautiful sketches and diagrams with our easy-to-use drawing tools, shapes, and advanced
                  features that feel natural and responsive.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                    Vector Graphics
                  </span>
                  <span className="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full text-xs font-medium">
                    Smart Shapes
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="group flex flex-col items-center space-y-6 rounded-2xl border bg-card/80 backdrop-blur-sm p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
                variants={scaleUp}
                whileHover={{
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(59, 130, 246, 0.15)",
                }}
              >
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 shadow-lg group-hover:shadow-xl transition-all duration-300"
                  whileHover={{ rotate: -10, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Users className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-card-foreground">Real-time Collaboration</h3>
                <p className="text-center text-muted-foreground leading-relaxed">
                  Work together with your team in real-time. See changes instantly as you brainstorm, with live cursors
                  and seamless synchronization.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    Live Cursors
                  </span>
                  <span className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
                    Comments
                  </span>
                </div>
              </motion.div>

              <motion.div
                className="group flex flex-col items-center space-y-6 rounded-2xl border bg-card/80 backdrop-blur-sm p-8 shadow-lg hover:shadow-2xl transition-all duration-300"
                variants={scaleUp}
                whileHover={{
                  y: -10,
                  boxShadow: "0 25px 50px -12px rgba(34, 197, 94, 0.15)",
                }}
              >
                <motion.div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500 to-green-600 shadow-lg group-hover:shadow-xl transition-all duration-300"
                  animate={{ rotate: [0, 360] }}
                  transition={{
                    duration: 8,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: "linear",
                  }}
                >
                  <Zap className="h-8 w-8 text-white" />
                </motion.div>
                <h3 className="text-2xl font-bold text-card-foreground">Lightning Fast</h3>
                <p className="text-center text-muted-foreground leading-relaxed">
                  Start creating immediately with no setup required. Built for speed and performance with instant
                  loading and smooth interactions.
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                    Instant Load
                  </span>
                  <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full text-xs font-medium">
                    Auto-save
                  </span>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* How It Works Section */}
        <AnimatedSection id="how-it-works" className="w-full py-16 md:py-28 lg:py-36 bg-background relative">
          <div className="px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-6 text-center mb-16">
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full text-sm font-medium text-green-700 dark:text-green-300"
                variants={fadeIn}
              >
                <CheckCircle className="h-4 w-4" />
                Simple Process
              </motion.div>
              <motion.h2 className="text-4xl font-bold tracking-tighter sm:text-6xl text-foreground" variants={fadeIn}>
                How It Works
              </motion.h2>
              <motion.p
                className="max-w-[900px] text-muted-foreground md:text-xl lg:text-2xl leading-relaxed"
                variants={fadeIn}
              >
                Three simple steps to start creating and collaborating with your team.
              </motion.p>
            </div>
            <motion.div
              className="mx-auto grid max-w-6xl items-start gap-12 py-12 lg:grid-cols-3"
              variants={stagger}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, amount: 0.3 }}
            >
              <motion.div className="flex flex-col items-center space-y-6 text-center" variants={itemFadeIn}>
                <motion.div
                  className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-2xl shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  1
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-pulse" />
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground">Open Canvas</h3>
                <p className="text-center text-muted-foreground leading-relaxed max-w-sm">
                  Start with a blank canvas and begin creating immediately. No setup required, just open and start
                  drawing.
                </p>
              </motion.div>

              <motion.div className="flex flex-col items-center space-y-6 text-center" variants={itemFadeIn}>
                <motion.div
                  className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-2xl shadow-xl"
                  whileHover={{ scale: 1.1, rotate: -5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  2
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-400 rounded-full animate-pulse delay-300" />
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground">Draw & Design</h3>
                <p className="text-center text-muted-foreground leading-relaxed max-w-sm">
                  Use our intuitive tools to sketch, add shapes, text, and bring your ideas to life with professional
                  precision.
                </p>
              </motion.div>

              <motion.div className="flex flex-col items-center space-y-6 text-center" variants={itemFadeIn}>
                <motion.div
                  className="relative flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 text-white font-bold text-2xl shadow-xl"
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  3
                  <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-400 rounded-full animate-pulse delay-700" />
                </motion.div>
                <h3 className="text-2xl font-bold text-foreground">Share & Collaborate</h3>
                <p className="text-center text-muted-foreground leading-relaxed max-w-sm">
                  Invite others to collaborate in real-time or share your creations with the world through multiple
                  export options.
                </p>
              </motion.div>
            </motion.div>
          </div>
        </AnimatedSection>

        {/* Final CTA Section */}
        <AnimatedSection className="w-full py-16 md:py-28 lg:py-36 border-t bg-gradient-to-br from-muted/50 to-background relative">
          <div className="grid items-center justify-center gap-8 px-4 text-center md:px-6">
            <div className="space-y-6">
              <motion.h2 className="text-4xl font-bold tracking-tighter md:text-6xl text-foreground" variants={fadeIn}>
                Ready to start creating?
              </motion.h2>
              <motion.p
                className="mx-auto max-w-[700px] text-muted-foreground md:text-xl lg:text-2xl leading-relaxed"
                variants={fadeIn}
              >
                Experience the power of intuitive drawing tools designed for creators. Start your creative journey
                today.
              </motion.p>
            </div>
            <motion.div className="mx-auto w-full max-w-md space-y-4" variants={scaleUp}>
              <div className="flex flex-col gap-4 min-[400px]:flex-row justify-center">
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 10 }}
                >
                  <Link href="/draw">
                    <Button
                      size="lg"
                      className="w-full min-[400px]:w-auto cursor-pointer bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white border-0 px-10 py-6 text-lg rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300"
                    >
                      Start Drawing Now
                      <ArrowRight className="ml-3 h-5 w-5" />
                    </Button>
                  </Link>
                </motion.div>
              </div>
              <p className="text-sm text-muted-foreground">No credit card required • Free forever plan available</p>
            </motion.div>
          </div>
        </AnimatedSection>
      </main>

      {/* Footer */}
      <motion.footer
        className="border-t py-8 md:py-4 bg-background/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="flex flex-col items-center justify-between gap-6 md:h-24 md:flex-row md:py-0 px-4 md:px-6">
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-lg"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Palette className="h-5 w-5 text-white" />
            </motion.div>
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Plexidraw
            </span>
          </motion.div>
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © 2025 Plexidraw. All rights reserved.
          </p>
        </div>
      </motion.footer>
    </div>
  )
}
