// Input validation functions
function validatePatientData(name, age, birthDate, phone, email, heartRate, temperature, weight) {
    if (name.length < 1 || name.length > 100) {
        throw new Error('Name must be between 1 and 100 characters.');
    }
    if (age < 0 || age > 150) {
        throw new Error('Age must be between 0 and 150.');
    }
    if (isNaN(new Date(birthDate))) {
        throw new Error('Invalid birth date.');
    }
    const phonePattern = /^\+?[1-9]\d{1,14}$/;
    if (!phonePattern.test(phone)) {
        throw new Error('Invalid phone number format.');
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        throw new Error('Invalid email format.');
    }
    if (heartRate < 40 || heartRate > 200) {
        throw new Error('Heart rate must be between 40 and 200 bpm.');
    }
    if (temperature < 35 || temperature > 42) {
        throw new Error('Temperature must be between 35 and 42 degrees Celsius.');
    }
    if (weight < 20 || weight > 300) {
        throw new Error('Weight must be between 20 and 300 kg.');
    }
}

function validateRecordData(recordData) {
    // Implement similar validation checks for record data if needed
    // This function can be tailored based on the fields present in recordData
}

// Adding try-catch blocks to routes
app.post('/create-patient', async (req, res) => {
    try {
        validatePatientData(req.body.name, req.body.age, req.body.birthDate, req.body.phone, req.body.email, req.body.heartRate, req.body.temperature, req.body.weight);
        // Code to create patient in database
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

app.post('/create-record', async (req, res) => {
    try {
        // Validate record data if needed and create record
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT') {
            res.status(400).send({ message: 'Database error: unique constraint violation.' });
        } else {
            res.status(500).send({ message: 'Internal server error. Please try again later.' });
        }
    }
};