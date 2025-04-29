
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-stockflow-background">
      <div className="text-center max-w-md p-8">
        <div className="mb-4 text-stockflow-primary">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mx-auto"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="m15 9-6 6" />
            <path d="m9 9 6 6" />
          </svg>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-stockflow-text">404</h1>
        <p className="text-xl text-stockflow-text-light mb-6">Oops! The page you're looking for cannot be found.</p>
        <Link to="/">
          <Button className="px-6">
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
