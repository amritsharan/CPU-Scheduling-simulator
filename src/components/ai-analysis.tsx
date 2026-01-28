"use client";

import { useState } from "react";
import type { SimulationResult } from "@/lib/types";
import { getAiSuggestion } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrainCircuit, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { SuggestOptimalAlgorithmOutput } from "@/ai/flows/suggest-optimal-algorithm";

interface AiAnalysisProps {
  results: SimulationResult[];
  isEnabled: boolean;
}

export function AiAnalysis({ results, isEnabled }: AiAnalysisProps) {
  const [performanceCriteria, setPerformanceCriteria] = useState("a combination of all");
  const [suggestion, setSuggestion] = useState<SuggestOptimalAlgorithmOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGetSuggestion = async () => {
    setIsLoading(true);
    setSuggestion(null);
    const response = await getAiSuggestion(results, performanceCriteria);
    setIsLoading(false);

    if (response.success && response.data) {
      setSuggestion(response.data);
    } else {
      toast({
        variant: "destructive",
        title: "AI Analysis Failed",
        description: response.error || "An unknown error occurred.",
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
            <BrainCircuit className="h-6 w-6 text-primary" />
            <CardTitle>AI Performance Analysis</CardTitle>
        </div>
        <CardDescription>
          Get an AI-powered recommendation for the best scheduling algorithm based on your performance goals.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Select
            value={performanceCriteria}
            onValueChange={setPerformanceCriteria}
            disabled={!isEnabled}
          >
            <SelectTrigger className="w-full sm:w-[300px]">
              <SelectValue placeholder="Select performance criteria..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="waiting time">Minimize Waiting Time</SelectItem>
              <SelectItem value="turnaround time">Minimize Turnaround Time</SelectItem>
              <SelectItem value="cpu utilization">Maximize CPU Utilization</SelectItem>
              <SelectItem value="context switches">Minimize Context Switches</SelectItem>
              <SelectItem value="a combination of all">Balanced Performance</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleGetSuggestion} disabled={!isEnabled || isLoading} className="w-full sm:w-auto">
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BrainCircuit className="mr-2 h-4 w-4" />}
            Get AI Suggestion
          </Button>
        </div>
        
        {isLoading && (
            <div className="flex justify-center items-center p-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )}

        {suggestion && (
          <div className="space-y-4 pt-4">
            <Alert>
              <AlertTitle className="text-lg">Suggested Algorithm: <span className="text-accent font-bold">{suggestion.suggestedAlgorithm}</span></AlertTitle>
              <AlertDescription>
                {suggestion.reasoning}
              </AlertDescription>
            </Alert>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Trade-offs</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{suggestion.tradeOffs}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="text-base">Starvation Mitigation</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">{suggestion.starvationMitigation}</p>
                </CardContent>
            </Card>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
