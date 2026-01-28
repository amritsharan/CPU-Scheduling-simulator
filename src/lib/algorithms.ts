import { Process, GanttChartEntry, SimulationResult } from './types';
import { IDLE_COLOR } from './constants';

const deepCopyProcesses = (processes: Process[]): Process[] => {
  return JSON.parse(JSON.stringify(processes));
};

export const runFCFS = (processes: Process[]): SimulationResult => {
  const localProcesses = deepCopyProcesses(processes).sort((a, b) => a.arrivalTime - b.arrivalTime);
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
    avgWaitingTime: totalWaitingTime / localProcesses.length,
    avgTurnaroundTime: totalTurnaroundTime / localProcesses.length,
    contextSwitches,
  };
};

export const runSJF = (processes: Process[]): SimulationResult => {
    const localProcesses = deepCopyProcesses(processes);
    const n = localProcesses.length;
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
            const nextArrivalTime = Math.min(...localProcesses.filter(p => !p.completionTime).map(p => p.arrivalTime));
            if(nextArrivalTime > currentTime) {
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

export const runPriority = (processes: Process[]): SimulationResult => {
    const localProcesses = deepCopyProcesses(processes);
    const n = localProcesses.length;
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
             const nextArrivalTime = Math.min(...localProcesses.filter(p => !p.completionTime).map(p => p.arrivalTime));
            if(nextArrivalTime > currentTime) {
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

export const runRoundRobin = (processes: Process[], timeQuantum: number): SimulationResult => {
    const localProcesses = deepCopyProcesses(processes).map(p => ({ ...p, remainingTime: p.burstTime }));
    const n = localProcesses.length;
    const ganttChart: GanttChartEntry[] = [];
    let currentTime = 0;
    let completed = 0;
    const readyQueue: Process[] = [];
    let contextSwitches = 0;
    let lastProcessId: number | null = null;
    const arrivalMap: { [time: number]: Process[] } = {};
    localProcesses.forEach(p => {
        if (!arrivalMap[p.arrivalTime]) {
            arrivalMap[p.arrivalTime] = [];
        }
        arrivalMap[p.arrivalTime].push(p);
    });
    
    let processIndex = 0;

    while (completed < n) {
        // Add processes that have arrived to the ready queue
        Object.keys(arrivalMap).forEach(t => {
            if (parseInt(t) <= currentTime) {
                readyQueue.push(...arrivalMap[parseInt(t)].sort((a,b) => a.arrivalTime - b.arrivalTime));
                delete arrivalMap[parseInt(t)];
            }
        });

        if (readyQueue.length === 0) {
            const nextArrivalTime = Math.min(...Object.keys(arrivalMap).map(Number));
             if (isFinite(nextArrivalTime) && nextArrivalTime > currentTime) {
                ganttChart.push({ processId: 'idle', processName: 'Idle', start: currentTime, end: nextArrivalTime, color: IDLE_COLOR });
                currentTime = nextArrivalTime;
             } else {
                 // This case happens if all processes are completed, but loop hasn't exited.
                 // It's a safeguard.
                 break;
             }
            continue;
        }

        const currentProcess = readyQueue.shift()!;
        
        if (lastProcessId !== null && lastProcessId !== currentProcess.id) {
            contextSwitches++;
        }

        const startTime = currentTime;
        const executionTime = Math.min(currentProcess.remainingTime!, timeQuantum);
        currentProcess.remainingTime! -= executionTime;
        currentTime += executionTime;

        ganttChart.push({ processId: currentProcess.id, processName: currentProcess.name, start: startTime, end: currentTime, color: currentProcess.color });
        
        // Add newly arrived processes during this execution
         Object.keys(arrivalMap).forEach(t => {
            if (parseInt(t) <= currentTime) {
                readyQueue.push(...arrivalMap[parseInt(t)].sort((a,b) => a.arrivalTime - b.arrivalTime));
                delete arrivalMap[parseInt(t)];
            }
        });


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
