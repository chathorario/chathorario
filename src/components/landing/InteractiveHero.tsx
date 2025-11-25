import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight, Play, Sparkles, BookOpen, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

const InteractiveHero = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId = 0;
    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    // Advanced particle system with multiple types
    const particles = Array.from({ length: 300 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      r: Math.random() * 3 + 1,
      type: Math.floor(Math.random() * 3),
      opacity: Math.random() * 0.8 + 0.2,
      rotation: Math.random() * Math.PI * 2,
      spin: (Math.random() - 0.5) * 0.02,
    }));

    const mouse = { x: width / 2, y: height / 2, active: false };
    const scrollY = { value: 0 };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };

    const onMouseLeave = () => {
      mouse.active = false;
    };

    const onScroll = () => {
      scrollY.value = window.scrollY;
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("scroll", onScroll);

    // Complex gradient system
    const createGradient = (ctx: CanvasRenderingContext2D) => {
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, "rgba(15, 23, 42, 0.95)");
      gradient.addColorStop(0.3, "rgba(30, 41, 59, 0.9)");
      gradient.addColorStop(0.6, "rgba(51, 65, 85, 0.85)");
      gradient.addColorStop(1, "rgba(71, 85, 105, 0.8)");
      return gradient;
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      
      // Dynamic background with parallax effect
      ctx.fillStyle = createGradient(ctx);
      ctx.fillRect(0, 0, width, height);

      // 6-layer parallax system with different behaviors
      for (let layer = 0; layer < 6; layer++) {
        const parallaxFactor = (layer + 1) * 0.015;
        const scrollFactor = (layer + 1) * 0.0005;
        const sizeFactor = 1 - layer * 0.1;
        
        const offsetX = (mouse.x - width / 2) * parallaxFactor;
        const offsetY = (mouse.y - height / 2) * parallaxFactor + scrollY.value * scrollFactor;
        
        ctx.fillStyle = `rgba(120, 140, 180, ${0.08 + layer * 0.012})`;
        
        // Different shapes for different layers
        if (layer % 2 === 0) {
          // Elliptical shapes
          ctx.beginPath();
          ctx.ellipse(
            width / 2 + offsetX, 
            height / 2 + offsetY, 
            300 * sizeFactor, 
            180 * sizeFactor, 
            layer * 0.2, 
            0, 
            Math.PI * 2
          );
          ctx.fill();
        } else {
          // Rectangular shapes with rotation
          ctx.save();
          ctx.translate(width / 2 + offsetX, height / 2 + offsetY);
          ctx.rotate(layer * 0.3);
          ctx.fillRect(-150 * sizeFactor, -90 * sizeFactor, 300 * sizeFactor, 180 * sizeFactor);
          ctx.restore();
        }
      }

      // Interactive particles with physics
      particles.forEach((p) => {
        if (mouse.active) {
          const dx = mouse.x - p.x;
          const dy = mouse.y - p.y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = Math.min(30 / dist, 0.8);
          
          // Different behavior based on particle type
          switch (p.type) {
            case 0: // Attractive particles
              p.vx += dx * force * 0.01;
              p.vy += dy * force * 0.01;
              break;
            case 1: // Repulsive particles
              p.vx -= dx * force * 0.008;
              p.vy -= dy * force * 0.008;
              break;
            case 2: // Orbital particles
              p.vx += dy * force * 0.005;
              p.vy -= dx * force * 0.005;
              break;
          }
        }

        // Physics and constraints
        p.vx *= 0.97;
        p.vy *= 0.97;
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.spin;

        // Boundary wrapping with bounce effect
        if (p.x < -p.r) p.x = width + p.r;
        if (p.x > width + p.r) p.x = -p.r;
        if (p.y < -p.r) p.y = height + p.r;
        if (p.y > height + p.r) p.y = -p.r;

        // Draw particles based on type
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        
        switch (p.type) {
          case 0: // Circle particles (knowledge)
            ctx.fillStyle = `rgba(100, 200, 255, ${p.opacity})`;
            ctx.beginPath();
            ctx.arc(0, 0, p.r, 0, Math.PI * 2);
            ctx.fill();
            break;
          case 1: // Square particles (time)
            ctx.fillStyle = `rgba(255, 200, 100, ${p.opacity})`;
            ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2);
            break;
          case 2: // Diamond particles (education)
            ctx.fillStyle = `rgba(200, 100, 255, ${p.opacity})`;
            ctx.beginPath();
            ctx.moveTo(0, -p.r);
            ctx.lineTo(p.r, 0);
            ctx.lineTo(0, p.r);
            ctx.lineTo(-p.r, 0);
            ctx.closePath();
            ctx.fill();
            break;
        }
        
        ctx.restore();
      });

      // Subtle grid overlay for educational theme
      ctx.strokeStyle = "rgba(255, 255, 255, 0.03)";
      ctx.lineWidth = 1;
      
      for (let x = 0; x < width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      
      for (let y = 0; y < height; y += 40) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  const handlePlayDemo = () => {
    setIsPlaying(true);
    // Simulate demo playback
    setTimeout(() => setIsPlaying(false), 3000);
  };

  return (
    <section
      id="hero"
      className="relative h-screen overflow-hidden"
      style={{
        marginTop: '80px',
        marginLeft: '0px',
        marginRight: 'auto',
        backgroundImage: 'url(/fundo_hero/fundo_hero_6.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ zIndex: 1, opacity: 0.3 }} // Reduzindo opacidade para 30% para maior nitidez da imagem
      />
      
      <div ref={containerRef} className="relative z-10 h-full flex items-center justify-end">
        <div className="w-full px-4 sm:px-6 lg:px-10 text-right">
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, ease: "easeOut" }}
            className="space-y-8"
          >
            {/* Animated title with educational icons */}
            <motion.div
              className="flex justify-end items-center gap-4 mb-6"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              <BookOpen className="h-12 w-12 text-primary animate-pulse" />
              <Clock className="h-12 w-12 text-primary animate-pulse" style={{ animationDelay: "0.2s" }} />
              <Sparkles className="h-12 w-12 text-primary animate-pulse" style={{ animationDelay: "0.4s" }} />
            </motion.div>

            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 1 }}
            >
              Revolução na
              <span className="block mt-4 text-primary drop-shadow-lg">Gestão Escolar</span>
            </motion.h1>

            <motion.p
              className="text-5xl md:text-2xl lg:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              Uma experiência imersiva onde o tempo se transforma em conhecimento <br />
              e a organização se torna uma jornada visual fascinante.
            </motion.p>

            {/* Interactive CTA buttons */}
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-end items-end mt-12"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
            >
              <Button
                size="lg"
                className="px-8 py-6 text-lg font-semibold rounded-full bg-primary hover:bg-primary/90 transition-all duration-300 transform hover:scale-105 shadow-2xl"
                onClick={() => navigate("/auth")}
              >
                <Sparkles className="mr-3 h-6 w-6" />
                Iniciar Jornada
                <ArrowRight className="ml-3 h-6 w-6" />
              </Button>
              
              <Button
                size="lg"
                variant="outline"
                className="px-8 py-6 text-lg font-semibold rounded-full border-2 transition-all duration-300 hover:bg-accent/10 transform hover:scale-105"
                onClick={handlePlayDemo}
                disabled={isPlaying}
              >
                <Play className="mr-3 h-5 w-5" />
                {isPlaying ? "Experienciando..." : "Ver Experiência"}
              </Button>
            </motion.div>

            {/* Subtle educational elements floating */}
            <motion.div
              className="absolute top-1/4 left-10 opacity-40"
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              📚
            </motion.div>
            <motion.div
              className="absolute top-1/3 right-16 opacity-30"
              initial={{ y: 0 }}
              animate={{ y: [0, -20, 0] }}
              transition={{ duration: 4, repeat: Infinity }}
            >
              ⏰
            </motion.div>
            <motion.div
              className="absolute bottom-1/4 left-20 opacity-50"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              🎓
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <motion.div
          className="w-6 h-10 border-2 border-primary rounded-full flex justify-center"
          initial={{ y: 0 }}
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <motion.div
            className="w-1 h-3 bg-primary rounded-full mt-2"
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </motion.div>
      </motion.div>
    </section>
  );
};

export default InteractiveHero;