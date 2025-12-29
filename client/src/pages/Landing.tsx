import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Activity, Brain, LineChart, ArrowRight, ShieldCheck, Smartphone, Mail, MapPin, Menu, X, Play, Microscope, Users, HeartPulse, ChevronDown } from "lucide-react";
import { motion, useScroll, useTransform, useSpring, useMotionValue, useMotionTemplate } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const heroRef = useRef(null);

  // Parallax & Scroll Transforms
  const heroY = useTransform(scrollY, [0, 1000], [0, 400]);
  const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);
  const textParallax = useTransform(scrollY, [0, 1000], [0, -150]);

  // Continuous rotation for background elements
  const rotate = useTransform(scrollY, [0, 4000], [0, 360]);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#0F172A] font-body text-slate-100 overflow-x-hidden selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* Living Background */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Floating Orbs */}
        <motion.div
          animate={{
            x: [0, 100, -50, 0],
            y: [0, -100, 50, 0],
            scale: [1, 1.2, 0.8, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full bg-cyan-500/10 blur-[120px]"
        />
        <motion.div
          animate={{
            x: [0, -150, 50, 0],
            y: [0, 80, -100, 0],
            scale: [1, 1.5, 0.9, 1]
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-10%] w-[800px] h-[800px] rounded-full bg-purple-600/10 blur-[120px]"
        />
        {/* Connecting Lines Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_100%)]" />
      </div>

      {/* Sticky Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${isScrolled ? "bg-[#0F172A]/80 backdrop-blur-xl border-b border-white/5 py-4" : "bg-transparent py-6"}`}>
        <div className="container mx-auto px-6 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-cyan-500 blur-lg opacity-50 animate-pulse" />
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white shadow-2xl">
                <Activity className="w-6 h-6" />
              </div>
            </div>
            <span className="text-2xl font-display font-bold text-white tracking-tight">ADAPT</span>
          </motion.div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {["Features", "How it Works", "Science", "Testimonials", "FAQ"].map((item, i) => (
              <motion.a
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                href={`#${item.toLowerCase().replace(/\s/g, '-')}`}
                className="text-sm font-medium text-slate-300 hover:text-cyan-400 transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full" />
              </motion.a>
            ))}
            <Link href="/login">
              <Button variant="ghost" className="font-semibold text-slate-300 hover:text-white hover:bg-white/10">Log In</Button>
            </Link>
            <Link href="/register">
              <Button className="rounded-full px-6 bg-cyan-500 hover:bg-cyan-400 text-slate-900 font-bold shadow-[0_0_20px_rgba(6,182,212,0.5)] hover:shadow-[0_0_30px_rgba(6,182,212,0.8)] transition-all transform hover:scale-105">
                Get Started
              </Button>
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <div ref={heroRef} className="relative min-h-screen flex items-center justify-center pt-20 perspective-1000">
        <div className="container mx-auto px-6 relative z-10 grid md:grid-cols-2 gap-12 items-center">

          <motion.div
            style={{ y: textParallax, opacity: heroOpacity }}
            className="text-left"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-sm font-medium mb-8"
            >
              <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-ping"></span>
              <span>Live Tremor Analysis Engine v2.0</span>
            </motion.div>

            <h1 className="text-6xl md:text-8xl font-display font-bold text-white mb-8 leading-[1] tracking-tighter">
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="block"
              >
                Control.
              </motion.span>
              <motion.span
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="block bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 text-transparent bg-clip-text animate-gradient-x"
              >
                Clarified.
              </motion.span>
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-slate-400 mb-12 max-w-lg leading-relaxed"
            >
              The first intelligent companion for <strong className="text-white">Parkinson's Disease</strong> management that visualizes your health in real-time.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              <Link href="/register">
                <MagneticButton className="h-16 px-10 rounded-full bg-white text-slate-900 font-bold text-lg hover:bg-cyan-50 transition-colors flex items-center justify-center gap-2 group">
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </MagneticButton>
              </Link>
              <div className="flex items-center gap-4 cursor-pointer group px-6">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:bg-white/10 transition-colors">
                  <Play className="w-5 h-5 fill-white text-white" />
                </div>
                <span className="font-medium text-white group-hover:underline">Watch Demo</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Hero Visual - Floating Cards */}
          <motion.div style={{ y: heroY, rotate: useTransform(scrollY, [0, 500], [0, 10]) }} className="relative hidden md:block h-[600px]">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-gradient-to-r from-cyan-500/20 to-purple-600/20 rounded-full blur-[100px] animate-pulse" />

            {/* Main Card */}
            <motion.div
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="absolute top-10 left-10 right-10 bottom-10 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-2xl p-6 z-20 flex flex-col"
            >
              <div className="h-8 flex items-center gap-2 mb-4 border-b border-white/5 pb-4">
                <div className="w-3 h-3 rounded-full bg-red-500" />
                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                <div className="w-3 h-3 rounded-full bg-green-500" />
              </div>
              <div className="flex-1 bg-gradient-to-br from-slate-950 to-slate-900 rounded-xl relative overflow-hidden flex items-end">
                {/* Animated Graph Line */}
                <svg className="w-full h-48" preserveAspectRatio="none">
                  <motion.path
                    d="M0,100 Q100,50 200,90 T400,60 T600,100"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="3"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 3, repeat: Infinity, repeatType: "mirror", ease: "easeInOut" }}
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#a855f7" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </motion.div>

            {/* Floating Badge 1 */}
            <motion.div
              animate={{ y: [0, 30, 0], x: [0, 10, 0] }}
              transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
              className="absolute -top-4 -right-8 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl z-30 shadow-xl"
            >
              <Activity className="w-8 h-8 text-cyan-400 mb-2" />
              <div className="text-2xl font-bold text-white">98%</div>
              <div className="text-xs text-slate-300">Accuracy</div>
            </motion.div>

            {/* Floating Badge 2 */}
            <motion.div
              animate={{ y: [0, -25, 0], x: [0, -10, 0] }}
              transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              className="absolute -bottom-8 -left-8 bg-gradient-to-br from-purple-600 to-indigo-600 p-5 rounded-2xl z-30 shadow-xl flex items-center gap-4"
            >
              <Brain className="w-8 h-8 text-white" />
              <div>
                <div className="text-sm font-medium text-purple-200">Analysis</div>
                <div className="text-lg font-bold text-white">Complete</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Marquee / Trusted By - Moved Up */}
      <div className="py-12 bg-slate-900 overflow-hidden border-y border-white/5 relative z-10">
        <div className="flex gap-20 animate-marquee whitespace-nowrap">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="flex gap-20 items-center opacity-40 grayscale">
              <span className="text-2xl font-display font-bold">HealthPlus</span>
              <span className="text-2xl font-display font-bold">NeuroLife</span>
              <span className="text-2xl font-display font-bold">MediCare</span>
              <span className="text-2xl font-display font-bold">FutureHealth</span>
              <span className="text-2xl font-display font-bold">SinaiCloud</span>
              <span className="text-2xl font-display font-bold">ApexMedical</span>
            </div>
          ))}
        </div>
      </div>

      {/* Features Section with Horizontal Scroll Stagger */}
      <section id="features" className="py-32 relative z-10 bg-slate-950">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-24 text-center"
          >
            <h2 className="text-sm font-bold text-cyan-500 tracking-widest uppercase mb-4">Features</h2>
            <h3 className="text-4xl md:text-5xl font-display font-bold text-white">Everything you need. <span className="text-slate-600">Nothing you don't.</span></h3>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            <TiltCard icon={Brain} title="Neural Analysis" desc="Algorithms trained on 10,000+ clinical samples to detect subtle motor fluctuations." delay={0} />
            <TiltCard icon={ShieldCheck} title="HIPAA Compliant" desc="Bank-grade encryption ensures your health data never leaves our secure enclave." delay={0.2} />
            <TiltCard icon={LineChart} title="Smart Trends" desc="We don't just show data. We interpret it, highlighting correlations with your routine." delay={0.4} />
          </div>
        </div>
      </section>

      {/* "How it works" with Drawing Line */}
      <section id="how-it-works" className="py-32 relative overflow-hidden bg-[#0F172A]">
        {/* Drawing Line Path */}
        <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-slate-800 -translate-x-1/2 hidden md:block">
          <motion.div
            style={{ height: useTransform(scrollY, [1200, 2000], ["0%", "100%"]) }}
            className="w-full bg-gradient-to-b from-cyan-500 to-purple-600 shadow-[0_0_15px_rgba(6,182,212,0.6)]"
          />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div className="text-center mb-20" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}>
            <h2 className="text-4xl font-display font-bold text-white mb-6">How ADAPT works</h2>
          </motion.div>
          <Step
            i={1}
            title="Log your day"
            desc="Take 30 seconds to record your medications and how you're typically feeling."
            icon={Smartphone}
            alignment="left"
          />
          <Step
            i={2}
            title="Perform the test"
            desc="Trace the spiral. Our engine analyzes speed, tremor amplitude, and deviation."
            icon={Activity}
            alignment="right"
          />
          <Step
            i={3}
            title="Get clarity"
            desc="Instant visualization of your motor function scores over time."
            icon={LineChart}
            alignment="left"
          />
        </div>
      </section>

      {/* NEW: The Science Section */}
      <section id="science" className="py-32 bg-slate-900 border-t border-white/5 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,_var(--tw-gradient-stops))] from-indigo-900/40 via-transparent to-transparent" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="md:w-1/2"
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest mb-6">
                <Microscope className="w-4 h-4" />
                Clinical Precision
              </div>
              <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Backed by Data.<br />Verified by Doctors.</h2>
              <p className="text-lg text-slate-400 mb-8 leading-relaxed">
                ADAPT isn't just a tracker. It uses the <strong className="text-white">UPDRS (Unified Parkinson's Disease Rating Scale)</strong> methodology digitized into a powerful algorithm.
              </p>
              <ul className="space-y-4 mb-8">
                {["Real-time tremor amplitude filtering", "Medication efficacy correlation", "Shareable PDF clinical reports"].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300">
                    <div className="w-6 h-6 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                      <ShieldCheck className="w-3 h-3" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="md:w-1/2 bg-slate-800 rounded-3xl p-8 border border-white/10 shadow-2xl relative"
            >
              {/* Pseudo Graph */}
              <div className="flex justify-between items-end h-64 gap-2">
                {[40, 65, 45, 80, 55, 90, 70, 85].map((h, i) => (
                  <motion.div
                    key={i}
                    initial={{ height: 0 }}
                    whileInView={{ height: `${h}%` }}
                    transition={{ duration: 1, delay: i * 0.1 }}
                    className="flex-1 bg-gradient-to-t from-indigo-600 to-cyan-400 rounded-t-lg opacity-80"
                  />
                ))}
              </div>
              <div className="mt-4 flex justify-between text-xs text-slate-500 font-mono">
                <span>MON</span><span>TUE</span><span>WED</span><span>THU</span><span>FRI</span><span>SAT</span><span>SUN</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* NEW: Testimonials Carousel */}
      <section id="testimonials" className="py-32 bg-[#0F172A] relative">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-display font-bold text-white mb-6">Lives Changed</h2>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <TestimonialCard
              name="Robert Fox"
              role="Diagnosed 2019"
              text="I used to forget if I took my midday dose. ADAPT not only reminds me but shows me what happens when I miss it."
              delay={0}
            />
            <TestimonialCard
              name="Eleanor Pena"
              role="Diagnosed 2021"
              text="My doctor didn't believe my tremors were worse in the morning until I showed her the graphs. Now we've adjusted my meds."
              delay={0.2}
            />
            <TestimonialCard
              name="Dr. Arlene McCoy"
              role="Neurologist"
              text="The clinical reports my patients bring from ADAPT are game-changers. I can actually see the trends between visits."
              delay={0.4}
            />
          </div>
        </div>
      </section>

      {/* NEW: FAQ Section */}
      <section id="faq" className="py-24 bg-slate-900 border-t border-white/5">
        <div className="container mx-auto px-6 max-w-3xl">
          <div className="flex items-center gap-2 mb-8 justify-center">
            <Brain className="w-6 h-6 text-purple-400" />
            <h2 className="text-3xl font-bold text-white">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            <Accordion type="single" collapsible className="w-full">
              {[
                { q: "Is my data shared with insurance companies?", a: "Never. We are strictly patient-first. Your data is yours, and we only share it with people you explicitly authorize (like your doctor)." },
                { q: "Can I use this on my tablet?", a: "Yes! ADAPT is a responsive web application that works great on iPads, Android tablets, and phones." },
                { q: "Is there a free trial?", a: "The basic tracking features are free forever. The advanced AI insights come with a premium subscription, but you get a 14-day free trial on sign-up." }
              ].map((item, i) => (
                <AccordionItem key={i} value={`item-${i}`} className="border-b border-white/10 mb-4 px-4 bg-slate-800/30 rounded-lg">
                  <AccordionTrigger className="text-lg font-medium text-slate-200 hover:text-white py-6 hover:no-underline data-[state=open]:text-cyan-400">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-slate-400 text-base pb-6 leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <div className="py-40 relative flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-cyan-600/5" />
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 100 }}
          className="text-center relative z-10 px-6"
        >
          <h2 className="text-5xl md:text-7xl font-bold font-display text-white mb-8">Ready to take control?</h2>
          <Link href="/register">
            <button className="relative px-12 py-6 rounded-full bg-white text-slate-900 text-xl font-extrabold tracking-wide hover:scale-105 transition-transform shadow-[0_0_50px_rgba(255,255,255,0.3)]">
              Start Your Journey
            </button>
          </Link>
        </motion.div>
      </div>

      {/* Expanded Footer */}
      <footer className="bg-slate-950 border-t border-white/10 py-20 text-slate-400">
        <div className="container mx-auto px-6 grid md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <Activity className="w-6 h-6 text-cyan-400" />
              <span className="font-bold text-white text-xl">ADAPT</span>
            </div>
            <p className="mb-6 leading-relaxed text-sm">
              Empowering Parkinson's patients with data-driven insights. Built with precision in San Francisco.
            </p>
            <div className="flex gap-4">
              {[Mail, MapPin, HeartPulse].map((Icon, i) => (
                <div key={i} className="w-10 h-10 rounded-full bg-white/5 hover:bg-cyan-500 hover:text-white flex items-center justify-center transition-all cursor-pointer">
                  <Icon className="w-4 h-4" />
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Product</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#features" className="hover:text-cyan-400 transition-colors">Features</a></li>
              <li><a href="#science" className="hover:text-cyan-400 transition-colors">The Science</a></li>
              <li><a href="#testimonials" className="hover:text-cyan-400 transition-colors">Stories</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Pricing</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm">
              <li><a href="#" className="hover:text-cyan-400 transition-colors">About</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-cyan-400 transition-colors">Contact</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold mb-6">Newsletter</h4>
            <p className="text-sm mb-4">Get the latest research and updates.</p>
            <div className="flex gap-2">
              <Input placeholder="Email address" className="bg-white/5 border-white/10" />
              <Button size="icon" className="bg-cyan-500 hover:bg-cyan-400"><ArrowRight className="w-4 h-4" /></Button>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-6 pt-8 border-t border-white/5 text-center md:text-left text-xs flex flex-col md:flex-row justify-between items-center">
          <p>© 2024 ADAPT Health Inc. All rights reserved.</p>
          <div className="flex gap-8 mt-4 md:mt-0">
            <a href="#" className="hover:text-white">Privacy</a>
            <a href="#" className="hover:text-white">Terms</a>
            <a href="#" className="hover:text-white">Sitemap</a>
          </div>
        </div>
      </footer>

    </div>
  );
}

// ---------------- Components ----------------

function TiltCard({ icon: Icon, title, desc, delay }: { icon: any, title: string, desc: string, delay: number }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useTransform(y, [-100, 100], [30, -30]);
  const rotateY = useTransform(x, [-100, 100], [-30, 30]);

  function handleMouse(event: React.MouseEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    x.set(event.clientX - rect.left - rect.width / 2);
    y.set(event.clientY - rect.top - rect.height / 2);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5 }}
      viewport={{ once: true }}
      style={{ perspective: 2000 }}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        onMouseMove={handleMouse}
        onMouseLeave={() => { x.set(0); y.set(0); }}
        className="h-full p-8 rounded-3xl bg-slate-800/50 border border-white/10 hover:bg-slate-800 transition-colors backdrop-blur-sm group relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

        <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 relative z-10">
          <Icon className="w-7 h-7 text-cyan-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 relative z-10">{title}</h3>
        <p className="text-slate-400 leading-relaxed relative z-10">{desc}</p>
      </motion.div>
    </motion.div>
  )
}

function Step({ i, title, desc, icon: Icon, alignment }: { i: number, title: string, desc: string, icon: any, alignment: "left" | "right" }) {
  const isLeft = alignment === "left";
  return (
    <motion.div
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ margin: "-100px" }}
      className={`flex items-center gap-12 mb-24 ${!isLeft && "flex-row-reverse"}`}
    >
      <div className="flex-1 text-right">
        {isLeft && (
          <>
            <div className="text-6xl font-black text-slate-800 mb-2">{`0${i}`}</div>
            <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-lg">{desc}</p>
          </>
        )}
      </div>

      <div className="relative z-10 w-16 h-16 rounded-full bg-slate-900 border-4 border-slate-800 flex items-center justify-center shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        <Icon className="w-6 h-6 text-cyan-400" />
        <div className="absolute inset-0 border-2 border-cyan-500/50 rounded-full animate-ping opacity-20" />
      </div>

      <div className="flex-1 text-left">
        {!isLeft && (
          <>
            <div className="text-6xl font-black text-slate-800 mb-2">{`0${i}`}</div>
            <h3 className="text-3xl font-bold text-white mb-2">{title}</h3>
            <p className="text-slate-400 text-lg">{desc}</p>
          </>
        )}
      </div>
    </motion.div>
  )
}

function TestimonialCard({ name, role, text, delay }: { name: string, role: string, text: string, delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      viewport={{ once: true }}
      className="bg-slate-800/50 border border-white/5 p-8 rounded-3xl relative hover:bg-slate-800 transition-colors"
    >
      <div className="absolute -top-4 -right-4 w-12 h-12 bg-cyan-500/20 rounded-full blur-xl" />
      <div className="flex items-center gap-4 mb-6">
        <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600" />
        <div>
          <div className="font-bold text-white">{name}</div>
          <div className="text-xs text-cyan-400">{role}</div>
        </div>
      </div>
      <p className="text-slate-300 italic leading-relaxed">"{text}"</p>
    </motion.div>
  )
}

function MagneticButton({ children, className }: { children: React.ReactNode, className: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const handleMouse = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current?.getBoundingClientRect() || { left: 0, top: 0, width: 0, height: 0 };
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    x.set((clientX - centerX) * 0.3);
    y.set((clientY - centerY) * 0.3);
  };

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onMouseMove={handleMouse}
      onMouseLeave={() => { x.set(0); y.set(0); }}
      className={className}
    >
      {children}
    </motion.button>
  )
}
