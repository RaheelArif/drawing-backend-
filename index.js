const express = require('express');
const cors = require('cors');
const corsConfig = require('./config/cors');
const imageRoutes = require('./routes/imageRoutes');
const proxyRoutes = require('./routes/proxyRoutes');
const errorHandler = require('./middleware/errorHandler');
const deepaiRoutes = require('./routes/deepaiRoutes');

const app = express();
const port = 5002;
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  preflightContinue: false,
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

app.use('/api', imageRoutes);
app.use('/api', proxyRoutes);

app.use('/api', deepaiRoutes);app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});