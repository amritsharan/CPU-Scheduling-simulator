import { Process, GanttChartEntry, SimulationResult } from './types';
import { IDLE_COLOR, CONTEXT_SWITCH_COLOR } from './constants';

const deepCopyProcesses = (processes: Process[]): Process[] => {
  return JSON.parse(JSON.stringify(processes));
};

const calculateCpuUtilization = (ganttChart: GanttChartEntry[], totalTime: number, numberOfCores: number): number => {
    if (totalTime === 0) return 0;

    const busyTime = ganttChart
        .filter(g => g.processId !== 'idle' && g.processId !== 'context-switch')
        .reduce((acc, g) => acc + (g.end - g.start), 0);
    
    const totalAvailableTime = totalTime * numberOfCores;
    if(totalAvailableTime === 0) return 0;

    return (busyTime / totalAvailableTime) * 100;
}

interface Core {
    id: number;
    currentTime: number;
    lastProcessId: number | null;
    runningProcess: Process | null;
}

const findNextAvailableCore = (cores: Core[]) => cores.reduce((prev, curr) => prev.currentTime <= curr.currentTime ? prev : curr);

// --- Non-preemptive algorithms ---

const runNonPreemptive = (
    processes: Process[],
    contextSwitchTime: number,
    numberOfCores: number,
    algorithmName: string,
    getProcess: (procs: Process[]) => Process
): SimulationResult => {
    const localProcesses = deepCopyProcesses(processes);
    const n = localProcesses.length;
    if (n === 0) {
        return {
            algorithm: algorithmName, processes: [], ganttChart: [], avgWaitingTime: 0,
            avgTurnaroundTime: 0, contextSwitches: 0, cpuUtilization: 0, numberOfCores
        };
    }

    const ganttChart: GanttChartEntry[] = [];
    let completed = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let contextSwitches = 0;

    const cores: Core[] = Array.from({ length: numberOfCores }, (_, i) => ({
        id: i, currentTime: 0, lastProcessId: null, runningProcess: null
    }));

    while (completed < n) {
        const earliestCore = findNextAvailableCore(cores);
        const currentTime = earliestCore.currentTime;

        const availableProcesses = localProcesses.filter(p => p.arrivalTime <= currentTime && !p.completionTime);

        if (availableProcesses.length > 0) {
            const currentProcess = getProcess(availableProcesses);
            const processInList = localProcesses.find(p => p.id === currentProcess.id)!;

            let startTime = currentTime;

            if (earliestCore.lastProcessId !== null && earliestCore.lastProcessId !== processInList.id && contextSwitchTime > 0) {
                contextSwitches++;
                ganttChart.push({ processId: 'context-switch', processName: 'CS', start: startTime, end: startTime + contextSwitchTime, color: CONTEXT_SWITCH_COLOR, coreId: earliestCore.id });
                startTime += contextSwitchTime;
            }

            processInList.waitingTime = startTime - processInList.arrivalTime;
            const completionTime = startTime + processInList.burstTime;
            processInList.completionTime = completionTime;
            processInList.turnaroundTime = completionTime - processInList.arrivalTime;

            totalWaitingTime += processInList.waitingTime;
            totalTurnaroundTime += processInList.turnaroundTime;

            ganttChart.push({ processId: processInList.id, processName: processInList.name, start: startTime, end: completionTime, color: processInList.color, coreId: earliestCore.id });

            earliestCore.currentTime = completionTime;
            earliestCore.lastProcessId = processInList.id;
            completed++;
        } else {
            const remainingProcesses = localProcesses.filter(p => !p.completionTime);
            if(remainingProcesses.length === 0) break;
            
            const nextArrivalTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
            if(isFinite(nextArrivalTime) && nextArrivalTime > currentTime) {
                ganttChart.push({ processId: 'idle', processName: 'Idle', start: currentTime, end: nextArrivalTime, color: IDLE_COLOR, coreId: earliestCore.id });
                earliestCore.currentTime = nextArrivalTime;
            } else {
                 earliestCore.currentTime += 1;
            }
        }
    }

    const makespan = Math.max(...cores.map(c => c.currentTime));
    const cpuUtilization = calculateCpuUtilization(ganttChart, makespan, numberOfCores);

    return {
        algorithm: algorithmName,
        processes: localProcesses,
        ganttChart,
        avgWaitingTime: totalWaitingTime / n,
        avgTurnaroundTime: totalTurnaroundTime / n,
        contextSwitches,
        cpuUtilization,
        numberOfCores,
    };
};

export const runFCFS = (processes: Process[], contextSwitchTime: number, numberOfCores: number): SimulationResult => {
    const sortedProcesses = deepCopyProcesses(processes).sort((a,b) => a.arrivalTime - b.arrivalTime);
    // For FCFS with multiple cores, we can't just iterate. We need to pick based on arrival time from a pool.
    // However, a simpler model is to assign to the next free core, which is what runNonPreemptive does.
    // The "getProcess" for FCFS will be the one that arrived earliest.
    return runNonPreemptive(processes, contextSwitchTime, numberOfCores, 'First-Come, First-Served',
        (procs) => procs.sort((a, b) => a.arrivalTime - b.arrivalTime)[0]
    );
};

export const runSJF = (processes: Process[], contextSwitchTime: number, numberOfCores: number): SimulationResult => {
    return runNonPreemptive(processes, contextSwitchTime, numberOfCores, 'Shortest Job First (Non-Preemptive)',
        (procs) => procs.sort((a, b) => a.burstTime - b.burstTime)[0]
    );
};

export const runPriority = (processes: Process[], contextSwitchTime: number, numberOfCores: number): SimulationResult => {
    return runNonPreemptive(processes, contextSwitchTime, numberOfCores, 'Priority (Non-Preemptive)',
        (procs) => procs.sort((a, b) => a.priority - b.priority)[0]
    );
};

export const runPriorityWithAging = (processes: Process[], contextSwitchTime: number, numberOfCores: number): SimulationResult => {
    // This is more complex than the generic non-preemptive runner allows, so it gets its own implementation.
    const localProcesses = deepCopyProcesses(processes).map(p => ({ ...p, originalPriority: p.priority }));
    const n = localProcesses.length;
    if (n === 0) {
        return {
            algorithm: 'Priority with Aging (Non-Preemptive)', processes: [], ganttChart: [], avgWaitingTime: 0,
            avgTurnaroundTime: 0, contextSwitches: 0, cpuUtilization: 0, numberOfCores
        };
    }
    const ganttChart: GanttChartEntry[] = [];
    let completed = 0;
    let totalWaitingTime = 0;
    let totalTurnaroundTime = 0;
    let contextSwitches = 0;
    const AGING_THRESHOLD = 10;

    const cores: Core[] = Array.from({ length: numberOfCores }, (_, i) => ({
        id: i, currentTime: 0, lastProcessId: null, runningProcess: null
    }));

    while (completed < n) {
        const earliestCore = findNextAvailableCore(cores);
        const currentTime = earliestCore.currentTime;

        let availableProcesses = localProcesses.filter(p => p.arrivalTime <= currentTime && !p.completionTime);
        
        if (availableProcesses.length > 0) {
            // Apply aging
            availableProcesses.forEach(p => {
                const waitingTime = currentTime - p.arrivalTime;
                if (waitingTime > AGING_THRESHOLD) {
                    const newPriority = p.originalPriority! - Math.floor(waitingTime / AGING_THRESHOLD);
                    p.priority = Math.max(1, newPriority);
                }
            });
            
            availableProcesses.sort((a, b) => a.priority - b.priority);
            const currentProcess = availableProcesses[0];
            const processInList = localProcesses.find(p => p.id === currentProcess.id)!;

            let startTime = currentTime;
            if (earliestCore.lastProcessId !== null && earliestCore.lastProcessId !== processInList.id && contextSwitchTime > 0) {
                contextSwitches++;
                ganttChart.push({ processId: 'context-switch', processName: 'CS', start: startTime, end: startTime + contextSwitchTime, color: CONTEXT_SWITCH_COLOR, coreId: earliestCore.id });
                startTime += contextSwitchTime;
            }

            processInList.waitingTime = startTime - processInList.arrivalTime;
            const completionTime = startTime + processInList.burstTime;
            processInList.completionTime = completionTime;
            processInList.turnaroundTime = completionTime - processInList.arrivalTime;

            totalWaitingTime += processInList.waitingTime;
            totalTurnaroundTime += processInList.turnaroundTime;

            ganttChart.push({ processId: processInList.id, processName: processInList.name, start: startTime, end: completionTime, color: processInList.color, coreId: earliestCore.id });
            
            earliestCore.currentTime = completionTime;
            earliestCore.lastProcessId = processInList.id;
            completed++;
            
            // Reset priorities for next iteration's aging calculation
            localProcesses.forEach(p => p.priority = p.originalPriority!);
        } else {
            const remainingProcesses = localProcesses.filter(p => !p.completionTime);
            if(remainingProcesses.length === 0) break;
            const nextArrivalTime = Math.min(...remainingProcesses.map(p => p.arrivalTime));
            ganttChart.push({ processId: 'idle', processName: 'Idle', start: currentTime, end: nextArrivalTime, color: IDLE_COLOR, coreId: earliestCore.id });
            earliestCore.currentTime = nextArrivalTime;
        }
    }
    
    const makespan = Math.max(...cores.map(c => c.currentTime));
    const cpuUtilization = calculateCpuUtilization(ganttChart, makespan, numberOfCores);

    return {
        algorithm: 'Priority with Aging (Non-Preemptive)', processes: localProcesses, ganttChart,
        avgWaitingTime: totalWaitingTime / n, avgTurnaroundTime: totalTurnaroundTime / n, contextSwitches, cpuUtilization, numberOfCores
    };
};


// --- Preemptive algorithms ---

const runPreemptive = (
  processes: Process[],
  contextSwitchTime: number,
  numberOfCores: number,
  algorithmName: string,
  getProcess: (procs: Process[], cores: Core[]) => Process | null
): SimulationResult => {
  const localProcesses = deepCopyProcesses(processes).map(p => ({ ...p, remainingTime: p.burstTime }));
  const n = localProcesses.length;

  if (n === 0) {
    return {
      algorithm: algorithmName, processes: [], ganttChart: [], avgWaitingTime: 0,
      avgTurnaroundTime: 0, contextSwitches: 0, cpuUtilization: 0, numberOfCores
    };
  }

  const ganttChart: GanttChartEntry[] = [];
  let currentTime = 0;
  let completed = 0;
  let contextSwitches = 0;
  
  const cores: Core[] = Array.from({ length: numberOfCores }, (_, i) => ({
    id: i, currentTime: 0, lastProcessId: null, runningProcess: null
  }));

  while (completed < n) {
      const availableToRun = localProcesses.filter(p => p.arrivalTime <= currentTime && p.remainingTime! > 0);
      const freeCores = cores.filter(c => c.runningProcess === null);

      // Assign processes to free cores
      for (const core of freeCores) {
          const processToRun = getProcess(availableToRun.filter(p => !cores.some(c => c.runningProcess?.id === p.id)), cores);
          if (processToRun) {
              if (core.lastProcessId !== null && core.lastProcessId !== processToRun.id && contextSwitchTime > 0) {
                // Not perfectly accurate for preemptive, but an approximation
              }
              core.runningProcess = processToRun;
          }
      }

      // Preemption check for cores that are already running something
      for (const core of cores) {
          if (core.runningProcess) {
              const bestProcessForCore = getProcess(availableToRun, cores);
              if (bestProcessForCore && bestProcessForCore.id !== core.runningProcess.id) {
                  const runningIsWorse = getProcess([core.runningProcess, bestProcessForCore], cores)?.id === bestProcessForCore.id;
                  if(runningIsWorse) {
                    // Preempt
                    core.runningProcess = bestProcessForCore;
                  }
              }
          }
      }

      const tick = 1;
      let lastGanttEntries: (GanttChartEntry | null)[] = cores.map(() => null);

      cores.forEach((core, i) => {
        const lastEntry = ganttChart.filter(g => g.coreId === core.id).pop();
        if(lastEntry && lastEntry.end === currentTime) lastGanttEntries[i] = lastEntry;
      });

      cores.forEach(core => {
          if (core.runningProcess) {
              const processInList = localProcesses.find(p => p.id === core.runningProcess!.id)!;
              const lastGantt = lastGanttEntries[core.id];
              
              if(core.lastProcessId !== processInList.id) {
                if(core.lastProcessId !== null) contextSwitches++;
                ganttChart.push({processId: 'context-switch', processName: 'CS', start: currentTime, end: currentTime + contextSwitchTime, color: CONTEXT_SWITCH_COLOR, coreId: core.id});
                core.currentTime += contextSwitchTime;
              }

              if(lastGantt && lastGantt.processId === processInList.id) {
                  lastGantt.end += tick;
              } else {
                  ganttChart.push({ processId: processInList.id, processName: processInList.name, start: currentTime, end: currentTime + tick, color: processInList.color, coreId: core.id });
              }

              processInList.remainingTime! -= tick;

              if (processInList.remainingTime! <= 0) {
                  processInList.completionTime = currentTime + tick;
                  processInList.turnaroundTime = processInList.completionTime - processInList.arrivalTime;
                  processInList.waitingTime = processInList.turnaroundTime - processInList.burstTime;
                  completed++;
                  core.runningProcess = null;
              }
              core.lastProcessId = processInList.id;
          } else {
              const lastGantt = lastGanttEntries[core.id];
              if(lastGantt && lastGantt.processId === 'idle') {
                  lastGantt.end += tick;
              } else {
                  ganttChart.push({ processId: 'idle', processName: 'Idle', start: currentTime, end: currentTime + tick, color: IDLE_COLOR, coreId: core.id });
              }
          }
      });
      
      currentTime += tick;
      if (currentTime > 1000) break; // Safety break
  }

  const totalWaitingTime = localProcesses.reduce((acc, p) => acc + (p.waitingTime || 0), 0);
  const totalTurnaroundTime = localProcesses.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0);
  const makespan = Math.max(...localProcesses.map(p => p.completionTime || 0));
  const cpuUtilization = calculateCpuUtilization(ganttChart, makespan, numberOfCores);
  
  return {
    algorithm: algorithmName, processes: localProcesses, ganttChart,
    avgWaitingTime: totalWaitingTime / n, avgTurnaroundTime: totalTurnaroundTime / n,
    contextSwitches, cpuUtilization, numberOfCores
  };
};

export const runSRTF = (processes: Process[], contextSwitchTime: number, numberOfCores: number): SimulationResult => {
    // A proper multi-core SRTF is very complex. This is a simplified simulation.
    return runPreemptive(processes, contextSwitchTime, numberOfCores, 'Shortest Remaining Time First (SJF Preemptive)',
        (procs) => procs.length > 0 ? procs.sort((a,b) => a.remainingTime! - b.remainingTime!)[0] : null
    );
};

export const runPriorityPreemptive = (processes: Process[], contextSwitchTime: number, numberOfCores: number): SimulationResult => {
    // A proper multi-core preemptive priority is very complex. This is a simplified simulation.
    return runPreemptive(processes, contextSwitchTime, numberOfCores, 'Priority (Preemptive)',
        (procs) => procs.length > 0 ? procs.sort((a,b) => a.priority - b.priority)[0] : null
    );
};

export const runRoundRobin = (processes: Process[], timeQuantum: number, contextSwitchTime: number, numberOfCores: number): SimulationResult => {
    const localProcesses = deepCopyProcesses(processes).map(p => ({ ...p, remainingTime: p.burstTime }));
    const n = localProcesses.length;

    if (n === 0) {
        return {
            algorithm: 'Round Robin', processes: [], ganttChart: [], avgWaitingTime: 0,
            avgTurnaroundTime: 0, contextSwitches: 0, cpuUtilization: 0, numberOfCores
        };
    }
    
    const ganttChart: GanttChartEntry[] = [];
    const readyQueue: Process[] = [];
    let currentTime = 0;
    let completed = 0;
    let contextSwitches = 0;
    let processIdx = 0;
    const allProcesses = localProcesses.sort((a,b) => a.arrivalTime - b.arrivalTime);
    
    const cores: Core[] = Array.from({ length: numberOfCores }, (_, i) => ({
      id: i, currentTime: 0, lastProcessId: null, runningProcess: null
    }));

    while (completed < n) {
        while (processIdx < n && allProcesses[processIdx].arrivalTime <= currentTime) {
            readyQueue.push(allProcesses[processIdx]);
            processIdx++;
        }

        cores.forEach(core => {
            if (core.currentTime <= currentTime && core.runningProcess) {
                const p = core.runningProcess;
                if(p.remainingTime! > 0) {
                    readyQueue.push(p);
                }
                core.runningProcess = null;
            }
        });

        cores.filter(c => c.runningProcess === null).forEach(core => {
            if(readyQueue.length > 0) {
                const currentProcess = readyQueue.shift()!;
                core.runningProcess = currentProcess;

                if (core.lastProcessId !== null && core.lastProcessId !== currentProcess.id) {
                    contextSwitches++;
                    ganttChart.push({ processId: 'context-switch', processName: 'CS', start: currentTime, end: currentTime + contextSwitchTime, color: CONTEXT_SWITCH_COLOR, coreId: core.id });
                    core.currentTime = currentTime + contextSwitchTime;
                } else {
                    core.currentTime = currentTime;
                }

                const startTime = core.currentTime;
                const executionTime = Math.min(currentProcess.remainingTime!, timeQuantum);
                currentProcess.remainingTime! -= executionTime;
                core.currentTime += executionTime;

                ganttChart.push({ processId: currentProcess.id, processName: currentProcess.name, start: startTime, end: core.currentTime, color: currentProcess.color, coreId: core.id });

                if (currentProcess.remainingTime! <= 0) {
                    const processInList = localProcesses.find(p => p.id === currentProcess.id)!;
                    processInList.completionTime = core.currentTime;
                    processInList.turnaroundTime = processInList.completionTime - processInList.arrivalTime;
                    processInList.waitingTime = processInList.turnaroundTime - processInList.burstTime;
                    completed++;
                }
                core.lastProcessId = currentProcess.id;
            }
        });
        
        const nextCoreEventTime = Math.min(...cores.map(c => c.runningProcess ? c.currentTime : Infinity));
        const nextProcessArrivalTime = processIdx < n ? allProcesses[processIdx].arrivalTime : Infinity;
        const nextTime = Math.min(nextCoreEventTime, nextProcessArrivalTime);

        if(nextTime === Infinity) {
          if(readyQueue.length === 0 && cores.every(c => c.runningProcess === null)) break;
          currentTime++;
          continue;
        };

        if (currentTime < nextTime) {
            cores.forEach(core => {
                if (core.currentTime <= currentTime && !core.runningProcess) {
                     ganttChart.push({ processId: 'idle', processName: 'Idle', start: currentTime, end: nextTime, color: IDLE_COLOR, coreId: core.id });
                }
            })
            currentTime = nextTime;
        } else {
             currentTime++;
        }
    }

    const totalWaitingTime = localProcesses.reduce((acc, p) => acc + (p.waitingTime || 0), 0);
    const totalTurnaroundTime = localProcesses.reduce((acc, p) => acc + (p.turnaroundTime || 0), 0);
    const makespan = Math.max(...localProcesses.map(p => p.completionTime || 0));
    const cpuUtilization = calculateCpuUtilization(ganttChart, makespan, numberOfCores);
    
    return {
        algorithm: 'Round Robin', processes: localProcesses, ganttChart,
        avgWaitingTime: totalWaitingTime / n, avgTurnaroundTime: totalTurnaroundTime / n,
        contextSwitches, cpuUtilization, numberOfCores
    };
};
