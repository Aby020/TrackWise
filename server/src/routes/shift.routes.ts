import { Router } from "express";

import {
    getCurrentShift,
    updateCurrentShift,
} from "@/controllers/shift.controller";
import { adminOnly, authenticate } from "@/middleware/auth.guard";

const router: Router = Router();

router.get("/current", authenticate, adminOnly, getCurrentShift);

router.put("/current", authenticate, adminOnly, updateCurrentShift);

export default router;
