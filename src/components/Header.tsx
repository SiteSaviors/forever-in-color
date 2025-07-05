
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, Sparkles } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "@/hooks/useAuthStore";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import TokenBalance from "@/components/ui/TokenBalance";
import TokenPurchaseModal from "@/components/ui/TokenPurchaseModal";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isTokenPurchaseOpen, setIsTokenPurchaseOpen] = useState(false);
  const {
    user,
    signOut
  } = useAuthStore();
  const navigate = useNavigate();
  
  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  const handleTokenPurchaseClick = () => {
    setIsTokenPurchaseOpen(true);
  };

  const handleNavClick = () => {
    // Add haptic feedback for mobile
    if (navigator.vibrate) {
      navigator.vibrate(25);
    }
    setIsMenuOpen(false);
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-gradient-to-r from-white/85 via-purple-50/90 to-pink-50/85 backdrop-blur-lg border-b border-gradient-to-r from-purple-200/30 to-pink-200/30 z-50 shadow-lg">
        {/* Animated Background Shine Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-shimmer pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo with Premium Effect */}
            <Link to="/" className="flex items-center group">
              <div className="relative">
                <img 
                  src="/lovable-uploads/353d8eff-65bb-4296-ac0d-a23a0c4b5cce.png" 
                  alt="Forever In Color" 
                  className="h-10 w-auto object-contain transition-transform duration-300 group-hover:scale-110" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 to-pink-400/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm"></div>
              </div>
            </Link>

            {/* Desktop Navigation with Premium Styling */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link 
                to="/" 
                className="font-poppins-tight font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300 relative group"
                onClick={handleNavClick}
              >
                Home
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <Link 
                to="/product" 
                className="font-poppins-tight font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300 relative group"
                onClick={handleNavClick}
              >
                Create Art
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
              </Link>
              <a 
                href="#styles" 
                className="font-poppins-tight font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300 relative group"
              >
                Styles
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
              </a>
              <a 
                href="#how-it-works" 
                className="font-poppins-tight font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300 relative group"
              >
                How It Works
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300"></span>
              </a>
            </nav>

            {/* Premium Auth Section */}
            <div className="hidden md:flex items-center space-x-4">
              {user ? (
                <>
                  <TokenBalance onPurchaseClick={handleTokenPurchaseClick} />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="flex items-center space-x-2 font-poppins-tight bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200/50 hover:border-purple-300/50 transition-all duration-300"
                      >
                        <User className="h-4 w-4" />
                        <span className="bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent font-medium">
                          {user.email}
                        </span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white/90 backdrop-blur-lg border-purple-200/50">
                      <DropdownMenuItem className="font-poppins">
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={handleSignOut} className="font-poppins">
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Sign Out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                <>
                  <Link to="/auth">
                    <Button 
                      variant="ghost" 
                      className="font-poppins-tight font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300"
                    >
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/product" onClick={handleNavClick}>
                    <Button className="font-poppins-tight font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:via-pink-700 hover:to-rose-600 text-white px-6 py-2.5 rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                      {/* Shine Effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                      <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                      <span className="relative z-10">Start Creating</span>
                    </Button>
                  </Link>
                </>
              )}
            </div>

            {/* Premium Mobile menu button */}
            <div className="md:hidden">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="bg-gradient-to-r from-purple-50 to-pink-50 hover:from-purple-100 hover:to-pink-100 border border-purple-200/50 transition-all duration-300"
              >
                {isMenuOpen ? (
                  <X className="h-5 w-5 text-purple-700" />
                ) : (
                  <Menu className="h-5 w-5 text-purple-700" />
                )}
              </Button>
            </div>
          </div>

          {/* Premium Mobile Navigation */}
          {isMenuOpen && (
            <div className="md:hidden py-4 border-t border-gradient-to-r from-purple-200/30 to-pink-200/30 bg-gradient-to-r from-white/40 to-purple-50/40 backdrop-blur-sm rounded-b-2xl">
              <nav className="flex flex-col space-y-4">
                <Link 
                  to="/" 
                  className="font-poppins-tight font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300 px-2"
                  onClick={handleNavClick}
                >
                  Home
                </Link>
                <Link 
                  to="/product" 
                  className="font-poppins-tight font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300 px-2"
                  onClick={handleNavClick}
                >
                  Create Art
                </Link>
                <a 
                  href="#styles" 
                  className="font-poppins-tight font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300 px-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Styles
                </a>
                <a 
                  href="#how-it-works" 
                  className="font-poppins-tight font-medium bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600 transition-all duration-300 px-2"
                  onClick={() => setIsMenuOpen(false)}
                >
                  How It Works
                </a>
                
                {user ? (
                  <div className="pt-4 border-t border-purple-200/30 space-y-2">
                    <TokenBalance onPurchaseClick={handleTokenPurchaseClick} className="justify-start px-2" />
                    <p className="text-sm font-poppins bg-gradient-to-r from-purple-700 to-pink-700 bg-clip-text text-transparent px-2">
                      Signed in as {user.email}
                    </p>
                    <Button 
                      variant="ghost" 
                      onClick={handleSignOut} 
                      className="w-full justify-start font-poppins hover:bg-gradient-to-r hover:from-purple-50 hover:to-pink-50"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="pt-4 border-t border-purple-200/30 space-y-2">
                    <Link to="/auth" onClick={handleNavClick}>
                      <Button 
                        variant="ghost" 
                        className="w-full font-poppins-tight bg-gradient-to-r from-gray-700 to-gray-900 bg-clip-text text-transparent hover:from-purple-600 hover:to-pink-600"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link to="/product" onClick={handleNavClick}>
                      <Button className="w-full font-poppins-tight font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-500 hover:from-purple-700 hover:via-pink-700 hover:to-rose-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-500"></div>
                        <Sparkles className="w-4 h-4 mr-2 animate-pulse" />
                        <span className="relative z-10">Start Creating</span>
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Token Purchase Modal */}
      <TokenPurchaseModal 
        isOpen={isTokenPurchaseOpen} 
        onClose={() => setIsTokenPurchaseOpen(false)} 
      />
    </>
  );
};

export default Header;
