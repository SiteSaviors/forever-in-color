
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, Clock } from "@/components/ui/icons";

interface RecentReview {
  name: string;
  rating: number;
  text: string;
  time: string;
}

const RecentReviews = () => {
  const recentReviews: RecentReview[] = [
    {
      name: "David K.",
      rating: 5,
      text: "Fast shipping, amazing quality. The AR feature blew my mind!",
      time: "2 hours ago"
    },
    {
      name: "Maria S.",
      rating: 5,
      text: "Perfect gift for my mom's birthday. She loves it!",
      time: "5 hours ago"
    },
    {
      name: "James L.",
      rating: 5,
      text: "The Living Memory feature is incredible. Highly recommend.",
      time: "1 day ago"
    },
    {
      name: "Lisa M.",
      rating: 5,
      text: "Beautiful colors and excellent customer service.",
      time: "2 days ago"
    }
  ];

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-gray-200">
      <CardContent className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Reviews</h3>
          <Badge className="bg-green-100 text-green-700 text-xs">Live</Badge>
        </div>
        
        <div className="grid md:grid-cols-2 gap-4">
          {recentReviews.map((review, index) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-medium">
                {review.name.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm">{review.name}</span>
                  <div className="flex">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 mb-1">"{review.text}"</p>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {review.time}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-6">
          <Button variant="outline" className="border-purple-200 text-purple-600 hover:bg-purple-50">
            View All 2,847 Reviews
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default RecentReviews;
