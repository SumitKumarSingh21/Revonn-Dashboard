
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { User, Phone, Mail } from "lucide-react";
import MechanicActions from "./MechanicActions";

interface Mechanic {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  mechanic_id: string;
  status: string;
  created_at: string;
}

interface MechanicsTableProps {
  mechanics: Mechanic[];
  onMechanicChange: () => void;
}

const MechanicsTable = ({ mechanics, onMechanicChange }: MechanicsTableProps) => {
  if (mechanics.length === 0) {
    return (
      <div className="text-center py-12 px-4">
        <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No mechanics found
        </h3>
        <p className="text-gray-500 max-w-sm mx-auto">
          Add your first mechanic to get started. They will be available for booking assignments.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="min-w-[180px]">Mechanic</TableHead>
            <TableHead className="min-w-[100px]">ID</TableHead>
            <TableHead className="min-w-[180px] hidden md:table-cell">Contact</TableHead>
            <TableHead className="min-w-[100px]">Status</TableHead>
            <TableHead className="min-w-[120px] hidden lg:table-cell">Added</TableHead>
            <TableHead className="text-right min-w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mechanics.map((mechanic) => (
            <TableRow key={mechanic.id} className="hover:bg-gray-50/80">
              <TableCell>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <span className="font-medium block truncate">{mechanic.name}</span>
                    {/* Show contact info on mobile */}
                    <div className="md:hidden text-sm text-gray-500 space-y-1 mt-1">
                      {mechanic.phone && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span className="truncate">{mechanic.phone}</span>
                        </div>
                      )}
                      {mechanic.email && (
                        <div className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          <span className="truncate">{mechanic.email}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="text-xs font-mono">
                  {mechanic.mechanic_id}
                </Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="space-y-1">
                  {mechanic.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-3 w-3 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{mechanic.phone}</span>
                    </div>
                  )}
                  {mechanic.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="h-3 w-3 flex-shrink-0 text-gray-400" />
                      <span className="truncate">{mechanic.email}</span>
                    </div>
                  )}
                  {!mechanic.phone && !mechanic.email && (
                    <span className="text-sm text-gray-400">No contact info</span>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Badge 
                  variant={mechanic.status === 'active' ? 'default' : 'secondary'}
                  className={`text-xs ${mechanic.status === 'active' 
                    ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                    : 'bg-red-100 text-red-800 hover:bg-red-200'
                  }`}
                >
                  {mechanic.status}
                </Badge>
              </TableCell>
              <TableCell className="hidden lg:table-cell">
                <span className="text-sm text-gray-500">
                  {new Date(mechanic.created_at).toLocaleDateString()}
                </span>
              </TableCell>
              <TableCell>
                <MechanicActions
                  mechanicId={mechanic.id}
                  mechanicName={mechanic.name}
                  currentStatus={mechanic.status}
                  onStatusChange={onMechanicChange}
                  onDelete={onMechanicChange}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default MechanicsTable;
