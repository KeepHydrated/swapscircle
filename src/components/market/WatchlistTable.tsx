
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WatchlistItem {
  id: string;
  symbol: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  isPositive: boolean;
}

interface WatchlistTableProps {
  items: WatchlistItem[];
}

export const WatchlistTable: React.FC<WatchlistTableProps> = ({ items }) => {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>My Watchlist</CardTitle>
        <Star className="h-5 w-5 text-yellow-400" />
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Symbol</TableHead>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id} className="cursor-pointer hover:bg-muted/50">
                <TableCell className="font-medium">{item.symbol}</TableCell>
                <TableCell className="text-muted-foreground">{item.name}</TableCell>
                <TableCell className="text-right">{item.price}</TableCell>
                <TableCell 
                  className={cn("text-right", 
                    item.isPositive ? "text-trademate-green" : "text-trademate-red")}
                >
                  {item.change} ({item.changePercent})
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
