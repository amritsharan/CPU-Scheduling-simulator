'use server';

/**
 * @fileOverview This file defines a Genkit flow for suggesting mitigation strategies
 * for common CPU scheduling challenges like trade-offs and starvation scenarios.
 *
 * - suggestMitigationStrategies - A function that suggests mitigation strategies based on scheduling algorithm analysis.
 * - SuggestMitigationStrategiesInput - The input type for the suggestMitigationStrategies function.
 * - SuggestMitigationStrategiesOutput - The output type for the suggestMitigationStrategies function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestMitigationStrategiesInputSchema = z.object({
  algorithm: z.string().describe('The scheduling algorithm used in the simulation (e.g., FCFS, SJF, Priority, Round Robin).'),
  waitingTime: z.number().describe('The average waiting time of the processes.'),
  turnaroundTime: z.number().describe('The average turnaround time of the processes.'),
  contextSwitches: z.number().describe('The number of context switches that occurred during the simulation.'),
  starvationPossible: z.boolean().describe('Whether starvation is possible with the given algorithm and scenario.'),
  performanceCriteria: z.string().describe('User-defined performance criteria (e.g., minimize waiting time, ensure fairness).'),
});
export type SuggestMitigationStrategiesInput = z.infer<typeof SuggestMitigationStrategiesInputSchema>;

const SuggestMitigationStrategiesOutputSchema = z.object({
  algorithmAnalysis: z.string().describe('Analysis of the algorithm based on the provided metrics.'),
  bestPractices: z.string().describe('Suggestions for best practices to optimize the algorithm for the given performance criteria.'),
  mitigationStrategies: z.string().describe('Mitigation strategies for trade-offs and starvation scenarios.'),
});
export type SuggestMitigationStrategiesOutput = z.infer<typeof SuggestMitigationStrategiesOutputSchema>;

export async function suggestMitigationStrategies(
  input: SuggestMitigationStrategiesInput
): Promise<SuggestMitigationStrategiesOutput> {
  return suggestMitigationStrategiesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestMitigationStrategiesPrompt',
  input: {schema: SuggestMitigationStrategiesInputSchema},
  output: {schema: SuggestMitigationStrategiesOutputSchema},
  prompt: `You are an expert in CPU scheduling algorithms. Based on the provided simulation results and user-defined performance criteria, provide an analysis of the algorithm, suggest best practices for optimization, and offer mitigation strategies for trade-offs and starvation scenarios.

Algorithm: {{{algorithm}}}
Average Waiting Time: {{{waitingTime}}}
Average Turnaround Time: {{{turnaroundTime}}}
Number of Context Switches: {{{contextSwitches}}}
Starvation Possible: {{{starvationPossible}}}
User-Defined Performance Criteria: {{{performanceCriteria}}}


Output should include algorithmAnalysis, bestPractices and mitigationStrategies.
`,
});

const suggestMitigationStrategiesFlow = ai.defineFlow(
  {
    name: 'suggestMitigationStrategiesFlow',
    inputSchema: SuggestMitigationStrategiesInputSchema,
    outputSchema: SuggestMitigationStrategiesOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
