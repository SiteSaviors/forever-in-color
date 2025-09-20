import { CheckCircle, Users, Sparkles, Zap } from "lucide-react";

interface OrientationHeaderProps {
  selectedOrientation: string;
}

const OrientationHeader = ({ selectedOrientation }: OrientationHeaderProps) => {
  return (
    <div className="relative text-center mb-8 overflow-hidden">
      {/* Dynamic Multi-Layer Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/10 to-accent/5 rounded-3xl"></div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent rounded-3xl animate-pulse"></div>
      
      {/* Floating Particles Animation */}
      <div className="absolute top-4 left-8 w-2 h-2 bg-primary/30 rounded-full animate-bounce" style={{ animationDelay: '0s', animationDuration: '3s' }}></div>
      <div className="absolute top-8 right-12 w-1.5 h-1.5 bg-secondary/40 rounded-full animate-bounce" style={{ animationDelay: '1s', animationDuration: '4s' }}></div>
      <div className="absolute bottom-6 left-16 w-1 h-1 bg-accent/50 rounded-full animate-bounce" style={{ animationDelay: '2s', animationDuration: '5s' }}></div>
      
      <div className="relative p-8 border border-primary/10 rounded-3xl backdrop-blur-sm">
        {/* Premium Header with Pulsing Badge */}
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="relative">
            <Sparkles className="w-8 h-8 text-primary animate-pulse" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-ping"></div>
          </div>
          <h4 className="text-3xl font-bold bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent font-poppins tracking-tight premium-pulse">
            Step 2: Perfect Your Canvas
          </h4>
        </div>

        {/* Progressive Disclosure with Confidence Indicators */}
        <div className="space-y-4">
          <p className="text-muted-foreground text-lg mb-4 max-w-2xl mx-auto leading-relaxed">
            Our intelligent system analyzed your photo and selected the optimal orientation for maximum visual impact
          </p>

          {/* Auto-Detection Confidence Badge */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-primary/10 to-secondary/10 px-6 py-3 rounded-2xl border border-primary/20 backdrop-blur-sm">
            <div className="relative">
              <CheckCircle className="w-6 h-6 text-primary" />
              <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping"></div>
            </div>
            <div className="text-left">
              <span className="font-semibold text-foreground block">AI-Optimized: {selectedOrientation.charAt(0).toUpperCase() + selectedOrientation.slice(1)}</span>
              <span className="text-sm text-muted-foreground">99.2% accuracy rate</span>
            </div>
            <div className="flex items-center gap-1 ml-4">
              <Zap className="w-4 h-4 text-secondary animate-pulse" />
              <span className="text-xs font-medium text-secondary">Smart Choice</span>
            </div>
          </div>

          {/* Social Proof Element */}
          <div className="flex items-center justify-center gap-2 mt-6 text-muted-foreground">
            <Users className="w-5 h-5 text-primary/70" />
            <span className="text-sm font-medium">
              Join <span className="text-primary font-bold">50,000+</span> happy customers who trusted our AI recommendations
            </span>
            <div className="flex -space-x-1 ml-2">
              <div className="w-6 h-6 bg-gradient-to-r from-primary to-secondary rounded-full border-2 border-background live-pulse"></div>
              <div className="w-6 h-6 bg-gradient-to-r from-secondary to-accent rounded-full border-2 border-background live-pulse" style={{ animationDelay: '0.5s' }}></div>
              <div className="w-6 h-6 bg-gradient-to-r from-accent to-primary rounded-full border-2 border-background live-pulse" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrientationHeader;