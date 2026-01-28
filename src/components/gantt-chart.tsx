"use client";

import { GanttChartEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface GanttChartProps {
  ganttChart: GanttChartEntry[];
  numberOfCores: number;
}

export function GanttChart({ ganttChart, numberOfCores }: GanttChartProps) {
  if (!ganttChart || ganttChart.length === 0 || !numberOfCores) {
    return null;
  }

  const overallDuration = ganttChart.reduce((max, entry) => Math.max(max, entry.end), 0);
  const timeMarkers = Array.from({ length: Math.ceil(overallDuration) + 2 }, (_, i) => i);


  const coreCharts = Array.from({ length: numberOfCores }, (_, coreIndex) => {
    const coreGanttChart = ganttChart.filter(entry => entry.coreId === coreIndex);
    
    return (
        <div key={coreIndex} className="mb-6">
            <h4 className="font-semibold mb-2 text-muted-foreground">Core {coreIndex + 1}</h4>
            <div className="relative pt-8 pr-4" style={{ width: `${(overallDuration + 1) * 3}rem`, minWidth: '100%' }}>
              <div className="relative h-12 w-full rounded overflow-hidden border">
                {coreGanttChart.map((entry, index) => {
                  const duration = entry.end - entry.start;
                  if (duration <= 0) return null;
                  return (
                    <Tooltip key={index} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex items-center justify-center h-full text-sm font-bold text-white transition-all overflow-hidden"
                          style={{
                            width: `${duration * 3}rem`,
                            backgroundColor: entry.color,
                            position: 'absolute',
                            left: `${entry.start * 3}rem`,
                          }}
                        >
                          <span className="px-1 truncate">{entry.processName}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Process: {entry.processName}</p>
                        <p>Core: {coreIndex + 1}</p>
                        <p>Start: {entry.start.toFixed(2)}</p>
                        <p>End: {entry.end.toFixed(2)}</p>
                        <p>Duration: {duration.toFixed(2)}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
              <div className="relative w-full h-6 mt-1" style={{width: `${(overallDuration + 1) * 3}rem`}}>
                {timeMarkers.map((time) => (
                  <div
                    key={time}
                    className="absolute top-0 text-xs text-muted-foreground"
                    style={{ left: `${time * 3}rem` }}
                  >
                    <span className="absolute -translate-x-1/2">{time}</span>
                    <div className="absolute top-[-2.75rem] h-10 w-px bg-border -translate-y-full"/>
                  </div>
                ))}
              </div>
            </div>
        </div>
    );
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gantt Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <ScrollArea className="w-full">
            {coreCharts}
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
