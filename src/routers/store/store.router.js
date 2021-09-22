const express = require("express");

// const mongoHelpers = require("../../helpers/mongoose.helper");

const router = express.Router();

router.get("/get/:key", async (req, res) => {
  try {
  } catch (err) {
    console.log("Error:", err);
    res.json({ err: err.message });
  }
});

module.exports = router;
