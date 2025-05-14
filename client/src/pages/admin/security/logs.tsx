import React, { useState } from 'react';
import SecurityLayout from '@/components/admin/security/security-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useQuery } from '@tanstack/react-query';
import { 
  Loader2,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  UserX,
  Lock,
  User,
  Clock,
  Search,
  Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { 
  Pagination, 
  PaginationContent, 
  PaginationItem, 
  PaginationLink,
  PaginationNext,
  PaginationPrevious 
} from '@/components/ui/pagination';
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function SecurityLogsPage() {
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedLog, setSelectedLog] = useState(null);

  const { data: logs, isLoading } = useQuery({
    queryKey: ['/api/security/logs', filter, page],
    retry: false,
  });

  const handleFilterChange = (value: string) => {
    setFilter(value);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search implementation would go here
    // Reset to page 1 when searching
    setPage(1);
  };

  const handleViewDetails = (log: any) => {
    setSelectedLog(log);
  };

  // Function to get the badge color based on the action type
  const getBadgeVariant = (action: string) => {
    if (action === 'Login' || action === 'Logout') return 'default';
    if (action === 'Failed Login' || action === 'Password Reset') return 'destructive';
    if (action === 'Settings Change' || action === 'Password Change') return 'outline';
    if (action === 'Account Locked') return 'destructive';
    return 'secondary';
  };

  // Function to get the icon based on the action type
  const getActionIcon = (action: string) => {
    if (action === 'Login') return <User className="h-4 w-4" />;
    if (action === 'Logout') return <UserX className="h-4 w-4" />;
    if (action === 'Failed Login') return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (action === 'Password Change') return <Lock className="h-4 w-4" />;
    if (action === 'Password Reset') return <Lock className="h-4 w-4 text-destructive" />;
    if (action === 'Account Locked') return <ShieldAlert className="h-4 w-4 text-destructive" />;
    if (action === 'Settings Change') return <ShieldCheck className="h-4 w-4" />;
    return <Clock className="h-4 w-4" />;
  };

  return (
    <SecurityLayout>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Security Event History</h1>
          <p className="text-muted-foreground">
            Monitor historical security events, login attempts, and user activities
          </p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm">
            Export Logs
          </Button>
          <Button variant="outline" size="sm">
            Clear Filters
          </Button>
        </div>
      </div>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 dark:bg-blue-950/20 dark:border-blue-900">
        <div className="flex items-start">
          <Clock className="h-5 w-5 text-blue-600 mr-2 mt-0.5 dark:text-blue-400" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-300">Audit & Activity Logs</h3>
            <p className="text-sm text-blue-700 dark:text-blue-300">
              This page displays a history of security events and user activities on your platform. Use it to identify security issues,
              monitor suspicious activities, and audit user actions. To change security policies and settings, visit the <strong>Security Settings Configuration</strong> page.
            </p>
          </div>
        </div>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3">
          <CardTitle>Audit Trail & Event History</CardTitle>
          <CardDescription>
            Historical record of security events, login attempts, and user activities on your platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-4 md:flex-row md:space-y-0 md:space-x-4 mb-6">
            <div className="flex-1">
              <form onSubmit={handleSearch} className="flex w-full max-w-sm items-center space-x-2">
                <Input
                  type="search"
                  placeholder="Search by user, IP, or action..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button type="submit" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
              </form>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filter} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Events</SelectItem>
                  <SelectItem value="login">Login Events</SelectItem>
                  <SelectItem value="failed">Failed Attempts</SelectItem>
                  <SelectItem value="password">Password Changes</SelectItem>
                  <SelectItem value="settings">Settings Changes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs && logs.length > 0 ? (
            <>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[100px]">Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>User</TableHead>
                      <TableHead>IP Address</TableHead>
                      <TableHead>Details</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log: any) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getActionIcon(log.action)}
                            <Badge variant={getBadgeVariant(log.action)}>
                              {log.action}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          {log.username}
                        </TableCell>
                        <TableCell className="font-mono text-xs">
                          {log.ipAddress}
                        </TableCell>
                        <TableCell>
                          <div className="truncate max-w-[250px]">
                            {log.details?.success === false && (
                              <span className="text-destructive">
                                {log.details?.reason || 'Failed'}
                                {log.details?.attempts && ` (${log.details.attempts} attempts)`}
                              </span>
                            )}
                            {log.details?.success === true && (
                              <span className="text-green-600">Success</span>
                            )}
                            {log.details?.method && ` via ${log.details.method}`}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm"
                                  onClick={() => handleViewDetails(log)}
                                >
                                  View
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>View event details</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="mt-4 flex items-center justify-end">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      />
                    </PaginationItem>
                    
                    {Array.from({ length: 3 }, (_, i) => (
                      <PaginationItem key={i}>
                        <PaginationLink 
                          onClick={() => setPage(i + 1)}
                          isActive={page === i + 1}
                        >
                          {i + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setPage(p => p + 1)}
                        disabled={page === 3}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <ShieldCheck className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium">No security events found</h3>
              <p className="text-muted-foreground mt-1 mb-4">
                There are no security events matching your criteria.
              </p>
              <Button variant="outline" onClick={() => {
                setFilter('all');
                setSearchQuery('');
              }}>
                Clear Filters
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Event Details Dialog */}
      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Security Event Details</DialogTitle>
            <DialogDescription>
              Detailed information about this security event.
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-4 py-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-semibold mb-1">Event ID</h4>
                  <p className="text-sm text-muted-foreground">{selectedLog.id}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Timestamp</h4>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedLog.timestamp).toLocaleString()}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">Action</h4>
                  <div className="flex items-center">
                    {getActionIcon(selectedLog.action)}
                    <Badge className="ml-2" variant={getBadgeVariant(selectedLog.action)}>
                      {selectedLog.action}
                    </Badge>
                  </div>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">User</h4>
                  <p className="text-sm text-muted-foreground">{selectedLog.username}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">User Agent</h4>
                  <p className="text-sm text-muted-foreground truncate">{selectedLog.userAgent}</p>
                </div>
                <div>
                  <h4 className="text-sm font-semibold mb-1">IP Address</h4>
                  <p className="text-sm text-muted-foreground">{selectedLog.ipAddress}</p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-1">Event Details</h4>
                <div className="rounded-md bg-muted p-3">
                  <pre className="text-xs overflow-auto whitespace-pre-wrap">
                    {JSON.stringify(selectedLog.details, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button variant="ghost" onClick={() => setSelectedLog(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </SecurityLayout>
  );
}