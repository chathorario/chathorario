import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Compass, Map, Navigation, Globe, BookOpen, Clock, Sparkles, Brain } from "lucide-react";

interface NavigationNode {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
  position: { x: number; y: number };
  connections: string[];
  color: string;
}

const navigationMap: NavigationNode[] = [
  {
    id: "story",
    label: "Jornada",
    icon: <Compass className="h-8 w-8" />,
    description: "Descubra nossa história educacional",
    position: { x: 25, y: 35 },
    connections: ["features", "timeline"],
    color: "bg-blue-500"
  },
  {
    id: "features",
    label: "Recursos",
    icon: <Sparkles className="h-8 w-8" />,
    description: "Explorar funcionalidades mágicas",
    position: { x: 10, y: 10 },
    connections: ["story", "technology"],
    color: "bg-purple-500"
  },
  {
    id: "timeline",
    label: "Evolução",
    icon: <Clock className="h-8 w-8" />,
    description: "Linha do tempo interativa",
    position: { x: 75, y: 20 },
    connections: ["story", "impact"],
    color: "bg-green-500"
  },
  {
    id: "technology",
    label: "Tecnologia",
    icon: <Brain className="h-8 w-8" />,
    description: "IA e inovação educacional",
    position: { x: 40, y: 10 },
    connections: ["features", "impact"],
    color: "bg-orange-500"
  },
  {
    id: "impact",
    label: "Impacto",
    icon: <Globe className="h-8 w-8" />,
    description: "Transformação educacional",
    position: { x: 60, y: 50 },
    connections: ["timeline", "technology"],
    color: "bg-red-500"
  }
];

const NonLinearNav = () => {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [isExploring, setIsExploring] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const goTo = (id: string) => {
    setSelectedNode(id);
    setIsExploring(true);
    
    // Simulate navigation delay for dramatic effect
    setTimeout(() => {
      const target = document.getElementById(id);
      if (target) {
        target.scrollIntoView({ 
          behavior: "smooth", 
          block: "start" 
        });
      }
      setTimeout(() => setIsExploring(false), 1000);
    }, 800);
  };

  const handleWheelNavigation = (e: React.WheelEvent) => {
    if (!containerRef.current) return;
    
    // Calculate navigation direction based on wheel delta
    const delta = e.deltaY > 0 ? 1 : -1;
    const currentIndex = navigationMap.findIndex(node => node.id === selectedNode);
    
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + delta + navigationMap.length) % navigationMap.length;
      goTo(navigationMap[nextIndex].id);
    }
  };

  return (
    <section 
      aria-label="Sistema de navegação espacial não-linear" 
      className="relative min-h-[500px] overflow-hidden bg-gradient-to-br from-muted/10 to-background/50 rounded-2xl border-2 border-primary/20"
      onWheel={handleWheelNavigation}
    >
      {/* Background grid for spatial reference */}
      <div className="absolute inset-0 opacity-20">
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute w-px h-full bg-primary"
            style={{ left: `${i * 5}%` }}
          />
        ))}
        {Array.from({ length: 20 }, (_, i) => (
          <div
            key={i}
            className="absolute h-px w-full bg-primary"
            style={{ top: `${i * 5}%` }}
          />
        ))}
      </div>

      {/* 3D Navigation Map Container */}
      <div 
        ref={containerRef}
        className="relative w-full h-full min-h-[500px] perspective-1000"
      >
        <AnimatePresence>
          {isExploring && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="absolute inset-0 flex items-center justify-center z-50"
            >
              <div className="text-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"
                />
                <p className="text-lg font-semibold text-primary">
                  Navegando para o espaço {selectedNode?.toUpperCase()}...
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Nodes */}
        {navigationMap.map((node) => (
          <motion.button
            key={node.id}
            onClick={() => goTo(node.id)}
            className={`absolute transform -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 border-2 transition-all duration-500 hover:scale-110 hover:shadow-2xl ${
              selectedNode === node.id 
                ? `${node.color} text-white border-white shadow-xl scale-110`
                : 'bg-background/80 text-foreground border-primary/30 hover:border-primary/60'
            }`}
            style={{
              left: `${node.position.x}%`,
              top: `${node.position.y}%`,
            }}
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, type: "spring", bounce: 0.5 }}
            whileHover={{ 
              scale: 1.1,
              transition: { duration: 0.2 } 
            }}
            whileTap={{ scale: 0.95 }}
          >
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                {node.icon}
              </div>
              <h3 className="font-bold text-lg">{node.label}</h3>
              <p className="text-sm opacity-70 max-w-[120px]">{node.description}</p>
              
              {/* Connection indicator */}
              <div className="flex justify-center space-x-1">
                {node.connections.map((conn, index) => (
                  <div
                    key={index}
                    className="w-2 h-2 rounded-full bg-primary/50"
                  />
                ))}
              </div>
            </div>
          </motion.button>
        ))}

        {/* Connection Lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {navigationMap.map((node) =>
            node.connections.map((targetId) => {
              const targetNode = navigationMap.find(n => n.id === targetId);
              if (!targetNode) return null;
              
              return (
                <motion.line
                  key={`${node.id}-${targetId}`}
                  x1={`${node.position.x}%`}
                  y1={`${node.position.y}%`}
                  x2={`${targetNode.position.x}%`}
                  y2={`${targetNode.position.y}%`}
                  stroke="url(#gradient)"
                  strokeWidth="2"
                  strokeDasharray="5,5"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              );
            })
          )}
        </svg>

        {/* SVG Gradient for connections */}
        <svg className="absolute w-0 h-0">
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" />
              <stop offset="50%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#ec4899" />
            </linearGradient>
          </defs>
        </svg>

        {/* Floating educational elements */}
        <motion.div
          className="absolute top-10 right-10 text-4xl opacity-30"
          animate={{ 
            y: [0, -15, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ duration: 4, repeat: Infinity }}
        >
          🧭
        </motion.div>
        
        <motion.div
          className="absolute bottom-20 left-8 text-3xl opacity-40"
          animate={{ 
            x: [0, 10, 0],
            rotate: [0, 10, -10, 0]
          }}
          transition={{ duration: 3, repeat: Infinity, delay: 1 }}
        >
          🗺️
        </motion.div>

        <motion.div
          className="absolute top-1/2 left-1/4 text-2xl opacity-50"
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360]
          }}
          transition={{ duration: 6, repeat: Infinity }}
        >
          🌟
        </motion.div>

        {/* Navigation Instructions */}
        <motion.div
          className="absolute bottom-6 left-1/2 transform -translate-x-1/2 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <Navigation className="h-5 w-5 mx-auto mb-1" />
          <p>Use a roda do mouse para navegar ou clique nos nós para explorar</p>
        </motion.div>
      </div>

      {/* Ambient audio control (visual only) */}
      <motion.button
        className="absolute top-4 right-4 p-3 rounded-full bg-background/80 border border-primary/30 hover:border-primary/60 transition-colors"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-2xl">🎵</span>
      </motion.button>
    </section>
  );
};

export default NonLinearNav;