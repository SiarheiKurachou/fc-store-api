const express = require("express");

const storeRouter = require("./store/store.router");

const router = express.Router();

router.use("/store", storeRouter);

module.exports = router;
