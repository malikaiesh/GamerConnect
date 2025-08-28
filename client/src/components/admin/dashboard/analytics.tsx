import { useEffect, useState, useMemo, memo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  LineChart,
  Line,
  CartesianGrid,
} from "recharts";
import { Loader2, Download, Calendar as CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

interface AnalyticsData {
  pageViews: number;
  uniqueVisitors: number;
  avgTimeOnSite: number;
  bounceRate: number;
  topPages: Array<{
    path: string;
    views: number;
  }>;
  topGames: Array<{
    name: string;
    plays: number;
  }>;
  dailyVisitors: Array<{
    date: string;
    visitors: number;
  }>;
  userDevices: Array<{
    device: string;
    count: number;
  }>;
}

// Chart colors
const COLORS = ['#7e57c2', '#ff5722', '#4caf50', '#2196f3', '#ff9800'];
const defaultTimeframe = '7days';

// Timeframe options
const timeframeOptions = [
  { value: '7days', label: '7 Days' },
  { value: '30days', label: '30 Days' },
  { value: '90days', label: '90 Days' },
  { value: '6months', label: '6 Months' },
  { value: '1year', label: '1 Year' },
  { value: '2years', label: '2 Years' },
  { value: '5years', label: '5 Years' },
  { value: 'custom', label: 'Custom Range' }
];

// Memoized chart components for better performance
const MemoizedStatsCard = memo(({ title, value, description }: { title: string; value: string; description: string }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
));

const MemoizedPieChart = memo(({ data, title, formatter }: { 
  data: Array<any>; 
  title: string;
  formatter?: (value: any, name?: string, props?: any) => any;
}) => (
  <Card className="col-span-1">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={formatter} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
));

const MemoizedBarChart = memo(({ data, title }: { data: Array<any>; title: string }) => (
  <Card className="col-span-1">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" horizontal={false} />
          <XAxis type="number" />
          <YAxis dataKey="name" type="category" width={100} />
          <Tooltip formatter={(value, name, props) => [value, props.payload.fullPath]} />
          <Bar dataKey="value" fill="#7e57c2" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
));

const MemoizedLineChart = memo(({ data, title }: { data: Array<any>; title: string }) => (
  <Card className="col-span-full">
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent className="h-96">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line 
            type="monotone" 
            dataKey="visitors" 
            stroke="#ff5722" 
            activeDot={{ r: 8 }} 
            name="Visitors" 
            isAnimationActive={false} // Disable animations for performance
          />
        </LineChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
));

export function Analytics() {
  const [timeframe, setTimeframe] = useState<string>(defaultTimeframe);
  const [startDate, setStartDate] = useState<Date | undefined>();
  const [endDate, setEndDate] = useState<Date | undefined>();
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState('json');
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();
  
  // Build query key with custom dates if applicable
  const queryKey = useMemo(() => {
    const baseKey = ['/api/analytics', timeframe];
    if (timeframe === 'custom' && startDate && endDate) {
      baseKey.push(format(startDate, 'yyyy-MM-dd'), format(endDate, 'yyyy-MM-dd'));
    }
    return baseKey;
  }, [timeframe, startDate, endDate]);
  
  const { data, isLoading, isError, refetch } = useQuery<AnalyticsData>({
    queryKey,
    enabled: timeframe !== 'custom' || (startDate && endDate),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (replaced cacheTime with gcTime)
    // Initial load only, we'll let the user manually refresh when needed
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
  });

  // Handle timeframe change
  const handleTimeframeChange = (newTimeframe: string) => {
    setTimeframe(newTimeframe);
    if (newTimeframe !== 'custom') {
      setStartDate(undefined);
      setEndDate(undefined);
    }
  };

  // Handle export
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const params = new URLSearchParams({
        timeframe,
        format: exportFormat
      });
      
      if (timeframe === 'custom' && startDate && endDate) {
        params.append('startDate', format(startDate, 'yyyy-MM-dd'));
        params.append('endDate', format(endDate, 'yyyy-MM-dd'));
      }
      
      const response = await fetch(`/api/analytics/export?${params}`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to export data');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `analytics_${timeframe}_${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Export completed successfully!' });
      setExportDialogOpen(false);
    } catch (error) {
      toast({
        title: 'Export failed',
        description: 'Failed to export analytics data. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsExporting(false);
    }
  };

  // Force refresh for custom date range
  const handleCustomDateSubmit = () => {
    if (startDate && endDate) {
      refetch();
    }
  };

  // Memoized data transformations to prevent unnecessary recalculations
  const topGamesData = useMemo(() => {
    if (!data?.topGames) return [];
    return data.topGames
      .map(game => ({
        name: game.name.length > 15 ? `${game.name.substring(0, 15)}...` : game.name,
        value: game.plays,
        fullName: game.name,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data?.topGames]);

  const topPagesData = useMemo(() => {
    if (!data?.topPages) return [];
    return data.topPages
      .map(page => ({
        name: page.path.length > 20 ? `${page.path.substring(0, 20)}...` : page.path,
        value: page.views,
        fullPath: page.path,
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [data?.topPages]);

  const dailyData = useMemo(() => {
    if (!data?.dailyVisitors) return [];
    return data.dailyVisitors.map(item => ({
      date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      visitors: item.visitors
    }));
  }, [data?.dailyVisitors]);
  
  const deviceData = useMemo(() => {
    if (!data?.userDevices) return [];
    return data.userDevices.map(item => ({
      name: item.device,
      value: item.count
    }));
  }, [data?.userDevices]);

  // Memoized total game plays calculation
  const totalGamePlays = useMemo(() => {
    if (!data?.topGames) return 0;
    return data.topGames.reduce((sum, game) => sum + game.plays, 0);
  }, [data?.topGames]);

  // Formatted session time
  const formattedSessionTime = useMemo(() => {
    if (!data?.avgTimeOnSite) return '0m 0s';
    return `${Math.floor(data.avgTimeOnSite)}m ${Math.round((data.avgTimeOnSite % 1) * 60)}s`;
  }, [data?.avgTimeOnSite]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-4 text-red-500">
        Error loading analytics data. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-2">
          <Select value={timeframe} onValueChange={handleTimeframeChange}>
            <SelectTrigger className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeframeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Dialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" data-testid="export-analytics-button">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Export Analytics Data</DialogTitle>
                <DialogDescription>
                  Export your analytics data for the selected time period.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Current selection: {timeframeOptions.find(opt => opt.value === timeframe)?.label}
                  {timeframe === 'custom' && startDate && endDate && (
                    <span> ({format(startDate, 'PPP')} to {format(endDate, 'PPP')})</span>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button
                  onClick={handleExport}
                  disabled={isExporting || (timeframe === 'custom' && (!startDate || !endDate))}
                >
                  {isExporting ? 'Exporting...' : 'Export Data'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {/* Custom Date Range Picker */}
      {timeframe === 'custom' && (
        <Card>
          <CardHeader>
            <CardTitle>Custom Date Range</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !startDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {startDate ? format(startDate, "PPP") : "Select start date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={startDate}
                      onSelect={setStartDate}
                      disabled={(date) => date > new Date() || (endDate && date > endDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label>End Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] justify-start text-left font-normal",
                        !endDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {endDate ? format(endDate, "PPP") : "Select end date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={endDate}
                      onSelect={setEndDate}
                      disabled={(date) => date > new Date() || (startDate && date < startDate)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <Button 
                onClick={handleCustomDateSubmit}
                disabled={!startDate || !endDate}
                data-testid="apply-custom-range-button"
              >
                Apply Range
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Show message if custom range but no dates selected */}
      {timeframe === 'custom' && (!startDate || !endDate) && (
        <div className="text-center py-8 text-muted-foreground">
          Please select a custom date range to view analytics data.
        </div>
      )}

      {/* Stats Cards - Using memoized components */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MemoizedStatsCard 
          title="Page Views" 
          value={data?.pageViews.toLocaleString() || '0'} 
          description="Total page views in selected period" 
        />
        <MemoizedStatsCard 
          title="Unique Visitors" 
          value={data?.uniqueVisitors.toLocaleString() || '0'} 
          description="Total unique visitors in selected period" 
        />
        <MemoizedStatsCard 
          title="Game Plays" 
          value={totalGamePlays.toLocaleString()} 
          description="Total game plays in selected period" 
        />
        <MemoizedStatsCard 
          title="Avg. Session" 
          value={formattedSessionTime} 
          description="Average time on site" 
        />
        <MemoizedStatsCard 
          title="Bounce Rate" 
          value={data?.bounceRate ? `${data.bounceRate}%` : '0%'} 
          description="Visitors who leave after viewing one page" 
        />
      </div>

      {/* Charts - Using memoized components */}
      <div className="grid gap-4 md:grid-cols-3">
        <MemoizedPieChart 
          data={topGamesData} 
          title="Top Games" 
          formatter={(value, name, props) => [value, props.payload.fullName]} 
        />
        <MemoizedPieChart 
          data={deviceData} 
          title="Device Distribution" 
          formatter={(value) => value.toLocaleString()} 
        />
        <MemoizedBarChart 
          data={topPagesData} 
          title="Most Visited Pages" 
        />
      </div>

      <MemoizedLineChart 
        data={dailyData} 
        title="Daily Visitors" 
      />
    </div>
  );
}
