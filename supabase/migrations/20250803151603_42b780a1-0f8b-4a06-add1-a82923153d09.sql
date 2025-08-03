
-- Create a table for predefined services that garages can choose from
CREATE TABLE public.predefined_services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL, -- duration in minutes
  vehicle_type TEXT NOT NULL CHECK (vehicle_type IN ('car', 'bike', 'both')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for predefined services (read-only for everyone)
ALTER TABLE public.predefined_services ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view predefined services
CREATE POLICY "Anyone can view predefined services" 
  ON public.predefined_services 
  FOR SELECT 
  USING (true);

-- Add a reference to predefined services in the existing services table
ALTER TABLE public.services 
ADD COLUMN predefined_service_id UUID REFERENCES public.predefined_services(id);

-- Insert comprehensive list of Indian garage services
INSERT INTO public.predefined_services (name, category, description, duration, vehicle_type) VALUES

-- Car Services - General Maintenance
('Engine Oil Change', 'General', 'Complete engine oil drain and refill with new oil and oil filter replacement', 45, 'car'),
('Oil Filter Change', 'General', 'Replace old oil filter with new one for clean oil circulation', 20, 'car'),
('Air Filter Cleaning', 'General', 'Clean or replace air filter for better engine breathing', 15, 'car'),
('Fuel Filter Change', 'General', 'Replace fuel filter to ensure clean fuel supply to engine', 30, 'car'),
('Spark Plug Change', 'General', 'Replace worn spark plugs for better ignition and mileage', 30, 'car'),
('Coolant Top-up', 'General', 'Check and refill engine coolant for proper temperature control', 15, 'car'),
('Brake Fluid Check', 'General', 'Check brake fluid level and top-up if needed', 10, 'car'),
('Power Steering Fluid', 'General', 'Check and refill power steering fluid for smooth steering', 10, 'car'),

-- Car Services - AC & Cooling
('AC Service', 'AC & Cooling', 'Complete AC system check, gas refill and filter cleaning', 60, 'car'),
('AC Gas Refill', 'AC & Cooling', 'Refill AC refrigerant gas for proper cooling', 30, 'car'),
('AC Filter Cleaning', 'AC & Cooling', 'Clean AC cabin filter for fresh air circulation', 15, 'car'),
('Radiator Service', 'AC & Cooling', 'Clean radiator and check cooling system for overheating issues', 45, 'car'),
('Thermostat Check', 'AC & Cooling', 'Check and replace faulty thermostat for proper engine temperature', 30, 'car'),

-- Car Services - Electrical
('Battery Check', 'Electrical', 'Test battery health and terminal cleaning for reliable starting', 20, 'car'),
('Alternator Check', 'Electrical', 'Check alternator charging system and belt condition', 30, 'car'),
('Headlight Bulb Change', 'Electrical', 'Replace faulty headlight bulbs for better night visibility', 15, 'car'),
('Tail Light Repair', 'Electrical', 'Fix or replace tail light bulbs and check connections', 15, 'car'),
('Horn Check', 'Electrical', 'Test and repair car horn for safety', 10, 'car'),
('Wiper Motor Service', 'Electrical', 'Check wiper motor and replace wiper blades if needed', 20, 'car'),

-- Car Services - Tyres & Wheels
('Tyre Puncture Repair', 'Tyre', 'Fix punctured tyre with patch or plug method', 20, 'car'),
('Wheel Balancing', 'Tyre', 'Balance all four wheels to reduce vibration while driving', 30, 'car'),
('Wheel Alignment', 'Tyre', 'Adjust wheel alignment for straight driving and even tyre wear', 45, 'car'),
('Tyre Rotation', 'Tyre', 'Rotate tyres to ensure even wear and longer tyre life', 20, 'car'),
('Tubeless Tyre Repair', 'Tyre', 'Professional tubeless tyre puncture repair with sealant', 25, 'car'),

-- Car Services - Brakes & Suspension
('Brake Pad Change', 'Brakes', 'Replace worn brake pads for safe and effective braking', 60, 'car'),
('Brake Shoe Service', 'Brakes', 'Clean and adjust brake shoes for proper rear braking', 45, 'car'),
('Brake Disc Machining', 'Brakes', 'Machine brake discs to remove wear and ensure smooth braking', 90, 'car'),
('Shock Absorber Check', 'Suspension', 'Check and replace faulty shock absorbers for comfortable ride', 60, 'car'),
('Suspension Service', 'Suspension', 'Complete suspension check and repair for smooth driving', 120, 'car'),

-- Car Services - Transmission & Clutch
('Clutch Repair', 'Transmission', 'Fix clutch problems including plate and cable adjustment', 180, 'car'),
('Gear Box Service', 'Transmission', 'Service manual gearbox with oil change and adjustment', 120, 'car'),
('Automatic Transmission Service', 'Transmission', 'Service automatic gearbox with fluid change and filter', 90, 'car'),

-- Car Services - Body & Exterior
('Car Wash', 'Wash', 'Complete exterior car wash with soap and water', 30, 'car'),
('Interior Cleaning', 'Wash', 'Deep clean car interior including seats and dashboard', 45, 'car'),
('Wax Polish', 'Wash', 'Apply protective wax coating for shiny car exterior', 60, 'car'),
('Underbody Wash', 'Wash', 'Clean car underbody to remove dirt and prevent rust', 20, 'car'),

-- Car Services - Diagnostics & Custom
('Engine Diagnostic', 'Diagnostic', 'Computer scan to identify engine problems and error codes', 30, 'car'),
('Full Car Checkup', 'Diagnostic', 'Complete 21-point car inspection for all major systems', 60, 'car'),
('Pre-delivery Service', 'Custom', 'Complete service before car delivery including all fluids', 120, 'car'),

-- Bike Services - General Maintenance
('Engine Oil Change', 'General', 'Change bike engine oil with new oil for smooth engine operation', 20, 'bike'),
('Oil Filter Change', 'General', 'Replace bike oil filter for clean oil circulation', 15, 'bike'),
('Air Filter Cleaning', 'General', 'Clean or replace air filter for better engine performance', 10, 'bike'),
('Spark Plug Change', 'General', 'Replace spark plug for better starting and mileage', 15, 'bike'),
('Chain Cleaning', 'General', 'Clean and lubricate bike chain for smooth power transfer', 20, 'bike'),
('Chain Sprocket Change', 'General', 'Replace worn chain and sprocket set for proper drive', 45, 'bike'),
('Coolant Service', 'General', 'Check and refill bike coolant for liquid-cooled engines', 15, 'bike'),

-- Bike Services - Brakes & Safety
('Front Brake Pad Change', 'Brakes', 'Replace front brake pads for effective stopping power', 30, 'bike'),
('Rear Brake Shoe Service', 'Brakes', 'Clean and adjust rear drum brake shoes', 25, 'bike'),
('Brake Cable Adjustment', 'Brakes', 'Adjust brake cables for proper brake lever feel', 15, 'bike'),
('Brake Fluid Change', 'Brakes', 'Replace brake fluid in hydraulic brake systems', 20, 'bike'),

-- Bike Services - Tyres & Wheels
('Tyre Puncture Repair', 'Tyre', 'Fix punctured bike tyre with patch or plug', 15, 'bike'),
('Tube Change', 'Tyre', 'Replace damaged inner tube with new one', 20, 'bike'),
('Wheel Alignment', 'Tyre', 'Align front and rear wheels for straight riding', 30, 'bike'),
('Tyre Change', 'Tyre', 'Replace old tyre with new one including balancing', 30, 'bike'),

-- Bike Services - Electrical
('Battery Check', 'Electrical', 'Test bike battery and clean terminals for reliable starting', 15, 'bike'),
('Headlight Bulb Change', 'Electrical', 'Replace headlight bulb for better night visibility', 10, 'bike'),
('Indicator Repair', 'Electrical', 'Fix faulty turn indicators and check wiring', 15, 'bike'),
('Horn Service', 'Electrical', 'Check and repair bike horn for safety', 10, 'bike'),
('Self Start Motor', 'Electrical', 'Repair or replace electric start motor', 45, 'bike'),

-- Bike Services - Suspension & Steering
('Front Shock Service', 'Suspension', 'Service front suspension forks with oil change', 60, 'bike'),
('Rear Shock Service', 'Suspension', 'Check and service rear mono-shock or twin shocks', 45, 'bike'),
('Steering Bearing Service', 'Suspension', 'Service steering head bearings for smooth turning', 30, 'bike'),

-- Bike Services - Carburetor & Fuel
('Carburetor Cleaning', 'Fuel System', 'Clean carburetor jets and passages for proper fuel mixing', 45, 'bike'),
('Fuel Tank Cleaning', 'Fuel System', 'Clean fuel tank and remove water or dirt contamination', 60, 'bike'),
('Petcock Service', 'Fuel System', 'Service fuel petcock valve for proper fuel flow', 20, 'bike'),

-- Bike Services - Wash & Care
('Bike Wash', 'Wash', 'Complete bike wash with soap and detailing', 20, 'bike'),
('Engine Degreasing', 'Wash', 'Remove oil and grease from bike engine for clean look', 30, 'bike'),
('Chrome Polish', 'Wash', 'Polish chrome parts for shiny appearance', 25, 'bike'),

-- Bike Services - Diagnostics & Custom
('Engine Diagnostic', 'Diagnostic', 'Check engine performance and identify problems', 20, 'bike'),
('Full Bike Service', 'Diagnostic', 'Complete bike checkup including all major components', 90, 'bike'),
('Performance Tuning', 'Custom', 'Tune bike for better performance and mileage', 60, 'bike'),

-- Services for Both Vehicles
('Denting', 'Body Work', 'Remove dents from vehicle body using professional tools', 120, 'both'),
('Painting', 'Body Work', 'Touch-up or complete paint job for vehicle exterior', 240, 'both'),
('Insurance Claim Work', 'Custom', 'Complete vehicle repair work for insurance claims', 480, 'both'),
('Accidental Repair', 'Custom', 'Major repair work after vehicle accidents', 720, 'both'),
('Number Plate Fitting', 'Custom', 'Install new number plates as per RTO requirements', 15, 'both');
