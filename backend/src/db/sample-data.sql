-- Insert sample customers with emails
INSERT INTO customers (name, email) VALUES 
    ('Speedy Logistics', 'contact@speedylogistics.com'), 
    ('Global Transit Solutions', 'info@globaltransit.com');

-- Get customer IDs
DO $$
DECLARE
    speedy_id INTEGER;
    global_id INTEGER;
BEGIN
    SELECT id INTO speedy_id FROM customers WHERE name = 'Speedy Logistics';
    SELECT id INTO global_id FROM customers WHERE name = 'Global Transit Solutions';

    -- Insert sample vehicles for Speedy Logistics
    INSERT INTO vehicles (license_plate, customer_id) VALUES 
        ('ABC123', speedy_id),
        ('ABC456', speedy_id),
        ('ABC789', speedy_id),
        ('ABC999', speedy_id),
        ('ABC555', speedy_id);

    -- Insert sample vehicles for Global Transit Solutions
    INSERT INTO vehicles (license_plate, customer_id) VALUES 
        ('XYZ123', global_id),
        ('XYZ456', global_id),
        ('XYZ789', global_id),
        ('XYZ999', global_id);

    -- Insert sample drivers for Speedy Logistics
    INSERT INTO drivers (first_name, last_name, customer_id, vehicle_id) 
    SELECT 'John', 'Doe', speedy_id, id FROM vehicles WHERE license_plate = 'ABC123';
    
    INSERT INTO drivers (first_name, last_name, customer_id, vehicle_id) 
    SELECT 'Jane', 'Smith', speedy_id, id FROM vehicles WHERE license_plate = 'ABC456';
    
    INSERT INTO drivers (first_name, last_name, customer_id, vehicle_id) 
    SELECT 'Mike', 'Johnson', speedy_id, id FROM vehicles WHERE license_plate = 'ABC789';
    
    INSERT INTO drivers (first_name, last_name, customer_id, vehicle_id) 
    SELECT 'David', 'Williams', speedy_id, id FROM vehicles WHERE license_plate = 'ABC999';
    
    INSERT INTO drivers (first_name, last_name, customer_id, vehicle_id) 
    SELECT 'Lisa', 'Brown', speedy_id, id FROM vehicles WHERE license_plate = 'ABC555';

    -- Insert sample drivers for Global Transit Solutions
    INSERT INTO drivers (first_name, last_name, customer_id, vehicle_id) 
    SELECT 'Robert', 'Wilson', global_id, id FROM vehicles WHERE license_plate = 'XYZ123';
    
    INSERT INTO drivers (first_name, last_name, customer_id, vehicle_id) 
    SELECT 'Sarah', 'Brown', global_id, id FROM vehicles WHERE license_plate = 'XYZ456';
    
    INSERT INTO drivers (first_name, last_name, customer_id, vehicle_id) 
    SELECT 'James', 'Taylor', global_id, id FROM vehicles WHERE license_plate = 'XYZ789';
    
    INSERT INTO drivers (first_name, last_name, customer_id, vehicle_id) 
    SELECT 'Emma', 'Davis', global_id, id FROM vehicles WHERE license_plate = 'XYZ999';

    -- Insert sample vehicle positions
    INSERT INTO vehicle_positions (vehicle_id, latitude, longitude, speed, ignition) 
    SELECT id, 37.7749, -122.4194, 65, true FROM vehicles WHERE license_plate = 'ABC123';
    
    INSERT INTO vehicle_positions (vehicle_id, latitude, longitude, speed, ignition) 
    SELECT id, 37.3382, -121.8863, 45, true FROM vehicles WHERE license_plate = 'ABC456';
    
    INSERT INTO vehicle_positions (vehicle_id, latitude, longitude, speed, ignition) 
    SELECT id, 37.4419, -122.1430, 0, false FROM vehicles WHERE license_plate = 'ABC789';
    
    INSERT INTO vehicle_positions (vehicle_id, latitude, longitude, speed, ignition) 
    SELECT id, 38.5816, -121.4944, 70, true FROM vehicles WHERE license_plate = 'ABC999';
    
    INSERT INTO vehicle_positions (vehicle_id, latitude, longitude, speed, ignition) 
    SELECT id, 37.8715, -122.2730, 55, true FROM vehicles WHERE license_plate = 'ABC555';
    
    INSERT INTO vehicle_positions (vehicle_id, latitude, longitude, speed, ignition) 
    SELECT id, 34.0522, -118.2437, 55, true FROM vehicles WHERE license_plate = 'XYZ123';
    
    INSERT INTO vehicle_positions (vehicle_id, latitude, longitude, speed, ignition) 
    SELECT id, 32.7157, -117.1611, 0, false FROM vehicles WHERE license_plate = 'XYZ456';
    
    INSERT INTO vehicle_positions (vehicle_id, latitude, longitude, speed, ignition) 
    SELECT id, 36.7783, -119.4179, 65, true FROM vehicles WHERE license_plate = 'XYZ789';
    
    INSERT INTO vehicle_positions (vehicle_id, latitude, longitude, speed, ignition) 
    SELECT id, 37.9577, -121.2908, 50, true FROM vehicles WHERE license_plate = 'XYZ999';

    -- Insert sample trips
    INSERT INTO trips (vehicle_id, driver_id, start_time, end_time, distance)
    SELECT v.id, d.id, NOW() - INTERVAL '2 HOURS', NOW() - INTERVAL '1 HOUR', 65.5
    FROM vehicles v JOIN drivers d ON v.id = d.vehicle_id 
    WHERE v.license_plate = 'ABC123' AND d.first_name = 'John' AND d.last_name = 'Doe';
    
    INSERT INTO trips (vehicle_id, driver_id, start_time, end_time, distance)
    SELECT v.id, d.id, NOW() - INTERVAL '3 HOURS', NOW() - INTERVAL '2 HOURS', 78.2
    FROM vehicles v JOIN drivers d ON v.id = d.vehicle_id 
    WHERE v.license_plate = 'ABC456' AND d.first_name = 'Jane' AND d.last_name = 'Smith';

    -- Add active trips (without end_time)
    INSERT INTO trips (vehicle_id, driver_id, start_time)
    SELECT v.id, d.id, NOW() - INTERVAL '30 MINUTES'
    FROM vehicles v JOIN drivers d ON v.id = d.vehicle_id 
    WHERE v.license_plate = 'XYZ123' AND d.first_name = 'Robert' AND d.last_name = 'Wilson';
    
    INSERT INTO trips (vehicle_id, driver_id, start_time)
    SELECT v.id, d.id, NOW() - INTERVAL '45 MINUTES'
    FROM vehicles v JOIN drivers d ON v.id = d.vehicle_id 
    WHERE v.license_plate = 'XYZ789' AND d.first_name = 'James' AND d.last_name = 'Taylor';
END $$; 