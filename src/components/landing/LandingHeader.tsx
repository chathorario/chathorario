import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Compass, Map, Sparkles, TrendingUp, BookOpen } from 'lucide-react';

const LandingHeader = () => {
  const navigate = useNavigate();

  return (
    <motion.header 
      className="fixed top-0 left-0 right-0 z-50 bg-background/5 backdrop-blur-xl border-b border-border/10 supports-[backdrop-filter]:bg-background/5"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      <div className="w-full px-6 h-20 flex items-center justify-between">
        {/* Logo com microinteração premium */}
        <motion.div 
          className="flex items-center gap-3 group cursor-pointer"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        >
          <motion.img
            src="/logo/logo_chathorario_fundo_transparente_2.png"
            alt="Logo ChatHorário"
            className="h-10 w-auto"
            whileHover={{ rotate: 5, scale: 1.05 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          />
          <motion.span 
              className="text-5xl md:text-2xl lg:text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-foreground via-primary to-foreground"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1, duration: 0.8 }}
          >
            <span className="block mt-1 text-primary drop-shadow-lg"> ChatHorário</span>
           
          </motion.span>
        </motion.div>

        {/* Navegação não-linear com efeitos especiais */}
        <nav className="hidden lg:flex items-center gap-8 text-sm">
          {[
            { href: "#hero", label: "Explorar", icon: Compass, color: "text-blue-400" },
            { href: "#journey", label: "Jornada", icon: Map, color: "text-green-400" },
            { href: "#features", label: "Recursos", icon: Sparkles, color: "text-purple-400" },
            { href: "#timeline", label: "Evolução", icon: TrendingUp, color: "text-orange-400" },
            { href: "#story", label: "História", icon: BookOpen, color: "text-red-400" }
          ].map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.a
                key={item.href}
                href={item.href}
                className="relative group text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-2"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                whileHover={{ scale: 1.05 }}
              >
                <Icon className={`h-5 w-5 ${item.color} transition-colors group-hover:animate-pulse`} />
                <span className="font-medium">{item.label}</span>
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-primary to-primary/50 group-hover:w-full transition-all duration-500 rounded-full" />
              </motion.a>
            );
          })}
        </nav>

        {/* Botão de entrar com efeito premium */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.8, type: "spring", stiffness: 300 }}
        >
          <Button 
            onClick={() => navigate("/auth")}
            className="relative overflow-hidden group bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 border border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300"
            size="lg"
          >
            <span className="relative z-10 font-semibold tracking-wide">
              Entrar
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
          </Button>
        </motion.div>
      </div>
    </motion.header>
  );
};

export default LandingHeader;