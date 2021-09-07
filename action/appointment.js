const axios = require("axios");
const {
  config,
  config: { clinicId },
} = require("../helpers/config");
// const fs = require("fs");
const Appointment = require("../model/appointment");
const { format, addWeeks } = require("date-fns");
const logger = require("../utils/logger");

const getRequestKey = async () => {
  const { data } = await axios.get(
    `https://api.sikkasoft.com/v2/start?app_id=${config.app_id}&app_key=${config.app_key}&office_id=${config.office_id}&secret_key=${config.secret_key}`
  );
  return data[0];
};

const getNext2WeekAppointments = async (request_key) => {
  const startdate = format(new Date(), "yyyy-MM-dd");
  const enddate = format(addWeeks(new Date(), 2), "yyyy-MM-dd");

  const { data } = await axios.get(
    `https://api.sikkasoft.com/v2/appointments`,
    {
      params: { request_key, startdate, enddate },
    }
  );

  return data[0]?.items;
  // fs.writeFileSync(
  //   './appointmentsNext2week.json',
  //   JSON.stringify(data, null, 2),
  //   'utf-8'
  // );
};

const getPatientById = async (patientId, request_key) => {
  const { data: pat, headers } = await axios.get(
    `https://api.sikkasoft.com/v2/patients/${patientId}`,
    {
      params: {
        request_key,
        expand: "primary_insurance_company,guarantor, provider",
      },
    }
  );

  return {
    meta_data: {
      rateLimit: headers["x-rate-limit-limit"],
      limitRemaining: headers["x-rate-limit-remaining"],
      limitReset: headers["x-rate-limit-reset"],
    },
    PT_UID: "",
    PT_GUID: "",
    PatNum: pat.patient_id,
    PT_GUA_ID: pat.guarantor_id,
    PT_GUA_FNAME: pat.guarantor_first_name,
    PT_GUA_LNAME: pat.guarantor_last_name,
    PT_GUA_BD: pat.guarantor.birthdate,
    PT_SUB_RELATIONSHIP: pat.primary_relationship,
    PT_GENDER: pat.gender === "Male" ? 0 : pat.gender === "Female" ? 1 : 2,
    PT_INS_SUB: pat.subscriber_id,
    PT_INS_NAME: pat.primary_insurance_company?.insurance_company_name ?? "",
    PT_GROUPNAME: pat.primary_insurance_company?.group_plan_name ?? "",
    PT_PAYOR_ID: pat.primary_insurance_company?.payer_id ?? "",
    PT_STATUS: "",
    PT_STATUS_DESCR: "",
    PT_PRIM_PROV: pat.provider_id,
    PT_SEC_PROV: "",
    PT_START_DT: "",
    PT_LAST_DT: "",
    PT_BIRTHDATE: pat.birthdate,
    PT_FNAME: pat.firstname,
    PT_LNAME: pat.lastname,
    PT_ADDRESS: {
      Street: pat.address_line1,
      Street2: pat.address_line2,
      City: pat.city,
      State: pat.state,
      Zip: pat.zipcode,
    },
    PT_PHONE: {
      Home: pat.homephone,
      Work: pat.workphone,
      Cell: pat.cell,
    },
    PT_EMAIL: pat.email,
    PT_LAST_MOD: "",
    CLINIC_ID: config.clinicId,
    PT_CARRIER_NAME: "",
    PT_PROV_FNAME: pat.provider?.firstname ?? "",
    PT_PROV_LNAME: pat.provider?.lastname ?? "",
    PT_PROV_TYPE: pat.provider?.provider_type ?? "",
    PT_PROV_NPI: pat.provider?.national_provider_identifier ?? "",
    PT_PROV_TIN: pat.provider?.tax_identification_number ?? "",
    PT_PROV_SPECIALTY_CODE: pat.provider?.specialty_code ?? "",
  };
};

const getPatientInfoFromAppointments = async (appointments, request_key) => {
  const DentrackAppt = [];
  for (let i = 0; i < appointments.length; i++) {
    const patientInfo = await getPatientById(
      appointments[i].patient_id,
      request_key
    );
    const { limitRemaining, limitReset } = patientInfo?.meta_data;
    if (limitRemaining == 0) {
      logger.info("sikka api limit reached, waiting");
      await new Promise((resolve) => setTimeout(resolve, limitReset * 1000));
    }
    const { meta_data, ...pat } = patientInfo;
    DentrackAppt.push({
      PATIENT_INFO: pat,
      APPT: {
        APPT_ID: `${appointments[i].appointment_sr_no}-${clinicId}`,
        APPT_NUM: appointments[i].appointment_sr_no,
        APPT_DT: appointments[i].date,
        APPT_LENGHT_MINS: appointments[i].length,
        PT_FNAME: pat.PT_GUA_FNAME,
        PT_LNAME: pat.PT_GUA_LNAME,
        PT_DOB: pat.PT_BIRTHDATE,
        TOTAL: "",
        PT_UID: "",
        APPT_REASON: "",
        APPT_ADA_CODES: "",
        APPT_TRT_PROC: "",
        APPT_STATUS: appointments[i].status,
        APPT_NEWPT_INFO: "",
        APPT_NOTES: appointments[i].description,
        APPT_LAST_MOD: "",
        CLINIC_ID: clinicId,
      },
    });
  }
  return DentrackAppt;
};

const saveDentrackAppointmentToCached =
  async function saveDentrackAppointmentToCached(DentrackAppointments) {
    try {
      await Appointment.insertMany(DentrackAppointments);
      logger.info("Cache completed");
    } catch (error) {
      logger.error("Caching Error: ", error);
    }
  };

const clearDentrackAppointmentCached =
  async function clearDentrackAppointmentCached() {
    try {
      Appointment.deleteMany();
      logger.info("clear Appointment cache completed");
    } catch (error) {
      logger.error("clear appointment cache error: ", error);
    }
  };

const CacheNext2WeekPatients = async () => {
  const { request_key } = await getRequestKey();

  const appointments = await getNext2WeekAppointments(request_key);
  const DentrackAppts = await getPatientInfoFromAppointments(
    appointments,
    request_key
  );
  await clearDentrackAppointmentCached();
  await saveDentrackAppointmentToCached(DentrackAppts);

  return DentrackAppts;
};

module.exports = {
  CacheNext2WeekPatients,
};
