import { useState } from "react";
import SecurityLayout from "@/components/admin/security/security-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { 
  AlertCircle, 
  ArrowDown, 
  ArrowUp, 
  Download, 
  Filter, 
  RefreshCw, 
  Search, 
  Shield, 
  User, 
  LogIn, 
  LogOut, 
  ShieldAlert,
  FileWarning,
  Settings
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

// Define mock security log data
interface SecurityLog {
  id: string;
  timestamp: Date;
  event: string;
  eventType: 'login' | 'logout' | 'failed_login' | 'permission_change' | 'settings_change' | 'suspicious';
  username: string;
  ipAddress: string;
  userAgent: string;
  details: string;
  severity: 'low' | 'medium' | 'high';
}

export default function SecurityLogsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [eventTypeFilter, setEventTypeFilter] = useState<string | undefined>();
  const [severityFilter, setSeverityFilter] = useState<string | undefined>();
  const [sortColumn, setSortColumn] = useState<keyof SecurityLog>("timestamp");
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Generate mock security logs
  const generateMockLogs = (): SecurityLog[] => {
    const mockLogs: SecurityLog[] = [
      {
        id: "log_1",
        timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        event: "Successful login",
        eventType: "login",
        username: "admin",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: "User logged in successfully",
        severity: "low"
      },
      {
        id: "log_2",
        timestamp: new Date(Date.now() - 1000 * 60 * 35), // 35 minutes ago
        event: "Failed login attempt",
        eventType: "failed_login",
        username: "admin",
        ipAddress: "203.0.113.42",
        userAgent: "Mozilla/5.0 (Linux; Android 10; SM-G960U)",
        details: "Incorrect password (3rd attempt)",
        severity: "medium"
      },
      {
        id: "log_3",
        timestamp: new Date(Date.now() - 1000 * 60 * 120), // 2 hours ago
        event: "User role modified",
        eventType: "permission_change",
        username: "admin",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: "Changed user 'editor' permissions: added 'manage_blog'",
        severity: "medium"
      },
      {
        id: "log_4",
        timestamp: new Date(Date.now() - 1000 * 60 * 180), // 3 hours ago
        event: "User logged out",
        eventType: "logout",
        username: "editor",
        ipAddress: "192.168.1.5",
        userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
        details: "User initiated logout",
        severity: "low"
      },
      {
        id: "log_5",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), // 12 hours ago
        event: "Multiple failed login attempts",
        eventType: "suspicious",
        username: "admin",
        ipAddress: "185.143.223.15",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: "5 failed login attempts from unusual location (Russia)",
        severity: "high"
      },
      {
        id: "log_6",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
        event: "Security settings changed",
        eventType: "settings_change",
        username: "admin",
        ipAddress: "192.168.1.1",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: "Password policy updated: minimum length set to 12 characters",
        severity: "medium"
      },
      {
        id: "log_7",
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), // 1.5 days ago
        event: "Suspicious file upload",
        eventType: "suspicious",
        username: "contributor",
        ipAddress: "192.168.1.10",
        userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        details: "Potentially malicious file detected and blocked (file.php)",
        severity: "high"
      },
    ];
    
    return mockLogs;
  };

  const securityLogs = generateMockLogs();
  
  // Handle sorting
  const handleSort = (column: keyof SecurityLog) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('desc');
    }
  };
  
  // Filter and sort logs
  const getFilteredLogs = (): SecurityLog[] => {
    return securityLogs
      .filter(log => {
        // Filter by search query
        if (searchQuery && !log.event.toLowerCase().includes(searchQuery.toLowerCase()) && 
            !log.username.toLowerCase().includes(searchQuery.toLowerCase()) &&
            !log.ipAddress.includes(searchQuery) &&
            !log.details.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Filter by event type
        if (eventTypeFilter && eventTypeFilter !== 'all' && log.eventType !== eventTypeFilter) {
          return false;
        }
        
        // Filter by severity
        if (severityFilter && severityFilter !== 'all' && log.severity !== severityFilter) {
          return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        if (sortColumn === 'timestamp') {
          return sortDirection === 'asc'
            ? a.timestamp.getTime() - b.timestamp.getTime()
            : b.timestamp.getTime() - a.timestamp.getTime();
        } else {
          const aValue = String(a[sortColumn]).toLowerCase();
          const bValue = String(b[sortColumn]).toLowerCase();
          
          return sortDirection === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
      });
  };

  const filteredLogs = getFilteredLogs();
  
  // Function to get icon based on event type
  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'login':
        return <LogIn className="h-4 w-4 text-primary" />;
      case 'logout':
        return <LogOut className="h-4 w-4 text-muted-foreground" />;
      case 'failed_login':
        return <ShieldAlert className="h-4 w-4 text-orange-500" />;
      case 'permission_change':
        return <User className="h-4 w-4 text-blue-500" />;
      case 'settings_change':
        return <Settings className="h-4 w-4 text-blue-500" />;
      case 'suspicious':
        return <FileWarning className="h-4 w-4 text-destructive" />;
      default:
        return <Shield className="h-4 w-4 text-muted-foreground" />;
    }
  };
  
  // Function to get badge style based on severity
  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'high':
        return <Badge variant="destructive">High</Badge>;
      case 'medium':
        return <Badge variant="warning" className="bg-orange-500">Medium</Badge>;
      case 'low':
        return <Badge variant="outline">Low</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  // Format the timestamp to a readable string
  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) {
      return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffMinutes < 24 * 60) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return format(date, 'MMM d, yyyy HH:mm:ss');
    }
  };

  return (
    <SecurityLayout 
      title="Security Logs" 
      description="Monitor security events and detect unauthorized access attempts"
    >
      <div className="space-y-6">
        <Card className="bg-background border-0">
          <CardHeader className="bg-background border-0">
            <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
              <div>
                <CardTitle className="text-foreground">Security Event Log</CardTitle>
                <CardDescription className="text-muted-foreground">
                  View and filter security-related events on your gaming website
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <RefreshCw size={14} />
                  Refresh
                </Button>
                <Button variant="outline" size="sm" className="flex items-center gap-1">
                  <Download size={14} />
                  Export
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="bg-background">
            <div className="mb-6 flex flex-col sm:flex-row justify-between gap-4">
              <div className="flex-1 relative max-w-sm">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search logs..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                    <SelectTrigger className="w-[180px] h-9">
                      <Filter className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Event Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Event Type</SelectLabel>
                        <SelectItem value="all">All Events</SelectItem>
                        <SelectItem value="login">Login</SelectItem>
                        <SelectItem value="logout">Logout</SelectItem>
                        <SelectItem value="failed_login">Failed Login</SelectItem>
                        <SelectItem value="permission_change">Permission Change</SelectItem>
                        <SelectItem value="settings_change">Settings Change</SelectItem>
                        <SelectItem value="suspicious">Suspicious Activity</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Select value={severityFilter} onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-[150px] h-9">
                      <AlertCircle className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                      <SelectValue placeholder="Severity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Severity</SelectLabel>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            
            <div className="rounded-md border border-border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="w-[180px] cursor-pointer"
                      onClick={() => handleSort('timestamp')}
                    >
                      <div className="flex items-center gap-1">
                        Timestamp
                        {sortColumn === 'timestamp' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('event')}
                    >
                      <div className="flex items-center gap-1">
                        Event
                        {sortColumn === 'event' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('username')}
                    >
                      <div className="flex items-center gap-1">
                        User
                        {sortColumn === 'username' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                    <TableHead className="hidden md:table-cell">IP Address</TableHead>
                    <TableHead className="hidden lg:table-cell">Details</TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('severity')}
                    >
                      <div className="flex items-center gap-1">
                        Severity
                        {sortColumn === 'severity' && (
                          sortDirection === 'asc' ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />
                        )}
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                        No logs found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell className="font-mono text-xs">
                          {formatTimestamp(log.timestamp)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getEventIcon(log.eventType)}
                            <span className="text-foreground">{log.event}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-foreground">
                          {log.username}
                        </TableCell>
                        <TableCell className="hidden md:table-cell font-mono text-xs text-muted-foreground">
                          {log.ipAddress}
                        </TableCell>
                        <TableCell className="hidden lg:table-cell text-muted-foreground text-sm max-w-[300px] truncate">
                          {log.details}
                        </TableCell>
                        <TableCell>
                          {getSeverityBadge(log.severity)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            
            <div className="text-xs text-muted-foreground mt-4">
              Showing {filteredLogs.length} of {securityLogs.length} logs
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-background border-0">
          <CardHeader className="bg-background border-0">
            <CardTitle className="text-foreground">Security Log Retention</CardTitle>
            <CardDescription className="text-muted-foreground">
              Configure how long security logs are kept in the system
            </CardDescription>
          </CardHeader>
          <CardContent className="bg-background">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-foreground mb-1">Log Retention Period</h3>
                  <Select defaultValue="90">
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="60">60 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-foreground mb-1">High Severity Log Retention</h3>
                  <Select defaultValue="365">
                    <SelectTrigger>
                      <SelectValue placeholder="Select retention period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="180">180 days</SelectItem>
                      <SelectItem value="365">1 year</SelectItem>
                      <SelectItem value="730">2 years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="rounded-lg bg-primary/10 p-4 text-sm">
                  <h3 className="font-medium text-foreground mb-2 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    Log Retention Recommendations
                  </h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• General logs: minimum 90 days</li>
                    <li>• Authentication logs: minimum 6 months</li>
                    <li>• Security incidents: minimum 1 year</li>
                    <li>• Consider legal and compliance requirements for your region</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-6">
              <Button variant="outline" className="mr-2">Cancel</Button>
              <Button>Save Settings</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </SecurityLayout>
  );
}