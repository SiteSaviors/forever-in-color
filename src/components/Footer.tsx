
import { Phone, Mail, MapPin, Clock, MessageCircle, Facebook, Instagram, Twitter, Youtube } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <img 
                src="/lovable-uploads/ba672515-a01f-4297-afc3-57592598b1cd.png" 
                alt="Forever In Color" 
                className="h-16 w-auto object-fill mb-4" 
              />
              <p className="text-gray-300 text-sm leading-relaxed">
                Transform your cherished memories into stunning works of art with our premium AI-powered photo transformation service.
              </p>
            </div>
            
            {/* Social Links */}
            <div>
              <h4 className="font-semibold mb-4 text-white">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-purple-600 transition-colors duration-300">
                  <Facebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-pink-600 transition-colors duration-300">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-blue-500 transition-colors duration-300">
                  <Twitter className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors duration-300">
                  <Youtube className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Quick Links</h4>
            <ul className="space-y-3">
              <li>
                <a href="#styles" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm">
                  Art Styles
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#ar-experience" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm">
                  AR Experience
                </a>
              </li>
              <li>
                <a href="#testimonials" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm">
                  Customer Reviews
                </a>
              </li>
              <li>
                <a href="#pricing" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm">
                  Pricing & Packages
                </a>
              </li>
              <li>
                <a href="#faq" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Customer Support</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <Phone className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Call Us</p>
                  <p className="text-sm text-gray-300">1-800-ART-MAGIC</p>
                  <p className="text-xs text-gray-400">(1-800-278-6244)</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <Mail className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Email Support</p>
                  <p className="text-sm text-gray-300">support@foreverincolor.com</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <MessageCircle className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Live Chat</p>
                  <p className="text-sm text-gray-300">Available 24/7</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <Clock className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Phone Hours</p>
                  <p className="text-sm text-gray-300">Mon-Fri: 8AM-8PM EST</p>
                  <p className="text-sm text-gray-300">Sat-Sun: 10AM-6PM EST</p>
                </div>
              </div>
            </div>
          </div>

          {/* Company Address & Legal */}
          <div>
            <h4 className="font-semibold mb-6 text-white">Company Info</h4>
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <MapPin className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-white">Address</p>
                  <p className="text-sm text-gray-300">
                    Forever In Color Studios<br />
                    123 Art District Lane<br />
                    Creative City, CC 12345
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 pt-4">
                <h5 className="font-medium text-white text-sm">Legal</h5>
                <ul className="space-y-2">
                  <li>
                    <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm">
                      Privacy Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm">
                      Terms of Service
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm">
                      Shipping Policy
                    </a>
                  </li>
                  <li>
                    <a href="#" className="text-gray-300 hover:text-purple-400 transition-colors duration-200 text-sm">
                      Return Policy
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div className="flex flex-col md:flex-row items-center space-y-2 md:space-y-0 md:space-x-6">
              <p className="text-sm text-gray-400">
                © 2024 Forever In Color. All rights reserved.
              </p>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-400">We accept:</span>
                <div className="flex space-x-2">
                  <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">VISA</div>
                  <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">MC</div>
                  <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">AMEX</div>
                  <div className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">PayPal</div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-400">All systems operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
