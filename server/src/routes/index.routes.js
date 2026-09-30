const express = require("express");

const router = express.Router();

router.get("/", (req, res) => {
    res.json({
  "status": "OK",
  "server": "TrackWise",
  "uptime": "Running"
});
});

module.exports = router;
