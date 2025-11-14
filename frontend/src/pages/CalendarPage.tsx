import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { AlertCircle, Calendar as CalendarIcon } from "lucide-react";

export default function CalendarPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());

  const upcomingEvents = [
    { date: "2024-01-25", title: "Proyecto Final de Cálculo", subject: "Cálculo", color: "bg-blue-500", priority: "high" },
    { date: "2024-01-26", title: "Ensayo de Historia", subject: "Historia", color: "bg-green-500", priority: "medium" },
    { date: "2024-01-28", title: "Laboratorio de Química", subject: "Química", color: "bg-purple-500", priority: "low" },
    { date: "2024-01-30", title: "Reporte de Física", subject: "Física", color: "bg-red-500", priority: "high" },
  ];

  const priorityVariant = {
    high: "destructive",
    medium: "default",
    low: "secondary",
  } as const;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground mb-2">Calendario Académico</h1>
        <p className="text-muted-foreground">Visualiza todas tus fechas de entrega</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-primary" />
              Calendario
            </CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center">
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-sm"
            />
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-warning" />
              Próximas Entregas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {upcomingEvents.map((event, index) => {
              const daysUntil = Math.ceil((new Date(event.date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
              
              return (
                <div key={index} className="p-3 rounded-lg bg-muted/50 hover:bg-muted space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${event.color}`} />
                      <span className="font-medium text-sm text-foreground">{event.title}</span>
                    </div>
                    <Badge variant={priorityVariant[event.priority]} className="text-xs">
                      {daysUntil}d
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground pl-4">
                    <span>{event.subject}</span>
                    <span>•</span>
                    <span>{new Date(event.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md">
        <CardHeader>
          <CardTitle>Leyenda de Prioridades</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            <Badge variant="destructive">Alta</Badge>
            <span className="text-sm text-muted-foreground">Urgente - menos de 3 días</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge>Media</Badge>
            <span className="text-sm text-muted-foreground">Normal - 3-7 días</span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Baja</Badge>
            <span className="text-sm text-muted-foreground">Planificada - más de 7 días</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
