export interface Process {
  id: number;
  name: string;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  color: string;
  completionTime?: number;
  turnaroundTime?: number;
  waitingTime?: number;
  remainingTime?: number;
  originalPriority?: number;
}

export interface GanttChartEntry {
  processId: number | 'idle' | 'context-switch';
  processName: string;
  start: number;
  end: number;
  color: string;
}

export interface SimulationResult {
  algorithm: string;
  processes: Process[];
  ganttChart: GanttChartEntry[];
  avgWaitingTime: number;
  avgTurnaroundTime: number;
  contextSwitches: number;
  cpuUtilization: number;
}
