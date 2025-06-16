
import { Menu, X, Search, ShoppingCart, User } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-8 sm:px-12 lg:px-16 my-[9px]">
        <div className="flex items-center justify-between h-16 py-0">
          {/* Logo - Far Left */}
          <div className="flex items-center flex-shrink-0">
            <img 
              src="/lovable-uploads/9e8397a4-ee91-45c4-b9ff-81b938018dd3.png" 
              alt="Forever In Color" 
              className="h-16 w-auto object-fill" 
            />
          </div>

          {/* Desktop Navigation - Center */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-16">
            <div className="flex items-center space-x-12">
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

          {/* Desktop Actions - Far Right */}
          <div className="hidden md:flex items-center space-x-6 flex-shrink-0">
            {/* Search */}
            <div className="relative">
              {isSearchOpen ? (
                <div className="flex items-center">
                  <input
                    type="text"
                    placeholder="Search..."
                    className="w-48 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    autoFocus
                    onBlur={() => setIsSearchOpen(false)}
                  />
                </div>
              ) : (
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-2 text-gray-700 hover:text-purple-600 transition-colors duration-200"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}
            </div>

            {/* Cart */}
            <button className="relative p-2 text-gray-700 hover:text-purple-600 transition-colors duration-200">
              <ShoppingCart className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-purple-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                0
              </span>
            </button>

            {/* Login */}
            <button className="p-2 text-gray-700 hover:text-purple-600 transition-colors duration-200">
              <User className="w-5 h-5" />
            </button>

            {/* Create Art Button */}
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-3 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 ml-4">
              Create Art
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
              {/* Mobile Search */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

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

              {/* Mobile Actions */}
              <div className="flex items-center space-x-4 pt-2">
                <button className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200">
                  <ShoppingCart className="w-5 h-5" />
                  <span>Cart (0)</span>
                </button>
                <button className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-200">
                  <User className="w-5 h-5" />
                  <span>Login</span>
                </button>
              </div>

              <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold w-fit">
                Create Art
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
