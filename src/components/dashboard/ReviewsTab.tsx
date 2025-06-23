
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Star, StarIcon, User, Calendar } from "lucide-react";

interface Review {
  id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  user_id: string;
  booking_id: string;
  bookings: {
    customer_name: string | null;
    service_id: string;
    services: {
      name: string;
    } | null;
  } | null;
}

const ReviewsTab = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalReviews: 0,
    averageRating: 0,
    fiveStars: 0,
    fourStars: 0,
    threeStars: 0,
    twoStars: 0,
    oneStar: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    loadReviews();
  }, []);

  useEffect(() => {
    const channel = supabase
      .channel("reviews-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "reviews" }, () => {
        console.log("Reviews updated");
        loadReviews();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const loadReviews = async () => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) return;

      const { data: garage } = await supabase
        .from("garages")
        .select("id")
        .eq("owner_id", user.user.id)
        .single();

      if (!garage) {
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from("reviews")
        .select(`
          *,
          bookings (
            customer_name,
            service_id,
            services (name)
          )
        `)
        .eq("garage_id", garage.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setReviews(data || []);
      calculateStats(data || []);
    } catch (error) {
      console.error("Error loading reviews:", error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (reviewsData: Review[]) => {
    const total = reviewsData.length;
    const average = total > 0 ? reviewsData.reduce((sum, review) => sum + review.rating, 0) / total : 0;
    
    const ratingCounts = reviewsData.reduce((acc, review) => {
      acc[review.rating] = (acc[review.rating] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    setStats({
      totalReviews: total,
      averageRating: Math.round(average * 10) / 10,
      fiveStars: ratingCounts[5] || 0,
      fourStars: ratingCounts[4] || 0,
      threeStars: ratingCounts[3] || 0,
      twoStars: ratingCounts[2] || 0,
      oneStar: ratingCounts[1] || 0,
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`h-4 w-4 ${
          index < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
        }`}
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Customer Reviews</h2>
        <p className="text-gray-600">View and monitor customer feedback in real-time</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalReviews}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <div className="text-2xl font-bold">{stats.averageRating}</div>
              <div className="flex">
                {renderStars(Math.round(stats.averageRating))}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">5-Star Reviews</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.fiveStars}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Rating Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span>5★</span>
                <span>{stats.fiveStars}</span>
              </div>
              <div className="flex justify-between">
                <span>4★</span>
                <span>{stats.fourStars}</span>
              </div>
              <div className="flex justify-between">
                <span>3★</span>
                <span>{stats.threeStars}</span>
              </div>
              <div className="flex justify-between">
                <span>2★</span>
                <span>{stats.twoStars}</span>
              </div>
              <div className="flex justify-between">
                <span>1★</span>
                <span>{stats.oneStar}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StarIcon className="h-5 w-5" />
            Recent Reviews
          </CardTitle>
          <CardDescription>Latest customer feedback and ratings</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="h-[600px]">
            {reviews.length > 0 ? (
              <div className="space-y-4 p-6">
                {reviews.map((review) => (
                  <div
                    key={review.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">
                              {review.bookings?.customer_name || "Anonymous Customer"}
                            </span>
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {review.bookings?.services?.name || "Service"}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex">
                            {renderStars(review.rating)}
                          </div>
                          <span className="text-sm font-medium">{review.rating}/5</span>
                        </div>

                        {review.comment && (
                          <p className="text-gray-700 text-sm leading-relaxed mb-3">
                            {review.comment}
                          </p>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDate(review.created_at)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <StarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Customer reviews will appear here after completed bookings</p>
              </div>
            )}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReviewsTab;
