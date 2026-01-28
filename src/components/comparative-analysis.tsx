"use client";

import type { SimulationResult } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Legend } from "recharts";
import { useMemo } from "react";

interface ComparativeAnalysisProps {
  results: SimulationResult[];
}

const chartConfig = {
    "Avg. Waiting Time": {
      label: "Avg. Waiting Time",
      color: "hsl(var(--chart-1))",
    },
    "Avg. Turnaround Time": {
      label: "Avg. Turnaround Time",
      color: "hsl(var(--chart-2))",
    },
  } satisfies ChartConfig;

export function ComparativeAnalysis({ results }: ComparativeAnalysisProps) {
  if (results.length === 0) {
    return null;
  }
  
  const sortedResults = useMemo(() => {
    return [...results].sort((a,b) => a.avgWaitingTime - b.avgWaitingTime);
  }, [results]);

  const chartData = sortedResults.map(r => ({
    name: r.algorithm.replace(/\s\(.*/, '').replace(/First-Come, First-Served/, 'FCFS'),
    "Avg. Waiting Time": parseFloat(r.avgWaitingTime.toFixed(2)),
    "Avg. Turnaround Time": parseFloat(r.avgTurnaroundTime.toFixed(2)),
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparative Analysis</CardTitle>
        <CardDescription>
          A side-by-side comparison of all scheduling algorithms.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Performance Metrics</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                        <TableRow>
                            <TableHead className="font-semibold">Algorithm</TableHead>
                            <TableHead className="text-right font-semibold">Avg. Waiting Time</TableHead>
                            <TableHead className="text-right font-semibold">Avg. Turnaround Time</TableHead>
                            <TableHead className="text-right font-semibold">CPU Utilization</TableHead>
                            <TableHead className="text-right font-semibold">Context Switches</TableHead>
                        </TableRow>
                        </TableHeader>
                        <TableBody>
                        {sortedResults.map((result) => (
                            <TableRow key={result.algorithm}>
                            <TableCell className="font-medium">{result.algorithm}</TableCell>
                            <TableCell className="text-right">{result.avgWaitingTime.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{result.avgTurnaroundTime.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{result.cpuUtilization.toFixed(2)}%</TableCell>
                            <TableCell className="text-right">{result.contextSwitches}</TableCell>
                            </TableRow>
                        ))}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
        <Card>
            <CardHeader>
                <CardTitle className="text-lg">Performance Chart</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[400px] w-full">
                    <ChartContainer config={chartConfig} className="w-full h-full">
                        <BarChart accessibilityLayer data={chartData} margin={{ top: 20, right: 20, bottom: 80, left: 0 }}>
                            <CartesianGrid vertical={false} />
                            <XAxis
                                dataKey="name"
                                tickLine={false}
                                tickMargin={10}
                                angle={-45}
                                textAnchor="end"
                                interval={0}
                                height={100}
                                style={{ fontSize: '0.75rem' }}
                            />
                            <YAxis />
                            <ChartTooltip
                                cursor={false}
                                content={<ChartTooltipContent indicator="dot" />}
                            />
                            <Legend verticalAlign="top" />
                            <Bar dataKey="Avg. Waiting Time" fill="var(--color-Avg. Waiting Time)" radius={4} />
                            <Bar dataKey="Avg. Turnaround Time" fill="var(--color-Avg. Turnaround Time)" radius={4} />
                        </BarChart>
                    </ChartContainer>
                </div>
            </CardContent>
        </Card>
      </CardContent>
    </Card>
  );
}
