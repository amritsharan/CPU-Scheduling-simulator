"use server";

import { suggestOptimalAlgorithm, SuggestOptimalAlgorithmInput } from "@/ai/flows/suggest-optimal-algorithm";
import { SimulationResult } from "@/lib/types";

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

    if (!fcfsResult || !sjfResult || !priorityResult || !rrResult || !srtfResult || !priorityPreemptiveResult) {
      throw new Error("One or more simulation results are missing for AI Analysis.");
    }
    
    const input: SuggestOptimalAlgorithmInput = {
      fcfsWaitingTime: fcfsResult.avgWaitingTime,
      fcfsTurnaroundTime: fcfsResult.avgTurnaroundTime,
      sjfWaitingTime: sjfResult.avgWaitingTime,
      sjfTurnaroundTime: sjfResult.avgTurnaroundTime,
      srtfWaitingTime: srtfResult.avgWaitingTime,
      srtfTurnaroundTime: srtfResult.avgTurnaroundTime,
      priorityWaitingTime: priorityResult.avgWaitingTime,
      priorityTurnaroundTime: priorityResult.avgTurnaroundTime,
      priorityPreemptiveWaitingTime: priorityPreemptiveResult.avgWaitingTime,
      priorityPreemptiveTurnaroundTime: priorityPreemptiveResult.avgTurnaroundTime,
      roundRobinWaitingTime: rrResult.avgWaitingTime,
      roundRobinTurnaroundTime: rrResult.avgTurnaroundTime,
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
