const express = require("express");
const router = express.Router();
const {
  processImage,
  checkStatus,
  proxyModel,
} = require("../controllers/imageController");

router.post("/process-image", processImage);
router.post("/check-status", checkStatus);
router.get("/proxy-model", proxyModel);
module.exports = router;
