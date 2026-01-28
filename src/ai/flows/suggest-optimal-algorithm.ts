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

const AlgorithmResultSchema = z.object({
  waitingTime: z.number().describe('The average waiting time.'),
  turnaroundTime: z.number().describe('The average turnaround time.'),
  contextSwitches: z.number().describe('The number of context switches.'),
  cpuUtilization: z.number().describe('The CPU utilization percentage.'),
});


const SuggestOptimalAlgorithmInputSchema = z.object({
  fcfs: AlgorithmResultSchema,
  sjf: AlgorithmResultSchema,
  srtf: AlgorithmResultSchema,
  priority: AlgorithmResultSchema,
  priorityPreemptive: AlgorithmResultSchema,
  roundRobin: AlgorithmResultSchema,
  priorityAging: AlgorithmResultSchema,
  performanceCriteria: z
    .string()
    .describe(
      'The performance criteria to optimize for, such as minimizing waiting time or turnaround time. Possible values: waiting time, turnaround time, cpu utilization, context switches, a combination of all.'
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
  prompt: `You are an expert in CPU scheduling algorithms. You will analyze the simulation results for different scheduling algorithms and suggest the best algorithm based on the user-defined performance criteria. Also, suggest mitigation strategies for trade-offs and starvation scenarios.

Here are the simulation results:

First-Come, First-Served (FCFS): 
- Avg. Waiting Time = {{fcfs.waitingTime}}
- Avg. Turnaround Time = {{fcfs.turnaroundTime}}
- Context Switches = {{fcfs.contextSwitches}}
- CPU Utilization = {{fcfs.cpuUtilization}}%

Shortest Job First (SJF) (Non-Preemptive): 
- Avg. Waiting Time = {{sjf.waitingTime}}
- Avg. Turnaround Time = {{sjf.turnaroundTime}}
- Context Switches = {{sjf.contextSwitches}}
- CPU Utilization = {{sjf.cpuUtilization}}%

Shortest Remaining Time First (SRTF) (SJF Preemptive): 
- Avg. Waiting Time = {{srtf.waitingTime}}
- Avg. Turnaround Time = {{srtf.turnaroundTime}}
- Context Switches = {{srtf.contextSwitches}}
- CPU Utilization = {{srtf.cpuUtilization}}%

Priority (Non-Preemptive): 
- Avg. Waiting Time = {{priority.waitingTime}}
- Avg. Turnaround Time = {{priority.turnaroundTime}}
- Context Switches = {{priority.contextSwitches}}
- CPU Utilization = {{priority.cpuUtilization}}%

Priority (Preemptive):
- Avg. Waiting Time = {{priorityPreemptive.waitingTime}}
- Avg. Turnaround Time = {{priorityPreemptive.turnaroundTime}}
- Context Switches = {{priorityPreemptive.contextSwitches}}
- CPU Utilization = {{priorityPreemptive.cpuUtilization}}%

Round Robin:
- Avg. Waiting Time = {{roundRobin.waitingTime}}
- Avg. Turnaround Time = {{roundRobin.turnaroundTime}}
- Context Switches = {{roundRobin.contextSwitches}}
- CPU Utilization = {{roundRobin.cpuUtilization}}%

Priority with Aging (Non-Preemptive):
- Avg. Waiting Time = {{priorityAging.waitingTime}}
- Avg. Turnaround Time = {{priorityAging.turnaroundTime}}
- Context Switches = {{priorityAging.contextSwitches}}
- CPU Utilization = {{priorityAging.cpuUtilization}}%

Performance Criteria: {{{performanceCriteria}}}

Based on the simulation results and the performance criteria, suggest the optimal scheduling algorithm. Explain your reasoning, and discuss the trade-offs associated with the suggested algorithm, and suggest mitigation strategies for starvation scenarios, if any exist for the suggested algorithm.

Consider these points when creating the response:

*   **Optimal Scheduling Algorithm**: Based on the performance criteria, identify the algorithm that best meets the specified requirements. 
    - If "waiting time" or "turnaround time", pick the algorithm with the lowest value for that metric.
    - If "cpu utilization", pick the one with the highest value.
    - If "context switches", pick the one with the lowest value.
    - If it is a combination, choose the algorithm that has the best-balanced performance across all metrics.
*   **Reasoning**: Explain why the selected algorithm is the most suitable for the given performance criteria. Consider the characteristics of each algorithm and how they align with the optimization goals.
*   **Trade-offs**: Discuss the potential trade-offs associated with the suggested algorithm. For example, if SJF is selected for minimizing waiting time, mention its potential for starvation.
*   **Starvation Mitigation**: Provide mitigation strategies for starvation scenarios, if applicable. Mention that the "Priority with Aging" algorithm is a direct solution to starvation in priority-based scheduling.

Adhere to the output schema defined by Zod.
`,
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
