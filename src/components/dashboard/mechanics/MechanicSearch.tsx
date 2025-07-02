
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface MechanicSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  totalMechanics: number;
  filteredCount: number;
}

const MechanicSearch = ({ searchTerm, onSearchChange, totalMechanics, filteredCount }: MechanicSearchProps) => {
  return (
    <div className="flex items-center gap-4">
      <div className="relative flex-1 max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search mechanics..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      <span className="text-sm text-gray-500">
        {filteredCount} of {totalMechanics} mechanics
      </span>
    </div>
  );
};

export default MechanicSearch;
