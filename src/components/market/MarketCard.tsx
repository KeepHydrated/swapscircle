
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ArrowDownRight, ArrowUpRight } from 'lucide-react';

interface MarketCardProps {
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

export const MarketCard = ({
  symbol,
  name,
  price,
  change,
  changePercent,
  isPositive,
}: MarketCardProps) => {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base font-bold">{symbol}</CardTitle>
          <span className="text-xs text-muted-foreground">{name}</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold">{price}</div>
            <div className={cn("flex items-center gap-1 text-sm", 
                isPositive ? "text-trademate-green" : "text-trademate-red")}>
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{change} ({changePercent})</span>
            </div>
          </div>
          <div className={cn("h-12 w-12 rounded-full flex items-center justify-center", 
              isPositive ? "bg-green-100" : "bg-red-100")}>
            {isPositive ? (
              <ArrowUpRight className="h-6 w-6 text-trademate-green" />
            ) : (
              <ArrowDownRight className="h-6 w-6 text-trademate-red" />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
