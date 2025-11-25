import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Users, BookOpen, GraduationCap, Clock } from "lucide-react";
import { ConversationData } from "@/hooks/useConversationState";

interface DataSummaryProps {
  data: ConversationData;
}

export const DataSummary = ({ data }: DataSummaryProps) => {
  const { schoolName, teachers = [], subjects = [], classes = [], workload = {} } = data;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* School Info */}
      {schoolName && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Escola
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-medium">{schoolName}</p>
          </CardContent>
        </Card>
      )}

      {/* Teachers */}
      {teachers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Professores ({teachers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-3">
                {teachers.map((teacher, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <p className="font-medium mb-2">{teacher.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {teacher.subjects.map((subject, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {subject}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Subjects */}
      {subjects.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Disciplinas ({subjects.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  {subject}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Classes */}
      {classes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-primary" />
              Turmas ({classes.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px] pr-4">
              <div className="space-y-2">
                {classes.map((cls, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card"
                  >
                    <span className="font-medium">{cls.name}</span>
                    <Badge variant="secondary">{cls.shift}</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Workload */}
      {Object.keys(workload).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Carga Horária
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[150px] pr-4">
              <div className="space-y-2">
                {Object.entries(workload).map(([subject, hours]) => (
                  <div
                    key={subject}
                    className="flex items-center justify-between p-2 rounded-lg border bg-card"
                  >
                    <span className="text-sm">{subject}</span>
                    <Badge variant="outline">{hours}h/semana</Badge>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
