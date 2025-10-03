
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import { useAuthStore } from "@/hooks/useAuthStore";

const Auth = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  useEffect(() => {
    // Redirect to main page if already authenticated
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleAuthSuccess = () => {
    navigate("/");
  };

  return <AuthForm onAuthSuccess={handleAuthSuccess} />;
};

export default Auth;
