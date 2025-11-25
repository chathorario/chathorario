import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ScheduleConflict } from "@/types/schedule";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";

interface ConflictsListProps {
  conflicts: ScheduleConflict[];
}

export const ConflictsList = ({ conflicts }: ConflictsListProps) => {
  if (conflicts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-primary" />
            Validações
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="border-primary/20 bg-primary/5">
            <Info className="h-4 w-4 text-primary" />
            <AlertDescription>
              Nenhum conflito detectado! A grade está válida e pronta para uso.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const highConflicts = conflicts.filter(c => c.severity === "high");
  const mediumConflicts = conflicts.filter(c => c.severity === "medium");
  const lowConflicts = conflicts.filter(c => c.severity === "low");

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "high":
        return <AlertCircle className="h-4 w-4" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getSeverityVariant = (severity: string): "destructive" | "default" | "secondary" => {
    switch (severity) {
      case "high":
        return "destructive";
      case "medium":
        return "default";
      default:
        return "secondary";
    }
  };

  const renderConflictGroup = (title: string, conflictList: ScheduleConflict[], variant: "destructive" | "default" | "secondary") => {
    if (conflictList.length === 0) return null;

    return (
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant={variant} className="font-semibold">
            {conflictList.length}
          </Badge>
          <span className="text-sm font-medium text-muted-foreground">{title}</span>
        </div>
        <div className="space-y-2">
          {conflictList.map((conflict, index) => (
            <Alert key={index} variant={conflict.severity === "high" ? "destructive" : "default"}>
              {getSeverityIcon(conflict.severity)}
              <AlertDescription className="text-sm">
                {conflict.description}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-destructive" />
            Conflitos e Validações
          </div>
          <Badge variant="destructive" className="text-base">
            {conflicts.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-6">
            {renderConflictGroup("Conflitos Críticos", highConflicts, "destructive")}
            {renderConflictGroup("Avisos Importantes", mediumConflicts, "default")}
            {renderConflictGroup("Sugestões de Melhoria", lowConflicts, "secondary")}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
