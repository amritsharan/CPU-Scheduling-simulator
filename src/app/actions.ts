"use server";

import { suggestOptimalAlgorithm, SuggestOptimalAlgorithmInput } from "@/ai/flows/suggest-optimal-algorithm";
import { SimulationResult } from "@/lib/types";
import htmlToDocx from 'html-to-docx';

const formatResultForAI = (result: SimulationResult) => ({
  waitingTime: result.avgWaitingTime,
  turnaroundTime: result.avgTurnaroundTime,
  contextSwitches: result.contextSwitches,
  cpuUtilization: result.cpuUtilization,
});

export async function getAiSuggestion(
  results: SimulationResult[],
  performanceCriteria: string
) {
  try {
    const fcfsResult = results.find(r => r.algorithm === 'First-Come, First-Served');
    const sjfResult = results.find(r => r.algorithm === 'Shortest Job First (Non-Preemptive)');
    const srtfResult = results.find(r => r.algorithm === 'Shortest Remaining Time First (SJF Preemptive)');
    const priorityResult = results.find(r => r.algorithm === 'Priority (Non-Preemptive)');
    const priorityPreemptiveResult = results.find(r => r.algorithm === 'Priority (Preemptive)');
    const rrResult = results.find(r => r.algorithm === 'Round Robin');
    const priorityAgingResult = results.find(r => r.algorithm === 'Priority with Aging (Non-Preemptive)');

    if (!fcfsResult || !sjfResult || !priorityResult || !rrResult || !srtfResult || !priorityPreemptiveResult || !priorityAgingResult) {
      throw new Error("One or more simulation results are missing for AI Analysis.");
    }
    
    const input: SuggestOptimalAlgorithmInput = {
      fcfs: formatResultForAI(fcfsResult),
      sjf: formatResultForAI(sjfResult),
      srtf: formatResultForAI(srtfResult),
      priority: formatResultForAI(priorityResult),
      priorityPreemptive: formatResultForAI(priorityPreemptiveResult),
      roundRobin: formatResultForAI(rrResult),
      priorityAging: formatResultForAI(priorityAgingResult),
      performanceCriteria,
    };

    const suggestion = await suggestOptimalAlgorithm(input);
    return { success: true, data: suggestion };
  } catch (error) {
    console.error("Error getting AI suggestion:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred.";
    return { success: false, error: errorMessage };
  }
}

export async function generateDocx(htmlString: string) {
    const fileBuffer = await htmlToDocx(htmlString, undefined, {
      table: { row: { cantSplit: true } },
      footer: true,
      pageNumber: true,
    });
  
    // The fileBuffer is a Buffer in Node.js environment
    return fileBuffer.toString('base64');
}
