import React from 'react';
import { ExternalLink } from 'lucide-react';
import { SponsoredProduct } from '@/types/sponsored';
import { trackSponsoredClick } from '@/hooks/useSponsoredProducts';

interface SponsoredProductCardProps {
  product: SponsoredProduct;
  searchQuery?: string;
}

const SponsoredProductCard: React.FC<SponsoredProductCardProps> = ({ product, searchQuery }) => {
  const handleClick = async () => {
    // Track the click
    await trackSponsoredClick(product.id, searchQuery);
    
    // Open external URL in new tab
    window.open(product.external_url, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      className="relative bg-card rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow cursor-pointer group border border-border/50"
      onClick={handleClick}
    >
      {/* Sponsored badge */}
      <div className="absolute top-2 left-2 z-10">
        <span className="text-[10px] font-medium px-2 py-0.5 bg-muted/80 backdrop-blur-sm text-muted-foreground rounded">
          Sponsored
        </span>
      </div>

      {/* External link indicator */}
      <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-7 h-7 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center">
          <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
        </div>
      </div>

      {/* Image */}
      <div className="aspect-square relative overflow-hidden">
        <img
          src={product.image_url || '/placeholder.svg'}
          alt={product.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-semibold text-sm truncate">{product.name}</h3>
        {product.description && (
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {product.description}
          </p>
        )}
        {product.category && (
          <span className="text-xs px-2 py-0.5 bg-muted rounded-full mt-2 inline-block">
            {product.category}
          </span>
        )}
      </div>
    </div>
  );
};

export default SponsoredProductCard;
