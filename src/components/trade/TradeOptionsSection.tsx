import { Card } from "@/components/ui/card";
import { Users, MapPin, Globe } from "lucide-react";
import { useNavigate } from "react-router-dom";

const TradeOptionsSection = () => {
  const navigate = useNavigate();

  const tradeOptions = [
    {
      id: "friends",
      title: "Trade with Friends",
      description: "Connect with people you know",
      icon: Users,
      onClick: () => navigate("/"),
    },
    {
      id: "local",
      title: "People in Your Area",
      description: "Find traders nearby",
      icon: MapPin,
      onClick: () => navigate("/"),
    },
    {
      id: "nationwide",
      title: "Across the US",
      description: "Explore nationwide trades",
      icon: Globe,
      onClick: () => navigate("/"),
    },
  ];

  return (
    <Card className="w-full p-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-foreground">Where to Trade</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {tradeOptions.map((option) => {
            const Icon = option.icon;
            return (
              <button
                key={option.id}
                className="flex items-center gap-4 p-4 rounded-lg hover:bg-accent transition-colors text-left group"
                onClick={option.onClick}
              >
                <div className="p-3 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors flex-shrink-0">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default TradeOptionsSection;
