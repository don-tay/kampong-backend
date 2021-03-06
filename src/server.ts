import path from 'path';
import express from 'express';
import dotenv from 'dotenv';
import 'colors';
import cookieParser from 'cookie-parser';
import fileUpload from 'express-fileupload';
import morgan from 'morgan';
import helmet from 'helmet';
import xss from 'xss-clean';
import rateLimit from 'express-rate-limit';
import hpp from 'hpp';
import cors from 'cors';
import { get } from 'lodash';
import { checkConn } from './utils';
import { apiRouter } from './routes';
import { errorHandler } from './middleware';
import { dbBackupJob, shuffleFeaturedListings } from './jobs';

dotenv.config({ path: 'config/config.env' });

// Init express
const app = express();

// Check connection to db
checkConn();

// Express json parser
app.use(express.json());

// Cookie parser
app.use(cookieParser());

// Multipart/formdata file uploader
app.use(fileUpload());

if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

// Set security headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Set express to populate req.ip from req headers 1 hop before proxy (ie. client's public ip)
// see: https://expressjs.com/en/guide/behind-proxies.html
app.set('trust proxy', 1);

// Rate limiting
const limiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 200,
    message: { success: false, error: 'Request limit exceeded, please try again later.' },
});

app.use(limiter);

// Prevent http param pollution
app.use(hpp());

// Enable CORS
app.use(cors());

// Mount routers
app.use('/api', apiRouter);

// Mount error handler
app.use(errorHandler);

// Run jobs (only in production)
if (process.env.NODE_ENV === 'production') {
    dbBackupJob.start();
    shuffleFeaturedListings.start();
}

// Set static folder
app.use(express.static(path.resolve(__dirname, '../public')));

// Serve frontend homepage
app.get('*', (req, res) => {
    const apiDocsPath = path.resolve(__dirname, '../public/api-docs/index.html');
    res.sendFile(apiDocsPath);
});

const PORT = parseInt(process.env.PORT) || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err: Error, _promise: Promise<any>) => {
    console.log(`Unhandled Error: ${get(err, 'message')}`.bgRed);
    // Write diagnostic report
    process.report.writeReport(err);
    // Close server & exit process
    server.close(() => process.exit(1));
});
