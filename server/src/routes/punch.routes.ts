import { Router } from "express";

import { endWork, startWork } from "@/controllers/punch.controller";
import { authenticate } from "@/middleware/auth.guard";
import {
    createBreak,
    endBreak,
} from "@/controllers/break.controller";

const router: Router = Router();

router.post("/punch-in", authenticate, startWork);

router.post("/punch-out", authenticate, endWork);

router.post("/breaks", authenticate, createBreak);

router.post("/breaks/end", authenticate, endBreak);

export default router;
