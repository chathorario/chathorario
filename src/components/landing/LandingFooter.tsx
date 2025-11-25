import { motion } from "framer-motion";

const LandingFooter = () => {
  return (
    <motion.footer 
      className="relative border-t border-border/20 bg-gradient-to-b from-background/50 to-background/80 backdrop-blur-3xl"
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.8, ease: "easeOut" }}
    >
      {/* Elemento decorativo sutil */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      
      <div className="w-full px-6 py-20">
        {/* Grid principal com layout orgânico */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Brand Section - Premium */}
          <motion.div 
            className="lg:col-span-4"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center gap-3 mb-6 group cursor-pointer">
              <motion.div 
                className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center border border-primary/20 shadow-lg"
                whileHover={{ rotate: 2, scale: 1.05 }}
                transition={{ type: "spring", stiffness: 400 }}
              >
                <span className="text-primary font-bold text-xl tracking-tighter">CH</span>
              </motion.div>
              <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                ChatHorário
              </span>
            </div>
            
            <p className="text-muted-foreground text-sm leading-relaxed mb-6 max-w-md">
              Plataforma SaaS revolucionária de gestão de horários escolares. 
              Combinamos inteligência artificial com pedagogia avançada para criar 
              experiências educacionais otimizadas e consistentes.
            </p>
            
            {/* Social Links com microinterações */}
            <div className="flex items-center gap-4">
              {[
                { name: "Twitter", icon: "🐦", url: "#" },
                { name: "LinkedIn", icon: "💼", url: "#" },
                { name: "GitHub", icon: "🐙", url: "#" },
                { name: "Discord", icon: "💬", url: "#" }
              ].map((social, index) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  className="h-10 w-10 rounded-full bg-background border border-border/30 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 group relative"
                  whileHover={{ y: -2, scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <span className="text-sm">{social.icon}</span>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-full" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Product Section */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <h4 className="font-semibold text-foreground mb-6 text-lg flex items-center gap-2">
              <span>📦</span> Produto
            </h4>
            <ul className="space-y-4 text-sm">
              {[
                { label: "Recursos Avançados", href: "#features", emoji: "✨" },
                { label: "Inteligência Artificial", href: "#ai", emoji: "🧠" },
                { label: "Dashboard Analytics", href: "#analytics", emoji: "📊" },
                { label: "Integrações", href: "#integrations", emoji: "🔌" },
                { label: "API Developer", href: "#api", emoji: "⚙️" },
                { label: "Planos & Preços", href: "#pricing", emoji: "💰" }
              ].map((item, index) => (
                <motion.li key={item.href} 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.05 + 0.4 }}
                >
                  <a 
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-all duration-300 flex items-center gap-3 group"
                  >
                    <span className="text-xs opacity-70 group-hover:opacity-100">{item.emoji}</span>
                    <span className="relative">
                      {item.label}
                      <span className="absolute -bottom-1 left-0 w-0 h-px bg-primary group-hover:w-full transition-all duration-500" />
                    </span>
                  </a>
                </motion.li>
              ))}
            </ul>
          </motion.div>

          {/* Company Section */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <h4 className="font-semibold text-foreground mb-6 text-lg flex items-center gap-2">
              <span>🏢</span> Empresa
            </h4>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-4">Institucional</h5>
                <ul className="space-y-3 text-sm">
                  {[
                    { label: "Sobre Nós", href: "#about" },
                    { label: "Nossa Missão", href: "#mission" },
                    { label: "Equipe", href: "#team" },
                    { label: "Investidores", href: "#investors" },
                    { label: "Blog", href: "#blog" }
                  ].map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-4">Carreiras</h5>
                <ul className="space-y-3 text-sm">
                  {[
                    { label: "Vagas", href: "#jobs" },
                    { label: "Cultura", href: "#culture" },
                    { label: "Benefícios", href: "#benefits" },
                    { label: "Estágios", href: "#internships" }
                  ].map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>

          {/* Legal & Support Section */}
          <motion.div 
            className="lg:col-span-3"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4 }}
          >
            <h4 className="font-semibold text-foreground mb-6 text-lg flex items-center gap-2">
              <span>⚖️</span> Suporte
            </h4>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-4">Legal</h5>
                <ul className="space-y-3 text-sm">
                  {[
                    { label: "Privacidade", href: "#privacy" },
                    { label: "Termos de Uso", href: "#terms" },
                    { label: "Cookies", href: "#cookies" },
                    { label: "LGPD", href: "#lgpd" },
                    { label: "Segurança", href: "#security" }
                  ].map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-sm text-muted-foreground mb-4">Ajuda</h5>
                <ul className="space-y-3 text-sm">
                  {[
                    { label: "Documentação", href: "#docs" },
                    { label: "Tutoriais", href: "#tutorials" },
                    { label: "FAQ", href: "#faq" },
                    { label: "Contato", href: "#contact" },
                    { label: "Status", href: "#status" }
                  ].map((item) => (
                    <li key={item.href}>
                      <a href={item.href} className="text-muted-foreground hover:text-foreground transition-colors">
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom Bar - Premium */}
        <motion.div 
          className="mt-16 pt-8 border-t border-border/10 flex flex-col lg:flex-row items-center justify-between gap-4 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <div className="flex items-center gap-6">
            <span>© {new Date().getFullYear()} ChatHorário Technologies</span>
            <span className="hidden md:inline">•</span>
            <span className="hidden md:inline">Transformando a educação através da tecnologia</span>
          </div>
          
          <div className="flex items-center gap-6">
            <span>🇧🇷 Feito no Brasil</span>
            <span>•</span>
            <span>v2.0.0</span>
            <span>•</span>
            <a href="#changelog" className="hover:text-foreground transition-colors">
              Changelog
            </a>
          </div>
        </motion.div>
      </div>
    </motion.footer>
  );
};

export default LandingFooter;