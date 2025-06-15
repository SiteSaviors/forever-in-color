
import { Menu, X } from "lucide-react";
import { useState } from "react";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 my-[9px]">
        <div className="flex items-center justify-between h-16 py-0">
          {/* Logo */}
          <div className="flex items-center">
            <img 
              src="/lovable-uploads/9e8397a4-ee91-45c4-b9ff-81b938018dd3.png" 
              alt="Forever In Color" 
              className="h-20 w-auto object-fill" 
            />
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
          <button className="md:hidden p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="w-6 h-6 text-gray-700" /> : <Menu className="w-6 h-6 text-gray-700" />}
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
