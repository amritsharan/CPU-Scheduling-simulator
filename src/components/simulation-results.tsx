"use client";

import type { SimulationResult } from "@/lib/types";
import { GanttChart } from "@/components/gantt-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface SimulationResultsProps {
  results: SimulationResult[];
}

export function SimulationResults({ results }: SimulationResultsProps) {
  if (results.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <CardTitle>No Simulation Data</CardTitle>
          <CardDescription>Configure your processes and run the simulation to see the results.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Results</CardTitle>
        <CardDescription>
          Analysis of each scheduling algorithm based on the provided processes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={results[0].algorithm}>
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-6 h-auto">
            {results.map((result) => (
              <TabsTrigger key={result.algorithm} value={result.algorithm} className="whitespace-normal">
                {result.algorithm}
              </TabsTrigger>
            ))}
          </TabsList>
          {results.map((result) => (
            <TabsContent key={result.algorithm} value={result.algorithm} className="mt-4 space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Avg. Waiting Time</CardDescription>
                    <CardTitle className="text-3xl text-primary">{result.avgWaitingTime.toFixed(2)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Avg. Turnaround Time</CardDescription>
                    <CardTitle className="text-3xl text-primary">{result.avgTurnaroundTime.toFixed(2)}</CardTitle>
                  </CardHeader>
                </Card>
                 <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Context Switches</CardDescription>
                    <CardTitle className="text-3xl text-primary">{result.contextSwitches}</CardTitle>
                  </CardHeader>
                </Card>
              </div>
              
              <GanttChart ganttChart={result.ganttChart} />

              <Card>
                <CardHeader>
                  <CardTitle>Process Details</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Process</TableHead>
                            <TableHead>Arrival</TableHead>
                            <TableHead>Burst</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Completion</TableHead>
                            <TableHead>Turnaround</TableHead>
                            <TableHead>Waiting</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.processes.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell><Badge style={{ backgroundColor: p.color }} className="text-white">{p.name}</Badge></TableCell>
                              <TableCell>{p.arrivalTime}</TableCell>
                              <TableCell>{p.burstTime}</TableCell>
                              <TableCell>{p.priority}</TableCell>
                              <TableCell>{p.completionTime?.toFixed(2)}</TableCell>
                              <TableCell>{p.turnaroundTime?.toFixed(2)}</TableCell>
                              <TableCell>{p.waitingTime?.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                   </div>
                </CardContent>
              </Card>

            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
