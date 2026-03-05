-- 1. Tutors Table
CREATE TABLE IF NOT EXISTS tutors (
                                      id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                      user_id BIGINT NOT NULL,
                                      full_name VARCHAR(255) NOT NULL,
    subject VARCHAR(100),
    hourly_rate DECIMAL(10, 2),
    bio TEXT,
    rating DOUBLE DEFAULT 0.0,
    total_lessons INT DEFAULT 0
    );

-- 2. Availability Slots
CREATE TABLE IF NOT EXISTS tutor_availability (
                                                  id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                                  tutor_id BIGINT NOT NULL,
                                                  available_date DATE NOT NULL,
                                                  start_time TIME NOT NULL,
                                                  end_time TIME NOT NULL,
                                                  is_booked BOOLEAN DEFAULT FALSE,
                                                  CONSTRAINT fk_tutor_avail FOREIGN KEY (tutor_id) REFERENCES tutors(id) ON DELETE CASCADE
    );

-- 3. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
                                        id BIGINT PRIMARY KEY AUTO_INCREMENT,
                                        student_id BIGINT NOT NULL,
                                        tutor_id BIGINT NOT NULL,
                                        slot_id BIGINT NOT NULL,
                                        status ENUM('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED') DEFAULT 'PENDING',
    total_price DECIMAL(10, 2),
    meeting_link VARCHAR(255), -- Virtual session එකට
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_tutor_booking FOREIGN KEY (tutor_id) REFERENCES tutors(id),
    CONSTRAINT fk_slot_booking FOREIGN KEY (slot_id) REFERENCES tutor_availability(id)
    );