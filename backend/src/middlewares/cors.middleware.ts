import cors from 'cors';

const allowedOrigins = [
  'https://infra-pro.com',
  'https://app.infra-pro.com',
  'http://localhost:3000', // Development only
];

export const corsOptions: cors.CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  maxAge: 86400, // 24 hours
};