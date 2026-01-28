"use client";

import { ExecutionLogEntry } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ExecutionLogProps {
  log: ExecutionLogEntry[];
}

export function ExecutionLog({ log }: ExecutionLogProps) {
  if (!log || log.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Process Execution Log</CardTitle>
        <CardDescription>A detailed, tick-by-tick log of CPU activity.</CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72 w-full rounded-md border">
          <Table className="font-code text-xs">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Time</TableHead>
                <TableHead className="w-[80px]">Core</TableHead>
                <TableHead>Message</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {log.map((entry, index) => (
                <TableRow key={index}>
                  <TableCell>{entry.time.toFixed(0)}</TableCell>
                  <TableCell>{entry.coreId + 1}</TableCell>
                  <TableCell>{entry.message}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
