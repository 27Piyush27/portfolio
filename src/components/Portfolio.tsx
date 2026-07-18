import { useState, useEffect, useRef, Suspense, lazy, memo, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LazyImage } from "@/components/LazyImage";
import { Typewriter } from "@/components/Typewriter";
import { Code2, Palette, Smartphone, Globe, Mail, Phone, Github, Linkedin, ExternalLink, ChevronDown, Menu, X, MapPin, Calendar, Award, Briefcase, GraduationCap, Send, Sparkles, Zap, Star, Brain } from "lucide-react";

// Lazy load heavy components for better performance
const Hero3D = lazy(() => import("@/components/Hero3D"));

// Loading fallback component
const LoadingSpinner = memo(() => (
  <div className="flex items-center justify-center h-64">
    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
  </div>
));

LoadingSpinner.displayName = 'LoadingSpinner';

// Memoized section component for better performance
const MemoizedSection = memo(({ id, className, children }: {
  id: string;
  className?: string;
  children: React.ReactNode;
}) => (
  <section id={id} className={className}>
    {children}
  </section>
));

MemoizedSection.displayName = 'MemoizedSection';

const Portfolio = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [scrollY, setScrollY] = useState(0);
  
  // Use refs for better performance
  const navigationRef = useRef<HTMLElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Optimized scroll handler with useCallback to prevent re-renders
  const scrollToSection = useCallback((sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: "smooth" });
    setIsMenuOpen(false);
  }, []);

  // Optimized scroll handler with throttling and Intersection Observer
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.pageYOffset;
          setScrollY(scrollTop);

          // Use Intersection Observer for better performance
          if (!observerRef.current) {
            observerRef.current = new IntersectionObserver(
              (entries) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting && entry.intersectionRatio > 0.5) {
                    setActiveSection(entry.target.id);
                  }
                });
              },
              { threshold: [0.5], rootMargin: '-50px 0px' }
            );

            // Observe all sections
            const sections = ["home", "about", "experience", "skills", "services", "projects", "certificates", "internships", "contact"];
            sections.forEach((sectionId) => {
              const element = document.getElementById(sectionId);
              if (element) observerRef.current?.observe(element);
            });
          }

          // Efficient animation handling
          const animateElements = document.querySelectorAll('.animate-on-scroll:not(.animate-in)');
          animateElements.forEach((element) => {
            const rect = element.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.8) {
              element.classList.add('animate-in');
            }
          });

          ticking = false;
        });
        ticking = true;
      }
    };

    // Optimized mouse move handler with debouncing
    let mouseTimeout: ReturnType<typeof setTimeout>;
    const handleMouseMove = (e: MouseEvent) => {
      clearTimeout(mouseTimeout);
      mouseTimeout = setTimeout(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        
        // Magnetic effect with requestAnimationFrame for smooth performance
        const magneticElements = document.querySelectorAll('.magnetic-btn');
        magneticElements.forEach((element) => {
          const rect = element.getBoundingClientRect();
          const elementCenterX = rect.left + rect.width / 2;
          const elementCenterY = rect.top + rect.height / 2;
          const distance = Math.sqrt(
            Math.pow(e.clientX - elementCenterX, 2) + Math.pow(e.clientY - elementCenterY, 2)
          );
          
          requestAnimationFrame(() => {
            if (distance < 100) {
              const strength = (100 - distance) / 100;
              const deltaX = (e.clientX - elementCenterX) * strength * 0.2;
              const deltaY = (e.clientY - elementCenterY) * strength * 0.2;
              (element as HTMLElement).style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.02)`;
            } else {
              (element as HTMLElement).style.transform = 'translate(0px, 0px) scale(1)';
            }
          });
        });
      }, 10);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    
    // Initial scroll check
    handleScroll();
    
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("mousemove", handleMouseMove);
      observerRef.current?.disconnect();
      clearTimeout(mouseTimeout);
    };
  }, []);

  // Memoized data to prevent unnecessary re-renders
  const navigation = useMemo(() => [
    { name: "Home", href: "home" },
    { name: "About", href: "about" },
    { name: "Experience", href: "experience" },
    { name: "Skills", href: "skills" },
    { name: "Services", href: "services" },
    { name: "Projects", href: "projects" },
    { name: "Certificates", href: "certificates" },
    { name: "Internships", href: "internships" },
    { name: "Contact", href: "contact" }
  ], []);

  const skills = useMemo(() => [
    { category: "Languages", items: ["C++", "C", "Python", "MATLAB", "HTML", "CSS", "JavaScript"] },
    { category: "Frameworks", items: ["React", "MERN Stack", "Git", "GitHub"] },
    { category: "Expertise", items: ["Frontend Development", "Backend Development", "UI/UX Design", "AI & ML", "DSA", "OS", "CN", "Compiler Design"] }
  ], []);

  const services = useMemo(() => [
    {
      icon: <Palette className="h-8 w-8" />,
      title: "UI/UX Design",
      description: "Creating intuitive and visually appealing user interfaces that enhance user experience and drive engagement."
    },
    {
      icon: <Code2 className="h-8 w-8" />,
      title: "Frontend Development",
      description: "Building responsive and interactive web applications using modern frameworks like React and cutting-edge technologies."
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: "AI/ML & Data Analytics",
      description: "Developing intelligent solutions using machine learning algorithms and providing data-driven insights for informed decision making."
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: "Backend Development",
      description: "Developing robust server-side applications with secure APIs and efficient database management systems."
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: "Full Stack Development",
      description: "End-to-end web development solutions combining frontend and backend technologies for complete digital products."
    }
  ], []);

  const projects = useMemo(() => [
    {
      title: "House Price Prediction",
      description: "A machine learning model that estimates real estate prices based on various features like location, size, and amenities.",
      tech: ["Python", "ML", "Data Analysis"],
      image: "/api/placeholder/400/250"
    },
    {
      title: "E-commerce Website",
      description: "A fully functional online store with frontend and backend integration, featuring user authentication and payment processing.",
      tech: ["React", "Node.js", "MongoDB"],
      image: "/api/placeholder/400/250"
    }
  ], []);

  return (
    <div className="min-h-screen bg-background">
      {/* Optimized Navigation */}
      <nav 
        ref={navigationRef}
        className="fixed top-0 w-full bg-background/90 backdrop-blur-sm z-50 border-b border-border transition-transform duration-300"
        style={{ transform: `translateY(${Math.max(-100, scrollY * -0.05)}px)` }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div 
              className="font-bold text-xl gradient-text cursor-pointer transition-transform hover:scale-105" 
              onClick={() => scrollToSection('home')}
            >
              Piyush Thakur
            </div>
            
            {/* Desktop Navigation */}
            <div className="hidden md:flex space-x-6">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className={`px-3 py-2 text-sm font-medium transition-all duration-200 relative ${
                    activeSection === item.href 
                      ? "text-primary" 
                      : "text-muted-foreground hover:text-primary"
                  }`}
                >
                  {item.name}
                  {activeSection === item.href && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary animate-fade-in" />
                  )}
                </button>
              ))}
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="p-2 rounded-md text-muted-foreground hover:text-primary transition-colors"
                aria-label="Toggle menu"
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-background/95 backdrop-blur-sm border-b border-border animate-fade-in">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block px-3 py-2 text-base font-medium text-muted-foreground hover:text-primary w-full text-left transition-colors"
                >
                  {item.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Optimized Hero Section */}
      <MemoizedSection id="home" className="relative min-h-screen flex items-center overflow-hidden animate-on-scroll">
        {/* Simplified Background Elements */}
        <div className="absolute inset-0 gradient-bg opacity-5" />
        
        {/* Lazy-loaded 3D Background */}
        <div className="absolute inset-0 opacity-20">
          <Suspense fallback={<LoadingSpinner />}>
            <Hero3D />
          </Suspense>
        </div>
        
        <div className="relative z-10 max-w-7xl mx-auto w-full section-padding pt-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              {/* Glass Card with Content */}
              <div className="glass-card rounded-2xl p-8 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-6 w-6 text-accent animate-pulse" />
                    <span className="text-accent font-medium">Available for Freelance</span>
                  </div>
                  
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight">
                    Hi, I'm{" "}
                    <span className="text-primary">Piyush Thakur</span>
                  </h1>
                  
                  <div className="text-xl sm:text-2xl lg:text-3xl font-medium text-muted-foreground min-h-[3rem]">
                    <Typewriter 
                      texts={["UI/UX Designer", "Web Developer", "Full Stack Developer", "Problem Solver"]} 
                      speed={100} 
                      deleteSpeed={50} 
                      pauseDuration={2000} 
                    />
                  </div>
                </div>
                
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed">
                  Passionate about creating digital experiences that matter. Currently pursuing B.Tech at JUIT Solan, 
                  I specialize in full-stack development, AI/ML, and data analytics.
                </p>
                
                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 py-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">2+</div>
                    <div className="text-sm text-muted-foreground">Years Experience</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">15+</div>
                    <div className="text-sm text-muted-foreground">Projects Done</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary">5+</div>
                    <div className="text-sm text-muted-foreground">Happy Clients</div>
                  </div>
                </div>
                
                {/* Enhanced Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    onClick={() => scrollToSection("projects")} 
                    className="btn-modern text-primary-foreground px-8 py-4 text-lg font-semibold magnetic-btn group"
                  >
                    <Zap className="h-5 w-5 mr-2 group-hover:animate-pulse" />
                    View My Work
                  </Button>
                  <Button 
                    onClick={() => scrollToSection("contact")} 
                    variant="outline" 
                    className="glass-enhanced border-2 border-primary/30 hover:border-primary px-8 py-4 text-lg font-semibold magnetic-btn group"
                  >
                    <Send className="h-5 w-5 mr-2 group-hover:translate-x-1 transition-transform" />
                    Let's Talk
                  </Button>
                </div>
              </div>
            </div>
            
            {/* Right Side - Optimized Avatar */}
            <div className="flex justify-center lg:justify-end relative">
              <div className="relative w-full max-w-lg">
                <div className="aspect-square relative">
                  <div className="absolute inset-0 rounded-full gradient-bg p-2 floating-1">
                    <div className="w-full h-full rounded-full bg-background flex items-center justify-center shadow-elegant">
                      <div className="w-4/5 h-4/5 rounded-full bg-gradient-to-br from-primary via-tech-purple to-tech-emerald flex items-center justify-center text-white relative overflow-hidden">
                        <span className="relative z-10 text-6xl font-serif font-bold">PT</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Tech Icons */}
                  <div className="absolute -top-8 -right-8 p-4 glass-card rounded-2xl floating-2">
                    <Code2 className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute top-1/2 -left-10 p-4 glass-card rounded-2xl floating-3">
                    <Palette className="h-8 w-8 text-accent" />
                  </div>
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 p-4 glass-card rounded-2xl floating-1">
                    <Brain className="h-8 w-8 text-tech-emerald" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
          <div className="animate-bounce cursor-pointer" onClick={() => scrollToSection('about')}>
            <ChevronDown className="h-8 w-8 text-muted-foreground mx-auto" />
          </div>
        </div>
      </MemoizedSection>

      {/* Contact Section */}
      <MemoizedSection id="contact" className="section-padding bg-section-bg animate-on-scroll">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-serif font-bold mb-6 text-gradient">Get In Touch</h2>
          <p className="text-lg text-muted-foreground mb-12 max-w-2xl mx-auto">
            Ready to bring your ideas to life? Let's discuss your next project and create something amazing together.
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <Card className="glass-card p-6 text-center group hover:scale-105 transition-transform">
              <Mail className="h-8 w-8 mx-auto mb-4 text-primary group-hover:animate-pulse" />
              <h3 className="font-semibold mb-2">Email</h3>
              <p className="text-muted-foreground text-sm">27piyushthakur27@gmail.com</p>
            </Card>
            
            <Card className="glass-card p-6 text-center group hover:scale-105 transition-transform">
              <Phone className="h-8 w-8 mx-auto mb-4 text-primary group-hover:animate-pulse" />
              <h3 className="font-semibold mb-2">Phone</h3>
              <p className="text-muted-foreground text-sm">+91 8219806476</p>
            </Card>
            
            <Card className="glass-card p-6 text-center group hover:scale-105 transition-transform">
              <MapPin className="h-8 w-8 mx-auto mb-4 text-primary group-hover:animate-pulse" />
              <h3 className="font-semibold mb-2">Location</h3>
              <p className="text-muted-foreground text-sm">JUIT Solan, Himachal Pradesh</p>
            </Card>
          </div>
          
          <div className="flex justify-center gap-6">
            <a href="mailto:27piyushthakur27@gmail.com" className="magnetic-btn">
              <Button className="btn-modern px-8 py-4 text-lg font-semibold">
                <Mail className="h-5 w-5 mr-2" />
                Send Email
              </Button>
            </a>
            <a href="https://linkedin.com/in/piyush-thakur-952364296" className="magnetic-btn">
              <Button variant="outline" className="glass-enhanced px-8 py-4 text-lg font-semibold">
                <Linkedin className="h-5 w-5 mr-2" />
                LinkedIn
              </Button>
            </a>
          </div>
        </div>
      </MemoizedSection>
    </div>
  );
};

export default Portfolio;