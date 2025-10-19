import { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import { X, Heart, ArrowLeft, ArrowRight, MoreVertical, Repeat } from "lucide-react";

const TestPage = () => {
  const allImages = [
    "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=500&h=500&fit=crop"
  ];
  const [slide, setSlide] = useState(0);

  return (
    <MainLayout>
      <div className="container mx-auto p-6">
        <div className="max-w-4xl mx-auto h-[540px] md:h-[520px] bg-white rounded-2xl overflow-hidden shadow-lg relative flex">
          
          {/* Image Section */}
          <div className="relative w-1/2 h-full flex-shrink-0 bg-black/10">
            <img
              src={allImages[slide]}
              alt="Sample Match - Vintage Camera"
              className="object-cover w-full h-full"
              style={{ minHeight: 320 }}
            />
            
            {/* Bottom navigation for multiple images */}
            {allImages.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
                <button
                  onClick={() => setSlide(s => (s > 0 ? s - 1 : allImages.length - 1))}
                  className="bg-white bg-opacity-90 rounded-full shadow p-2 hover:scale-105 transition"
                  aria-label="Previous"
                >
                  <ArrowLeft className="w-4 h-4" />
                </button>
                
                <div className="flex items-center gap-1.5">
                  {allImages.map((_, i) => (
                    <button
                      key={i}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        slide === i ? "bg-white" : "bg-white/60"
                      }`}
                      onClick={() => setSlide(i)}
                      aria-label={`Go to image ${i + 1}`}
                    />
                  ))}
                </div>
                
                <button
                  onClick={() => setSlide(s => (s < allImages.length - 1 ? s + 1 : 0))}
                  className="bg-white bg-opacity-90 rounded-full shadow p-2 hover:scale-105 transition"
                  aria-label="Next"
                >
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
            
            {/* Left 3-dots menu */}
            <div className="absolute top-4 left-4 z-30">
              <button
                className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center"
                aria-label="More actions"
              >
                <MoreVertical className="w-5 h-5 text-gray-400" />
              </button>
            </div>
            
            {/* Top-right buttons */}
            <div className="absolute top-4 right-4 flex gap-3 z-20">
              <button
                className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
              <button
                className="w-12 h-12 bg-white rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 cursor-pointer transition-colors"
                aria-label="Like"
              >
                <Heart className="w-5 h-5 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Details Section */}
          <div className="flex-1 flex flex-col px-8 py-7 justify-start overflow-y-auto">
            {/* Item details */}
            <div className="mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Sample Match - Vintage Camera
                </h2>
                <p className="text-gray-700 text-base leading-relaxed mb-4">
                  A beautiful vintage camera in excellent working condition. Perfect for photography enthusiasts or collectors.
                </p>
                
                {/* Item Details Grid */}
                <div className="grid grid-cols-2 gap-4 text-sm pb-6 border-b">
                  <div className="font-medium text-gray-900">Electronics</div>
                  <div className="font-medium text-gray-900">vintage</div>
                  <div className="font-medium text-gray-900">Good</div>
                  <div className="font-medium text-gray-900">$200 - $400</div>
                </div>
              </div>
              
              {/* What They're Looking For Section */}
              <div className="mt-6 pt-6 border-t">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">What They&apos;re Looking For</h3>
                
                {/* Categories interested in */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Categories interested in</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Electronics</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Home & Garden</span>
                  </div>
                </div>
                
                {/* Acceptable conditions */}
                <div className="mb-4">
                  <p className="text-xs text-gray-600 mb-2">Acceptable conditions</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">New</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Like New</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">Good</span>
                  </div>
                </div>
                
                {/* Price ranges interested in */}
                <div>
                  <p className="text-xs text-gray-600 mb-2">Price ranges interested in</p>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">$0 - $50</span>
                    <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">$50 - $100</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* User profile info */}
            <div className="flex gap-3 items-center mt-auto pt-6 border-t border-gray-200 bg-gray-50 p-4 -mx-8 -mb-7">
              <div className="w-11 h-11 rounded-full border cursor-pointer hover:opacity-80 transition-opacity overflow-hidden">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=sample"
                  alt="sample_photographer"
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 hover:text-primary transition-colors cursor-pointer">
                    sample_photographer
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600">No reviews</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                  <span>Since 2024</span>
                  <div className="flex items-center gap-1">
                    <Repeat className="h-3 w-3" />
                    <span>0 trades completed</span>
                  </div>
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
