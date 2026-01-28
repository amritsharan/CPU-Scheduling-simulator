"use client";

import type { Process } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Plus, Trash2 } from "lucide-react";

interface ProcessInputProps {
  processes: Process[];
  setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
  timeQuantum: number;
  setTimeQuantum: React.Dispatch<React.SetStateAction<number>>;
  contextSwitchTime: number;
  setContextSwitchTime: React.Dispatch<React.SetStateAction<number>>;
  numberOfCores: number;
  setNumberOfCores: React.Dispatch<React.SetStateAction<number>>;
}

export function ProcessInput({ processes, setProcesses, timeQuantum, setTimeQuantum, contextSwitchTime, setContextSwitchTime, numberOfCores, setNumberOfCores }: ProcessInputProps) {

  const addProcess = () => {
    const newId = processes.length > 0 ? Math.max(...processes.map(p => p.id)) + 1 : 1;
    setProcesses([
      ...processes,
      { id: newId, name: `P${newId}`, arrivalTime: 0, burstTime: 1, priority: 1, color: '' }
    ]);
  };

  const removeProcess = (id: number) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  const handleProcessChange = (id: number, field: keyof Process, value: string) => {
    const numericValue = Number(value);
    if (!isNaN(numericValue) && numericValue >= 0) {
      setProcesses(processes.map(p =>
        p.id === id ? { ...p, [field]: numericValue } : p
      ));
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Configuration</CardTitle>
        <CardDescription>
          Define the processes for the simulation. Add, remove, or edit processes below.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[100px]">Process ID</TableHead>
                <TableHead>Arrival Time</TableHead>
                <TableHead>Burst Time</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processes.map((process) => (
                <TableRow key={process.id}>
                  <TableCell className="font-medium">{process.name}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={process.arrivalTime}
                      onChange={(e) => handleProcessChange(process.id, 'arrivalTime', e.target.value)}
                      min="0"
                      className="w-24"
                      suppressHydrationWarning
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={process.burstTime}
                      onChange={(e) => handleProcessChange(process.id, 'burstTime', e.target.value)}
                      min="1"
                      className="w-24"
                      suppressHydrationWarning
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={process.priority}
                      onChange={(e) => handleProcessChange(process.id, 'priority', e.target.value)}
                      min="1"
                      className="w-24"
                      suppressHydrationWarning
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon" onClick={() => removeProcess(process.id)} suppressHydrationWarning>
                      <Trash2 className="h-4 w-4 text-destructive" />
                      <span className="sr-only">Remove Process</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-4">
          <Button variant="outline" onClick={addProcess} suppressHydrationWarning>
            <Plus className="mr-2 h-4 w-4" /> Add Process
          </Button>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <Label htmlFor="numberOfCores" className="whitespace-nowrap">Number of Cores</Label>
              <Input
                id="numberOfCores"
                type="number"
                value={numberOfCores}
                onChange={(e) => setNumberOfCores(Math.max(1, Number(e.target.value)))}
                min="1"
                className="w-24"
                suppressHydrationWarning
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="contextSwitchTime" className="whitespace-nowrap">Context Switch Time</Label>
              <Input
                id="contextSwitchTime"
                type="number"
                value={contextSwitchTime}
                onChange={(e) => setContextSwitchTime(Math.max(0, Number(e.target.value)))}
                min="0"
                className="w-24"
                suppressHydrationWarning
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="timeQuantum" className="whitespace-nowrap">Round Robin Time Quantum</Label>
              <Input
                id="timeQuantum"
                type="number"
                value={timeQuantum}
                onChange={(e) => setTimeQuantum(Math.max(1, Number(e.target.value)))}
                min="1"
                className="w-24"
                suppressHydrationWarning
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
