import { Router } from "express";

import { getShiftInfo } from "@/controllers/shiftInfo.controller";
import { authenticate } from "@/middleware/auth.guard";

const router: Router = Router();

router.get("/current", authenticate, getShiftInfo);

export default router;
