"use client";

import { useState, useEffect } from 'react';
import type { Process, SimulationResult } from '@/lib/types';
import { runFCFS, runSJF, runPriority, runRoundRobin, runSRTF, runPriorityPreemptive, runPriorityWithAging } from '@/lib/algorithms';
import { ProcessInput } from '@/components/process-input';
import { SimulationResults } from '@/components/simulation-results';
import { AiAnalysis } from '@/components/ai-analysis';
import { Button } from '@/components/ui/button';
import { Play } from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { PROCESS_COLORS } from '@/lib/constants';
import { ComparativeAnalysis } from './comparative-analysis';

const assignColors = (processes: Process[]): Process[] => {
  return processes.map((p, index) => ({
    ...p,
    color: PROCESS_COLORS[index % PROCESS_COLORS.length]
  }));
};

export function SimulationDashboard() {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [timeQuantum, setTimeQuantum] = useState(4);
  const [contextSwitchTime, setContextSwitchTime] = useState(1);
  const [numberOfCores, setNumberOfCores] = useState(1);
  const [simulationResults, setSimulationResults] = useState<SimulationResult[]>([]);

  useEffect(() => {
    const generateRandomProcesses = (): Process[] => {
      const numProcesses = Math.floor(Math.random() * 3) + 4; // 4 to 6 processes
      const newProcesses: Process[] = [];
      for (let i = 1; i <= numProcesses; i++) {
        newProcesses.push({
          id: i,
          name: `P${i}`,
          arrivalTime: Math.floor(Math.random() * 6), // 0-5
          burstTime: Math.floor(Math.random() * 15) + 1, // 1-15
          priority: Math.floor(Math.random() * 10) + 1, // 1-10
          color: '',
        });
      }
      return newProcesses;
    };

    setProcesses(assignColors(generateRandomProcesses()));
  }, []);

  const runSimulations = () => {
    const coloredProcesses = assignColors(processes);
    setProcesses(coloredProcesses);

    const fcfsResult = runFCFS(coloredProcesses, contextSwitchTime, numberOfCores);
    const sjfResult = runSJF(coloredProcesses, contextSwitchTime, numberOfCores);
    const srtfResult = runSRTF(coloredProcesses, contextSwitchTime, numberOfCores);
    const priorityResult = runPriority(coloredProcesses, contextSwitchTime, numberOfCores);
    const priorityPreemptiveResult = runPriorityPreemptive(coloredProcesses, contextSwitchTime, numberOfCores);
    const rrResult = runRoundRobin(coloredProcesses, timeQuantum, contextSwitchTime, numberOfCores);
    const priorityAgingResult = runPriorityWithAging(coloredProcesses, contextSwitchTime, numberOfCores);
    
    setSimulationResults([fcfsResult, sjfResult, srtfResult, priorityResult, priorityPreemptiveResult, rrResult, priorityAgingResult]);
  };

  return (
    <div className="space-y-8">
      <ProcessInput
        processes={processes}
        setProcesses={setProcesses}
        timeQuantum={timeQuantum}
        setTimeQuantum={setTimeQuantum}
        contextSwitchTime={contextSwitchTime}
        setContextSwitchTime={setContextSwitchTime}
        numberOfCores={numberOfCores}
        setNumberOfCores={setNumberOfCores}
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
          <ComparativeAnalysis results={simulationResults} />
          <Separator />
          <AiAnalysis results={simulationResults} isEnabled={simulationResults.length > 0} />
        </>
      )}
    </div>
  );
}
