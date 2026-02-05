import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetUserMoodEntries, useAddMoodEntry } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { Smile, AlertCircle } from 'lucide-react';

const moods = [
  { name: 'Happy', icon: '/assets/generated/mood-happy.dim_48x48.png', value: 'happy', color: 'from-yellow-400 to-orange-400' },
  { name: 'Neutral', icon: '/assets/generated/mood-neutral.dim_48x48.png', value: 'neutral', color: 'from-blue-400 to-cyan-400' },
  { name: 'Sad', icon: '/assets/generated/mood-sad.dim_48x48.png', value: 'sad', color: 'from-blue-600 to-purple-600' },
  { name: 'Stressed', icon: '/assets/generated/mood-stressed.dim_48x48.png', value: 'stressed', color: 'from-red-500 to-pink-500' },
];

export default function MoodTrackerPage() {
  const { identity } = useInternetIdentity();
  const { data: moodEntries = [], isLoading } = useGetUserMoodEntries();
  const addMood = useAddMoodEntry();

  const isAuthenticated = !!identity;

  const handleMoodSelect = async (mood: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to track your mood');
      return;
    }

    try {
      await addMood.mutateAsync(mood);
      toast.success('Mood recorded successfully!');
    } catch (error) {
      toast.error('Failed to record mood. Please try again.');
      console.error(error);
    }
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const sortedEntries = [...moodEntries].sort((a, b) => Number(b.timestamp - a.timestamp));
  const recentEntries = sortedEntries.slice(0, 10);

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Smile className="w-10 h-10 text-purple-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Mood Tracker
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Track your emotional well-being and identify patterns over time
        </p>
      </div>

      {!isAuthenticated && (
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please login to track your mood and view your history.
          </AlertDescription>
        </Alert>
      )}

      {/* Mood Selection */}
      <Card className="mb-8 border-2 border-purple-200 dark:border-purple-800">
        <CardHeader>
          <CardTitle>How are you feeling today?</CardTitle>
          <CardDescription>Select your current mood to track it</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {moods.map((mood) => (
              <button
                key={mood.value}
                onClick={() => handleMoodSelect(mood.value)}
                disabled={addMood.isPending || !isAuthenticated}
                className={`p-6 rounded-xl border-2 hover:border-purple-400 dark:hover:border-purple-600 transition-all hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-br ${mood.color} bg-opacity-10`}
              >
                <img src={mood.icon} alt={mood.name} className="w-12 h-12 mx-auto mb-3" />
                <p className="font-semibold text-center">{mood.name}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mood History */}
      {isAuthenticated && (
        <Card>
          <CardHeader>
            <CardTitle>Your Mood History</CardTitle>
            <CardDescription>Recent mood entries (last 10)</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">Loading mood history...</p>
              </div>
            ) : recentEntries.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No mood entries yet. Start tracking your mood above!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentEntries.map((entry, index) => {
                  const moodData = moods.find(m => m.value === entry.mood);
                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {moodData && (
                          <img src={moodData.icon} alt={moodData.name} className="w-8 h-8" />
                        )}
                        <span className="font-medium capitalize">{entry.mood}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatTimestamp(entry.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Insights */}
      {isAuthenticated && recentEntries.length > 0 && (
        <Card className="mt-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
          <CardHeader>
            <CardTitle>Mood Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              You've tracked {moodEntries.length} mood {moodEntries.length === 1 ? 'entry' : 'entries'}. 
              Regular mood tracking helps you identify patterns and triggers, 
              leading to better emotional awareness and well-being.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
