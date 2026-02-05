import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Phone, Globe, MessageCircle, AlertTriangle } from 'lucide-react';

const helplines = [
  {
    name: 'National Suicide Prevention Lifeline',
    phone: '988',
    description: '24/7 free and confidential support for people in distress',
    availability: '24/7',
    icon: Phone,
  },
  {
    name: 'Crisis Text Line',
    phone: 'Text HOME to 741741',
    description: 'Free, 24/7 support for those in crisis via text message',
    availability: '24/7',
    icon: MessageCircle,
  },
  {
    name: 'SAMHSA National Helpline',
    phone: '1-800-662-4357',
    description: 'Treatment referral and information service for mental health and substance abuse',
    availability: '24/7',
    icon: Phone,
  },
  {
    name: 'National Alliance on Mental Illness (NAMI)',
    phone: '1-800-950-6264',
    description: 'Information, referrals, and support for mental health concerns',
    availability: 'Mon-Fri, 10am-10pm ET',
    icon: Phone,
  },
  {
    name: 'International Association for Suicide Prevention',
    phone: 'Visit website for country-specific numbers',
    description: 'Global directory of crisis centers and helplines',
    availability: 'Varies by location',
    icon: Globe,
  },
];

const onlineResources = [
  {
    name: 'BetterHelp',
    url: 'https://www.betterhelp.com',
    description: 'Online counseling and therapy services',
  },
  {
    name: 'Talkspace',
    url: 'https://www.talkspace.com',
    description: 'Online therapy with licensed therapists',
  },
  {
    name: 'MentalHealth.gov',
    url: 'https://www.mentalhealth.gov',
    description: 'U.S. government mental health resources',
  },
  {
    name: 'Anxiety and Depression Association of America',
    url: 'https://adaa.org',
    description: 'Resources for anxiety and depression',
  },
];

export default function HelplinePage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-5xl">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Phone className="w-10 h-10 text-red-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-orange-600 bg-clip-text text-transparent">
            Emergency Helpline & Resources
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Immediate support and crisis resources available 24/7
        </p>
      </div>

      {/* Emergency Alert */}
      <Alert className="mb-8 border-2 border-red-500 bg-red-50 dark:bg-red-950">
        <AlertTriangle className="h-5 w-5 text-red-600" />
        <AlertDescription className="text-base">
          <strong className="text-red-600">If you are in immediate danger or experiencing a medical emergency, 
          please call 911 or go to your nearest emergency room.</strong>
        </AlertDescription>
      </Alert>

      {/* Crisis Helplines */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Crisis Helplines</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {helplines.map((helpline, index) => {
            const Icon = helpline.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{helpline.name}</CardTitle>
                      <CardDescription className="mt-1">{helpline.description}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <span className="font-semibold text-lg">{helpline.phone}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Available: {helpline.availability}
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Online Resources */}
      <section className="mb-12">
        <h2 className="text-3xl font-bold mb-6">Online Mental Health Resources</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {onlineResources.map((resource, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Globe className="w-5 h-5 text-blue-600" />
                  {resource.name}
                </CardTitle>
                <CardDescription>{resource.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => window.open(resource.url, '_blank')}
                >
                  Visit Website →
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Additional Support */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 border-2 border-blue-200 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-2xl">You Are Not Alone</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Mental health challenges are common, and seeking help is a sign of strength, not weakness. 
            Whether you're experiencing a crisis or just need someone to talk to, these resources are here for you.
          </p>
          <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">When to Seek Help:</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
              <li>Thoughts of self-harm or suicide</li>
              <li>Overwhelming feelings of sadness, anxiety, or hopelessness</li>
              <li>Difficulty functioning in daily life</li>
              <li>Substance abuse concerns</li>
              <li>Experiencing trauma or abuse</li>
            </ul>
          </div>
          <p className="text-sm text-muted-foreground italic">
            Remember: Our community support page is for peer support, not crisis intervention. 
            For immediate help, please use the resources listed above.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
