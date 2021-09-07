const mongoose = require('mongoose');
const { Schema } = mongoose;

const patientSchema = new Schema({}, { strict: false });

module.exports = mongoose.model('AppointmentDentrack', patientSchema);
