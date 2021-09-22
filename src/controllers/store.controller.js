const StoreModel = require("../models/Store.model");
const log4js = require("log4js");
const logger = log4js.getLogger("store.controller");
logger.level = process.env.LOG_LEVEL || "debug";

/**
 * Builds an `AND` mongoDB query to pass it into DB request
 * @param {Object} filters - List of data values for filtering
 */
const buildAndQuery = async (filters) => {
  let query = {};
  let tempSelectors = [];
  for (let category in filters) {
    if (Array.isArray(filters[category]) && filters[category].length > 0) {
      tempSelectors.push({ [category]: { $in: filters[category] } });
    }
  }
  query = tempSelectors.length > 1 ? { $and: tempSelectors } : tempSelectors[0];
  return query || {};
};

/**
 * Builds an `OR` mongoDB query to pass it into DB request
 * @param {Object} filters - List of data values for filtering
 */
const buildOrQuery = async (filters) => {
  let query = {};
  let tempSelectors = [];
  for (let category in filters) {
    if (Array.isArray(filters[category]) && filters[category].length > 0) {
      tempSelectors.push({ [category]: { $in: filters[category] } });
    }
  }
  query = tempSelectors.length > 1 ? { $or: tempSelectors } : tempSelectors[0];
  return query || {};
};

const createStoreRecord = async (record) => {
  const callback = (err, res) => {
    const response = {};
    if (err !== null) {
      response.message = `${err}\nAffected ${res.modifiedCount} documents in database`;
      logger.info(response.message);
    } else {
      response.message = "Successfully created record.";
      response.data = res;
    }
    return response;
  };
  const result = await StoreModel.create(record, callback);
  return result;
};

const getStoreRecord = async (key = "") => {
  const query = await buildAndQuery({
    key: [key],
  });
  const data = await StoreModel.findOne(query);
  return data;
};

const getAllStoreRecords = async () => {
  const data = await StoreModel.find();
  return data;
};

const updateStoreRecord = async (oldRecord, newRecord) => {
  const callback = (err, res) => {
    const response = {};
    if (err !== null) {
      response.message = `${err}\nAffected ${res.modifiedCount} documents in database`;
      logger.info(response.message);
    } else {
      response.message = "Successfully updated records data.";
      response.data = res;
    }
    return response;
  };
  const result = await StoreModel.updateOne(oldRecord, newRecord, callback);
  return result;
};

const deleteStoreRecord = async (record) => {
  const callback = (err, res) => {
    const response = {};
    if (err !== null) {
      response.message = `${err}\nAffected ${res.modifiedCount} documents in database`;
      logger.info(response.message);
    } else {
      response.message = "Successfully deleted records data.";
      response.data = res;
    }
    return response;
  };
  const result = await StoreModel.deleteOne(record, callback);
  return result;
};

const deleteAllStoreRecords = async () => {
  const callback = (err, res) => {
    const response = {};
    if (err !== null) {
      response.message = `${err}\nAffected ${res.modifiedCount} documents in database`;
      logger.info(response.message);
    } else {
      response.message = "Successfully deleted records data.";
      response.data = res;
    }
    return response;
  };
  const result = await StoreModel.deleteMany({}, callback);
  return result;
};

module.exports = {
  buildAndQuery: buildAndQuery,
  buildOrQuery: buildOrQuery,
  createStoreRecord: createStoreRecord,
  getStoreRecord: getStoreRecord,
  getAllStoreRecords: getAllStoreRecords,
  updateStoreRecord: updateStoreRecord,
  deleteStoreRecord: deleteStoreRecord,
  deleteAllStoreRecords: deleteAllStoreRecords,
};
