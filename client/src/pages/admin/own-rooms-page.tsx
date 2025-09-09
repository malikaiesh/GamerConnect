import { useQuery } from "@tanstack/react-query";
import AdminNavigation from "@/components/admin/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function OwnRoomsPage() {
  // Fetch own rooms data
  const { data: ownRoomsData, isLoading, error } = useQuery({
    queryKey: ["/api/rooms/my-rooms"],
  });

  console.log("Own Rooms Data:", ownRoomsData);
  console.log("Loading:", isLoading);
  console.log("Error:", error);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Own Rooms</h1>
            <p className="text-muted-foreground">
              Manage and monitor all rooms you've created.
            </p>
          </div>

          {/* Simple Content */}
          <Card>
            <CardHeader>
              <CardTitle>Your Created Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading your rooms...</div>
              ) : error ? (
                <div className="text-red-500">Error: {(error as Error).message}</div>
              ) : !ownRoomsData?.length ? (
                <div>No rooms created yet</div>
              ) : (
                <div>
                  <p>Found {ownRoomsData.length} rooms</p>
                  <div className="space-y-2 mt-4">
                    {ownRoomsData.map((roomData: any, index: number) => (
                      <div key={index} className="p-4 border rounded">
                        <div className="font-medium">{roomData.room?.name || 'Unnamed Room'}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {roomData.room?.roomId} • Status: {roomData.room?.status}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}