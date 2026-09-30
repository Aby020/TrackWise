import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Compass } from "lucide-react";
import { Logo } from "../../components/brand/Logo";
import { Button } from "../../components/ui/Button";
import { useAuth } from "../../context/AuthContext";

function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated, isAdmin } = useAuth();

  const homePath = isAuthenticated
    ? isAdmin
      ? "/admin"
      : "/dashboard"
    : "/";

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-canvas">
      <div
        className="pointer-events-none absolute inset-0"
        aria-hidden="true"
      >
        <span className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
        <span className="absolute -right-20 bottom-10 h-80 w-80 rounded-full bg-violet/15 blur-3xl" />
      </div>

      <header className="relative z-10 mx-auto flex w-full max-w-6xl items-center px-6 py-6 lg:px-8">
        <Link to="/" aria-label="TrackWise home">
          <Logo variant="dark" />
        </Link>
      </header>

      <main className="relative z-10 mx-auto flex w-full max-w-6xl flex-1 items-center justify-center px-6 py-16 lg:px-8">
        <div className="animate-fade-up text-center">
          <p className="font-display text-7xl font-bold tracking-tight sm:text-8xl">
            <span className="bg-gradient-to-r from-primary to-violet bg-clip-text text-transparent">
              404
            </span>
          </p>
          <div className="mx-auto mt-6 grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
            <Compass className="h-6 w-6" aria-hidden="true" />
          </div>
          <h1 className="mt-5 text-xl font-bold tracking-tight text-ink">
            This page is off the clock
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted">
            The page you're looking for doesn't exist or has been moved.
            Let's get you back to work.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button
              size="lg"
              onClick={() => navigate(homePath)}
              leftIcon={ArrowLeft}
            >
              Back to {isAuthenticated ? "dashboard" : "home"}
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate("/login")}
            >
              Sign in
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default NotFound;
