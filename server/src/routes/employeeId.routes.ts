import { Router } from "express";

import {
    createEmployeeIdHandler,
    getNextEmployeeIdHandler,
    getShiftOptionsHandler,
} from "@/controllers/employeeId.controller";
import { adminOnly, authenticate } from "@/middleware/auth.guard";

const router: Router = Router();

router.get("/next", authenticate, adminOnly, getNextEmployeeIdHandler);

router.get("/shifts", authenticate, adminOnly, getShiftOptionsHandler);

router.post("/", authenticate, adminOnly, createEmployeeIdHandler);

export default router;
