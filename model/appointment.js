const mongoose = require("mongoose");
const { Schema } = mongoose;

const appointmentSchema = new Schema({}, { strict: false });

module.exports = mongoose.model("AppointmentDentrack", appointmentSchema);
