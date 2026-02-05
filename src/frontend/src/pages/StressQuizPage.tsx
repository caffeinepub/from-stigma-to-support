import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserQuizResponse, useSubmitStressQuiz } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { FileText, AlertCircle, CheckCircle } from 'lucide-react';

const questions = [
  {
    id: 1,
    question: 'How often do you feel overwhelmed by your academic workload?',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  },
  {
    id: 2,
    question: 'How frequently do you have trouble sleeping due to stress?',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  },
  {
    id: 3,
    question: 'How often do you feel anxious about exams or assignments?',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  },
  {
    id: 4,
    question: 'How frequently do you experience physical symptoms of stress (headaches, fatigue)?',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  },
  {
    id: 5,
    question: 'How often do you feel unable to cope with your responsibilities?',
    options: ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'],
  },
];

export default function StressQuizPage() {
  const { identity } = useInternetIdentity();
  const { data: previousResponse } = useGetUserQuizResponse();
  const submitQuiz = useSubmitStressQuiz();

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>(new Array(questions.length).fill(-1));
  const [showResults, setShowResults] = useState(false);

  const isAuthenticated = !!identity;

  const handleAnswer = (value: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = value;
    setAnswers(newAnswers);
  };

  const handleNext = () => {
    if (answers[currentQuestion] === -1) {
      toast.error('Please select an answer');
      return;
    }

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      handleSubmit();
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmit = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to submit the quiz');
      return;
    }

    if (answers.some(a => a === -1)) {
      toast.error('Please answer all questions');
      return;
    }

    const score = answers.reduce((sum, answer) => sum + answer, 0);

    try {
      await submitQuiz.mutateAsync({
        score: BigInt(score),
        responses: answers.map(a => BigInt(a)),
      });
      setShowResults(true);
      toast.success('Quiz submitted successfully!');
    } catch (error) {
      toast.error('Failed to submit quiz. Please try again.');
      console.error(error);
    }
  };

  const calculateScore = () => {
    return answers.reduce((sum, answer) => sum + answer, 0);
  };

  const getScoreLevel = (score: number) => {
    if (score <= 5) return { level: 'Low', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-950' };
    if (score <= 10) return { level: 'Moderate', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-950' };
    if (score <= 15) return { level: 'High', color: 'text-orange-600', bg: 'bg-orange-100 dark:bg-orange-950' };
    return { level: 'Very High', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-950' };
  };

  const getSuggestions = (score: number) => {
    if (score <= 5) {
      return [
        'Great job managing your stress! Keep up your healthy habits.',
        'Continue practicing relaxation techniques regularly.',
        'Maintain a balanced schedule with time for rest and activities you enjoy.',
      ];
    }
    if (score <= 10) {
      return [
        'Your stress levels are moderate. Consider implementing stress management techniques.',
        'Try our breathing exercises and relaxation methods.',
        'Ensure you\'re getting enough sleep and taking regular breaks.',
        'Connect with friends or family for support.',
      ];
    }
    if (score <= 15) {
      return [
        'Your stress levels are high. It\'s important to take action.',
        'Practice daily relaxation and breathing exercises.',
        'Consider reaching out to a counselor or therapist.',
        'Break large tasks into smaller, manageable steps.',
        'Prioritize self-care and set boundaries.',
      ];
    }
    return [
      'Your stress levels are very high. Please seek professional support.',
      'Visit our Helpline page for immediate resources.',
      'Talk to a mental health professional as soon as possible.',
      'Practice stress-relief techniques multiple times daily.',
      'Don\'t hesitate to ask for help from friends, family, or professionals.',
    ];
  };

  const resetQuiz = () => {
    setCurrentQuestion(0);
    setAnswers(new Array(questions.length).fill(-1));
    setShowResults(false);
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResults) {
    const score = calculateScore();
    const scoreInfo = getScoreLevel(score);
    const suggestions = getSuggestions(score);

    return (
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <Card className="border-2 border-green-200 dark:border-green-800">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>
            <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
            <CardDescription>Here are your results and personalized suggestions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className={`p-6 rounded-lg ${scoreInfo.bg}`}>
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">Your Stress Score</p>
                <p className="text-5xl font-bold mb-2">{score}</p>
                <p className={`text-xl font-semibold ${scoreInfo.color}`}>{scoreInfo.level} Stress Level</p>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-semibold mb-3">Personalized Suggestions</h3>
              <ul className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <li key={index} className="flex items-start gap-2">
                    <span className="text-green-600 mt-1">✓</span>
                    <span className="text-muted-foreground">{suggestion}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex gap-3">
              <Button onClick={resetQuiz} variant="outline" className="flex-1">
                Retake Quiz
              </Button>
              <Button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              >
                Explore Resources
              </Button>
            </div>
          </CardContent>
        </Card>

        {previousResponse && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Previous Result</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                Last taken: {new Date(Number(previousResponse.timestamp) / 1000000).toLocaleString()}
              </p>
              <p className="text-muted-foreground">
                Score: {Number(previousResponse.score)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <FileText className="w-10 h-10 text-orange-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            Stress Assessment Quiz
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Answer these questions to assess your stress levels and receive personalized suggestions
        </p>
      </div>

      {!isAuthenticated && (
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please login to save your quiz results and track your progress over time.
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-2 border-orange-200 dark:border-orange-800">
        <CardHeader>
          <div className="flex items-center justify-between mb-4">
            <CardTitle>Question {currentQuestion + 1} of {questions.length}</CardTitle>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h3 className="text-xl font-semibold mb-6">{questions[currentQuestion].question}</h3>
            <RadioGroup
              value={answers[currentQuestion]?.toString()}
              onValueChange={(value) => handleAnswer(parseInt(value))}
            >
              {questions[currentQuestion].options.map((option, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-muted transition-colors">
                  <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                  <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              variant="outline"
              className="flex-1"
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestion] === -1 || submitQuiz.isPending}
              className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
            >
              {currentQuestion === questions.length - 1 ? 'Submit' : 'Next'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
