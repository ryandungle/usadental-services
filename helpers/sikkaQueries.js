const { config } = require("./config");
const axios = require("axios");

const getRequestKey = async () => {
  const { app_id, app_key, office_id, secret_key } = config;
  const { data } = await axios.get(`https://api.sikkasoft.com/v2/start`, {
    params: {
      app_id,
      app_key,
      office_id,
      secret_key,
    },
  });
  return data[0];
};

exports.getPatients = async (page = 0) => {
  const { request_key } = await getRequestKey();
  const pageSize = 5000;

  const { data } = await axios.get(`https://api.sikkasoft.com/v2/patients`, {
    params: {
      request_key,
      offset: page,
      limit: pageSize,
    },
  });
  const { items: patients } = data[0];

  return patients;
};

exports.getPatientsDaily = async (page = 0) => {
  const { request_key } = await getRequestKey();
  const pageSize = 500;

  const { data } = await axios
    .get(`https://api.sikkasoft.com/v2/patients`, {
      params: {
        request_key,
        sort_by: "patient_id",
        sort_order: "desc",
        offset: page,
        limit: pageSize,
      },
    })
    .catch((e) => console.log(e));
  const { items: patients } = data[0];

  return patients;
};
