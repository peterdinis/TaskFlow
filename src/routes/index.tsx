import { useState, useEffect, useRef, useCallback, useMemo, Suspense, lazy } from 'react';
import { motion, useScroll, useTransform, AnimatePresence, useInView } from 'framer-motion';
import { useNavigate } from '@tanstack/react-router';
import {
  ArrowRight, Sparkles, Check, Star, Users, Zap, Shield, Globe,
  BarChart, Bell, Calendar, Clock, Folder, Target, TrendingUp,
  ChevronRight, Play, Github, Twitter, Linkedin, Menu, X,
  Award, Lock, Cloud, Smartphone, Heart, Rocket
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { createFileRoute } from '@tanstack/react-router';
import { useDebounceCallback } from '@react-hook/debounce';
import { AnimatedLoader } from '@/components/shared/AnimatedComponent';
import { PendingComponent } from '@/components/shared/PendingComponent';

// Mock stats
const STATS = [
  { value: '500K+', label: 'Active Users', icon: Users },
  { value: '98%', label: 'Satisfaction', icon: Heart },
  { value: '4.9', label: 'Rating', icon: Star },
  { value: '24/7', label: 'Support', icon: Clock },
] as const;

// Features
const FEATURES = [
  {
    title: 'Smart Task Management',
    description: 'AI-powered suggestions and intelligent organization for your tasks.',
    icon: Sparkles,
    color: 'from-blue-500 to-cyan-500',
    delay: 0,
  },
  {
    title: 'Real-time Collaboration',
    description: 'Work together with your team seamlessly on shared projects.',
    icon: Users,
    color: 'from-purple-500 to-pink-500',
    delay: 0.1,
  },
  {
    title: 'Cross-platform Sync',
    description: 'Access your tasks anywhere, on any device, instantly.',
    icon: Globe,
    color: 'from-green-500 to-emerald-500',
    delay: 0.2,
  },
  {
    title: 'Productivity Insights',
    description: 'Track progress and optimize your workflow with detailed analytics.',
    icon: BarChart,
    color: 'from-orange-500 to-red-500',
    delay: 0.3,
  },
] as const;

// Testimonials
const TESTIMONIALS = [
  {
    name: 'Sarah Johnson',
    role: 'Product Manager',
    company: 'TechCorp',
    content: 'TaskFlow has revolutionized how our team manages projects. The collaboration features are exceptional!',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    rating: 5,
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    company: 'StartUpXYZ',
    content: 'The AI suggestions save me hours every week. Best task management tool I\'ve used.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    rating: 5,
  },
  {
    name: 'Emma Wilson',
    role: 'Marketing Director',
    company: 'GrowthLab',
    content: 'From personal tasks to team projects, TaskFlow handles everything beautifully.',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    rating: 5,
  },
] as const;

// Pricing plans
const PLANS = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for getting started',
    features: [
      'Up to 100 tasks',
      '1 project',
      'Basic features',
      'Email support',
      'Mobile apps',
    ],
    cta: 'Get Started',
    popular: false,
    color: 'border-blue-200',
  },
  {
    name: 'Pro',
    price: '$9',
    period: 'per month',
    description: 'For power users & small teams',
    features: [
      'Unlimited tasks',
      '10 projects',
      'Advanced features',
      'Priority support',
      'Custom themes',
      'Team collaboration',
    ],
    cta: 'Try Pro Free',
    popular: true,
    color: 'border-purple-500',
  },
  {
    name: 'Team',
    price: '$24',
    period: 'per month',
    description: 'For teams & organizations',
    features: [
      'Everything in Pro',
      'Unlimited projects',
      'Advanced analytics',
      'Dedicated support',
      'SSO & SAML',
      'Custom onboarding',
    ],
    cta: 'Contact Sales',
    popular: false,
    color: 'border-emerald-200',
  },
] as const;

export const Route = createFileRoute('/')({
  component: LandingPage,
  loader: async () => {
    return {
      preloaded: true,
    };
  },
  pendingComponent: PendingComponent
});

function AnimatedSection({
  children,
  delay = 0,
  className = ""
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay }}
      className={className}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

const Stats = () => {
  return (
    <section className="py-20 px-4 bg-muted/30">
      <div className="container mx-auto max-w-6xl">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <AnimatedSection key={stat.label} delay={index * 0.1}>
                <div className="text-center">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="text-3xl font-bold mb-2">{stat.value}</div>
                  <div className="text-muted-foreground">{stat.label}</div>
                </div>
              </AnimatedSection>
            );
          })}
        </div>
      </div>
    </section>
  );
};

const OptimizedImage = ({
  src,
  alt,
  className
}: {
  src: string;
  alt: string;
  className?: string;
}) => {
  const [loaded, setLoaded] = useState(false);

  return (
    <div className={`relative ${className}`}>
      {!loaded && (
        <div className="absolute inset-0 bg-muted animate-pulse rounded-full" />
      )}
      <img
        src={src}
        alt={alt}
        className={`w-full h-full object-cover rounded-full ${loaded ? 'opacity-100' : 'opacity-0'}`}
        loading="lazy"
        width={48}
        height={48}
        onLoad={() => setLoaded(true)}
      />
    </div>
  );
};

function LandingPage() {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const { scrollY } = useScroll();

  const headerOpacity = useTransform(scrollY, [0, 100], [0, 1]);
  const headerBackground = useTransform(
    scrollY,
    [0, 100],
    ['rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0.95)']
  );

  // Debounced scroll handler
  const checkScroll = useDebounceCallback((y: number) => {
    setIsScrolled(y > 50);
  }, 10);

  useEffect(() => {
    const unsubscribe = scrollY.on('change', checkScroll);
    return () => unsubscribe();
  }, [scrollY, checkScroll]);

  const handleGetStarted = useCallback(() => {
    navigate({ to: '/register' });
  }, [navigate]);

  const handleLogin = useCallback(() => {
    navigate({ to: '/login' });
  }, [navigate]);

  const handleSubscribe = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsSubscribing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    alert(`Thank you for subscribing with ${email}!`);
    setEmail('');
    setIsSubscribing(false);
  }, [email]);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMenuOpen(false);
    }
  }, []);

  // Memoizovaný animated background
  const animatedBackground = useMemo(() => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/20 rounded-full"
          style={{
            willChange: 'transform, opacity',
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
          }}
          animate={{
            y: [null, -20, 20, -10],
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "linear"
          }}
        />
      ))}
    </div>
  ), []);

  // Memoizované footer sekcie
  const footerSections = useMemo(() => [
    {
      title: 'Product',
      links: ['Features', 'Pricing', 'API', 'Documentation'],
    },
    {
      title: 'Company',
      links: ['About', 'Blog', 'Careers', 'Press'],
    },
    {
      title: 'Legal',
      links: ['Privacy', 'Terms', 'Security', 'Cookie Policy'],
    },
  ], []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {animatedBackground}

      {/* Header */}
      <motion.header
        style={{
          opacity: headerOpacity,
          backgroundColor: headerBackground,
          backdropFilter: 'blur(10px)',
          willChange: 'transform, opacity, background-color',
        }}
        className="fixed top-0 left-0 right-0 z-50 border-b border-border/50"
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', delay: 0.1 }}
                className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center"
                style={{ willChange: 'transform' }}
              >
                <span className="text-primary-foreground font-bold text-sm">TF</span>
              </motion.div>
              <span className="font-bold text-xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                TaskFlow
              </span>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              {['Features', 'Pricing', 'Testimonials'].map((item) => (
                <button
                  key={item}
                  onClick={() => scrollToSection(item.toLowerCase())}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                >
                  {item}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                onClick={handleLogin}
                className="hidden sm:inline-flex"
              >
                Sign In
              </Button>
              <Button
                onClick={handleGetStarted}
                className="gap-2"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Button>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden p-2"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-t border-border bg-background/95 backdrop-blur-lg"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="flex flex-col gap-4">
                  {['Features', 'Pricing', 'Testimonials'].map((item) => (
                    <button
                      key={item}
                      onClick={() => scrollToSection(item.toLowerCase())}
                      className="py-2 text-left font-medium hover:text-primary transition-colors"
                    >
                      {item}
                    </button>
                  ))}
                  <Button variant="outline" onClick={handleLogin} className="mt-2">
                    Sign In
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center">
              <AnimatedSection>
                <Badge className="mb-6 px-4 py-1.5 bg-primary/10 text-primary border-primary/20 hover:bg-primary/20">
                  <Sparkles className="w-3 h-3 mr-2" />
                  Trusted by 500,000+ teams worldwide
                </Badge>
              </AnimatedSection>

              <AnimatedSection delay={0.1}>
                <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                  Organize your work
                  <span className="block bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
                    and life, finally.
                  </span>
                </h1>
              </AnimatedSection>

              <AnimatedSection delay={0.2}>
                <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-10">
                  TaskFlow brings all your tasks, teammates, and tools together in one place.
                  Keep everything in sync across your entire organization.
                </p>
              </AnimatedSection>

              <AnimatedSection delay={0.3}>
                <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
                  <Button
                    size="lg"
                    onClick={handleGetStarted}
                    className="px-8 py-6 text-lg gap-3"
                  >
                    Start for free
                    <ArrowRight className="w-5 h-5" />
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="px-8 py-6 text-lg gap-3"
                    onClick={() => scrollToSection('features')}
                  >
                    <Play className="w-5 h-5" />
                    Watch demo
                  </Button>
                </div>
              </AnimatedSection>

              {/* Hero image/illustration */}
              <AnimatedSection delay={0.4}>
                <div className="relative">
                  <div className="relative mx-auto max-w-4xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-3xl rounded-3xl" />
                    <div className="relative bg-card border border-border rounded-2xl p-8 shadow-2xl">
                      {/* Mock dashboard preview */}
                      <div className="grid grid-cols-3 gap-4 mb-4">
                        {['Today', 'Upcoming', 'Projects'].map((item, i) => (
                          <motion.div
                            key={item}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.1 }}
                            className="bg-muted/50 rounded-lg p-4"
                            style={{ willChange: 'transform, opacity' }}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className="font-medium">{item}</span>
                              <Badge variant="outline" className="text-xs">
                                12
                              </Badge>
                            </div>
                            <div className="space-y-2">
                              {[...Array(3)].map((_, j) => (
                                <div
                                  key={j}
                                  className="h-2 bg-muted rounded-full animate-pulse"
                                  style={{
                                    width: `${60 + j * 20}%`,
                                    animationDelay: `${j * 0.1}s`,
                                  }}
                                />
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                      <div className="bg-muted/30 rounded-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                              <Target className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">Marketing Campaign</div>
                              <div className="text-sm text-muted-foreground">4 tasks completed</div>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {[1, 2, 3].map((i) => (
                              <div
                                key={i}
                                className="w-8 h-8 rounded-full bg-muted animate-pulse"
                                style={{ animationDelay: `${i * 0.2}s` }}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="space-y-3">
                          {[...Array(4)].map((_, i) => (
                            <div key={i} className="flex items-center gap-3">
                              <div className="w-4 h-4 rounded-full border-2 border-primary/30" />
                              <div
                                className="h-3 bg-muted rounded-full animate-pulse"
                                style={{
                                  width: `${70 + i * 10}%`,
                                  animationDelay: `${i * 0.1}s`,
                                }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <Stats />

        {/* Features Section */}
        <section id="features" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <AnimatedSection className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
                <Zap className="w-3 h-3 mr-2" />
                Features
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Everything you need to
                <span className="block text-primary">stay productive</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Powerful features designed to help you organize, prioritize, and get things done.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {FEATURES.map((feature, index) => {
                const Icon = feature.icon;
                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: feature.delay }}
                    whileHover={{ y: -5 }}
                    className="group"
                    style={{ willChange: 'transform' }}
                  >
                    <div className={cn(
                      "h-full p-6 rounded-2xl border border-border bg-card optimized-shadow",
                      "group-hover:shadow-xl group-hover:border-primary/20 transition-all"
                    )}>
                      <div className={cn(
                        "w-12 h-12 rounded-xl mb-6 flex items-center justify-center optimized-gradient",
                        "bg-gradient-to-br",
                        feature.color
                      )}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                      <p className="text-muted-foreground">{feature.description}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Additional features grid */}
            <AnimatedSection delay={0.2} className="mt-20">
              <div className="grid md:grid-cols-3 gap-8">
                {[
                  {
                    icon: Shield,
                    title: 'Enterprise Security',
                    description: 'Bank-level encryption and compliance standards.',
                  },
                  {
                    icon: Cloud,
                    title: 'Cloud Backup',
                    description: 'Automatic backups and version history.',
                  },
                  {
                    icon: Smartphone,
                    title: 'Mobile Apps',
                    description: 'iOS and Android apps with full feature parity.',
                  },
                ].map((item, index) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.title} className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2">{item.title}</h4>
                        <p className="text-muted-foreground text-sm">{item.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 px-4 bg-muted/30">
          <div className="container mx-auto max-w-6xl">
            <AnimatedSection className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
                <Star className="w-3 h-3 mr-2" />
                Testimonials
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Loved by teams
                <span className="block text-primary">worldwide</span>
              </h2>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8">
              {TESTIMONIALS.map((testimonial, index) => (
                <AnimatedSection key={testimonial.name} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className="bg-card border border-border rounded-2xl p-6 optimized-shadow"
                    style={{ willChange: 'transform' }}
                  >
                    <div className="flex items-center gap-3 mb-4">
                      <OptimizedImage
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-12 h-12"
                      />
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {testimonial.role} • {testimonial.company}
                        </div>
                      </div>
                    </div>
                    <p className="text-muted-foreground mb-4">{testimonial.content}</p>
                    <div className="flex text-yellow-500">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-20 px-4">
          <div className="container mx-auto max-w-6xl">
            <AnimatedSection className="text-center mb-16">
              <Badge className="mb-4 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
                <Award className="w-3 h-3 mr-2" />
                Pricing
              </Badge>
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Simple, transparent
                <span className="block text-primary">pricing</span>
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Start free. Upgrade when you need more power.
              </p>
            </AnimatedSection>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {PLANS.map((plan, index) => (
                <AnimatedSection key={plan.name} delay={index * 0.1}>
                  <motion.div
                    whileHover={{ y: -5 }}
                    className={cn(
                      "relative border-2 rounded-2xl p-8 optimized-shadow",
                      plan.color,
                      plan.popular && "ring-2 ring-primary/20 shadow-xl"
                    )}
                    style={{ willChange: 'transform' }}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <Badge className="bg-primary text-primary-foreground">
                          Most Popular
                        </Badge>
                      </div>
                    )}

                    <div className="text-center mb-8">
                      <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                      <div className="flex items-baseline justify-center gap-1 mb-2">
                        <span className="text-4xl font-bold">{plan.price}</span>
                        <span className="text-muted-foreground">/{plan.period}</span>
                      </div>
                      <p className="text-muted-foreground">{plan.description}</p>
                    </div>

                    <ul className="space-y-3 mb-8">
                      {plan.features.map((feature, i) => (
                        <li key={i} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      className={cn(
                        "w-full",
                        plan.popular
                          ? "bg-gradient-to-r from-primary to-primary/80"
                          : "bg-primary"
                      )}
                      onClick={handleGetStarted}
                    >
                      {plan.cta}
                    </Button>
                  </motion.div>
                </AnimatedSection>
              ))}
            </div>

            <AnimatedSection className="text-center mt-12">
              <p className="text-muted-foreground">
                All plans include 30-day free trial. No credit card required.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/20">
          <div className="container mx-auto max-w-4xl text-center">
            <AnimatedSection>
              <div className="bg-card border border-border rounded-3xl p-8 md:p-12 shadow-2xl">
                <Badge className="mb-6 px-4 py-1.5 bg-primary/10 text-primary border-primary/20">
                  <Rocket className="w-3 h-3 mr-2" />
                  Ready to start?
                </Badge>

                <h2 className="text-4xl md:text-5xl font-bold mb-6">
                  Start your free trial today
                </h2>

                <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
                  Join thousands of teams who use TaskFlow to stay organized and productive.
                </p>

                <form onSubmit={handleSubscribe} className="max-w-md mx-auto mb-8">
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Input
                      type="email"
                      placeholder="Enter your work email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 h-12"
                      required
                    />
                    <Button
                      type="submit"
                      size="lg"
                      disabled={isSubscribing}
                      className="h-12 px-8"
                    >
                      {isSubscribing ? 'Subscribing...' : 'Get Started'}
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground mt-3">
                    Free 30-day trial • No credit card required
                  </p>
                </form>

                <div className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    <span>Enterprise security</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Check className="w-4 h-4" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4" />
                    <span>24/7 support</span>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </section>
      </Suspense>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-border">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-r from-primary to-primary/60 flex items-center justify-center">
                  <span className="text-primary-foreground font-bold text-sm">TF</span>
                </div>
                <span className="font-bold text-xl">TaskFlow</span>
              </div>
              <p className="text-muted-foreground text-sm">
                The intelligent task manager for teams and individuals.
              </p>
            </div>

            {footerSections.map((section) => (
              <div key={section.title}>
                <h4 className="font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link}>
                      <button
                        className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => scrollToSection(link.toLowerCase())}
                      >
                        {link}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} TaskFlow. All rights reserved.
            </div>

            <div className="flex items-center gap-4">
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Github className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Twitter className="w-5 h-5" />
              </button>
              <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                <Linkedin className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}