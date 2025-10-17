import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import ratesRouter from './routes/rates';

const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, service: 'jewellery-server' });
});

app.use('/api/rates', ratesRouter);

const port = process.env.PORT || 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Server listening on http://localhost:${port}`);
});