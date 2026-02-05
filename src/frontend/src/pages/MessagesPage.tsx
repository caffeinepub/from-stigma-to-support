import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useGetMessagesByUser, useGetAllMessages, useSendMessage, useMarkMessageAsRead, useIsCallerAdmin, useGetCallerUserProfile } from '../hooks/useQueries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageCircle, Send, AlertCircle, Users, Shield, CheckCheck, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import type { Message } from '../backend';
import { Principal } from '@dfinity/principal';

export default function MessagesPage() {
  const { identity } = useInternetIdentity();
  const { data: isAdmin, isLoading: adminLoading } = useIsCallerAdmin();
  const { data: userProfile } = useGetCallerUserProfile();
  const { data: userMessages = [], isLoading: messagesLoading } = useGetMessagesByUser();
  const { data: allMessages = [], isLoading: allMessagesLoading } = useGetAllMessages();
  const sendMessageMutation = useSendMessage();
  const markAsReadMutation = useMarkMessageAsRead();

  const [newMessageDialogOpen, setNewMessageDialogOpen] = useState(false);
  const [recipientPrincipal, setRecipientPrincipal] = useState('');
  const [messageContent, setMessageContent] = useState('');
  const [isSupport, setIsSupport] = useState(false);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [replyTo, setReplyTo] = useState<Principal | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const isAuthenticated = !!identity;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [selectedConversation, userMessages, allMessages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast.error('Please login to send messages');
      return;
    }

    try {
      const recipient = replyTo || Principal.fromText(recipientPrincipal);
      await sendMessageMutation.mutateAsync({
        recipient,
        content: messageContent,
        isSupport,
      });
      toast.success('Message sent successfully');
      setNewMessageDialogOpen(false);
      setRecipientPrincipal('');
      setMessageContent('');
      setIsSupport(false);
      setReplyTo(null);
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const handleMarkAsRead = async (messageId: bigint) => {
    try {
      await markAsReadMutation.mutateAsync(messageId);
    } catch (error: any) {
      console.error('Failed to mark message as read:', error);
    }
  };

  const getConversations = (messages: Message[]) => {
    const conversations = new Map<string, Message[]>();
    
    messages.forEach(msg => {
      const otherUser = msg.sender.toString() === identity?.getPrincipal().toString() 
        ? msg.recipient.toString() 
        : msg.sender.toString();
      
      if (!conversations.has(otherUser)) {
        conversations.set(otherUser, []);
      }
      conversations.get(otherUser)!.push(msg);
    });

    return Array.from(conversations.entries()).map(([user, msgs]) => ({
      user,
      messages: msgs.sort((a, b) => Number(a.timestamp) - Number(b.timestamp)),
      unreadCount: msgs.filter(m => 
        m.recipient.toString() === identity?.getPrincipal().toString() && !m.readByRecipient
      ).length,
    }));
  };

  const userConversations = getConversations(userMessages);
  const adminConversations = isAdmin ? getConversations(allMessages) : [];

  const openReplyDialog = (recipientPrincipal: Principal) => {
    setReplyTo(recipientPrincipal);
    setRecipientPrincipal(recipientPrincipal.toString());
    setNewMessageDialogOpen(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-6 h-6 text-blue-600" />
              Messages
            </CardTitle>
            <CardDescription>Please login to access your messages</CardDescription>
          </CardHeader>
          <CardContent>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Login to send and receive direct messages with other users and admins.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (messagesLoading || adminLoading) {
    return (
      <div className="container mx-auto px-4 py-16">
        <div className="space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 flex items-center gap-2">
          <MessageCircle className="w-10 h-10 text-blue-600" />
          {isAdmin ? 'Messages & Support' : 'Messages'}
        </h1>
        <p className="text-muted-foreground">
          {isAdmin ? 'View all conversations and provide support' : 'Your direct conversations'}
        </p>
      </div>

      <Tabs defaultValue={isAdmin ? 'all' : 'my-messages'} className="w-full">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <TabsTrigger value="my-messages">
            <MessageCircle className="w-4 h-4 mr-2" />
            My Messages
            {userConversations.reduce((acc, conv) => acc + conv.unreadCount, 0) > 0 && (
              <Badge variant="destructive" className="ml-2">
                {userConversations.reduce((acc, conv) => acc + conv.unreadCount, 0)}
              </Badge>
            )}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="all">
              <Shield className="w-4 h-4 mr-2" />
              All Messages (Admin)
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="my-messages" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Your Conversations</h2>
            <Dialog open={newMessageDialogOpen} onOpenChange={setNewMessageDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-blue-600 to-purple-600">
                  <Send className="w-4 h-4 mr-2" />
                  New Message
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{replyTo ? 'Reply to Message' : 'Send New Message'}</DialogTitle>
                  <DialogDescription>
                    {replyTo ? 'Send a reply to this user' : 'Send a direct message to another user'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSendMessage} className="space-y-4">
                  <div>
                    <Label htmlFor="recipient">Recipient Principal ID *</Label>
                    <Input
                      id="recipient"
                      value={recipientPrincipal}
                      onChange={(e) => setRecipientPrincipal(e.target.value)}
                      placeholder="Enter principal ID"
                      required
                      disabled={!!replyTo}
                    />
                  </div>
                  <div>
                    <Label htmlFor="content">Message *</Label>
                    <Textarea
                      id="content"
                      value={messageContent}
                      onChange={(e) => setMessageContent(e.target.value)}
                      rows={4}
                      placeholder="Type your message..."
                      required
                    />
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => {
                      setNewMessageDialogOpen(false);
                      setReplyTo(null);
                      setRecipientPrincipal('');
                      setMessageContent('');
                    }}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={sendMessageMutation.isPending}>
                      {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {userConversations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-muted-foreground">No conversations yet</p>
                <p className="text-sm text-muted-foreground mt-2">Start a new conversation to get started</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Conversations</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[500px]">
                    {userConversations.map((conv) => (
                      <button
                        key={conv.user}
                        onClick={() => setSelectedConversation(conv.user)}
                        className={`w-full p-4 text-left hover:bg-accent transition-colors border-b ${
                          selectedConversation === conv.user ? 'bg-accent' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span className="font-medium text-sm truncate max-w-[150px]">
                              {conv.user.substring(0, 8)}...
                            </span>
                          </div>
                          {conv.unreadCount > 0 && (
                            <Badge variant="destructive" className="text-xs">
                              {conv.unreadCount}
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {conv.messages[conv.messages.length - 1].content}
                        </p>
                      </button>
                    ))}
                  </ScrollArea>
                </CardContent>
              </Card>

              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle className="text-lg flex items-center justify-between">
                    <span>
                      {selectedConversation ? `Chat with ${selectedConversation.substring(0, 12)}...` : 'Select a conversation'}
                    </span>
                    {selectedConversation && (
                      <Button size="sm" onClick={() => openReplyDialog(Principal.fromText(selectedConversation))}>
                        <Send className="w-4 h-4 mr-2" />
                        Reply
                      </Button>
                    )}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {selectedConversation ? (
                    <ScrollArea className="h-[450px] pr-4" ref={scrollRef}>
                      <div className="space-y-4">
                        {userConversations
                          .find(c => c.user === selectedConversation)
                          ?.messages.map((msg) => {
                            const isOwnMessage = msg.sender.toString() === identity?.getPrincipal().toString();
                            
                            // Mark as read if it's a received message
                            if (!isOwnMessage && !msg.readByRecipient) {
                              handleMarkAsRead(msg.id);
                            }

                            return (
                              <div
                                key={Number(msg.id)}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[70%] rounded-lg p-3 ${
                                    isOwnMessage
                                      ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white'
                                      : 'bg-gray-100 dark:bg-gray-800'
                                  }`}
                                >
                                  <p className="text-sm">{msg.content}</p>
                                  <div className="flex items-center justify-between gap-2 mt-2">
                                    <span className={`text-xs ${isOwnMessage ? 'text-blue-100' : 'text-muted-foreground'}`}>
                                      {new Date(Number(msg.timestamp) / 1000000).toLocaleString()}
                                    </span>
                                    {isOwnMessage && (
                                      <span className="text-xs">
                                        {msg.readByRecipient ? (
                                          <CheckCheck className="w-3 h-3" />
                                        ) : (
                                          <Check className="w-3 h-3" />
                                        )}
                                      </span>
                                    )}
                                  </div>
                                  {msg.isSupport && (
                                    <Badge variant="outline" className="mt-2 text-xs">
                                      Support
                                    </Badge>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    </ScrollArea>
                  ) : (
                    <div className="h-[450px] flex items-center justify-center text-muted-foreground">
                      Select a conversation to view messages
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {isAdmin && (
          <TabsContent value="all" className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">All Conversations (Admin View)</h2>
              <p className="text-muted-foreground">Monitor and moderate all user conversations</p>
            </div>

            {allMessagesLoading ? (
              <Skeleton className="h-96 w-full" />
            ) : adminConversations.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <MessageCircle className="w-16 h-16 mb-4 opacity-50" />
                  <p className="text-muted-foreground">No conversations to display</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {adminConversations.map((conv) => (
                  <Card key={conv.user}>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Conversation: {conv.user.substring(0, 20)}...
                        {conv.messages.some(m => m.isSupport) && (
                          <Badge variant="outline">Support</Badge>
                        )}
                      </CardTitle>
                      <CardDescription>
                        {conv.messages.length} messages
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-[300px]">
                        <div className="space-y-3">
                          {conv.messages.map((msg) => (
                            <div
                              key={Number(msg.id)}
                              className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <Badge variant="outline" className="text-xs">
                                    {msg.sender.toString().substring(0, 8)}...
                                  </Badge>
                                  <span className="text-xs text-muted-foreground">→</span>
                                  <Badge variant="outline" className="text-xs">
                                    {msg.recipient.toString().substring(0, 8)}...
                                  </Badge>
                                </div>
                                <span className="text-xs text-muted-foreground">
                                  {new Date(Number(msg.timestamp) / 1000000).toLocaleString()}
                                </span>
                              </div>
                              <p className="text-sm">{msg.content}</p>
                              <div className="flex items-center gap-2 mt-2">
                                {msg.readByRecipient && (
                                  <Badge variant="secondary" className="text-xs">
                                    Read
                                  </Badge>
                                )}
                                {msg.isSupport && (
                                  <Badge variant="default" className="text-xs">
                                    Support
                                  </Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}

