import { Process, GanttChartEntry, SimulationResult } from './types';
import { IDLE_COLOR } from './constants';

const deepCopyProcesses = (processes: Process[]): Process[] => {
  return JSON.parse(JSON.stringify(processes));
};

export const runFCFS = (processes: Process[]): SimulationResult => {
  const localProcesses = deepCopyProcesses(processes).sort((a, b) => a.arrivalTime - b.arrivalTime);
  const n = localProcesses.length;
  if (n === 0) {
    return {
      algorithm: 'First-Come, First-Served',
      processes: [],
      ganttChart: [],
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      contextSwitches: 0,
    };
  }

  const ganttChart: GanttChartEntry[] = [];
  let currentTime = 0;
  let totalWaitingTime = 0;
  let totalTurnaroundTime = 0;
  let contextSwitches = 0;
  let lastProcessId: number | null = null;

  localProcesses.forEach(p => {
    if (currentTime < p.arrivalTime) {
      ganttChart.push({ processId: 'idle', processName: 'Idle', start: currentTime, end: p.arrivalTime, color: IDLE_COLOR });
      currentTime = p.arrivalTime;
    }

    if(lastProcessId !== null && lastProcessId !== p.id) {
        contextSwitches++;
    }

    p.waitingTime = currentTime - p.arrivalTime;
    const startTime = currentTime;
    currentTime += p.burstTime;
    p.completionTime = currentTime;
    p.turnaroundTime = p.completionTime - p.arrivalTime;

    totalWaitingTime += p.waitingTime;
    totalTurnaroundTime += p.turnaroundTime;
    
    ganttChart.push({ processId: p.id, processName: p.name, start: startTime, end: p.completionTime, color: p.color });
    lastProcessId = p.id;
  });

  return {
    algorithm: 'First-Come, First-Served',
    processes: localProcesses,
    ganttChart,
    avgWaitingTime: totalWaitingTime / n,
    avgTurnaroundTime: totalTurnaroundTime / n,
    contextSwitches,
  };
};

export const runSJF = (processes: Process[]): SimulationResult => {
    const localProcesses = deepCopyProcesses(processes);
    const n = localProcesses.length;
    if (n === 0) {
        return {
            algorithm: 'Shortest Job First (Non-Preemptive)',
            processes: [],
            ganttChart: [],
            avgWaitingTime: 0,
            avgTurnaroundTime: 0,
            contextSwitches: 0,
        };
    }

    const ganttChart: GanttChartEntry[] = [];
    let currentTime = 0;
    let completed = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let contextSwitches = 0;
    let lastProcessId: number | null = null;

    while(completed < n) {
        const availableProcesses = localProcesses
            .filter(p => p.arrivalTime <= currentTime && !p.completionTime)
            .sort((a, b) => {
                if(a.burstTime === b.burstTime) return a.arrivalTime - b.arrivalTime;
                return a.burstTime - b.burstTime;
            });
        
        if (availableProcesses.length === 0) {
            const remainingProcesses = localProcesses.filter(p => !p.completionTime);
            if (remainingProcesses.length === 0) break;
            const nextArrivalTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
            if(isFinite(nextArrivalTime) && nextArrivalTime > currentTime) {
                ganttChart.push({ processId: 'idle', processName: 'Idle', start: currentTime, end: nextArrivalTime, color: IDLE_COLOR });
                currentTime = nextArrivalTime;
            }
            continue;
        }

        const currentProcess = availableProcesses[0];
        const processInList = localProcesses.find(p => p.id === currentProcess.id)!;

        if (lastProcessId !== null && lastProcessId !== processInList.id) {
            contextSwitches++;
        }

        const startTime = currentTime;
        processInList.waitingTime = currentTime - processInList.arrivalTime;
        currentTime += processInList.burstTime;
        processInList.completionTime = currentTime;
        processInList.turnaroundTime = processInList.completionTime - processInList.arrivalTime;

        totalWaitingTime += processInList.waitingTime;
        totalTurnaroundTime += processInList.turnaroundTime;

        ganttChart.push({ processId: processInList.id, processName: processInList.name, start: startTime, end: processInList.completionTime, color: processInList.color });
        
        completed++;
        lastProcessId = processInList.id;
    }

    return {
        algorithm: 'Shortest Job First (Non-Preemptive)',
        processes: localProcesses,
        ganttChart,
        avgWaitingTime: totalWaitingTime / n,
        avgTurnaroundTime: totalTurnaroundTime / n,
        contextSwitches,
    };
};

export const runSRTF = (processes: Process[]): SimulationResult => {
  const localProcesses = deepCopyProcesses(processes).map(p => ({ ...p, remainingTime: p.burstTime }));
  const n = localProcesses.length;

  if (n === 0) {
    return {
      algorithm: 'Shortest Remaining Time First (SJF Preemptive)',
      processes: [],
      ganttChart: [],
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      contextSwitches: 0,
    };
  }

  const ganttChart: GanttChartEntry[] = [];
  let currentTime = 0;
  let completed = 0;
  let contextSwitches = 0;
  let lastProcessId: number | null = null;
  const completedProcesses: Process[] = [];

  while (completed < n) {
    const available = localProcesses.filter(p => p.arrivalTime <= currentTime && p.remainingTime! > 0);

    if (available.length === 0) {
      const futureArrivals = localProcesses.filter(p => p.arrivalTime > currentTime && p.remainingTime! > 0);
      if (futureArrivals.length > 0) {
        const nextArrivalTime = Math.min(...futureArrivals.map(p => p.arrivalTime));
        ganttChart.push({ processId: 'idle', processName: 'Idle', start: currentTime, end: nextArrivalTime, color: IDLE_COLOR });
        currentTime = nextArrivalTime;
      } else {
        break; // No more processes to run
      }
      continue;
    }

    available.sort((a, b) => a.remainingTime! - b.remainingTime!);
    const currentProcess = available[0];

    if (lastProcessId !== null && lastProcessId !== currentProcess.id) {
      contextSwitches++;
    }

    const startTime = currentTime;
    currentTime++;
    currentProcess.remainingTime!--;
    
    const lastGanttEntry = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1] : null;
    if (lastGanttEntry && lastGanttEntry.processId === currentProcess.id) {
      lastGanttEntry.end = currentTime;
    } else {
      ganttChart.push({ processId: currentProcess.id, processName: currentProcess.name, start: startTime, end: currentTime, color: currentProcess.color });
    }

    lastProcessId = currentProcess.id;

    if (currentProcess.remainingTime === 0) {
      const processInList = localProcesses.find(p => p.id === currentProcess.id)!;
      processInList.completionTime = currentTime;
      processInList.turnaroundTime = processInList.completionTime - processInList.arrivalTime;
      processInList.waitingTime = processInList.turnaroundTime - processInList.burstTime;
      completed++;
    }
  }

  const totalWaitingTime = localProcesses.reduce((acc, p) => acc + (p.waitingTime || 0), 0);
  const totalTurnaroundTime = localProcesses.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0);
  
  return {
    algorithm: 'Shortest Remaining Time First (SJF Preemptive)',
    processes: localProcesses,
    ganttChart,
    avgWaitingTime: totalWaitingTime / n,
    avgTurnaroundTime: totalTurnaroundTime / n,
    contextSwitches,
  };
};

export const runPriority = (processes: Process[]): SimulationResult => {
    const localProcesses = deepCopyProcesses(processes);
    const n = localProcesses.length;
    if (n === 0) {
        return {
            algorithm: 'Priority (Non-Preemptive)',
            processes: [],
            ganttChart: [],
            avgWaitingTime: 0,
            avgTurnaroundTime: 0,
            contextSwitches: 0,
        };
    }

    const ganttChart: GanttChartEntry[] = [];
    let currentTime = 0;
    let completed = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let contextSwitches = 0;
    let lastProcessId: number | null = null;

    while(completed < n) {
        const availableProcesses = localProcesses
            .filter(p => p.arrivalTime <= currentTime && !p.completionTime)
            .sort((a, b) => {
                if (a.priority === b.priority) return a.arrivalTime - b.arrivalTime;
                return a.priority - b.priority;
            });

        if (availableProcesses.length === 0) {
             const remainingProcesses = localProcesses.filter(p => !p.completionTime);
             if (remainingProcesses.length === 0) break;
            const nextArrivalTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
            if(isFinite(nextArrivalTime) && nextArrivalTime > currentTime) {
                ganttChart.push({ processId: 'idle', processName: 'Idle', start: currentTime, end: nextArrivalTime, color: IDLE_COLOR });
                currentTime = nextArrivalTime;
            }
            continue;
        }

        const currentProcess = availableProcesses[0];
        const processInList = localProcesses.find(p => p.id === currentProcess.id)!;

        if (lastProcessId !== null && lastProcessId !== processInList.id) {
            contextSwitches++;
        }

        const startTime = currentTime;
        processInList.waitingTime = currentTime - processInList.arrivalTime;
        currentTime += processInList.burstTime;
        processInList.completionTime = currentTime;
        processInList.turnaroundTime = processInList.completionTime - processInList.arrivalTime;

        totalWaitingTime += processInList.waitingTime;
        totalTurnaroundTime += processInList.turnaroundTime;

        ganttChart.push({ processId: processInList.id, processName: processInList.name, start: startTime, end: processInList.completionTime, color: processInList.color });

        completed++;
        lastProcessId = processInList.id;
    }

    return {
        algorithm: 'Priority (Non-Preemptive)',
        processes: localProcesses,
        ganttChart,
        avgWaitingTime: totalWaitingTime / n,
        avgTurnaroundTime: totalTurnaroundTime / n,
        contextSwitches,
    };
};

export const runPriorityPreemptive = (processes: Process[]): SimulationResult => {
  const localProcesses = deepCopyProcesses(processes).map(p => ({ ...p, remainingTime: p.burstTime }));
  const n = localProcesses.length;

  if (n === 0) {
    return {
      algorithm: 'Priority (Preemptive)',
      processes: [],
      ganttChart: [],
      avgWaitingTime: 0,
      avgTurnaroundTime: 0,
      contextSwitches: 0,
    };
  }

  const ganttChart: GanttChartEntry[] = [];
  let currentTime = 0;
  let completed = 0;
  let contextSwitches = 0;
  let lastProcessId: number | null = null;

  while (completed < n) {
    const available = localProcesses.filter(p => p.arrivalTime <= currentTime && p.remainingTime! > 0);

    if (available.length === 0) {
      const futureArrivals = localProcesses.filter(p => p.arrivalTime > currentTime && p.remainingTime! > 0);
      if (futureArrivals.length > 0) {
        const nextArrivalTime = Math.min(...futureArrivals.map(p => p.arrivalTime));
        ganttChart.push({ processId: 'idle', processName: 'Idle', start: currentTime, end: nextArrivalTime, color: IDLE_COLOR });
        currentTime = nextArrivalTime;
      } else {
        break; // No more processes to run
      }
      continue;
    }

    available.sort((a, b) => a.priority - b.priority);
    const currentProcess = available[0];

    if (lastProcessId !== null && lastProcessId !== currentProcess.id) {
      contextSwitches++;
    }

    const startTime = currentTime;
    currentTime++;
    currentProcess.remainingTime!--;
    
    const lastGanttEntry = ganttChart.length > 0 ? ganttChart[ganttChart.length - 1] : null;
    if (lastGanttEntry && lastGanttEntry.processId === currentProcess.id) {
      lastGanttEntry.end = currentTime;
    } else {
      ganttChart.push({ processId: currentProcess.id, processName: currentProcess.name, start: startTime, end: currentTime, color: currentProcess.color });
    }

    lastProcessId = currentProcess.id;

    if (currentProcess.remainingTime === 0) {
      const processInList = localProcesses.find(p => p.id === currentProcess.id)!;
      processInList.completionTime = currentTime;
      processInList.turnaroundTime = processInList.completionTime - processInList.arrivalTime;
      processInList.waitingTime = processInList.turnaroundTime - processInList.burstTime;
      completed++;
    }
  }

  const totalWaitingTime = localProcesses.reduce((acc, p) => acc + (p.waitingTime || 0), 0);
  const totalTurnaroundTime = localProcesses.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0);
  
  return {
    algorithm: 'Priority (Preemptive)',
    processes: localProcesses,
    ganttChart,
    avgWaitingTime: totalWaitingTime / n,
    avgTurnaroundTime: totalTurnaroundTime / n,
    contextSwitches,
  };
};


export const runRoundRobin = (processes: Process[], timeQuantum: number): SimulationResult => {
    const localProcesses = deepCopyProcesses(processes).map(p => ({ ...p, remainingTime: p.burstTime }));
    const n = localProcesses.length;

    if (n === 0) {
        return {
            algorithm: 'Round Robin',
            processes: [],
            ganttChart: [],
            avgWaitingTime: 0,
            avgTurnaroundTime: 0,
            contextSwitches: 0,
        };
    }
    
    const readyQueue: Process[] = [];
    let currentTime = 0;
    let completed = 0;
    let contextSwitches = 0;
    let lastProcessId: number | null = null;
    let processIdx = 0;
    const allProcesses = localProcesses.sort((a,b) => a.arrivalTime - b.arrivalTime);

    while (completed < n) {
        while (processIdx < n && allProcesses[processIdx].arrivalTime <= currentTime) {
            readyQueue.push(allProcesses[processIdx]);
            processIdx++;
        }

        if (readyQueue.length === 0) {
            if (processIdx < n) {
                const nextArrivalTime = allProcesses[processIdx].arrivalTime;
                if (nextArrivalTime > currentTime) {
                    ganttChart.push({ processId: 'idle', processName: 'Idle', start: currentTime, end: nextArrivalTime, color: IDLE_COLOR });
                    currentTime = nextArrivalTime;
                }
                continue; 
            } else {
                break;
            }
        }

        const currentProcess = readyQueue.shift()!;
        
        if (lastProcessId !== null && lastProcessId !== currentProcess.id) {
            contextSwitches++;
        }

        const startTime = currentTime;
        const executionTime = Math.min(currentProcess.remainingTime!, timeQuantum);
        currentProcess.remainingTime! -= executionTime;
        currentTime += executionTime;

        if (ganttChart.length > 0 && ganttChart[ganttChart.length - 1].processId === currentProcess.id && ganttChart[ganttChart.length - 1].end === startTime) {
            ganttChart[ganttChart.length-1].end = currentTime;
        } else {
            ganttChart.push({ processId: currentProcess.id, processName: currentProcess.name, start: startTime, end: currentTime, color: currentProcess.color });
        }
        
        while (processIdx < n && allProcesses[processIdx].arrivalTime <= currentTime) {
            const arrivingProcess = allProcesses[processIdx];
            if (!readyQueue.some(p => p.id === arrivingProcess.id)) {
                readyQueue.push(arrivingProcess);
            }
            processIdx++;
        }

        if (currentProcess.remainingTime! > 0) {
            readyQueue.push(currentProcess);
        } else {
            const processInList = localProcesses.find(p => p.id === currentProcess.id)!;
            processInList.completionTime = currentTime;
            processInList.turnaroundTime = processInList.completionTime - processInList.arrivalTime;
            processInList.waitingTime = processInList.turnaroundTime - processInList.burstTime;
            completed++;
        }

        lastProcessId = currentProcess.id;
    }

    const totalWaitingTime = localProcesses.reduce((acc, p) => acc + (p.waitingTime || 0), 0);
    const totalTurnaroundTime = localProcesses.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0);
    
    return {
        algorithm: 'Round Robin',
        processes: localProcesses,
        ganttChart,
        avgWaitingTime: totalWaitingTime / n,
        avgTurnaroundTime: totalTurnaroundTime / n,
        contextSwitches,
    };
};
