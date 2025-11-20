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
    <div className="w-full space-y-6">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-foreground">Where to Trade</h2>
        <p className="text-muted-foreground">
          Choose how you'd like to connect with other traders
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {tradeOptions.map((option) => {
          const Icon = option.icon;
          return (
            <Card
              key={option.id}
              className="p-6 cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 group"
              onClick={option.onClick}
            >
              <div className="flex flex-col items-center text-center space-y-4">
                <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-8 h-8 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-foreground">
                    {option.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default TradeOptionsSection;
