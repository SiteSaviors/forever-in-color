
import { Menu, X, Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo - Left aligned */}
          <div className="flex items-center flex-shrink-0">
            <Link to="/">
              <img 
                src="/lovable-uploads/b032116b-c33f-4ac1-9792-baea8a2ab78f.png" 
                alt="Forever In Color" 
                className="h-12 w-auto object-contain" 
              />
            </Link>
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden lg:flex items-center justify-center flex-1 mx-12">
            <div className="flex items-center space-x-8">
              <a href="#styles" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium">
                Art Styles
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium">
                How It Works
              </a>
              <a href="#ar-experience" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium">
                AR Experience
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium">
                Reviews
              </a>
            </div>
          </nav>

          {/* Desktop Actions - Right aligned with consistent spacing */}
          <div className="hidden lg:flex items-center space-x-4 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-56 px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-sm"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2.5 text-gray-700 hover:text-purple-600 transition-colors duration-200 hover:bg-gray-50 rounded-lg"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Cart */}
            <button className="relative p-2.5 text-gray-700 hover:text-purple-600 transition-colors duration-200 hover:bg-gray-50 rounded-lg">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                0
              </span>
            </button>

            {/* Login */}
            <button className="p-2.5 text-gray-700 hover:text-purple-600 transition-colors duration-200 hover:bg-gray-50 rounded-lg">
              <User className="w-5 h-5" />
            </button>

            {/* Create Art Button - Consistent styling */}
            <Link 
              to="/product"
              className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 ml-4"
            >
              Create Art
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button className="lg:hidden p-2.5 hover:bg-gray-50 rounded-lg transition-colors duration-200" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>

        {/* Mobile Navigation - Consistent spacing */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t border-gray-100">
            <nav className="flex flex-col space-y-6">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <a href="#styles" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium py-2">
                Art Styles
              </a>
              <a href="#how-it-works" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium py-2">
                How It Works
              </a>
              <a href="#ar-experience" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium py-2">
                AR Experience
              </a>
              <a href="#testimonials" className="text-gray-700 hover:text-purple-600 transition-colors duration-200 font-medium py-2">
                Reviews
              </a>

              {/* Mobile Actions - Grid layout */}
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
                <button className="flex items-center justify-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 py-3">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart (0)</span>
                </button>
                <button className="flex items-center justify-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200 py-3">
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </button>
              </div>

              <Link 
                to="/product"
                className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-center mt-4"
              >
                Create Art
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
