const mongoose = require("mongoose");
const { Schema } = mongoose;

const patientSchema = new Schema(
  {
    patient_id: String,
    guarantor_id: String,
    firstname: String,
    lastname: String,
    primary_relationship: String,
    subscriber_id: String,
    guarantor_first_name: String,
    guarantor_last_name: String,
  },
  { strict: false }
);

module.exports = mongoose.model("Patient", patientSchema);
