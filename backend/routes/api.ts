import express from "express";

const router = express.Router();

import { restoreUser } from "../utils/auth.js";

router.use(restoreUser);

export default router;
