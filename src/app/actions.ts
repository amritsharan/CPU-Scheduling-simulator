"use server";

import { suggestOptimalAlgorithm, SuggestOptimalAlgorithmInput } from "@/ai/flows/suggest-optimal-algorithm";
import { SimulationResult } from "@/lib/types";

export async function getAiSuggestion(
  results: SimulationResult[],
  performanceCriteria: string
) {
  try {
    const fcfsResult = results.find(r => r.algorithm.includes('First-Come, First-Served'));
    const sjfResult = results.find(r => r.algorithm.includes('Shortest Job First'));
    const priorityResult = results.find(r => r.algorithm.includes('Priority'));
    const rrResult = results.find(r => r.algorithm.includes('Round Robin'));

    if (!fcfsResult || !sjfResult || !priorityResult || !rrResult) {
      throw new Error("One or more simulation results are missing.");
    }
    
    const input: SuggestOptimalAlgorithmInput = {
      fcfsWaitingTime: fcfsResult.avgWaitingTime,
      fcfsTurnaroundTime: fcfsResult.avgTurnaroundTime,
      sjfWaitingTime: sjfResult.avgWaitingTime,
      sjfTurnaroundTime: sjfResult.avgTurnaroundTime,
      priorityWaitingTime: priorityResult.avgWaitingTime,
      priorityTurnaroundTime: priorityResult.avgTurnaroundTime,
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
