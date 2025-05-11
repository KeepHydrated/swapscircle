
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock, Newspaper } from 'lucide-react';

interface NewsItem {
  id: string;
  title: string;
  source: string;
  time: string;
}

interface MarketNewsProps {
  news: NewsItem[];
}

export const MarketNews: React.FC<MarketNewsProps> = ({ news }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <Newspaper className="h-5 w-5" />
          Market News
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {news.map((item) => (
            <div key={item.id} className="border-b pb-3 last:border-b-0 last:pb-0">
              <h3 className="font-medium text-sm hover:text-primary cursor-pointer">
                {item.title}
              </h3>
              <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                <span>{item.source}</span>
                <span className="w-1 h-1 rounded-full bg-muted-foreground"></span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
