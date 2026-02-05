import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetAllCommunityPosts, useCreateCommunityPost, useCheckContent, useDeletePost, useIsCallerAdmin } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { AlertCircle, Send, Users, Clock, Trash2 } from 'lucide-react';

export default function CommunityPage() {
  const { identity } = useInternetIdentity();
  const { data: posts = [], isLoading } = useGetAllCommunityPosts();
  const { data: isAdmin = false } = useIsCallerAdmin();
  const createPost = useCreateCommunityPost();
  const checkContent = useCheckContent();
  const deletePost = useDeletePost();

  const [content, setContent] = useState('');
  const [anonymous, setAnonymous] = useState(true);

  const isAuthenticated = !!identity;
  const currentUserPrincipal = identity?.getPrincipal().toString();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated) {
      toast.error('Please login to post');
      return;
    }

    if (!content.trim()) {
      toast.error('Please enter some content');
      return;
    }

    try {
      // Check content for inappropriate words
      const result = await checkContent.mutateAsync(content);
      
      if (!result.passed) {
        toast.error('Your post contains inappropriate content. Please revise and try again.');
        return;
      }

      await createPost.mutateAsync({ content, anonymous });
      toast.success('Post created successfully!');
      setContent('');
    } catch (error) {
      toast.error('Failed to create post. Please try again.');
      console.error(error);
    }
  };

  const handleDeletePost = async (postId: bigint) => {
    try {
      await deletePost.mutateAsync(postId);
      toast.success('Post deleted successfully');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to delete post';
      if (errorMessage.includes('Unauthorized')) {
        toast.error('You do not have permission to delete this post');
      } else {
        toast.error('Failed to delete post. Please try again.');
      }
      console.error(error);
    }
  };

  const canDeletePost = (post: typeof posts[0]) => {
    if (!isAuthenticated) return false;
    // Admin can delete any post
    if (isAdmin) return true;
    // User can delete their own post
    return post.author.toString() === currentUserPrincipal;
  };

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const sortedPosts = [...posts].sort((a, b) => Number(b.timestamp - a.timestamp));

  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Users className="w-10 h-10 text-blue-600" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Community Support
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Share your concerns and support others in a safe, anonymous space
        </p>
      </div>

      {/* Disclaimer */}
      <Alert className="mb-8 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription>
          <strong>Important:</strong> This is a peer support community. For emergencies or professional help, 
          please visit our <span className="font-semibold">Helpline</span> page or contact a mental health professional.
        </AlertDescription>
      </Alert>

      {/* Create Post Form */}
      {isAuthenticated ? (
        <Card className="mb-8 border-2 border-blue-200 dark:border-blue-800">
          <CardHeader>
            <CardTitle>Share Your Thoughts</CardTitle>
            <CardDescription>
              Your post will be displayed anonymously to protect your privacy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Textarea
                placeholder="Share what's on your mind... (stress, anxiety, academic pressure, etc.)"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={5}
                className="resize-none"
              />
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="anonymous"
                    checked={anonymous}
                    onChange={(e) => setAnonymous(e.target.checked)}
                    className="w-4 h-4 rounded"
                  />
                  <label htmlFor="anonymous" className="text-sm cursor-pointer">
                    Post anonymously (recommended)
                  </label>
                </div>
                
                <Button
                  type="submit"
                  disabled={createPost.isPending || checkContent.isPending}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  {createPost.isPending || checkContent.isPending ? (
                    'Posting...'
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      ) : (
        <Alert className="mb-8">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please login to share your thoughts and support others in the community.
          </AlertDescription>
        </Alert>
      )}

      {/* Community Posts */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" />
          Community Posts
        </h2>

        {isLoading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading posts...</p>
          </div>
        ) : sortedPosts.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                No posts yet. Be the first to share your thoughts!
              </p>
            </CardContent>
          </Card>
        ) : (
          sortedPosts.map((post) => (
            <Card key={post.id.toString()} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">Anonymous</Badge>
                    {post.moderationFlag && (
                      <Badge variant="destructive">Flagged</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {formatTimestamp(post.timestamp)}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
                
                {canDeletePost(post) && (
                  <div className="flex justify-end">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="destructive"
                          size="sm"
                          disabled={deletePost.isPending}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Post</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeletePost(post.id)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
