import { useAuth } from "../Contexts/AuthContext";
import { useEffect } from "react";
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, loading, setIsAuthorized } = useAuth();

  const hasAccess = !!user?.appAccess?.some((app) => app.slug === "agenda");

  useEffect(() => {
    if (loading) return;

    if (!user || !hasAccess) {
      alert("Vous n'avez pas les permissions nécessaires pour accéder à cette application.");
      window.location.replace("https://vegibec-portail.com/");
      return;
    }

    setIsAuthorized(true);
  }, [user, loading, hasAccess, setIsAuthorized]);

  if (loading) return <div>Chargement...</div>;

  if (!user || !hasAccess) return null;

  return children;
};



export default ProtectedRoute;