"use client";

import { useState } from 'react';
import type { Process, SimulationResult } from '@/lib/types';
import { runFCFS, runSJF, runPriority, runRoundRobin, runSRTF, runPriorityPreemptive } from '@/lib/algorithms';
import { ProcessInput } from '@/components/process-input';
import { SimulationResults } from '@/components/simulation-results';
import { AiAnalysis } from '@/components/ai-analysis';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PROCESS_COLORS } from '@/lib/constants';

const initialProcesses: Process[] = [
  { id: 1, name: 'P1', arrivalTime: 0, burstTime: 8, priority: 3, color: '' },
  { id: 2, name: 'P2', arrivalTime: 1, burstTime: 4, priority: 1, color: '' },
  { id: 3, name: 'P3', arrivalTime: 2, burstTime: 9, priority: 4, color: '' },
  { id: 4, name: 'P4', arrivalTime: 3, burstTime: 5, priority: 2, color: '' },
];

const assignColors = (processes: Process[]): Process[] => {
  return processes.map((p, index) => ({
    ...p,
    color: PROCESS_COLORS[index % PROCESS_COLORS.length]
  }));
};

export function SimulationDashboard() {
  const [processes, setProcesses] = useState<Process[]>(assignColors(initialProcesses));
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);

  const runSimulations = () => {
    const coloredProcesses = assignColors(processes);
    setProcesses(coloredProcesses);

    const fcfsResult = runFCFS(coloredProcesses);
    const sjfResult = runSJF(coloredProcesses);
    const srtfResult = runSRTF(coloredProcesses);
    const priorityResult = runPriority(coloredProcesses);
    const priorityPreemptiveResult = runPriorityPreemptive(coloredProcesses);
    const rrResult = runRoundRobin(coloredProcesses, timeQuantum);
    
    setSimulationResults([fcfsResult, sjfResult, srtfResult, priorityResult, priorityPreemptiveResult, rrResult]);
  };

  return (
    <div className="space-y-8">
      <ProcessInput
        processes={processes}
        setProcesses={setProcesses}
        timeQuantum={timeQuantum}
        setTimeQuantum={setTimeQuantum}
      />
      
      <div className="flex justify-center">
        <Button size="lg" onClick={runSimulations}>
          <Play className="mr-2 h-5 w-5" /> Run Simulation
        </Button>
      </div>

      <Separator />

      <SimulationResults results={simulationResults} />
      
      {simulationResults.length > 0 && (
        <>
          <Separator />
          <AiAnalysis results={simulationResults} isEnabled={simulationResults.length > 0} />
        </>
      )}
    </div>
  );
}
