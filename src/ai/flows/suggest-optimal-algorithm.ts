'use server';

/**
 * @fileOverview An AI agent that analyzes simulation results and suggests the best scheduling algorithm.
 *
 * - suggestOptimalAlgorithm - A function that suggests the best scheduling algorithm based on performance criteria.
 * - SuggestOptimalAlgorithmInput - The input type for the suggestOptimalAlgorithm function.
 * - SuggestOptimalAlgorithmOutput - The return type for the suggestOptimalAlgorithm function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestOptimalAlgorithmInputSchema = z.object({
  fcfsWaitingTime: z.number().describe('The average waiting time for FCFS scheduling algorithm.'),
  fcfsTurnaroundTime: z.number().describe('The average turnaround time for FCFS scheduling algorithm.'),
  sjfWaitingTime: z.number().describe('The average waiting time for SJF (Non-Preemptive) scheduling algorithm.'),
  sjfTurnaroundTime: z.number().describe('The average turnaround time for SJF (Non-Preemptive) scheduling algorithm.'),
  srtfWaitingTime: z.number().describe('The average waiting time for SRTF (SJF Preemptive) scheduling algorithm.'),
  srtfTurnaroundTime: z.number().describe('The average turnaround time for SRTF (SJF Preemptive) scheduling algorithm.'),
  priorityWaitingTime: z.number().describe('The average waiting time for Priority (Non-Preemptive) scheduling algorithm.'),
  priorityTurnaroundTime: z.number().describe('The average turnaround time for Priority (Non-Preemptive) scheduling algorithm.'),
  priorityPreemptiveWaitingTime: z.number().describe('The average waiting time for Priority (Preemptive) scheduling algorithm.'),
  priorityPreemptiveTurnaroundTime: z.number().describe('The average turnaround time for Priority (Preemptive) scheduling algorithm.'),
  roundRobinWaitingTime: z.number().describe('The average waiting time for Round Robin scheduling algorithm.'),
  roundRobinTurnaroundTime: z.number().describe('The average turnaround time for Round Robin scheduling algorithm.'),
  performanceCriteria: z
    .string()
    .describe(
      'The performance criteria to optimize for, such as minimizing waiting time or turnaround time. Possible values: waiting time, turnaround time, a combination of both.'
    ),
});
export type SuggestOptimalAlgorithmInput = z.infer<typeof SuggestOptimalAlgorithmInputSchema>;

const SuggestOptimalAlgorithmOutputSchema = z.object({
  suggestedAlgorithm: z.string().describe('The suggested optimal scheduling algorithm.'),
  reasoning: z.string().describe('The reasoning behind the suggested algorithm.'),
  tradeOffs: z.string().describe('The trade-offs associated with the suggested algorithm.'),
  starvationMitigation: z.string().describe('Mitigation strategies for starvation scenarios.'),
});
export type SuggestOptimalAlgorithmOutput = z.infer<typeof SuggestOptimalAlgorithmOutputSchema>;

export async function suggestOptimalAlgorithm(
  input: SuggestOptimalAlgorithmInput
): Promise<SuggestOptimalAlgorithmOutput> {
  return suggestOptimalAlgorithmFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestOptimalAlgorithmPrompt',
  input: {schema: SuggestOptimalAlgorithmInputSchema},
  output: {schema: SuggestOptimalAlgorithmOutputSchema},
  prompt: `You are an expert in CPU scheduling algorithms. You will analyze the simulation results for different scheduling algorithms (FCFS, SJF (Non-Preemptive), SRTF (SJF Preemptive), Priority (Non-Preemptive), Priority (Preemptive), Round Robin) and suggest the best algorithm based on the user-defined performance criteria. Also, suggest mitigation strategies for trade-offs and starvation scenarios.

Here are the simulation results:

FCFS: Waiting Time = {{{fcfsWaitingTime}}}, Turnaround Time = {{{fcfsTurnaroundTime}}}
SJF (Non-Preemptive): Waiting Time = {{{sjfWaitingTime}}}, Turnaround Time = {{{sjfTurnaroundTime}}}
SRTF (SJF Preemptive): Waiting Time = {{{srtfWaitingTime}}}, Turnaround Time = {{{srtfTurnaroundTime}}}
Priority (Non-Preemptive): Waiting Time = {{{priorityWaitingTime}}}, Turnaround Time = {{{priorityTurnaroundTime}}}
Priority (Preemptive): Waiting Time = {{{priorityPreemptiveWaitingTime}}}, Turnaround Time = {{{priorityPreemptiveTurnaroundTime}}}
Round Robin: Waiting Time = {{{roundRobinWaitingTime}}}, Turnaround Time = {{{roundRobinTurnaroundTime}}}

Performance Criteria: {{{performanceCriteria}}}

Based on the simulation results and the performance criteria, suggest the optimal scheduling algorithm. Explain your reasoning, and discuss the trade-offs associated with the suggested algorithm, and suggest mitigation strategies for starvation scenarios, if any exist for the suggested algorithm.

Consider these points when creating the response:

*   Optimal Scheduling Algorithm: Based on the performance criteria, identify the algorithm (FCFS, SJF (Non-Preemptive), SRTF (SJF Preemptive), Priority (Non-Preemptive), Priority (Preemptive), or Round Robin) that best meets the specified requirements. If the performance criteria is "waiting time", pick the algorithm with the lowest waiting time, and similarly for turnaround time. If it is a combination of both, choose the algorithm that has the best average across both metrics. If two algorithms have the exact same average, pick the SJF algorithm, since that is generally considered optimal.
*   Reasoning: Explain why the selected algorithm is the most suitable for the given performance criteria. Consider the characteristics of each algorithm and how they align with the optimization goals.
*   Trade-offs: Discuss the potential trade-offs associated with the suggested algorithm. For example, if SJF is selected for minimizing waiting time, mention its potential for starvation.
*   Starvation Mitigation: Provide mitigation strategies for starvation scenarios, if applicable. This could involve techniques like aging or dynamic priority adjustment.

Adhere to the output schema defined by Zod:
${JSON.stringify(SuggestOptimalAlgorithmOutputSchema.describe())}`,
});

const suggestOptimalAlgorithmFlow = ai.defineFlow(
  {
    name: 'suggestOptimalAlgorithmFlow',
    inputSchema: SuggestOptimalAlgorithmInputSchema,
    outputSchema: SuggestOptimalAlgorithmOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
