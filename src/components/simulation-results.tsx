"use client";

import type { SimulationResult } from "@/lib/types";
import { GanttChart } from "@/components/gantt-chart";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { ExecutionLog } from "./execution-log";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import htmlToDocx from 'html-to-docx';
import { saveAs } from 'file-saver';
import '@/lib/jspdf.d.ts';


interface SimulationResultsProps {
  results: SimulationResult[];
}

export function SimulationResults({ results }: SimulationResultsProps) {
  if (results.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardHeader>
          <CardTitle>No Simulation Data</CardTitle>
          <CardDescription>Configure your processes and run the simulation to see the results.</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  const handleDownloadPDF = (result: SimulationResult) => {
    const doc = new jsPDF();

    doc.setFontSize(20);
    doc.text(`Simulation Results: ${result.algorithm}`, 14, 22);

    doc.setFontSize(12);
    doc.text(`Average Waiting Time: ${result.avgWaitingTime.toFixed(2)}`, 14, 32);
    doc.text(`Average Turnaround Time: ${result.avgTurnaroundTime.toFixed(2)}`, 14, 38);
    doc.text(`CPU Utilization: ${result.cpuUtilization.toFixed(2)}%`, 14, 44);
    doc.text(`Context Switches: ${result.contextSwitches}`, 14, 50);

    const head = [['Process', 'Arrival', 'Burst', 'Priority', 'Completion', 'Turnaround', 'Waiting']];
    const body = result.processes.map(p => [
        p.name,
        p.arrivalTime,
        p.burstTime,
        p.originalPriority ?? p.priority,
        p.completionTime?.toFixed(2) ?? 'N/A',
        p.turnaroundTime?.toFixed(2) ?? 'N/A',
        p.waitingTime?.toFixed(2) ?? 'N/A'
    ]);

    autoTable(doc, {
        head: head,
        body: body,
        startY: 60,
    });

    doc.save(`${result.algorithm.replace(/\s+/g, '_')}_results.pdf`);
  };

  const handleDownloadWord = async (result: SimulationResult) => {
      const tableRows = result.processes.map(p => `
          <tr>
              <td>${p.name}</td>
              <td>${p.arrivalTime}</td>
              <td>${p.burstTime}</td>
              <td>${p.originalPriority ?? p.priority}</td>
              <td>${p.completionTime?.toFixed(2) ?? 'N/A'}</td>
              <td>${p.turnaroundTime?.toFixed(2) ?? 'N/A'}</td>
              <td>${p.waitingTime?.toFixed(2) ?? 'N/A'}</td>
          </tr>
      `).join('');

      const htmlString = `
          <!DOCTYPE html>
          <html>
          <head>
              <title>Simulation Results</title>
              <style>
                  body { font-family: sans-serif; }
                  table { border-collapse: collapse; width: 100%; }
                  th, td { border: 1px solid #dddddd; text-align: left; padding: 8px; }
                  th { background-color: #f2f2f2; }
              </style>
          </head>
          <body>
              <h1>Simulation Results: ${result.algorithm}</h1>
              <h2>Summary Metrics</h2>
              <ul>
                  <li>Average Waiting Time: ${result.avgWaitingTime.toFixed(2)}</li>
                  <li>Average Turnaround Time: ${result.avgTurnaroundTime.toFixed(2)}</li>
                  <li>CPU Utilization: ${result.cpuUtilization.toFixed(2)}%</li>
                  <li>Context Switches: ${result.contextSwitches}</li>
              </ul>
              <h2>Process Details</h2>
              <table>
                  <thead>
                      <tr>
                          <th>Process</th>
                          <th>Arrival</th>
                          <th>Burst</th>
                          <th>Priority</th>
                          <th>Completion</th>
                          <th>Turnaround</th>
                          <th>Waiting</th>
                      </tr>
                  </thead>
                  <tbody>
                      ${tableRows}
                  </tbody>
              </table>
          </body>
          </html>
      `;

      const fileBuffer = await htmlToDocx(htmlString, undefined, {
          table: { row: { cantSplit: true } },
          footer: true,
          pageNumber: true,
      });

      saveAs(fileBuffer as Blob, `${result.algorithm.replace(/\s+/g, '_')}_results.docx`);
  };


  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulation Results</CardTitle>
        <CardDescription>
          Analysis of each scheduling algorithm based on the provided processes.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={results[0].algorithm}>
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 h-auto">
            {results.map((result) => (
              <TabsTrigger key={result.algorithm} value={result.algorithm} className="whitespace-normal">
                {result.algorithm}
              </TabsTrigger>
            ))}
          </TabsList>
          {results.map((result) => (
            <TabsContent key={result.algorithm} value={result.algorithm} className="mt-4 space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Avg. Waiting Time</CardDescription>
                    <CardTitle className="text-3xl text-primary">{result.avgWaitingTime.toFixed(2)}</CardTitle>
                  </CardHeader>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Avg. Turnaround Time</CardDescription>
                    <CardTitle className="text-3xl text-primary">{result.avgTurnaroundTime.toFixed(2)}</CardTitle>
                  </CardHeader>
                </Card>
                 <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>Context Switches</CardDescription>
                    <CardTitle className="text-3xl text-primary">{result.contextSwitches}</CardTitle>
                  </CardHeader>
                </Card>
                 <Card>
                  <CardHeader className="pb-2">
                    <CardDescription>CPU Utilization</CardDescription>
                    <CardTitle className="text-3xl text-primary">{result.cpuUtilization.toFixed(2)}%</CardTitle>
                  </CardHeader>
                </Card>
              </div>
              
              <GanttChart ganttChart={result.ganttChart} numberOfCores={result.numberOfCores} />

              <ExecutionLog log={result.executionLog} />

              <Card>
                <CardHeader>
                  <CardTitle>Process Details</CardTitle>
                </CardHeader>
                <CardContent>
                   <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Process</TableHead>
                            <TableHead>Arrival</TableHead>
                            <TableHead>Burst</TableHead>
                            <TableHead>Priority</TableHead>
                            <TableHead>Completion</TableHead>
                            <TableHead>Turnaround</TableHead>
                            <TableHead>Waiting</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {result.processes.map((p) => (
                            <TableRow key={p.id}>
                              <TableCell><Badge style={{ backgroundColor: p.color }} className="text-white">{p.name}</Badge></TableCell>
                              <TableCell>{p.arrivalTime}</TableCell>
                              <TableCell>{p.burstTime}</TableCell>
                              <TableCell>{p.originalPriority ?? p.priority}</TableCell>
                              <TableCell>{p.completionTime?.toFixed(2)}</TableCell>
                              <TableCell>{p.turnaroundTime?.toFixed(2)}</TableCell>
                              <TableCell>{p.waitingTime?.toFixed(2)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                   </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                    <CardTitle>Download Results</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-wrap gap-4">
                    <Button onClick={() => handleDownloadPDF(result)}>
                        <Download className="mr-2 h-4 w-4" />
                        Download as PDF
                    </Button>
                    <Button onClick={() => handleDownloadWord(result)} variant="outline">
                        <Download className="mr-2 h-4 w-4" />
                        Download as Word
                    </Button>
                </CardContent>
              </Card>

            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
