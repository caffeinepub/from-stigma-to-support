import { useGetCommunityGuidelines } from '../hooks/useQueries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Heart, Shield, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function GuidelinesPage() {
  const { data: guidelines, isLoading } = useGetCommunityGuidelines();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <p className="text-center text-muted-foreground">Loading guidelines...</p>
      </div>
    );
  }

  if (!guidelines) {
    return (
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <Alert>
          <AlertDescription>Failed to load community guidelines.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Heart className="w-10 h-10 text-pink-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Community Guidelines
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Creating a safe, supportive space for everyone
        </p>
      </div>

      {/* Core Principles */}
      <Card className="mb-8 border-2 border-pink-200 dark:border-pink-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Heart className="w-6 h-6 text-pink-600" />
            Our Core Principles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-lg text-muted-foreground">{guidelines.corePrinciples}</p>
        </CardContent>
      </Card>

      {/* Acceptable Conduct */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle className="w-6 h-6 text-green-600" />
            Acceptable Conduct
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {guidelines.acceptableConduct.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Prohibited Behaviors */}
      <Card className="mb-8 border-2 border-red-200 dark:border-red-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <XCircle className="w-6 h-6 text-red-600" />
            Prohibited Behaviors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {guidelines.prohibitedBehaviors.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Safety Guidelines */}
      <Card className="mb-8 border-2 border-yellow-200 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="w-6 h-6 text-yellow-600" />
            Safety Guidelines
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {guidelines.safetyGuidelines.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Posting Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Shield className="w-6 h-6 text-blue-600" />
            Posting Rules
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {guidelines.postingRules.map((item, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                <span className="text-muted-foreground">{item}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Separator className="my-8" />

      {/* Footer Note */}
      <Alert className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950 dark:to-purple-950 border-pink-200 dark:border-pink-800">
        <Heart className="h-4 w-4 text-pink-600" />
        <AlertDescription>
          <strong>Thank you for being part of our community!</strong> By following these guidelines, 
          you help create a safe and supportive environment for everyone. If you see content that 
          violates these guidelines, please report it to our moderation team.
        </AlertDescription>
      </Alert>
    </div>
  );
}
