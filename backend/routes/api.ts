import express from 'express';

const router = express.Router();


router.post('/test', function(req, res) {
  res.json({ requestBody: req.body });
});




export default router;
