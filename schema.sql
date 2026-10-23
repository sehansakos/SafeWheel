-- RescueWrench PostgreSQL + PostGIS Production Schema
CREATE EXTENSION IF NOT EXISTS postgis;

-- Users / Drivers Table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    emergency_contact VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles (Digital Glovebox)
CREATE TABLE vehicles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    license_plate VARCHAR(20) NOT NULL,
    make_model VARCHAR(100) NOT NULL,
    drive_type VARCHAR(10) DEFAULT '2WD', -- '2WD', 'AWD', '4WD'
    tire_spec VARCHAR(30),
    battery_type VARCHAR(30)
);

-- Mechanics / Recovery Vans
CREATE TABLE mechanics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    van_identifier VARCHAR(50),
    is_online BOOLEAN DEFAULT false,
    rating NUMERIC(3,2) DEFAULT 5.00,
    current_location GEOMETRY(Point, 4326)
);

CREATE INDEX idx_mechanic_location ON mechanics USING GIST(current_location);

-- Emergency Service Requests (Jobs)
CREATE TABLE service_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    mechanic_id UUID REFERENCES mechanics(id),
    service_category VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'REQUESTED', -- 'REQUESTED', 'EN_ROUTE', 'ARRIVED', 'COMPLETED'
    pickup_location GEOMETRY(Point, 4326),
    base_price NUMERIC(10,2) NOT NULL,
    extra_parts_cost NUMERIC(10,2) DEFAULT 0.00,
    has_life_cover_rider BOOLEAN DEFAULT false,
    total_amount NUMERIC(10,2) NOT NULL,
    customer_signature TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
