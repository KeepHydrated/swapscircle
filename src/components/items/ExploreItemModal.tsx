
import React from "react";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";
import { X, ArrowLeft, ArrowRight, Heart } from "lucide-react";
import { Item } from "@/types/item";

interface ExploreItemModalProps {
  open: boolean;
  item: Item | null;
  onClose: () => void;
  images?: string[];
  liked?: boolean;
  onLike?: () => void;
}

const profile = {
  name: "Emma Wilson",
  avatar: "https://randomuser.me/api/portraits/women/44.jpg",
  stars: 4.8,
  reviews: 42,
  since: 2023,
  distance: "2.3 mi away",
  response: "~1 hr response",
};

const ExploreItemModal: React.FC<ExploreItemModalProps> = ({
  open,
  item,
  onClose,
  images = [],
  liked,
  onLike,
}) => {
  if (!item) return null;

  // Image carousel
  const allImages =
    images.length > 0
      ? images
      : [
          item.image,
          "https://images.unsplash.com/photo-1721322800607-8c38375eef04",
          "https://images.unsplash.com/photo-1618160702438-9b02ab6515c9",
        ];
  const [slide, setSlide] = React.useState(0);

  React.useEffect(() => {
    setSlide(0);
  }, [item]);

  return (
    <Dialog open={open} onOpenChange={v => !v && onClose()}>
      <DialogOverlay className="bg-black/80" />
      <DialogContent
        className="max-w-4xl w-[97vw] p-0 border-0 rounded-xl bg-transparent shadow-none"
      >
        <div className="flex w-full max-h-[92vh] h-[540px] md:h-[520px] bg-white rounded-2xl overflow-hidden relative animate-fade-in">
          {/* Close button - top right, smaller size */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-20"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600" />
          </button>

          {/* Carousel */}
          <div className="relative w-1/2 h-full flex-shrink-0 bg-black/10">
            <img
              src={allImages[slide]}
              alt={item.name}
              className="object-cover w-full h-full"
              style={{ minHeight: 320 }}
            />
            {/* Carousel Nav */}
            <button
              onClick={() =>
                setSlide(s => (s > 0 ? s - 1 : allImages.length - 1))
              }
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full shadow p-2 hover:scale-105 transition z-10"
              aria-label="Previous"
            >
              <ArrowLeft />
            </button>
            <button
              onClick={() =>
                setSlide(s => (s < allImages.length - 1 ? s + 1 : 0))
              }
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white bg-opacity-90 rounded-full shadow p-2 hover:scale-105 transition z-10"
              aria-label="Next"
            >
              <ArrowRight />
            </button>
            <div className="absolute bottom-4 left-0 w-full flex justify-center gap-2 z-10">
              {allImages.map((_, i) => (
                <button
                  key={i}
                  className={`w-2.5 h-2.5 rounded-full ${
                    slide === i
                      ? "bg-white border-primary border-2"
                      : "bg-white/60"
                  }`}
                  style={{ borderWidth: slide === i ? 2 : 0 }}
                  onClick={() => setSlide(i)}
                />
              ))}
            </div>
            {/* Like button positioned on the right side of the image */}
            <button
              className="absolute top-4 right-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center hover:bg-gray-50 transition-colors z-10"
              onClick={onLike}
              aria-label={liked ? "Unlike" : "Like"}
            >
              <Heart
                className={`w-6 h-6 ${liked ? "text-red-500" : "text-gray-400"}`}
                fill={liked ? "red" : "none"}
              />
            </button>
          </div>
          {/* Details */}
          <div className="flex-1 flex flex-col px-8 py-7 justify-start overflow-y-auto">
            <div className="flex items-center justify-between mb-2 gap-3">
              <h2 className="text-2xl font-bold text-gray-900 truncate">
                {item.name}
              </h2>
            </div>
            <div className="bg-gray-50 p-3 mb-4 text-gray-700 rounded-lg text-base min-h-[66px]">
              {item.description ||
                "No description. This item has been gently used and well maintained."}
            </div>
            <div className="mb-3 flex flex-wrap gap-3 items-center text-sm">
              <div className="flex items-center gap-2 px-3 py-1 bg-green-50 rounded-full">
                <span className="w-2 h-2 bg-green-400 inline-block rounded-full" />
                <span className="text-green-700">Brand New</span>
              </div>
              {item.category && (
                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 rounded-full text-blue-700">
                  <span className="">🏷️</span>
                  {item.category}
                </div>
              )}
              {item.tags && item.tags.length > 0 && (
                <div className="flex items-center gap-2 px-3 py-1 bg-violet-50 rounded-full text-violet-700">
                  <span className="">🍽️</span>
                  {item.tags[0]}
                </div>
              )}
            </div>
            {/* [FAKE] profile info for demo */}
            <div className="flex gap-3 items-center mt-auto pt-6">
              <img
                src={profile.avatar}
                alt={profile.name}
                className="w-11 h-11 rounded-full border object-cover"
              />
              <div>
                <span className="font-semibold text-gray-900">
                  {profile.name}
                </span>
                <span className="ml-2 text-yellow-500 text-xs font-semibold">
                  ★ {profile.stars}{" "}
                  <span className="text-gray-400 font-normal ml-1">
                    ({profile.reviews})
                  </span>
                </span>
                <div className="flex text-xs text-gray-500 mt-1 gap-4">
                  <span>Since {profile.since}</span>
                  <span>· {profile.distance}</span>
                  <span>· {profile.response}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
export default ExploreItemModal;
