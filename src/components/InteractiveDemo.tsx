
import { useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Upload, Camera, Smartphone, Play, Sparkles } from "lucide-react";

const InteractiveDemo = () => {
  const [selectedStyle, setSelectedStyle] = useState("neon");
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const artStyles = [
    { id: "neon", name: "Neon Synthwave", colors: "from-pink-500 via-purple-600 to-cyan-400" },
    { id: "watercolor", name: "Watercolor Dreams", colors: "from-blue-300 via-purple-300 to-pink-300" },
    { id: "popart", name: "Pop Art Burst", colors: "from-red-500 via-yellow-400 to-blue-500" },
    { id: "cartoon", name: "Cartoon Style", colors: "from-orange-400 via-red-500 to-pink-500" },
    { id: "charcoal", name: "Charcoal Sketch", colors: "from-gray-400 via-gray-600 to-gray-800" },
    { id: "impressionist", name: "Impressionist", colors: "from-blue-400 via-green-500 to-yellow-400" }
  ];

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            See the{" "}
            <span className="bg-gradient-to-r from-pink-500 via-purple-600 to-blue-600 bg-clip-text text-transparent">
              Magic
            </span>{" "}
            in Action
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Upload a photo, choose your style, and watch your memories transform into stunning artwork. 
            Then experience it in AR right from your phone.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Photo Upload Demo */}
          <Card className="group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Upload className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">1. Upload Your Photo</h3>
                <p className="text-gray-600">Drag & drop or click to upload any photo</p>
              </div>

              {/* Upload Area */}
              <div
                className="border-2 border-dashed border-purple-200 rounded-xl p-8 text-center cursor-pointer hover:border-purple-400 transition-colors"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploadedImage ? (
                  <div className="space-y-4">
                    <img 
                      src={uploadedImage} 
                      alt="Uploaded" 
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <p className="text-sm text-green-600 font-medium">✓ Photo uploaded successfully!</p>
                    <button className="text-purple-600 text-sm hover:underline">
                      Upload different photo
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Camera className="w-12 h-12 text-purple-400 mx-auto" />
                    <div>
                      <p className="text-gray-600 font-medium">Drop your photo here</p>
                      <p className="text-sm text-gray-500">or click to browse</p>
                    </div>
                  </div>
                )}
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </CardContent>
          </Card>

          {/* Style Selector */}
          <Card className="group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">2. Choose Your Style</h3>
                <p className="text-gray-600">Select from 10 unique artistic styles</p>
              </div>

              {/* Style Preview */}
              <div className="mb-6">
                <div className={`aspect-square bg-gradient-to-br ${artStyles.find(s => s.id === selectedStyle)?.colors} rounded-xl mb-4 flex items-center justify-center relative overflow-hidden`}>
                  {uploadedImage ? (
                    <div className="absolute inset-0">
                      <img 
                        src={uploadedImage} 
                        alt="Style preview" 
                        className="w-full h-full object-cover opacity-80"
                      />
                      <div className={`absolute inset-0 bg-gradient-to-br ${artStyles.find(s => s.id === selectedStyle)?.colors} mix-blend-overlay`}></div>
                    </div>
                  ) : (
                    <div className="text-center text-white">
                      <div className="w-16 h-16 border-4 border-white/50 rounded-full flex items-center justify-center mx-auto mb-2">
                        <div className="w-8 h-8 bg-white/30 rounded-full"></div>
                      </div>
                      <p className="text-sm opacity-90">Upload a photo to see preview</p>
                    </div>
                  )}
                </div>
                <p className="text-center font-medium text-gray-700">
                  {artStyles.find(s => s.id === selectedStyle)?.name}
                </p>
              </div>

              {/* Style Options */}
              <div className="grid grid-cols-2 gap-2">
                {artStyles.map((style) => (
                  <button
                    key={style.id}
                    onClick={() => setSelectedStyle(style.id)}
                    className={`p-3 rounded-lg text-sm font-medium transition-all ${
                      selectedStyle === style.id
                        ? 'bg-purple-100 text-purple-700 border-2 border-purple-300'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {style.name}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AR Experience Preview */}
          <Card className="group hover:shadow-xl transition-all duration-300">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-pink-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Smartphone className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">3. Experience in AR</h3>
                <p className="text-gray-600">View your artwork in your space with AR</p>
              </div>

              {/* AR Preview */}
              <div className="relative">
                <div className="aspect-square bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl mb-4 flex items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-purple-200/30 to-pink-200/30"></div>
                  <div className="text-center z-10">
                    <div className="w-20 h-20 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4">
                      <Play className="w-10 h-10 text-purple-600" />
                    </div>
                    <p className="text-purple-700 font-medium">AR Demo</p>
                    <p className="text-sm text-purple-600">Tap to preview</p>
                  </div>
                  
                  {/* Floating AR indicators */}
                  <div className="absolute top-4 right-4">
                    <Badge variant="secondary" className="bg-white/90 text-purple-700 font-semibold">
                      AR Ready
                    </Badge>
                  </div>
                </div>
              </div>

              {/* AR Features */}
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">See artwork on your wall</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Adjust size & position</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-sm text-gray-600">Share with friends</span>
                </div>
              </div>

              <button className="w-full mt-6 bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-medium hover:shadow-lg transition-all">
                Try AR Experience
              </button>
            </CardContent>
          </Card>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <div className="bg-white rounded-2xl p-8 shadow-xl border border-purple-100 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Transform Your Memories?</h3>
            <p className="text-gray-600 mb-6">
              Join thousands of customers who have turned their precious photos into stunning artwork
            </p>
            <button className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-8 py-4 rounded-full font-semibold text-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300">
              Start Your Transformation
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default InteractiveDemo;
