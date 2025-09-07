
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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-red-50 to-red-100">
      <div className="container mx-auto px-4 py-6 max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-red-200 relative">
            <CheckCircle className="h-12 w-12 text-red-600" />
            <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Verified Mechanic</h1>
          <p className="text-gray-600 text-lg">Authorized by Revonn</p>
        </div>

        {/* Main Card */}
        <Card className="border-red-200 shadow-2xl bg-white backdrop-blur-sm overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-red-600 via-red-600 to-red-700 text-white p-6">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-white rounded-xl overflow-hidden border-3 border-red-200 shadow-lg flex-shrink-0">
                {mechanic.photo_url ? (
                  <img
                    src={mechanic.photo_url}
                    alt={mechanic.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                    <User className="h-8 w-8 text-gray-400" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <CardTitle className="text-xl font-bold text-white truncate">{mechanic.name}</CardTitle>
                <p className="text-red-100 text-base font-mono mt-1 tracking-wider">ID: {mechanic.mechanic_id}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Status Badge */}
            <div className="flex justify-center">
              <Badge 
                variant="outline"
                className={mechanic.status === 'active' 
                  ? 'bg-green-50 text-green-700 border-green-300 px-6 py-3 text-base font-semibold' 
                  : 'bg-gray-50 text-gray-600 border-gray-300 px-6 py-3 text-base'
                }
              >
                {mechanic.status === 'active' ? '✓ Active & Verified' : 'Inactive'}
              </Badge>
            </div>

            {/* Garage Info */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-5 border-2 border-red-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
                  <Building className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-gray-900 text-lg">Garage Information</span>
              </div>
              <h3 className="font-bold text-xl text-gray-900 mb-2">{mechanic.garage.name}</h3>
              {mechanic.garage.location && (
                <div className="flex items-start gap-2 mt-3">
                  <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                  <p className="text-gray-700 text-base leading-relaxed">{mechanic.garage.location}</p>
                </div>
              )}
            </div>

            {/* Contact Information */}
            {(mechanic.phone || mechanic.email) && (
              <div className="space-y-4">
                <h3 className="font-bold text-gray-900 text-lg flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-blue-600 text-sm">📞</span>
                  </div>
                  Contact Information
                </h3>
                
                <div className="space-y-3">
                  {mechanic.phone && (
                    <a 
                      href={`tel:${mechanic.phone}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 active:scale-95 transform duration-150"
                    >
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                        <Phone className="h-5 w-5 text-green-600" />
                      </div>
                      <span className="text-gray-800 font-medium text-lg">{mechanic.phone}</span>
                    </a>
                  )}
                  
                  {mechanic.email && (
                    <a 
                      href={`mailto:${mechanic.email}`}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors border border-gray-200 active:scale-95 transform duration-150"
                    >
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Mail className="h-5 w-5 text-blue-600" />
                      </div>
                      <span className="text-gray-800 font-medium text-base break-all">{mechanic.email}</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Revonn Branding */}
            <div className="text-center pt-6 border-t-2 border-gray-100">
              <p className="text-sm text-gray-500 mb-2">Verified by</p>
              <div className="bg-gradient-to-r from-red-600 to-red-700 bg-clip-text text-transparent">
                <p className="text-3xl font-black tracking-wider">REVONN</p>
              </div>
              <p className="text-sm text-gray-400 mt-3 bg-gray-50 px-4 py-2 rounded-full inline-block">
                Verified on {new Date(mechanic.created_at).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long', 
                  day: 'numeric'
                })}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-8 space-y-2">
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-red-100">
            <p className="text-gray-700 font-medium">✓ This mechanic has been verified by Revonn</p>
            <p className="text-gray-600 text-sm mt-1">for quality and professional service.</p>
          </div>
        </div>
        
        {/* Safe area padding for mobile */}
        <div className="h-8"></div>
      </div>
    </div>
  );
};

export default MechanicVerification;
