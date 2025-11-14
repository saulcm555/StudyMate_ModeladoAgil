import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, TrendingUp, AlertCircle } from "lucide-react";

export default function Dashboard() {
  // Datos de ejemplo
  const upcomingTasks = [
    { id: 1, title: "Proyecto Final de Cálculo", subject: "Matemáticas", dueDate: "2 días", priority: "high" },
    { id: 2, title: "Ensayo de Historia", subject: "Historia", dueDate: "3 días", priority: "medium" },
    { id: 3, title: "Laboratorio de Química", subject: "Química", dueDate: "5 días", priority: "low" },
  ];

  const subjects = [
    { name: "Matemáticas", progress: 75, tasks: 4 },
    { name: "Historia", progress: 60, tasks: 3 },
    { name: "Química", progress: 45, tasks: 5 },
  ];

  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">Bienvenido de vuelta! Aquí está tu resumen académico.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Tasks */}
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
          {/* gradient overlay removed to avoid color tint */}
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-warning/10">
                <AlertCircle className="w-5 h-5 text-warning" />
              </div>
              Próximas Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 relative z-10">
            {upcomingTasks.map((task, index) => (
              <div 
                key={task.id} 
                className="flex items-center justify-between p-4 rounded-xl bg-muted cursor-pointer border border-border/50"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground mb-1">{task.title}</h4>
                  <p className="text-sm text-muted-foreground">{task.subject}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={task.priority === "high" ? "destructive" : task.priority === "medium" ? "default" : "secondary"}
                    className="shadow-md"
                  >
                    {task.dueDate}
                  </Badge>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Ver Todas las Tareas
            </Button>
          </CardContent>
        </Card>

        {/* Subject Progress */}
        <Card className="border-0 shadow-lg overflow-hidden group">
          {/* gradient overlay removed to avoid color tint */}
          <CardHeader className="relative z-10">
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 rounded-lg bg-success/10">
                <TrendingUp className="w-5 h-5 text-success" />
              </div>
              Progreso por Materia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 relative z-10">
            {subjects.map((subject) => (
              <div key={subject.name} className="space-y-3 p-3 rounded-xl hover:bg-muted/50">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-foreground">{subject.name}</span>
                  <span className="text-sm font-medium text-muted-foreground">{subject.tasks} tareas</span>
                </div>
                <div className="space-y-2">
                  <Progress value={subject.progress} className="h-3 shadow-inner" />
                  <span className="text-xs font-medium text-success">{subject.progress}% completado</span>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              Ver Todas las Materias
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-xl bg-primary overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left space-y-2">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-2">
                <div className="w-2 h-2 bg-white rounded-full" />
                <span className="text-sm font-semibold text-white">Sesión disponible</span>
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">¿Listo para estudiar?</h3>
              <p className="text-white/90 text-lg">Inicia una sesión Pomodoro y mantén tu productividad al máximo</p>
            </div>
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-2xl px-8 py-6 text-lg font-semibold"
            >
              <Clock className="w-6 h-6 mr-2" />
              Iniciar Pomodoro
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
