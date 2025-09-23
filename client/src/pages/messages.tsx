import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { VerificationIcon } from "@/components/ui/verification-icon";
import { 
  Send, 
  Search, 
  MoreVertical, 
  Edit3, 
  Trash2,
  Reply,
  Clock,
  Check,
  CheckCheck,
  MessageCircle
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Sidebar } from "@/components/layout/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
} from "@/components/ui/alert-dialog";

interface User {
  id: number;
  username: string;
  avatar?: string;
  isVerified: boolean;
  verificationExpiry?: string;
}

interface Conversation {
  conversation: {
    id: number;
    type: 'direct' | 'group';
    user1Id: number;
    user2Id?: number;
    groupName?: string;
    lastMessageAt: string;
    isArchived: boolean;
  };
  otherUser: User;
  lastMessage?: {
    id: number;
    content: string;
    senderId: number;
    type: 'text' | 'image' | 'file' | 'system' | 'emoji';
    createdAt: string;
  };
  unreadCount: number;
}

interface Message {
  message: {
    id: number;
    conversationId: number;
    content: string;
    type: 'text' | 'image' | 'file' | 'system' | 'emoji';
    status: 'sent' | 'delivered' | 'read' | 'failed';
    senderId: number;
    isEdited: boolean;
    createdAt: string;
    editedAt?: string;
  };
  sender: User;
}

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<number | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editingContent, setEditingContent] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Fetch conversations
  const { data: conversations = [], isLoading: conversationsLoading, error: conversationsError } = useQuery<Conversation[]>({
    queryKey: ['/api/messages/conversations'],
    enabled: true,
  });

  // Fetch messages for selected conversation
  const { data: messagesData, isLoading: messagesLoading } = useQuery<{
    messages: Message[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  }>({
    queryKey: ['/api/messages/conversations', selectedConversation, 'messages'],
    enabled: selectedConversation !== null,
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; type?: string }) => {
      return await apiRequest(`/api/messages/conversations/${selectedConversation}/messages`, {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      setNewMessage("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations', selectedConversation, 'messages'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    }
  });

  // Edit message mutation
  const editMessageMutation = useMutation({
    mutationFn: async (data: { messageId: number; content: string }) => {
      return await apiRequest(`/api/messages/messages/${data.messageId}`, {
        method: 'PUT',
        body: JSON.stringify({ content: data.content }),
      });
    },
    onSuccess: () => {
      setEditingMessageId(null);
      setEditingContent("");
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations', selectedConversation, 'messages'] });
      toast({
        title: "Success",
        description: "Message updated successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update message",
        variant: "destructive",
      });
    }
  });

  // Delete message mutation
  const deleteMessageMutation = useMutation({
    mutationFn: async (messageId: number) => {
      return await apiRequest(`/api/messages/messages/${messageId}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations', selectedConversation, 'messages'] });
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete message",
        variant: "destructive",
      });
    }
  });

  // Mark messages as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: async (conversationId: number) => {
      return await apiRequest(`/api/messages/conversations/${conversationId}/read`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/messages/conversations'] });
    }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData?.messages]);

  // Mark conversation as read when selected
  useEffect(() => {
    if (selectedConversation) {
      markAsReadMutation.mutate(selectedConversation);
    }
  }, [selectedConversation]);

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.otherUser.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    
    sendMessageMutation.mutate({
      content: newMessage,
      type: 'text'
    });
  };

  const handleEditMessage = (messageId: number, currentContent: string) => {
    setEditingMessageId(messageId);
    setEditingContent(currentContent);
  };

  const handleSaveEdit = () => {
    if (!editingContent.trim() || !editingMessageId) return;
    
    editMessageMutation.mutate({
      messageId: editingMessageId,
      content: editingContent
    });
  };

  const handleDeleteMessage = (messageId: number) => {
    deleteMessageMutation.mutate(messageId);
  };

  const getMessageStatusIcon = (status: string) => {
    switch (status) {
      case 'sent':
        return <Check className="w-3 h-3 text-muted-foreground" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-muted-foreground" />;
      case 'read':
        return <CheckCheck className="w-3 h-3 text-primary" />;
      case 'failed':
        return <Clock className="w-3 h-3 text-destructive" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[hsl(260,40%,8%)] flex">
      <Sidebar />
      
      {/* Main Content */}
      <div className="flex-1 ml-64">
        {/* Header */}
        <div className="bg-[hsl(260,35%,12%)] border-b border-[hsl(260,20%,18%)] p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-800 rounded-lg">
              <Send className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[hsl(0,0%,98%)]">💬 Messages</h1>
              <p className="text-[hsl(210,10%,70%)]">Chat with your friends and contacts</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 h-[calc(100vh-120px)] bg-[hsl(260,40%,8%)]">
          <div className="flex h-full gap-6">
          {/* Conversations List */}
          <Card className="w-1/3 flex flex-col bg-[hsl(260,35%,12%)] border-[hsl(260,20%,18%)]">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[hsl(0,0%,98%)]">Messages</h2>
              </div>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search conversations..."
                  className="pl-8 bg-[hsl(260,20%,20%)] border-[hsl(260,20%,18%)] text-[hsl(0,0%,98%)] placeholder:text-[hsl(210,10%,70%)]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  data-testid="search-conversations"
                />
              </div>
            </CardHeader>
            <CardContent className="flex-1 p-0">
              <ScrollArea className="h-full">
                {conversationsLoading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : conversationsError ? (
                  <div className="text-center text-red-400 p-6">
                    <p className="mb-2">Failed to load conversations</p>
                    <p className="text-sm text-[hsl(210,10%,70%)]">Please refresh the page or try again later</p>
                  </div>
                ) : filteredConversations.length === 0 ? (
                  <div className="text-center text-[hsl(210,10%,70%)] p-6">
                    {searchQuery ? "No conversations found" : "No conversations yet"}
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredConversations.map((conversation) => (
                      <div
                        key={conversation.conversation.id}
                        className={`p-4 cursor-pointer hover:bg-[hsl(260,20%,18%)] border-b border-[hsl(260,20%,18%)] ${
                          selectedConversation === conversation.conversation.id
                            ? "bg-[hsl(262,83%,15%)] border-r-4 border-r-[hsl(262,83%,58%)]"
                            : ""
                        }`}
                        onClick={() => setSelectedConversation(conversation.conversation.id)}
                        data-testid={`conversation-${conversation.conversation.id}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="relative">
                            <Avatar className="w-10 h-10">
                              <AvatarImage src={conversation.otherUser.avatar} />
                              <AvatarFallback>
                                {conversation.otherUser.username.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            {conversation.otherUser.isVerified && (
                              <div className="absolute -bottom-1 -right-1">
                                <VerificationIcon
                                  isVerified={conversation.otherUser.isVerified}
                                  verificationExpiry={conversation.otherUser.verificationExpiry}
                                  size={16}
                                />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h3 className="font-medium truncate text-[hsl(0,0%,98%)]">
                                {conversation.otherUser.username}
                              </h3>
                              <div className="flex items-center gap-1">
                                {conversation.lastMessage && (
                                  <span className="text-xs text-[hsl(210,10%,70%)]">
                                    {formatDistanceToNow(new Date(conversation.lastMessage.createdAt), { addSuffix: true })}
                                  </span>
                                )}
                                {conversation.unreadCount > 0 && (
                                  <Badge variant="default" className="text-xs min-w-[20px] h-5">
                                    {conversation.unreadCount > 99 ? "99+" : conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {conversation.lastMessage && (
                              <p className="text-sm text-[hsl(210,10%,70%)] truncate">
                                {conversation.lastMessage.content}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Chat Interface */}
          <Card className="flex-1 flex flex-col bg-[hsl(260,35%,12%)] border-[hsl(260,20%,18%)]">
            {selectedConversation ? (
              <>
                {/* Chat Header */}
                <CardHeader className="pb-3">
                  {(() => {
                    const conversation = conversations.find(c => c.conversation.id === selectedConversation);
                    if (!conversation) return null;
                    return (
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={conversation.otherUser.avatar} />
                            <AvatarFallback>
                              {conversation.otherUser.username.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          {conversation.otherUser.isVerified && (
                            <div className="absolute -bottom-1 -right-1">
                              <VerificationIcon
                                isVerified={conversation.otherUser.isVerified}
                                verificationExpiry={conversation.otherUser.verificationExpiry}
                                size={16}
                              />
                            </div>
                          )}
                        </div>
                        <div>
                          <h3 className="font-semibold text-[hsl(0,0%,98%)]">{conversation.otherUser.username}</h3>
                          <p className="text-sm text-[hsl(210,10%,70%)]">Online</p>
                        </div>
                      </div>
                    );
                  })()}
                </CardHeader>

                <Separator />

                {/* Messages Area */}
                <CardContent className="flex-1 p-0 flex flex-col">
                  <ScrollArea className="flex-1 p-4">
                    {messagesLoading ? (
                      <div className="flex items-center justify-center h-32">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      </div>
                    ) : messagesData?.messages.length === 0 ? (
                      <div className="text-center text-[hsl(210,10%,70%)] p-6">
                        No messages yet. Start the conversation!
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messagesData?.messages.map((msg) => {
                          const isOwn = msg.message.senderId === conversations.find(c => c.conversation.id === selectedConversation)?.conversation.user1Id;
                          const isEditing = editingMessageId === msg.message.id;

                          return (
                            <div
                              key={msg.message.id}
                              className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                              data-testid={`message-${msg.message.id}`}
                            >
                              <div className={`max-w-[70%] ${isOwn ? "order-2" : "order-1"}`}>
                                <div
                                  className={`rounded-lg p-3 ${
                                    isOwn
                                      ? "bg-[hsl(262,83%,58%)] text-white"
                                      : "bg-[hsl(260,20%,20%)] text-[hsl(0,0%,98%)]"
                                  }`}
                                >
                                  {isEditing ? (
                                    <div className="space-y-2">
                                      <Input
                                        value={editingContent}
                                        onChange={(e) => setEditingContent(e.target.value)}
                                        onKeyDown={(e) => {
                                          if (e.key === 'Enter') handleSaveEdit();
                                          if (e.key === 'Escape') {
                                            setEditingMessageId(null);
                                            setEditingContent("");
                                          }
                                        }}
                                        className="text-sm bg-[hsl(260,20%,25%)] border-[hsl(260,20%,18%)] text-[hsl(0,0%,98%)]"
                                      />
                                      <div className="flex gap-2">
                                        <Button
                                          size="sm"
                                          onClick={handleSaveEdit}
                                          disabled={editMessageMutation.isPending}
                                        >
                                          Save
                                        </Button>
                                        <Button
                                          size="sm"
                                          variant="outline"
                                          onClick={() => {
                                            setEditingMessageId(null);
                                            setEditingContent("");
                                          }}
                                        >
                                          Cancel
                                        </Button>
                                      </div>
                                    </div>
                                  ) : (
                                    <div className="group relative">
                                      <p className="text-sm break-words">
                                        {msg.message.content}
                                        {msg.message.isEdited && (
                                          <span className="text-xs opacity-70 ml-2">(edited)</span>
                                        )}
                                      </p>
                                      {isOwn && (
                                        <DropdownMenu>
                                          <DropdownMenuTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                                            >
                                              <MoreVertical className="w-3 h-3" />
                                            </Button>
                                          </DropdownMenuTrigger>
                                          <DropdownMenuContent align="end">
                                            <DropdownMenuItem onClick={() => handleEditMessage(msg.message.id, msg.message.content)}>
                                              <Edit3 className="w-4 h-4 mr-2" />
                                              Edit
                                            </DropdownMenuItem>
                                            <AlertDialog>
                                              <AlertDialogTrigger asChild>
                                                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                                                  <Trash2 className="w-4 h-4 mr-2" />
                                                  Delete
                                                </DropdownMenuItem>
                                              </AlertDialogTrigger>
                                              <AlertDialogContent>
                                                <AlertDialogHeader>
                                                  <AlertDialogTitle>Delete Message</AlertDialogTitle>
                                                  <AlertDialogDescription>
                                                    Are you sure you want to delete this message? This action cannot be undone.
                                                  </AlertDialogDescription>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                  <AlertDialogAction
                                                    onClick={() => handleDeleteMessage(msg.message.id)}
                                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                  >
                                                    Delete
                                                  </AlertDialogAction>
                                                </AlertDialogFooter>
                                              </AlertDialogContent>
                                            </AlertDialog>
                                          </DropdownMenuContent>
                                        </DropdownMenu>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className={`flex items-center gap-1 mt-1 text-xs text-[hsl(210,10%,70%)] ${isOwn ? "justify-end" : "justify-start"}`}>
                                  <span>
                                    {formatDistanceToNow(new Date(msg.message.createdAt), { addSuffix: true })}
                                  </span>
                                  {isOwn && getMessageStatusIcon(msg.message.status)}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                      </div>
                    )}
                  </ScrollArea>

                  {/* Message Input */}
                  <div className="p-4 border-t border-[hsl(260,20%,18%)]">
                    <div className="flex gap-2">
                      <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..."
                        className="bg-[hsl(260,20%,20%)] border-[hsl(260,20%,18%)] text-[hsl(0,0%,98%)] placeholder:text-[hsl(210,10%,70%)]"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                          }
                        }}
                        disabled={sendMessageMutation.isPending}
                        data-testid="message-input"
                      />
                      <Button
                        onClick={handleSendMessage}
                        disabled={!newMessage.trim() || sendMessageMutation.isPending}
                        data-testid="send-message-button"
                      >
                        <Send className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </>
            ) : (
              <CardContent className="flex-1 flex items-center justify-center">
                <div className="text-center text-[hsl(210,10%,70%)]">
                  <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50 text-[hsl(262,83%,58%)]" />
                  <h3 className="text-lg font-medium mb-2 text-[hsl(0,0%,98%)]">Select a conversation</h3>
                  <p>Choose a conversation from the left to start messaging</p>
                </div>
              </CardContent>
            )}
          </Card>
          </div>
        </div>
      </div>
    </div>
  );
}