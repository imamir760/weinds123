'use client';

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, PlusCircle, Trash2 } from 'lucide-react';
import Link from 'next/link';
import EmployerLayout from '@/app/employer/layout';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

type Question = {
  id: number;
  questionText: string;
  questionType: 'multiple-choice' | 'short-answer';
  options: string[];
  correctAnswer: string;
};

export default function CreateSkillTestPage({
  params,
}: {
  params: { postId: string };
}) {
  const [testTitle, setTestTitle] = useState('');
  const [simpleTestContent, setSimpleTestContent] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        id: Date.now(),
        questionText: '',
        questionType: 'short-answer',
        options: ['', '', '', ''],
        correctAnswer: '',
      },
    ]);
  };

  const removeQuestion = (id: number) => {
    setQuestions(questions.filter((q) => q.id !== id));
  };

  const handleQuestionChange = (
    id: number,
    field: keyof Question,
    value: any
  ) => {
    setQuestions(
      questions.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

    const handleOptionChange = (
    questionId: number,
    optionIndex: number,
    value: string
  ) => {
    setQuestions(
      questions.map((q) => {
        if (q.id === questionId) {
          const newOptions = [...q.options];
          newOptions[optionIndex] = value;
          return { ...q, options: newOptions };
        }
        return q;
      })
    );
  };

  const PageContent = (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-6">
        <Button asChild variant="outline" size="sm">
          <Link href="/employer/skill-tests">
            <ArrowLeft className="mr-2" /> Back to All Posts
          </Link>
        </Button>
      </div>
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Create Manual Skill Test</CardTitle>
          <CardDescription>
            For Post ID: <span className="font-semibold">{params.postId}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <Label htmlFor="test-title">Test Title</Label>
            <Input
              id="test-title"
              placeholder="e.g., Frontend Developer Screening"
              value={testTitle}
              onChange={(e) => setTestTitle(e.target.value)}
            />
          </div>

          <div className="p-4 border bg-secondary/50 rounded-lg space-y-4">
            <h3 className="font-semibold">Option 1: Simple Test</h3>
            <p className="text-sm text-muted-foreground">
              Quickly create a test by pasting all your questions and
              instructions into a single text box.
            </p>
            <Textarea
              rows={10}
              placeholder="Paste your questions here..."
              value={simpleTestContent}
              onChange={(e) => setSimpleTestContent(e.target.value)}
            />
          </div>

          <div className="p-4 border bg-secondary/50 rounded-lg space-y-4">
            <h3 className="font-semibold">Option 2: Structured Test</h3>
             <p className="text-sm text-muted-foreground">
              Add questions one by one with specific types and correct answers for more detailed evaluation.
            </p>
            <div className="space-y-4">
              {questions.map((q, index) => (
                <Card key={q.id} className="p-4 bg-background">
                  <div className="flex justify-between items-center mb-4">
                    <Label>Question {index + 1}</Label>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => removeQuestion(q.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Enter question text"
                      value={q.questionText}
                      onChange={(e) =>
                        handleQuestionChange(
                          q.id,
                          'questionText',
                          e.target.value
                        )
                      }
                    />
                    <Select
                      value={q.questionType}
                      onValueChange={(value) =>
                        handleQuestionChange(q.id, 'questionType', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select question type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="short-answer">
                          Short Answer
                        </SelectItem>
                        <SelectItem value="multiple-choice">
                          Multiple Choice
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    {q.questionType === 'multiple-choice' && (
                      <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt, i) => (
                          <Input
                            key={i}
                            placeholder={`Option ${i + 1}`}
                            value={opt}
                            onChange={(e) =>
                              handleOptionChange(q.id, i, e.target.value)
                            }
                          />
                        ))}
                      </div>
                    )}
                     <div>
                      <Label>Correct Answer</Label>
                      <Input
                        placeholder="Enter the correct answer"
                        value={q.correctAnswer}
                        onChange={(e) =>
                          handleQuestionChange(
                            q.id,
                            'correctAnswer',
                            e.target.value
                          )
                        }
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={addQuestion}
            >
              <PlusCircle className="mr-2" /> Add Question
            </Button>
          </div>

          <div className="flex justify-end">
            <Button>Save and Send Test</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return <EmployerLayout>{PageContent}</EmployerLayout>;
}
