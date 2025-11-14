import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Calendar, AlertCircle } from "lucide-react";

export default function Tasks() {
  const tasks = [
    { 
      id: 1, 
      title: "Proyecto Final de Cálculo", 
      subject: "Cálculo Diferencial",
      subjectColor: "bg-blue-500",
      dueDate: "2024-01-25", 
      priority: "high",
      completed: false,
      description: "Resolver problemas del capítulo 5"
    },
    { 
      id: 2, 
      title: "Ensayo sobre la Revolución Francesa", 
      subject: "Historia Universal",
      subjectColor: "bg-green-500",
      dueDate: "2024-01-26", 
      priority: "medium",
      completed: false,
      description: "3000 palabras mínimo"
    },
    { 
      id: 3, 
      title: "Laboratorio de Compuestos Orgánicos", 
      subject: "Química Orgánica",
      subjectColor: "bg-purple-500",
      dueDate: "2024-01-28", 
      priority: "low",
      completed: false,
      description: "Experimento sobre alcoholes"
    },
    { 
      id: 4, 
      title: "Análisis literario", 
      subject: "Literatura Moderna",
      subjectColor: "bg-orange-500",
      dueDate: "2024-01-22", 
      priority: "medium",
      completed: true,
      description: "Análisis de '1984' de George Orwell"
    },
    { 
      id: 5, 
      title: "Reporte de laboratorio", 
      subject: "Física Mecánica",
      subjectColor: "bg-red-500",
      dueDate: "2024-01-30", 
      priority: "high",
      completed: false,
      description: "Experimento de movimiento parabólico"
    },
  ];

  const priorityColors = {
    high: "destructive",
    medium: "default",
    low: "secondary",
  } as const;

  const priorityLabels = {
    high: "Alta",
    medium: "Media",
    low: "Baja",
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  const TaskCard = ({ task }: { task: typeof tasks[0] }) => {
    const daysUntil = Math.ceil((new Date(task.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    const isOverdue = daysUntil < 0;
    const isDueSoon = daysUntil <= 3 && daysUntil >= 0;

    return (
      <Card className="border-0 shadow-md hover:shadow-lg transition-all">
        <CardContent className="p-4">
          <div className="flex items-start gap-4">
            <Checkbox className="mt-1" defaultChecked={task.completed} />
            <div className="flex-1 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h3 className={`font-semibold text-foreground ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                  {task.title}
                </h3>
                <Badge variant={priorityColors[task.priority]}>
                  {priorityLabels[task.priority]}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground">{task.description}</p>
              
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${task.subjectColor}`} />
                  <span className="text-sm text-muted-foreground">{task.subject}</span>
                </div>
                
                <div className={`flex items-center gap-1 text-sm ${isOverdue ? 'text-destructive' : isDueSoon ? 'text-warning' : 'text-muted-foreground'}`}>
                  {(isOverdue || isDueSoon) && <AlertCircle className="w-4 h-4" />}
                  <Calendar className="w-4 h-4" />
                  <span>
                    {isOverdue 
                      ? `Vencida hace ${Math.abs(daysUntil)} días`
                      : isDueSoon 
                      ? `Vence en ${daysUntil} días`
                      : new Date(task.dueDate).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Mis Tareas</h1>
          <p className="text-muted-foreground">Organiza y monitorea tus tareas académicas</p>
        </div>
        <Button className="shadow-md">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Tarea
        </Button>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="pending">
            Pendientes ({pendingTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completadas ({completedTasks.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4 mt-6">
          {pendingTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>
        
        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedTasks.map((task) => (
            <TaskCard key={task.id} task={task} />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
