async function main() {
  const patients1 = await getPatients(1);
  console.log("writing 5k to 10k");
  patients1.forEach(async (patient) => {
    const upsertPatient = await Patient.updateOne(
      { patient_id: patient.patient_id },
      patient,
      { upsert: true }
    );
  });
  const patients2 = await getPatients(2);
  console.log("writing 10k to 15k");
  patients2.forEach(async (patient) => {
    const upsertPatient = await Patient.updateOne(
      { patient_id: patient.patient_id },
      patient,
      { upsert: true }
    );
  });
  const patients3 = await getPatients(3);
  console.log("writing 15k to 20k");
  patients3.forEach(async (patient) => {
    const upsertPatient = await Patient.updateOne(
      { patient_id: patient.patient_id },
      patient,
      { upsert: true }
    );
  });
  const patients4 = await getPatients(4);
  console.log("writing 20k to 25k");
  patients4.forEach(async (patient) => {
    const p = new Patient(patient);
    const upsertPatient = await Patient.updateOne(
      { patient_id: patient.patient_id },
      patient,
      { upsert: true }
    );
  });
  const patients5 = await getPatients(5);
  console.log("writing 25k to 26123");
  patients5.forEach(async (patient) => {
    const p = new Patient(patient);
    const upsertPatient = await Patient.updateOne(
      { patient_id: patient.patient_id },
      patient,
      { upsert: true }
    );
  });
}

//this one is running on cloud function schedule task
async function addDailyPatients() {
  const patients = await getPatientsDaily();
  console.log("writing to database");
  const promises = [];
  patients.forEach((patient) => {
    const upsertPatient = Patient.updateOne(
      { patient_id: patient.patient_id },
      patient,
      { upsert: true }
    );
    promises.push(upsertPatient);
  });
  Promise.all(promises)
    .then((res) => console.log("writting completed"))
    .catch((e) => console.log(e));
}

module.exports = {
  addDailyPatients,
};
