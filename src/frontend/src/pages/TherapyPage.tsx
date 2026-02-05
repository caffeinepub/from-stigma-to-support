import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useCreateTherapySessionRequest } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Brain, Wind, Palette, Music, Activity, Video } from 'lucide-react';

export default function TherapyPage() {
  const { identity } = useInternetIdentity();
  const createRequest = useCreateTherapySessionRequest();
  
  const [sessionType, setSessionType] = useState('');
  const [details, setDetails] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const isAuthenticated = !!identity;

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to request a session');
      return;
    }

    if (!sessionType || !details.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      await createRequest.mutateAsync({ typeRequest: sessionType, details });
      toast.success('Session request submitted successfully!');
      setSessionType('');
      setDetails('');
      setDialogOpen(false);
    } catch (error) {
      toast.error('Failed to submit request. Please try again.');
      console.error(error);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Brain className="w-10 h-10 text-green-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Therapy & Wellness Resources
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Explore techniques and resources to support your mental well-being
        </p>
      </div>

      <Tabs defaultValue="relaxation" className="mb-12">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-8">
          <TabsTrigger value="relaxation">Relaxation</TabsTrigger>
          <TabsTrigger value="art">Art Therapy</TabsTrigger>
          <TabsTrigger value="music">Music Therapy</TabsTrigger>
          <TabsTrigger value="physio">Physiotherapy</TabsTrigger>
        </TabsList>

        {/* Relaxation & Breathing */}
        <TabsContent value="relaxation">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <img src="/assets/generated/relaxation-icon.dim_64x64.png" alt="Relaxation" className="w-12 h-12" />
                <div>
                  <CardTitle className="text-2xl">Relaxation & Breathing Exercises</CardTitle>
                  <CardDescription>Calm your mind and reduce stress through breathing techniques</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Wind className="w-5 h-5 text-blue-600" />
                  Deep Breathing Exercise (4-7-8 Technique)
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
                  <li>Sit comfortably with your back straight</li>
                  <li>Breathe in quietly through your nose for 4 seconds</li>
                  <li>Hold your breath for 7 seconds</li>
                  <li>Exhale completely through your mouth for 8 seconds</li>
                  <li>Repeat this cycle 3-4 times</li>
                </ol>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Progressive Muscle Relaxation</h3>
                <p className="text-muted-foreground mb-2">
                  Tense and relax different muscle groups to release physical tension:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Start with your toes and work up to your head</li>
                  <li>Tense each muscle group for 5 seconds</li>
                  <li>Release and notice the difference for 10 seconds</li>
                  <li>Practice daily for best results</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Mindfulness Meditation</h3>
                <p className="text-muted-foreground">
                  Spend 5-10 minutes focusing on your breath and present moment. 
                  When your mind wanders, gently bring your attention back to your breathing. 
                  This practice helps reduce anxiety and improve focus.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Art Therapy */}
        <TabsContent value="art">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <img src="/assets/generated/art-therapy-icon.dim_64x64.png" alt="Art Therapy" className="w-12 h-12" />
                <div>
                  <CardTitle className="text-2xl">Art Therapy</CardTitle>
                  <CardDescription>Express yourself through creative activities</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-purple-600" />
                  Expressive Drawing
                </h3>
                <p className="text-muted-foreground mb-3">
                  Use drawing to express emotions you find difficult to verbalize:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Draw your feelings using colors and shapes</li>
                  <li>Create a visual journal of your day</li>
                  <li>Sketch mandalas for relaxation and focus</li>
                  <li>No artistic skill required - focus on expression</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Collage Making</h3>
                <p className="text-muted-foreground">
                  Cut out images and words from magazines that resonate with you. 
                  Arrange them on paper to create a visual representation of your goals, 
                  feelings, or aspirations. This process can help clarify thoughts and emotions.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Color Therapy</h3>
                <p className="text-muted-foreground">
                  Use coloring books or create your own designs. The repetitive motion 
                  and focus on colors can be meditative and calming, reducing stress and anxiety.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Music Therapy */}
        <TabsContent value="music">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <img src="/assets/generated/music-therapy-icon.dim_64x64.png" alt="Music Therapy" className="w-12 h-12" />
                <div>
                  <CardTitle className="text-2xl">Music Therapy</CardTitle>
                  <CardDescription>Harness the healing power of music</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Music className="w-5 h-5 text-pink-600" />
                  Active Listening
                </h3>
                <p className="text-muted-foreground mb-3">
                  Dedicate time to truly listen to music without distractions:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Choose calming instrumental or nature sounds</li>
                  <li>Close your eyes and focus on different instruments</li>
                  <li>Notice how the music makes you feel</li>
                  <li>Try binaural beats for deep relaxation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Music Creation</h3>
                <p className="text-muted-foreground">
                  You don't need to be a musician to benefit from creating music. 
                  Humming, singing, or playing simple instruments can be therapeutic. 
                  Express your emotions through sound and rhythm.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Playlist Therapy</h3>
                <p className="text-muted-foreground">
                  Create playlists for different moods: energizing morning music, 
                  calming study sounds, or uplifting songs for difficult days. 
                  Music can help regulate emotions and improve mood.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Physiotherapy */}
        <TabsContent value="physio">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <img src="/assets/generated/physio-icon.dim_64x64.png" alt="Physiotherapy" className="w-12 h-12" />
                <div>
                  <CardTitle className="text-2xl">Physiotherapy-Based Stress Relief</CardTitle>
                  <CardDescription>Physical exercises to reduce mental stress</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-3 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-green-600" />
                  Gentle Stretching
                </h3>
                <p className="text-muted-foreground mb-3">
                  Release physical tension that accumulates from stress:
                </p>
                <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                  <li>Neck rolls: Slowly rotate your head in circles</li>
                  <li>Shoulder shrugs: Lift shoulders to ears, hold, release</li>
                  <li>Seated spinal twist: Gentle rotation to release back tension</li>
                  <li>Wrist and ankle circles: Improve circulation</li>
                </ul>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Posture Awareness</h3>
                <p className="text-muted-foreground">
                  Poor posture can increase stress and fatigue. Practice sitting with your 
                  back straight, shoulders relaxed, and feet flat on the floor. 
                  Take breaks every 30 minutes to stand and stretch.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-3">Walking Meditation</h3>
                <p className="text-muted-foreground">
                  Combine gentle exercise with mindfulness. Walk slowly and deliberately, 
                  focusing on each step and your breath. This practice reduces stress 
                  while providing light physical activity.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Session Request */}
      <Card className="border-2 border-green-200 dark:border-green-800">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Video className="w-6 h-6 text-green-600" />
            Request a Therapy Session
          </CardTitle>
          <CardDescription>
            Express interest in a guided therapy session with our resources
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700">
                Request Session
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Request a Therapy Session</DialogTitle>
                <DialogDescription>
                  Fill out this form to express your interest. We'll provide you with links to join sessions via Google Meet or Jitsi.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmitRequest} className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="sessionType">Session Type</Label>
                  <Select value={sessionType} onValueChange={setSessionType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a therapy type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="relaxation">Relaxation & Breathing</SelectItem>
                      <SelectItem value="art">Art Therapy</SelectItem>
                      <SelectItem value="music">Music Therapy</SelectItem>
                      <SelectItem value="physio">Physiotherapy</SelectItem>
                      <SelectItem value="general">General Counseling</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="details">Additional Details</Label>
                  <Textarea
                    id="details"
                    placeholder="Tell us about your needs and preferences..."
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    rows={4}
                  />
                </div>

                <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <strong>Note:</strong> Sessions will be conducted via external platforms like Google Meet or Jitsi. 
                    You'll receive connection details after your request is reviewed.
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={createRequest.isPending || !isAuthenticated}
                >
                  {createRequest.isPending ? 'Submitting...' : 'Submit Request'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </div>
  );
}
