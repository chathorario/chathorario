import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useNavigate } from "react-router-dom";
import { 
  Calendar, 
  Zap, 
  Shield, 
  Clock, 
  CheckCircle2,
  ArrowRight,
  Brain,
  Users,
  BookOpen
} from "lucide-react";
import LandingHeader from "@/components/landing/LandingHeader";
import LandingFooter from "@/components/landing/LandingFooter";
import InteractiveHero from "@/components/landing/InteractiveHero";
import NonLinearNav from "@/components/landing/NonLinearNav";

const Index = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: Zap,
      title: "Geração Automática",
      description: "Algoritmo genético inteligente cria horários otimizados em minutos"
    },
    {
      icon: Brain,
      title: "IA Integrada",
      description: "Validações automáticas e sugestões contextuais em tempo real"
    },
    {
      icon: Shield,
      title: "Validação Completa",
      description: "Impede conflitos de horários e garante consistência pedagógica"
    },
    {
      icon: Clock,
      title: "Economia de Tempo",
      description: "Reduza de dias para minutos o tempo de criação de grades horárias"
    },
    {
      icon: Users,
      title: "Gestão de Professores",
      description: "Controle completo de disponibilidade e carga horária"
    },
    {
      icon: BookOpen,
      title: "Disciplinas Flexíveis",
      description: "Configure matérias, cargas e vínculos de forma intuitiva"
    }
  ];

  const steps = [
    {
      number: "01",
      title: "Configure sua Escola",
      description: "Insira dados básicos, turnos e estrutura"
    },
    {
      number: "02",
      title: "Cadastre Professores",
      description: "Adicione docentes, disponibilidade e disciplinas"
    },
    {
      number: "03",
      title: "Defina Turmas",
      description: "Crie turmas, séries e distribua cargas horárias"
    },
    {
      number: "04",
      title: "Gere Automaticamente",
      description: "IA cria o horário perfeito em segundos"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <LandingHeader />
      <InteractiveHero />
      <NonLinearNav />

      {/* Features Section */}
      <section className="py-24 bg-muted/30" id="features">
  <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Tudo que você precisa para gerenciar horários
            </h2>
            <p className="text-lg text-muted-foreground">
              Recursos poderosos que simplificam a gestão pedagógica
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-2 hover:border-primary/50 transition-all hover:shadow-soft hover:-rotate-1">
                  <CardHeader>
                    <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6 text-primary" />
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
  <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Como funciona
            </h2>
            <p className="text-lg text-muted-foreground">
              Quatro passos simples para horários perfeitos
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 w-full">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl font-bold text-primary">{step.number}</span>
                  </div>
                  <h3 className="text-xl font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-muted -translate-x-1/2 z-0"></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Resultados Educacionais */}
      <section id="results" className="py-24 bg-muted/20">
  <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Resultados que transformam escolas</h2>
            <p className="text-lg text-muted-foreground">Impacto real na gestão pedagógica e qualidade do ensino</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 w-full">
            {[
              {
                icon: Clock,
                value: "98%",
                title: "Redução de Tempo",
                description: "De dias para minutos na criação de horários"
              },
              {
                icon: CheckCircle2,
                value: "99.7%",
                title: "Horários Livres de Conflitos",
                description: "Zero choques de professores ou sobreposições"
              },
              {
                icon: Users,
                value: "87%",
                title: "Satisfação Docente",
                description: "Professores com horários mais equilibrados"
              },
              {
                icon: Brain,
                value: "42%",
                title: "Otimização Pedagógica",
                description: "Melhor distribuição de disciplinas ao longo da semana"
              },
              {
                icon: Calendar,
                value: "100%",
                title: "Conformidade Total",
                description: "Respeito integral às cargas horárias e disponibilidades"
              },
              {
                icon: Zap,
                value: "3x",
                title: "Mais Eficiência",
                description: "Velocidade na criação de horários alternativos"
              }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="text-center p-6 rounded-xl bg-background border hover:shadow-soft transition-all">
                  <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                  <h3 className="text-lg font-semibold mb-2">{stat.title}</h3>
                  <p className="text-sm text-muted-foreground">{stat.description}</p>
                </div>
              );
            })}
          </div>
          
          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Dados baseados em implementações reais em escolas de todo o Brasil
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
  <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-bold">
              Pronto para automatizar seus horários?
            </h2>
            <p className="text-xl text-primary-foreground/90">
              Junte-se a centenas de escolas que já economizam tempo com ChatHorário
            </p>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-medium"
              onClick={() => navigate("/auth")}
            >
              Começar Agora - É Grátis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      <LandingFooter />
    </div>
  );
};

export default Index;
