import { AdminNavigation } from "@/components/admin/navigation";
import GamesAdminPage from "./games-page";

export default function AdminGames() {
  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900">
      <AdminNavigation />
      <GamesAdminPage />
    </div>
  );
}
