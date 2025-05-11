
import React from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { SimpleChart } from '@/components/market/SimpleChart';
import { MarketCard } from '@/components/market/MarketCard';
import { WatchlistTable } from '@/components/market/WatchlistTable';
import { MarketNews } from '@/components/market/MarketNews';

// Sample data for demonstration
const sampleChartData = [
  { date: "Jan", value: 4000 },
  { date: "Feb", value: 3000 },
  { date: "Mar", value: 5000 },
  { date: "Apr", value: 2780 },
  { date: "May", value: 1890 },
  { date: "Jun", value: 2390 },
  { date: "Jul", value: 3490 },
  { date: "Aug", value: 4000 },
  { date: "Sep", value: 4500 },
  { date: "Oct", value: 5200 },
  { date: "Nov", value: 4800 },
  { date: "Dec", value: 6000 },
];

const marketCards = [
  {
    symbol: "AAPL",
    name: "Apple Inc",
    price: "$173.85",
    change: "+2.45",
    changePercent: "1.43%",
    isPositive: true,
  },
  {
    symbol: "MSFT",
    name: "Microsoft Corp",
    price: "$403.78",
    change: "+5.23",
    changePercent: "1.31%",
    isPositive: true,
  },
  {
    symbol: "TSLA",
    name: "Tesla Inc",
    price: "$177.59",
    change: "-3.42",
    changePercent: "1.89%",
    isPositive: false,
  },
  {
    symbol: "AMZN",
    name: "Amazon.com Inc",
    price: "$178.22",
    change: "+1.89",
    changePercent: "1.07%",
    isPositive: true,
  },
];

const watchlistItems = [
  {
    id: "1",
    symbol: "AAPL",
    name: "Apple Inc",
    price: "$173.85",
    change: "+2.45",
    changePercent: "1.43%",
    isPositive: true,
  },
  {
    id: "2",
    symbol: "MSFT",
    name: "Microsoft Corp",
    price: "$403.78",
    change: "+5.23",
    changePercent: "1.31%",
    isPositive: true,
  },
  {
    id: "3",
    symbol: "TSLA",
    name: "Tesla Inc",
    price: "$177.59",
    change: "-3.42",
    changePercent: "1.89%",
    isPositive: false,
  },
  {
    id: "4",
    symbol: "AMZN",
    name: "Amazon.com Inc",
    price: "$178.22",
    change: "+1.89",
    changePercent: "1.07%",
    isPositive: true,
  },
  {
    id: "5",
    symbol: "GOOGL",
    name: "Alphabet Inc",
    price: "$148.95",
    change: "+0.87",
    changePercent: "0.59%",
    isPositive: true,
  },
];

const newsItems = [
  {
    id: "1",
    title: "Federal Reserve Signals Potential Rate Cut in September Meeting",
    source: "Financial Times",
    time: "2 hours ago",
  },
  {
    id: "2",
    title: "Apple Reports Strong Q3 Earnings, Beats Market Expectations",
    source: "Wall Street Journal",
    time: "4 hours ago",
  },
  {
    id: "3",
    title: "Oil Prices Drop as Demand Concerns Outweigh Supply Disruptions",
    source: "Reuters",
    time: "6 hours ago",
  },
  {
    id: "4",
    title: "Tesla to Open New Gigafactory in Asia, Shares Rise 3%",
    source: "Bloomberg",
    time: "8 hours ago",
  },
];

const Dashboard: React.FC = () => {
  return (
    <MainLayout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Market Dashboard</h1>
        <p className="text-muted-foreground mt-1">Track your investments and market trends</p>
      </div>

      <div className="mb-6">
        <SimpleChart 
          title="S&P 500 Index" 
          data={sampleChartData} 
          color="#4361EE" 
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {marketCards.map((card, index) => (
          <MarketCard key={index} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <WatchlistTable items={watchlistItems} />
        </div>
        <div>
          <MarketNews news={newsItems} />
        </div>
      </div>
    </MainLayout>
  );
};

export default Dashboard;
