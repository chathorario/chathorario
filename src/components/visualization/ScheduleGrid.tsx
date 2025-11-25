import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Schedule, ViewMode, ScheduleEntry } from "@/types/schedule";
import { Calendar, User, AlertCircle, Download, FileText, FileSpreadsheet, Search } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { exportToPDF, exportToCSV } from "@/services/exportService";
import { toast } from "sonner";

interface ScheduleGridProps {
  schedule: Schedule;
}

const DAYS = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta"];
const PERIODS = [1, 2, 3, 4, 5, 6];

export const ScheduleGrid = ({ schedule }: ScheduleGridProps) => {
  const [viewMode, setViewMode] = useState<ViewMode>("by-class");
  const [selectedFilter, setSelectedFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Get unique classes and teachers
  const classes = [...new Set(schedule.entries.map(e => e.className))];
  const teachers = [...new Set(schedule.entries.map(e => e.teacherName))];

  // Filter classes/teachers based on search
  const filteredItems = (viewMode === "by-class" ? classes : teachers).filter(item =>
    item.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleExportPDF = () => {
    const currentFilter = selectedFilter || filteredItems[0];
    exportToPDF(schedule, viewMode, currentFilter);
    toast.success("PDF exportado com sucesso!");
  };

  const handleExportCSV = () => {
    const currentFilter = selectedFilter || filteredItems[0];
    exportToCSV(schedule, viewMode, currentFilter);
    toast.success("CSV exportado com sucesso!");
  };

  const getEntriesForCell = (day: string, period: number, filter: string): ScheduleEntry[] => {
    return schedule.entries.filter(entry => {
      const matchesSlot = entry.timeSlot.day === day && entry.timeSlot.period === period;
      
      if (viewMode === "by-class") {
        return matchesSlot && entry.className === filter;
      } else {
        return matchesSlot && entry.teacherName === filter;
      }
    });
  };

  const renderGrid = (filter: string) => (
    <div className="border rounded-lg overflow-hidden">
      <ScrollArea className="w-full">
        <table className="w-full border-collapse min-w-[700px]">
          <thead>
            <tr className="bg-muted">
              <th className="border p-3 text-left font-semibold w-32">Horário</th>
              {DAYS.map(day => (
                <th key={day} className="border p-3 text-center font-semibold">
                  {day}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERIODS.map(period => (
              <tr key={period} className="hover:bg-accent/50 transition-colors">
                <td className="border p-3 font-medium bg-muted/50">
                  {period}º horário
                </td>
                {DAYS.map(day => {
                  const entries = getEntriesForCell(day, period, filter);
                  return (
                    <td key={`${day}-${period}`} className="border p-2">
                      {entries.length > 0 ? (
                        <div className="space-y-1">
                          {entries.map(entry => (
                            <div
                              key={entry.id}
                              className="p-2 rounded-md bg-primary/10 border border-primary/20 hover:bg-primary/20 transition-colors"
                            >
                              <p className="text-xs font-semibold text-primary">
                                {entry.subjectName}
                              </p>
                              <p className="text-xs text-muted-foreground mt-0.5">
                                {viewMode === "by-class" ? entry.teacherName : entry.className}
                              </p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center text-muted-foreground text-xs py-4">
                          -
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </ScrollArea>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Grade de Horários
            </CardTitle>
            <div className="flex gap-2">
              <Button
                variant={viewMode === "by-class" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("by-class");
                  setSearchTerm("");
                  setSelectedFilter("");
                }}
              >
                Por Turma
              </Button>
              <Button
                variant={viewMode === "by-teacher" ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setViewMode("by-teacher");
                  setSearchTerm("");
                  setSelectedFilter("");
                }}
              >
                Por Professor
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={`Buscar ${viewMode === "by-class" ? "turma" : "professor"}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              className="gap-2"
            >
              <FileText className="h-4 w-4" />
              Exportar PDF
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportCSV}
              className="gap-2"
            >
              <FileSpreadsheet className="h-4 w-4" />
              Exportar CSV
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Alert */}
      {schedule.conflicts && schedule.conflicts.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {schedule.conflicts.length} conflito(s) detectado(s). Revise a grade antes de finalizar.
          </AlertDescription>
        </Alert>
      )}

      {/* Score Badge */}
      {schedule.fitnessScore !== undefined && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Qualidade da grade:</span>
          <Badge variant={schedule.fitnessScore > 80 ? "default" : "secondary"}>
            {schedule.fitnessScore.toFixed(1)}%
          </Badge>
        </div>
      )}

      {/* Schedule Tabs */}
      {filteredItems.length > 0 ? (
        <Tabs
          value={selectedFilter || filteredItems[0]}
          onValueChange={setSelectedFilter}
        >
          <ScrollArea className="w-full">
            <TabsList className="inline-flex h-auto flex-wrap gap-2 bg-transparent p-0">
              {filteredItems.map(item => (
                <TabsTrigger
                  key={item}
                  value={item}
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  {viewMode === "by-class" ? (
                    <Calendar className="h-4 w-4 mr-2" />
                  ) : (
                    <User className="h-4 w-4 mr-2" />
                  )}
                  {item}
                </TabsTrigger>
              ))}
            </TabsList>
          </ScrollArea>

          {filteredItems.map(item => (
            <TabsContent key={item} value={item} className="mt-4">
              {renderGrid(item)}
            </TabsContent>
          ))}
        </Tabs>
      ) : (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            Nenhum resultado encontrado para "{searchTerm}"
          </CardContent>
        </Card>
      )}
    </div>
  );
};
