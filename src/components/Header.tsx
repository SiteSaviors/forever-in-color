
import { Heart, Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-pink-500 via-purple-500 to-blue-500 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">Forever In Color</span>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
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
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-2 rounded-full font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200">
              Create Art
            </button>
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? (
              <X className="w-6 h-6 text-gray-700" />
            ) : (
              <Menu className="w-6 h-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100">
            <nav className="flex flex-col space-y-4">
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
