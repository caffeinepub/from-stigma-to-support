import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
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
import { Clock, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { useEditCommunityPost, useDeletePost, useCheckContent } from '../../hooks/useQueries';
import type { CommunityPost } from '../../backend';

interface CommunityPostCardProps {
  post: CommunityPost;
  canEdit: boolean;
  canDelete: boolean;
}

export default function CommunityPostCard({ post, canEdit, canDelete }: CommunityPostCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  
  const editPost = useEditCommunityPost();
  const deletePost = useDeletePost();
  const checkContent = useCheckContent();

  const formatTimestamp = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) / 1000000);
    return date.toLocaleString();
  };

  const startEditing = () => {
    setIsEditing(true);
    setEditContent(post.content);
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditContent('');
  };

  const handleEditPost = async () => {
    if (!editContent.trim()) {
      toast.error('Please enter some content');
      return;
    }

    try {
      // Check content for inappropriate words
      const result = await checkContent.mutateAsync(editContent);
      
      if (!result.passed) {
        toast.error('Your edited post contains inappropriate content. Please revise and try again.');
        return;
      }

      await editPost.mutateAsync({ postId: post.id, newContent: editContent });
      toast.success('Post updated successfully!');
      setIsEditing(false);
      setEditContent('');
    } catch (error: any) {
      const errorMessage = error?.message || 'Failed to edit post';
      if (errorMessage.includes('Unauthorized') || errorMessage.includes('Not Authorized')) {
        toast.error('You do not have permission to edit this post');
      } else if (errorMessage.includes('Post not found')) {
        toast.error('Post not found');
      } else {
        toast.error('Failed to edit post. Please try again.');
      }
      console.error(error);
    }
  };

  const handleDeletePost = async () => {
    try {
      await deletePost.mutateAsync(post.id);
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

  return (
    <Card className="hover:shadow-lg transition-shadow">
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
        {isEditing ? (
          <div className="space-y-4">
            <Textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              rows={5}
              className="resize-none"
              placeholder="Edit your post..."
            />
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={cancelEditing}
                disabled={editPost.isPending || checkContent.isPending}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleEditPost}
                disabled={editPost.isPending || checkContent.isPending}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {editPost.isPending || checkContent.isPending ? 'Saving...' : 'Save'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-foreground whitespace-pre-wrap mb-4">{post.content}</p>
            
            {(canEdit || canDelete) && (
              <div className="flex justify-end gap-2">
                {canEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={startEditing}
                    disabled={editPost.isPending}
                  >
                    <Edit2 className="w-4 h-4 mr-2" />
                    Edit
                  </Button>
                )}
                {canDelete && (
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
                          onClick={handleDeletePost}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                )}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
