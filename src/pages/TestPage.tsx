import MainLayout from "@/components/layout/MainLayout";
import { X, Heart, ChevronRight, Star, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const TestPage = () => {
  return (
    <MainLayout>
      <div className="container mx-auto p-6 flex items-center justify-center min-h-screen">
        <div className="w-full max-w-5xl bg-card rounded-3xl shadow-2xl flex overflow-hidden">
          {/* Left Side - Image */}
          <div className="w-1/2 bg-muted p-12 flex items-center justify-center relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 left-6 bg-background rounded-full w-12 h-12"
            >
              <div className="flex flex-col gap-1">
                <div className="w-1 h-1 rounded-full bg-foreground"></div>
                <div className="w-1 h-1 rounded-full bg-foreground"></div>
                <div className="w-1 h-1 rounded-full bg-foreground"></div>
              </div>
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 left-1/2 -translate-x-1/2 bg-background rounded-full w-14 h-14"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 right-1/2 translate-x-1/2 bg-background rounded-full w-14 h-14 ml-20"
            >
              <Heart className="w-6 h-6" />
            </Button>
            
            <img 
              src="https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500&h=500&fit=crop" 
              alt="Vintage Camera" 
              className="w-full h-auto object-contain max-h-96"
            />
          </div>
          
          {/* Right Side - Details */}
          <div className="w-1/2 p-12 flex flex-col relative">
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute top-6 right-6 rounded-full"
            >
              <X className="w-6 h-6" />
            </Button>
            
            <h1 className="text-4xl font-bold mb-4">Sample Match - Vintage Camera</h1>
            
            <p className="text-muted-foreground text-lg mb-8">
              A beautiful vintage camera in excellent working condition. Perfect for photography enthusiasts or collectors.
            </p>
            
            <div className="grid grid-cols-2 gap-6 mb-8">
              <div>
                <p className="text-lg font-semibold">Electronics</p>
              </div>
              <div>
                <p className="text-lg font-semibold">vintage</p>
              </div>
              
              <div>
                <p className="text-lg font-semibold">Good</p>
              </div>
              <div>
                <p className="text-lg font-semibold">$200 - $400</p>
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="icon" 
              className="absolute bottom-12 right-12 rounded-full w-14 h-14"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
            
            <div className="mt-auto pt-8 border-t flex items-center gap-4">
              <Avatar className="w-12 h-12">
                <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=sample" />
                <AvatarFallback>SP</AvatarFallback>
              </Avatar>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-lg">sample_photographer</p>
                  <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                  <span className="text-muted-foreground">No reviews</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Since 2024</span>
                  <span className="flex items-center gap-1">
                    <RefreshCw className="w-4 h-4" />
                    0 trades completed
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default TestPage;
