import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, BookOpen, Clock, CheckCircle2 } from "lucide-react";

export default function Subjects() {
  const subjects = [
    { 
      id: 1, 
      name: "Cálculo Diferencial", 
      professor: "Dr. García", 
      schedule: "Lun, Mié 10:00-12:00",
      color: "bg-blue-500",
      totalTasks: 8,
      completedTasks: 6
    },
    { 
      id: 2, 
      name: "Historia Universal", 
      professor: "Prof. Martínez", 
      schedule: "Mar, Jue 14:00-16:00",
      color: "bg-green-500",
      totalTasks: 6,
      completedTasks: 4
    },
    { 
      id: 3, 
      name: "Química Orgánica", 
      professor: "Dra. López", 
      schedule: "Mié, Vie 08:00-10:00",
      color: "bg-purple-500",
      totalTasks: 10,
      completedTasks: 4
    },
    { 
      id: 4, 
      name: "Literatura Moderna", 
      professor: "Prof. Rodríguez", 
      schedule: "Lun, Jue 16:00-18:00",
      color: "bg-orange-500",
      totalTasks: 5,
      completedTasks: 5
    },
    { 
      id: 5, 
      name: "Física Mecánica", 
      professor: "Dr. Torres", 
      schedule: "Mar, Vie 10:00-12:00",
      color: "bg-red-500",
      totalTasks: 7,
      completedTasks: 3
    },
    { 
      id: 6, 
      name: "Programación I", 
      professor: "Ing. Sánchez", 
      schedule: "Lun, Mié 14:00-16:00",
      color: "bg-cyan-500",
      totalTasks: 9,
      completedTasks: 7
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Materias</h1>
          <p className="text-muted-foreground">Gestiona tus materias del semestre actual</p>
        </div>
        <Button className="shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Materia
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {subjects.map((subject) => {
          const completion = Math.round((subject.completedTasks / subject.totalTasks) * 100);
          
          return (
            <Card key={subject.id} className="border-0 shadow-md hover:shadow-lg transition-all cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 rounded-lg ${subject.color} flex items-center justify-center shadow-md`}>
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <Badge variant={completion === 100 ? "secondary" : "default"}>
                    {completion}%
                  </Badge>
                </div>
                <CardTitle className="text-xl group-hover:text-primary transition-colors">{subject.name}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="w-4 h-4" />
                  <span>{subject.professor}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{subject.schedule}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{subject.completedTasks} de {subject.totalTasks} tareas completadas</span>
                </div>
                <div className="pt-2">
                  <Button variant="outline" className="w-full">Ver Detalles</Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
