"use client";

import { GanttChartEntry, Process } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

interface GanttChartProps {
  ganttChart: GanttChartEntry[];
}

export function GanttChart({ ganttChart }: GanttChartProps) {
  if (!ganttChart || ganttChart.length === 0) {
    return null;
  }

  const totalDuration = ganttChart[ganttChart.length - 1].end;
  const timeMarkers = Array.from({ length: Math.ceil(totalDuration) + 1 }, (_, i) => i);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Gantt Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="relative pt-8 pr-4" style={{ width: `${totalDuration * 3}rem` }}>
              <div className="flex h-12 w-full rounded overflow-hidden border">
                {ganttChart.map((entry, index) => {
                  const duration = entry.end - entry.start;
                  if (duration === 0) return null;
                  return (
                    <Tooltip key={index} delayDuration={0}>
                      <TooltipTrigger asChild>
                        <div
                          className="flex items-center justify-center h-full text-sm font-bold text-white transition-all overflow-hidden"
                          style={{
                            width: `${duration * 3}rem`,
                            backgroundColor: entry.color,
                          }}
                        >
                          <span className="px-1">{entry.processName}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Process: {entry.processName}</p>
                        <p>Start: {entry.start}</p>
                        <p>End: {entry.end}</p>
                        <p>Duration: {duration.toFixed(2)}</p>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
              <div className="relative w-full h-6 mt-1">
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
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}
