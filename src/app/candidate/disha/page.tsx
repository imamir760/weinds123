'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bot, Lightbulb, CheckCircle, List } from 'lucide-react';
import { generateLearningRoadmap, generateSpecializations } from '@/ai/flows';

export default function DishaAiPage() {
  const [goal, setGoal] = useState('');
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [roadmap, setRoadmap] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleGenerateSpecializations = async () => {
    if (!goal) return;
    setLoading(true);
    setRoadmap(null);
    setSpecializations([]);
    try {
      const result = await generateSpecializations({ interests: goal, skills: '' });
      setSpecializations(result.specializations);
    } catch (error) {
      console.error('Failed to generate specializations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateRoadmap = async (specialization: string) => {
    setLoading(true);
    setRoadmap(null);
    try {
      const result = await generateLearningRoadmap({ specialization, userCareerGoals: goal });
      setRoadmap({ ...result, specialization });
    } catch (error) {
      console.error('Failed to generate roadmap:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="text-center mb-12">
        <Bot className="w-16 h-16 mx-auto text-primary mb-4" />
        <h1 className="text-4xl font-bold font-headline">Disha AI Career OS</h1>
        <p className="text-xl text-muted-foreground mt-2">Your personal AI mentor for career growth.</p>
      </div>

      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>1. Define Your Career Goal</CardTitle>
          <CardDescription>What do you want to become? (e.g., "Data Analyst", "AI Engineer")</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input 
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g., AI/ML Engineer"
            />
            <Button onClick={handleGenerateSpecializations} disabled={loading || !goal}>
              {loading && !specializations.length ? 'Thinking...' : 'Discover Paths'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {specializations.length > 0 && (
        <Card className="max-w-3xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>2. Choose a Specialization</CardTitle>
            <CardDescription>Our AI suggests these specializations based on your goal. Pick one to generate a roadmap.</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {specializations.map((spec, index) => (
              <Button key={index} variant="outline" size="lg" onClick={() => handleGenerateRoadmap(spec)} disabled={loading}>
                <Lightbulb className="mr-2" /> {spec}
              </Button>
            ))}
          </CardContent>
        </Card>
      )}

      {loading && !roadmap && (
         <div className="text-center py-8">
            <p>Generating your personalized roadmap...</p>
         </div>
      )}

      {roadmap && (
        <Card className="max-w-3xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Your Learning Roadmap for: {roadmap.specialization}</CardTitle>
            <CardDescription>Follow these steps to achieve your career goal.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold text-lg flex items-center mb-2"><CheckCircle className="w-5 h-5 mr-2 text-green-500" /> Roadmap</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-secondary rounded-lg">
                    {roadmap.roadmap}
                </div>
              </div>
               <div>
                <h3 className="font-semibold text-lg flex items-center mb-2"><List className="w-5 h-5 mr-2 text-blue-500" /> Resources</h3>
                <div className="prose prose-sm dark:prose-invert max-w-none p-4 bg-secondary rounded-lg">
                    {roadmap.resources}
                </div>
              </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
