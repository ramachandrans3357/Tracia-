import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import { supabase } from './lib/supabase.js';
import authRouter from './routes/auth.js';
import recordsRouter from './routes/records.js';
import citizenLandRouter from './routes/citizenLandRoutes.js';
import publicLandRouter from './routes/publicLandRoutes.js';
import officerLandRouter from './routes/officerLandRoutes.js';
import citizenGrievanceRouter from './routes/citizenGrievanceRoutes.js';
import officerGrievanceRouter from './routes/officerGrievanceRoutes.js';
import ocrExtractionRouter from './routes/ocrExtractionRoutes.js';
import assistantRouter from './routes/assistantRoutes.js';
import mapRouter from './routes/mapRoutes.js';
import notificationRouter from './routes/notificationRoutes.js';
import citizenApplicationRouter from './routes/citizenApplicationRoutes.js';
import officerApplicationRouter from './routes/officerApplicationRoutes.js';
import officerOcrRouter from './routes/officerOcrRoutes.js';

const app = express();

app.use(cors());
app.use(express.json());

// Sanitize requested URL to trim trailing %0A, newlines or spaces
app.use((req, _res, next) => {
  req.url = req.url.replace(/(%0[aA]|%0[dD]|\s|\r|\n)+$/g, '');
  next();
});

app.use('/api/auth', authRouter);
app.use('/api/records', recordsRouter);
app.use('/api/citizen/lands', citizenLandRouter);
app.use('/api/lands', publicLandRouter);
app.use('/api/officer/lands', officerLandRouter);
app.use('/api/citizen/grievances', citizenGrievanceRouter);
app.use('/api/officer/grievances', officerGrievanceRouter);
app.use('/api/citizen/ocr', ocrExtractionRouter);
app.use('/api/assistant', assistantRouter);
app.use('/api/map', mapRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/citizen/applications', citizenApplicationRouter);
app.use('/api/officer/applications', officerApplicationRouter);
app.use('/api/officer/ocr', officerOcrRouter);







app.get('/api/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok' });
});

app.get('/api/db-test', async (_req: Request, res: Response) => {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      res.status(500).json({
        status: 'error',
        message: 'Failed to communicate with Supabase',
        error: error.message
      });
      return;
    }

    res.json({
      status: 'ok',
      message: 'Supabase connection successful',
      sessionData: data
    });
  } catch (err: any) {
    res.status(500).json({
      status: 'error',
      message: 'Unexpected error testing Supabase connection',
      error: err?.message || String(err)
    });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`);
});

export default app;
