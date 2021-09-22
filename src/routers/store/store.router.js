const express = require("express");
const storeController = require("../../controllers/store.controller");
const log4js = require("log4js");
const logger = log4js.getLogger("store");
logger.level = process.env.LOG_LEVEL || "debug";

const expirationConstant = process.env.RECORDS_EXPIRE_MINS
  ? process.env.RECORDS_EXPIRE_MINS * 60 * 1000
  : 24 * 60 * 60 * 1000;

const maxRecordsNum = process.env.MAX_RECORDS || 25;

const genRanHex = (size) =>
  [...Array(size)]
    .map(() => Math.floor(Math.random() * 16).toString(16))
    .join("");

const router = express.Router();

router.get("/get/:key", async (req, res) => {
  try {
    const recordKey = req.params.key;
    let response = await storeController.getStoreRecord(recordKey);
    if (!response) {
      logger.info("Unable to find record. Cache miss");
      const tempItem = {
        key: recordKey,
        value: genRanHex(12),
        expireAt: Date.now() + expirationConstant,
      };
      const createdItem = await storeController.createStoreRecord(tempItem);
      logger.info(createdItem);
      response = tempItem;
    } else {
      logger.info("Found record. Cache hit");
    }
    res.json(response);
  } catch (err) {
    logger.error("Error:", err);
    res.json({ err: err.message });
  }
});

router.get("/get-all", async (req, res) => {
  try {
    const response = await storeController.getAllStoreRecords();
    res.json(response);
  } catch (err) {
    logger.error("Error:", err);
    res.json({ err: err.message });
  }
});

router.post("/create", async (req, res) => {
  try {
    const record = req.body ? req.body.record : null;
    let tempItem = {
      key: genRanHex(12),
      value: genRanHex(12),
      expireAt: Date.now() + expirationConstant,
    };
    if (!!record) {
      const { key, value, expireAt } = record;
      tempItem = {
        key: key || genRanHex(12),
        value: value || genRanHex(12),
        expireAt: expireAt || Date.now() + expirationConstant,
      };
    }
    const allRecords = await storeController.getAllStoreRecords();
    const excessRecordNum = allRecords.length - maxRecordsNum + 1;
    let response = {};
    if (excessRecordNum > 0) {
      response = await Promise.all([
        ...allRecords
          .slice(0, excessRecordNum)
          .map((item) => storeController.deleteStoreRecord(item)),
        storeController.createStoreRecord(tempItem),
      ]);
    } else {
      response = await storeController.createStoreRecord(tempItem);
    }
    res.json(response);
  } catch (err) {
    logger.error("Error:", err);
    res.json({ err: err.message });
  }
});

router.put("/update/:key", async (req, res) => {
  try {
    const recordKey = req.params.key;
    const record = req.body ? req.body.record : null;
    let tempItem = {
      key: recordKey,
      value: genRanHex(12),
      expireAt: Date.now() + expirationConstant,
    };
    if (!!record) {
      const { key, value, expireAt } = record;
      tempItem = {
        key: key || recordKey,
        value: value || genRanHex(12),
        expireAt: expireAt || Date.now() + expirationConstant,
      };
    }
    const response = await storeController.updateStoreRecord(
      { key: recordKey },
      tempItem
    );
    res.json(response);
  } catch (err) {
    logger.error("Error:", err);
    res.json({ err: err.message });
  }
});

router.delete("/delete/:key", async (req, res) => {
  try {
    const recordKey = req.params.key;
    const response = await storeController.deleteStoreRecord({
      key: recordKey,
    });
    res.json(response);
  } catch (err) {
    logger.error("Error:", err);
    res.json({ err: err.message });
  }
});

router.delete("/delete-all", async (req, res) => {
  try {
    const response = await storeController.deleteAllStoreRecords();
    res.json(response);
  } catch (err) {
    logger.error("Error:", err);
    res.json({ err: err.message });
  }
});

module.exports = router;
