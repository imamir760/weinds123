'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Bot, User, Send, Mic, Loader2 } from 'lucide-react';
import { conductAiInterview } from '@/ai/flows/conduct-ai-interview';

const jobDetails = {
    jobDescription: "As a Senior Frontend Developer, you will be responsible for building our next-generation user interfaces using React and TypeScript. You should have a strong understanding of component-based architecture, state management, and modern frontend tooling.",
    candidateProfile: "A software engineer with 5 years of experience in JavaScript, specializing in React for the last 3 years. Proficient in TypeScript and Tailwind CSS."
};

export default function AiInterviewPage({ params }: { params: { jobId: string }}) {
    const [conversation, setConversation] = useState<{ role: 'user' | 'ai', text: string }[]>([]);
    const [currentInput, setCurrentInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(scrollToBottom, [conversation]);

    useEffect(() => {
        // Start the interview with an initial question from the AI
        const startInterview = async () => {
            setLoading(true);
            try {
                const result = await conductAiInterview({
                    jobDescription: jobDetails.jobDescription,
                    candidateProfile: jobDetails.candidateProfile,
                    question: "Please introduce yourself and tell me about your experience with React.",
                    previousResponses: ""
                });
                setConversation([{ role: 'ai', text: result.response }]);
            } catch (error) {
                console.error("Failed to start interview:", error);
                setConversation([{ role: 'ai', text: "Sorry, I'm having trouble starting the interview. Please try refreshing." }]);
            } finally {
                setLoading(false);
            }
        };
        startInterview();
    }, []);

    const handleSendMessage = async () => {
        if (!currentInput.trim() || loading) return;

        const newConversation = [...conversation, { role: 'user' as const, text: currentInput }];
        setConversation(newConversation);
        setCurrentInput('');
        setLoading(true);

        const previousResponses = newConversation
            .map(msg => `${msg.role === 'user' ? 'Candidate' : 'Interviewer'}: ${msg.text}`)
            .join('\n');

        try {
            const result = await conductAiInterview({
                jobDescription: jobDetails.jobDescription,
                candidateProfile: jobDetails.candidateProfile,
                question: currentInput,
                previousResponses: previousResponses,
            });
            setConversation(prev => [...prev, { role: 'ai', text: result.response }]);
        } catch (error) {
            console.error("AI interview error:", error);
            setConversation(prev => [...prev, { role: 'ai', text: "I encountered an error. Could you please repeat that?" }]);
        } finally {
            setLoading(false);
        }
    };


  return (
    <div className="container mx-auto py-8 px-4">
        <Card className="max-w-3xl mx-auto">
            <CardHeader className="text-center">
                <CardTitle className="text-2xl font-bold font-headline">AI Interview</CardTitle>
                <CardDescription>For Senior Frontend Developer at TechCorp</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="h-[500px] flex flex-col">
                    <div className="flex-grow overflow-y-auto p-4 space-y-6 border rounded-lg bg-secondary">
                        {conversation.map((msg, index) => (
                            <div key={index} className={`flex items-start gap-3 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                                {msg.role === 'ai' && <Bot className="w-6 h-6 text-primary flex-shrink-0" />}
                                <div className={`p-3 rounded-lg max-w-[80%] ${msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-background'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                                 {msg.role === 'user' && <User className="w-6 h-6 text-muted-foreground flex-shrink-0" />}
                            </div>
                        ))}
                         {loading && (
                            <div className="flex items-start gap-3">
                                <Bot className="w-6 h-6 text-primary flex-shrink-0" />
                                <div className="p-3 rounded-lg bg-background">
                                    <Loader2 className="w-5 h-5 animate-spin"/>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>
                    <div className="mt-4 flex items-center gap-2">
                        <Textarea 
                            placeholder="Type your response..." 
                            className="flex-grow"
                            value={currentInput}
                            onChange={e => setCurrentInput(e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }}}
                        />
                        <Button onClick={handleSendMessage} disabled={loading}><Send className="w-5 h-5" /></Button>
                        <Button variant="outline" disabled={loading}><Mic className="w-5 h-5" /></Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    </div>
  );
}
