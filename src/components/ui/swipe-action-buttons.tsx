import { Heart, X, Star, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SwipeActionButtonsProps {
  onDislike: () => void;
  onSuperLike: () => void;
  onLike: () => void;
  onRewind?: () => void;
  disabled?: boolean;
}

export const SwipeActionButtons = ({ 
  onDislike, 
  onSuperLike, 
  onLike, 
  onRewind,
  disabled = false 
}: SwipeActionButtonsProps) => {
  return (
    <div className="flex items-center justify-center gap-4 px-8 py-6">
      {onRewind && (
        <Button
          variant="outline"
          size="icon"
          className="h-14 w-14 rounded-full border-2 border-muted hover:border-primary/50 hover:bg-primary/5 transition-all duration-200"
          onClick={onRewind}
          disabled={disabled}
        >
          <RotateCcw className="h-6 w-6 text-muted-foreground" />
        </Button>
      )}

      <Button
        variant="outline"
        size="icon"
        className="h-16 w-16 rounded-full border-2 border-dislike/30 hover:border-dislike hover:bg-gradient-dislike hover:shadow-dislike hover:scale-110 transition-all duration-200 group"
        onClick={onDislike}
        disabled={disabled}
      >
        <X className="h-7 w-7 text-dislike group-hover:text-white transition-colors" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-14 w-14 rounded-full border-2 border-superlike/30 hover:border-superlike hover:bg-superlike hover:shadow-lg hover:scale-110 transition-all duration-200 group"
        onClick={onSuperLike}
        disabled={disabled}
      >
        <Star className="h-6 w-6 text-superlike group-hover:text-white transition-colors" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className="h-16 w-16 rounded-full border-2 border-like/30 hover:border-like hover:bg-gradient-like hover:shadow-like hover:scale-110 transition-all duration-200 group"
        onClick={onLike}
        disabled={disabled}
      >
        <Heart className="h-7 w-7 text-like group-hover:text-white transition-colors" />
      </Button>
    </div>
  );
};