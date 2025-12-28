import { Bell, CreditCard, ShoppingCart, Key, FileText, AlertCircle, Droplet } from "lucide-react";
import { useOrders } from "@/hooks/useData";
import type { Order } from "@/data/mockData";

const iconMap = {
  "bell": Bell,
  "credit-card": CreditCard,
  "cart": ShoppingCart,
  "key": Key,
  "file-text": FileText,
  "alert-circle": AlertCircle,
  "droplet": Droplet,
};

const colorMap = {
  "primary": "bg-primary",
  "destructive": "bg-destructive",
  "teal": "bg-teal",
  "coral": "bg-coral",
  "purple": "bg-purple",
};

const OrdersOverview = () => {
  const { data: orders, isLoading } = useOrders();

  if (isLoading) {
    return (
      <div className="glass-card-hover p-6 animate-pulse">
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );
  }

  return (
    <div className="glass-card-hover p-6 animate-fade-in" style={{ animationDelay: "0.8s" }}>
      <div className="mb-6">
        <h3 className="text-foreground font-semibold">Orders overview</h3>
        <p className="text-teal text-xs">+30% this month</p>
      </div>

      <div className="space-y-4">
        {orders?.map((order: Order, index: number) => {
          const Icon = iconMap[order.icon] || Bell;
          const colorClass = colorMap[order.color] || "bg-primary";
          return (
            <div key={index} className="flex items-start gap-4">
              <div className={`w-8 h-8 rounded-lg ${colorClass} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-primary-foreground" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-foreground text-sm font-medium truncate">{order.title}</p>
                <p className="text-muted-foreground text-xs">{order.date}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrdersOverview;