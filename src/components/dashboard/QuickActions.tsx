import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Users, BookOpen, GraduationCap, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";

type ActionItem = {
  label: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  to: string;
  variant?: "default" | "outline";
};

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions: ActionItem[] = [
    {
      label: "Cadastrar Professores",
      description: "Gerencie docentes e seus vínculos",
      icon: Users,
      to: "/teachers",
    },
    {
      label: "Definir Disciplinas",
      description: "Organize matérias por etapas e áreas",
      icon: BookOpen,
      to: "/subjects",
      variant: "outline",
    },
    {
      label: "Criar Turmas",
      description: "Estruture turmas por escola e série",
      icon: GraduationCap,
      to: "/classes",
    },
  ];

  return (
    <div className="grid md:grid-cols-2 gap-4">
      {actions.map(({ label, description, icon: Icon, to, variant }) => (
        <Card key={label} className="card-edu hover:shadow-lg transition-smooth hover-scale">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">{label}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Button className="w-full" variant={variant ?? "default"} onClick={() => navigate(to)}>
              Acessar
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};