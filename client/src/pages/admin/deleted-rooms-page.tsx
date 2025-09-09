import { useQuery } from "@tanstack/react-query";
import AdminNavigation from "@/components/admin/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DeletedRoomsPage() {
  // Fetch deleted rooms data
  const { data: deletedRoomsData, isLoading, error } = useQuery({
    queryKey: ["/api/rooms/deleted"],
  });

  console.log("Deleted Rooms Data:", deletedRoomsData);
  console.log("Loading:", isLoading);
  console.log("Error:", error);

  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      
      <div className="flex-1 p-6 lg:p-10">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold">Deleted Rooms Recovery</h1>
            <p className="text-muted-foreground">
              Recover deleted user rooms by their ID.
            </p>
          </div>

          {/* Simple Content */}
          <Card>
            <CardHeader>
              <CardTitle>Deleted Rooms</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div>Loading deleted rooms...</div>
              ) : error ? (
                <div className="text-red-500">Error: {(error as Error).message}</div>
              ) : !deletedRoomsData?.length ? (
                <div>No deleted rooms found</div>
              ) : (
                <div>
                  <p>Found {deletedRoomsData.length} deleted rooms</p>
                  <div className="space-y-2 mt-4">
                    {deletedRoomsData.map((roomData: any, index: number) => (
                      <div key={index} className="p-4 border rounded">
                        <div className="font-medium">{roomData.room?.name || 'Unnamed Room'}</div>
                        <div className="text-sm text-muted-foreground">
                          ID: {roomData.room?.roomId} • Owner: {roomData.owner?.username}
                        </div>
                        <div className="text-sm text-red-500">
                          Deleted: {roomData.room?.deletedAt ? new Date(roomData.room.deletedAt).toLocaleString() : 'Unknown'}
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