const mongoose = require("mongoose");

const expirationConstant = process.env.RECORDS_EXPIRE_MINS
  ? process.env.RECORDS_EXPIRE_MINS * 60 * 1000
  : 24 * 60 * 60 * 1000;

const storeModel = new mongoose.Schema(
  {
    key: {
      type: String,
    },
    value: {
      type: mongoose.Mixed,
    },
    expireAt: {
      type: Date,
      default: Date.now + expirationConstant,
    },
  },
  { collection: "records", timestamps: true }
);

storeModel.index({ expireAt: 1 }, { expireAfterSeconds: 3600 });

module.exports = mongoose.model("StoreModel", storeModel);
