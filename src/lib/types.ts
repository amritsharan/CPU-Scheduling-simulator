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
}

export interface GanttChartEntry {
  processId: number | 'idle';
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
}
