
import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, MapPin, Phone, Mail, Building, User } from "lucide-react";

interface MechanicDetails {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  mechanic_id: string;
  photo_url: string | null;
  status: string;
  created_at: string;
  garage: {
    name: string;
    location: string | null;
  };
}

const MechanicVerification = () => {
  const { mechanicId } = useParams();
  const [searchParams] = useSearchParams();
  const [mechanic, setMechanic] = useState<MechanicDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMechanicDetails();
  }, [mechanicId]);

  const fetchMechanicDetails = async () => {
    try {
      setLoading(true);
      
      // Get mechanic ID from URL params or search params
      const id = mechanicId || searchParams.get('mechanic_id');
      
      console.log('Searching for mechanic ID:', id);
      console.log('URL params:', { mechanicId });
      console.log('Search params:', Object.fromEntries(searchParams.entries()));
      
      if (!id) {
        setError('Mechanic ID not provided');
        return;
      }

      // First, let's try to find the mechanic by mechanic_id
      const { data, error } = await supabase
        .from('mechanics')
        .select(`
          *,
          garage:garages(name, location)
        `)
        .eq('mechanic_id', id)
        .single();

      console.log('Database query result:', { data, error });

      if (error) {
        console.error('Database error:', error);
        
        // If not found by mechanic_id, try by id
        const { data: dataById, error: errorById } = await supabase
          .from('mechanics')
          .select(`
            *,
            garage:garages(name, location)
          `)
          .eq('id', id)
          .single();

        console.log('Second query by ID result:', { dataById, errorById });

        if (errorById) {
          setError('Mechanic not found or invalid QR code');
          return;
        }
        
        setMechanic(dataById);
      } else {
        setMechanic(data);
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to verify mechanic');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verifying mechanic...</p>
        </div>
      </div>
    );
  }

  if (error || !mechanic) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-red-200 shadow-lg">
          <CardContent className="text-center p-8">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">❌</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Verification Failed</h2>
            <p className="text-gray-600">{error || 'Invalid QR code or mechanic not found'}</p>
            <p className="text-sm text-gray-500 mt-2">Please ensure you're scanning a valid Revonn mechanic QR code</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 p-4">
      <div className="max-w-md mx-auto pt-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-red-200">
            <CheckCircle className="h-10 w-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verified Mechanic</h1>
          <p className="text-gray-600">Authorized by Revonn</p>
        </div>

        {/* Main Card */}
        <Card className="border-red-200 shadow-xl bg-white/95 backdrop-blur">
          <CardHeader className="bg-gradient-to-r from-red-600 to-red-700 text-white rounded-t-lg">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-lg overflow-hidden border-2 border-red-200">
                {mechanic.photo_url ? (
                  <img
                    src={mechanic.photo_url}
                    alt={mechanic.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg font-bold">{mechanic.name}</CardTitle>
                <p className="text-red-100 text-sm font-mono">ID: {mechanic.mechanic_id}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge 
                className={mechanic.status === 'active' 
                  ? 'bg-green-100 text-green-800 border-green-300 px-4 py-2' 
                  : 'bg-gray-100 text-gray-600 border-gray-300 px-4 py-2'
                }
              >
                {mechanic.status === 'active' ? '✓ Active & Verified' : 'Inactive'}
              </Badge>
            </div>

            {/* Garage Info */}
            <div className="bg-red-50 rounded-lg p-4 border border-red-200">
              <div className="flex items-center gap-2 mb-2">
                <Building className="h-5 w-5 text-red-600" />
                <span className="font-semibold text-gray-900">Garage</span>
              </div>
              <p className="font-bold text-lg text-gray-900">{mechanic.garage.name}</p>
              {mechanic.garage.location && (
                <div className="flex items-center gap-1 mt-2">
                  <MapPin className="h-4 w-4 text-red-500" />
                  <p className="text-gray-600 text-sm">{mechanic.garage.location}</p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                <span>Contact Information</span>
              </h3>
              
              {mechanic.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-4 w-4 text-red-500" />
                  <span className="text-gray-700">{mechanic.phone}</span>
                </div>
              )}
              
              {mechanic.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Mail className="h-4 w-4 text-red-500" />
                  <span className="text-gray-700">{mechanic.email}</span>
                </div>
              )}
            </div>

            {/* Revonn Branding */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500">Verified by</p>
              <p className="text-xl font-bold text-red-600 tracking-wide">REVONN</p>
              <p className="text-xs text-gray-400 mt-1">
                Verified on {new Date(mechanic.created_at).toLocaleDateString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-600">
          <p>This mechanic has been verified by Revonn</p>
          <p className="mt-1">for quality and professional service.</p>
        </div>
      </div>
    </div>
  );
};

export default MechanicVerification;
