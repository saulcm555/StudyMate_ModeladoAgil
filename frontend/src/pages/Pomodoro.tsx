import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useState, useEffect } from "react";
import { Play, Pause, RotateCcw, Coffee, BookOpen } from "lucide-react";

export default function Pomodoro() {
  const [minutes, setMinutes] = useState(25);
  const [seconds, setSeconds] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedPomodoros, setCompletedPomodoros] = useState(0);

  const WORK_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  const totalSeconds = isBreak ? BREAK_TIME : WORK_TIME;
  const currentSeconds = minutes * 60 + seconds;
  const progress = ((totalSeconds - currentSeconds) / totalSeconds) * 100;

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive) {
      interval = setInterval(() => {
        if (seconds === 0) {
          if (minutes === 0) {
            // Timer finished
            setIsActive(false);
            if (!isBreak) {
              setCompletedPomodoros(prev => prev + 1);
              setIsBreak(true);
              setMinutes(5);
            } else {
              setIsBreak(false);
              setMinutes(25);
            }
            setSeconds(0);
          } else {
            setMinutes(minutes - 1);
            setSeconds(59);
          }
        } else {
          setSeconds(seconds - 1);
        }
      }, 1000);
    } else if (!isActive && interval) {
      clearInterval(interval);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, minutes, seconds, isBreak]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsBreak(false);
    setMinutes(25);
    setSeconds(0);
  };

  const formatTime = (mins: number, secs: number) => {
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-foreground mb-2">Técnica Pomodoro</h1>
        <p className="text-muted-foreground">Aumenta tu concentración con intervalos de trabajo enfocado</p>
      </div>

      <Card className="border-0 shadow-xl bg-gradient-card">
        <CardContent className="p-8">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center gap-4">
              <div className={`p-4 rounded-full ${isBreak ? 'bg-success/10' : 'bg-primary/10'}`}>
                {isBreak ? (
                  <Coffee className={`w-8 h-8 ${isBreak ? 'text-success' : 'text-primary'}`} />
                ) : (
                  <BookOpen className={`w-8 h-8 ${isBreak ? 'text-success' : 'text-primary'}`} />
                )}
              </div>
              <h2 className="text-2xl font-bold text-foreground">
                {isBreak ? "Tiempo de Descanso" : "Sesión de Estudio"}
              </h2>
            </div>

            <div className="relative">
              <div className="text-8xl font-bold text-foreground mb-6">
                {formatTime(minutes, seconds)}
              </div>
              <Progress value={progress} className="h-3" />
            </div>

            <div className="flex items-center justify-center gap-4">
              <Button
                size="lg"
                onClick={toggleTimer}
                className="w-32 shadow-lg"
              >
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pausar
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Iniciar
                  </>
                )}
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={resetTimer}
                className="w-32"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reiniciar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Pomodoros Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-primary">{completedPomodoros}</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Tiempo de Trabajo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-secondary">25 min</div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Tiempo de Descanso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-success">5 min</div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-md bg-muted/50">
        <CardHeader>
          <CardTitle>¿Qué es la Técnica Pomodoro?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-muted-foreground">
          <p>La técnica Pomodoro es un método de gestión del tiempo que consiste en:</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>25 minutos de trabajo concentrado</li>
            <li>5 minutos de descanso</li>
            <li>Después de 4 pomodoros, toma un descanso más largo (15-30 minutos)</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
