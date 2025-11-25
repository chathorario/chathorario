import { Card, CardContent } from "@/components/ui/card";
import { School, Users, BookOpen, GraduationCap } from "lucide-react";

type DashboardStats = {
  schools: number;
  teachers: number;
  subjects: number;
  classes: number;
};

type StatItem = {
  label: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
};

export const StatsCards = ({ stats }: { stats: DashboardStats }) => {
  const items: StatItem[] = [
    {
      label: "Escolas",
      value: stats.schools,
      icon: School,
      color: "text-indigo-600",
      bg: "bg-indigo-50"
    },
    {
      label: "Professores",
      value: stats.teachers,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-50"
    },
    {
      label: "Disciplinas",
      value: stats.subjects,
      icon: BookOpen,
      color: "text-emerald-600",
      bg: "bg-emerald-50"
    },
    {
      label: "Turmas",
      value: stats.classes,
      icon: GraduationCap,
      color: "text-amber-600",
      bg: "bg-amber-50"
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {items.map(({ label, value, icon: Icon, color, bg }) => (
        <Card key={label} className="border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-slate-500">{label}</p>
              <p className="text-2xl font-bold text-slate-800">{value}</p>
            </div>
            <div className={`h-12 w-12 rounded-full ${bg} flex items-center justify-center`}>
              <Icon className={`h-6 w-6 ${color}`} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};