import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Users, Brain, Smile, FileText, Phone } from 'lucide-react';
import BreathingAnimation from '@/components/BreathingAnimation';

type Page = 'home' | 'community' | 'therapy' | 'mood' | 'quiz' | 'guidelines' | 'helpline';

interface HomePageProps {
  onNavigate: (page: Page) => void;
}

export default function HomePage({ onNavigate }: HomePageProps) {
  const features = [
    {
      icon: Users,
      title: 'Community Support',
      description: 'Share your concerns and connect with others in a safe, supportive environment.',
      page: 'community' as Page,
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: Brain,
      title: 'Therapy Resources',
      description: 'Access relaxation techniques, art therapy, music therapy, and more.',
      page: 'therapy' as Page,
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: Smile,
      title: 'Mood Tracker',
      description: 'Track your emotional well-being and identify patterns over time.',
      page: 'mood' as Page,
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: FileText,
      title: 'Stress Quiz',
      description: 'Assess your stress levels and receive personalized suggestions.',
      page: 'quiz' as Page,
      color: 'from-orange-500 to-red-500',
    },
    {
      icon: Heart,
      title: 'Community Guidelines',
      description: 'Learn about our community standards and safety guidelines.',
      page: 'guidelines' as Page,
      color: 'from-pink-500 to-rose-500',
    },
    {
      icon: Phone,
      title: 'Emergency Helpline',
      description: 'Access crisis support and emergency mental health resources.',
      page: 'helpline' as Page,
      color: 'from-red-500 to-orange-500',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-12">
      {/* Hero Section */}
      <section className="text-center mb-16">
        <div className="max-w-4xl mx-auto">
          <img
            src="/assets/generated/hero-wellness.dim_800x400.png"
            alt="Academic Wellness"
            className="w-full max-w-2xl mx-auto rounded-2xl shadow-2xl mb-8"
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-green-600 to-purple-600 bg-clip-text text-transparent">
            From Stigma to Support
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8">
            Your safe space for academic wellness and mental health support
          </p>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-4">
            We're here to help you navigate stress, anxiety, and academic pressure. 
            Connect with a supportive community, access wellness resources, and take control of your mental health journey.
          </p>

          {/* Breathing Animation */}
          <div className="mt-12 mb-8">
            <BreathingAnimation />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">Explore Our Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <Card
                key={feature.page}
                className="hover:shadow-xl transition-all duration-300 cursor-pointer border-2 hover:border-blue-300 dark:hover:border-blue-700"
                onClick={() => onNavigate(feature.page)}
              >
                <CardHeader>
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="ghost"
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onNavigate(feature.page);
                    }}
                  >
                    Learn More →
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Call to Action */}
      <section className="text-center bg-gradient-to-r from-blue-500 via-green-500 to-purple-500 rounded-2xl p-12 text-white">
        <h2 className="text-3xl font-bold mb-4">Ready to Start Your Wellness Journey?</h2>
        <p className="text-xl mb-8 opacity-90">
          Join our supportive community and take the first step towards better mental health.
        </p>
        <Button
          size="lg"
          className="bg-white text-blue-600 hover:bg-gray-100 font-semibold"
          onClick={() => onNavigate('community')}
        >
          Get Started
        </Button>
      </section>
    </div>
  );
}
