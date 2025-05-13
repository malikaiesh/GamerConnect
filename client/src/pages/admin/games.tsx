import AdminNavigation from "@/components/admin/navigation";
import GamesAdminPage from "./games-page";

export default function AdminGames() {
  return (
    <div className="flex min-h-screen bg-background">
      <AdminNavigation />
      <GamesAdminPage />
    </div>
  );
}
