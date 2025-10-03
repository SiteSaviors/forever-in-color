import { Badge } from "@/components/ui/badge";
import { Zap, Download } from "@/components/ui/icons";
interface StyleCardBadgesProps {
  isPopular: boolean;
  showGeneratedBadge: boolean;
  existingPurchase: any;
}
const StyleCardBadges = ({
  isPopular,
  showGeneratedBadge,
  existingPurchase
}: StyleCardBadgesProps) => {
  return <div className="flex flex-col gap-1 flex-shrink-0 items-end">
      {isPopular}
      {showGeneratedBadge && <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs px-2 py-0.5 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
          <Zap className="w-3 h-3 mr-1" />
          Ready
        </Badge>}
      {existingPurchase && <Badge className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-xs px-2 py-0.5 shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02]">
          <Download className="w-3 h-3 mr-1" />
          Purchased
        </Badge>}
    </div>;
};
export default StyleCardBadges;