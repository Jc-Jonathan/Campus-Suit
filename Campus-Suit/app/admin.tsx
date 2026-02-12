import { AdminStack } from "../src/navigation/AdminStack";
import { useAuth } from "../src/contexts/AuthContext";

export default function AdminPage() {
  const { userToken } = useAuth();

  if (!userToken) {
    return null; // Will be handled by auth logic
  }

  return <AdminStack />;
}
