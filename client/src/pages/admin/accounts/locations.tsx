import { useQuery } from "@tanstack/react-query";
import { AdminLayout } from "@/components/admin/layout";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
} from "react-simple-maps";
import { Loader2 } from "lucide-react";

// Path to the world map GeoJSON
const geoUrl = "https://raw.githubusercontent.com/deldersveld/topojson/master/world-countries.json";

interface CountryData {
  country: string;
  count: number;
}

interface LocationData {
  ip?: string;
  city?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
}

interface UserMapData {
  countryStats: CountryData[];
  recentLocations: LocationData[];
}

export default function AccountsLocationsPage() {
  // Fetch country stats and recent locations
  const { data, isLoading } = useQuery<UserMapData>({
    queryKey: ['/api/admin/users/map-data'],
    queryFn: async () => {
      // Fetch country statistics
      const countryResponse = await fetch('/api/admin/users/countries');
      if (!countryResponse.ok) {
        throw new Error('Failed to fetch country statistics');
      }
      const countryStats = await countryResponse.json();
      
      // Get 100 most recent users with location data
      const locationResponse = await fetch('/api/admin/users/recent-locations?limit=100');
      if (!locationResponse.ok) {
        throw new Error('Failed to fetch location data');
      }
      const recentLocations = await locationResponse.json();
      
      return {
        countryStats,
        recentLocations
      };
    }
  });
  
  // Calculate the max users per country for color intensity
  const maxUsers = data?.countryStats?.reduce((max, country) => 
    country.count > max ? country.count : max, 0) || 1;

  // Get color intensity based on user count (0.2 to 0.8 intensity)
  const getColorIntensity = (count: number) => {
    const normalized = count / maxUsers;
    return 0.2 + (normalized * 0.6); // Scale to range 0.2-0.8
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-3xl font-bold tracking-tight">User Locations</h2>

        <Card>
          <CardHeader>
            <CardTitle>Global User Distribution</CardTitle>
            <CardDescription>
              Visualize where your users are located around the world
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="h-[500px]">
                <ComposableMap
                  projectionConfig={{
                    scale: 140,
                    rotation: [-11, 0, 0],
                  }}
                >
                  <Geographies geography={geoUrl}>
                    {({ geographies }) =>
                      geographies.map((geo) => {
                        const country = data?.countryStats?.find(
                          (c) => c.country.toLowerCase() === geo.properties.name.toLowerCase()
                        );
                        const userCount = country?.count || 0;
                        
                        return (
                          <Geography
                            key={geo.rsmKey}
                            geography={geo}
                            fill={
                              userCount > 0
                                ? `rgba(56, 189, 248, ${getColorIntensity(userCount)})`
                                : "#F5F5F5"
                            }
                            stroke="#D6D6DA"
                            style={{
                              default: {
                                outline: "none",
                              },
                              hover: {
                                fill: userCount > 0 ? "#38BDF8" : "#E5E5E5",
                                outline: "none",
                                cursor: "pointer",
                              },
                              pressed: {
                                outline: "none",
                              },
                            }}
                          />
                        );
                      })
                    }
                  </Geographies>

                  {/* Plot individual user locations */}
                  {data?.recentLocations
                    ?.filter(location => 
                      location.latitude !== undefined && 
                      location.longitude !== undefined)
                    .map((location, i) => (
                      <Marker
                        key={i}
                        coordinates={[
                          location.longitude as number,
                          location.latitude as number,
                        ]}
                      >
                        <circle r={3} fill="#FF5533" stroke="#FFFFFF" strokeWidth={1} />
                      </Marker>
                    ))}
                </ComposableMap>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top User Countries</CardTitle>
            <CardDescription>
              Countries with the highest number of registered users
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="space-y-4">
                {data?.countryStats?.slice(0, 10).map((country, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-8 text-right font-medium">{index + 1}.</div>
                    <div className="flex-1">
                      <div className="text-lg font-medium">{country.country || "Unknown"}</div>
                      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{
                            width: `${(country.count / maxUsers) * 100}%`,
                          }}
                        ></div>
                      </div>
                    </div>
                    <div className="text-lg font-semibold">{country.count}</div>
                  </div>
                ))}

                {(!data?.countryStats || data.countryStats.length === 0) && (
                  <div className="py-8 text-center text-gray-500">
                    No country data available
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}