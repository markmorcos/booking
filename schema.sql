-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create availability_slots table
CREATE TABLE IF NOT EXISTS availability_slots (
    id SERIAL PRIMARY KEY,
    date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    duration INTEGER NOT NULL,
    is_booked BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create appointment_requests table
CREATE TABLE IF NOT EXISTS appointment_requests (
    id SERIAL PRIMARY KEY,
    slot_id INTEGER NOT NULL REFERENCES availability_slots(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('pending', 'confirmed', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index for common queries
CREATE INDEX idx_slots_date_time ON availability_slots(date, start_time);
CREATE INDEX idx_slots_is_booked ON availability_slots(is_booked);
CREATE INDEX idx_appointment_status ON appointment_requests(status);

-- Setup trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = CURRENT_TIMESTAMP;
   RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_availability_slots_timestamp
BEFORE UPDATE ON availability_slots
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

CREATE TRIGGER update_appointment_requests_timestamp
BEFORE UPDATE ON appointment_requests
FOR EACH ROW EXECUTE PROCEDURE update_timestamp();

-- Setup Row Level Security
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

-- Create policies for availability_slots
CREATE POLICY "Availability slots are viewable by everyone" 
ON availability_slots FOR SELECT 
USING (true);

CREATE POLICY "Only authenticated users can insert availability slots" 
ON availability_slots FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update availability slots" 
ON availability_slots FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Only authenticated users can delete availability slots" 
ON availability_slots FOR DELETE 
TO authenticated 
USING (true);

-- Create policies for appointment_requests
CREATE POLICY "Appointment requests are viewable by admins only" 
ON appointment_requests FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Everyone can insert appointment requests" 
ON appointment_requests FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Only authenticated users can update appointment requests" 
ON appointment_requests FOR UPDATE 
TO authenticated 
USING (true);

CREATE POLICY "Only authenticated users can delete appointment requests" 
ON appointment_requests FOR DELETE 
TO authenticated 
USING (true); 