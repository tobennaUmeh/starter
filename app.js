const express = require('express');
const app = express();
const userRouter = require('./routes/userRoutes');
const tourRouter = require('./routes/tourRoutes');
const reviewRouter = require('./routes/reviewRoutes');
const AppError = require('./utils/appError');
const morgan = require('morgan');
const globalErrorHandler = require('./controllers/errorController');
const rateLimit = require('express-rate-limit');

const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
// const cors = require('cors');

//RATE Limiter
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message:
    'Too many requests from this IP, please try again in an hour!',
});

// MIDDLEWARES
//HTTP HEADERS
// <SET> </SET>Security HTTP headers
app.use(helmet());

// DEV LOGGING
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// LIMIT REQUESTS FROM SAME API
app.use('/api', limiter);

//BODY PARSERS, reading data from body into req.body
app.use(express.json({ limit: '10kb' }));

//Data samitization against DOD and CSRF nosql query injection
app.use(mongoSanitize());
app.use(xss());
// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      'duration',
      'difficulty',
      'ratingsAverage',
      'ratingsQuantity',
      'price',
      'maxGroupSize',
    ],
  })
);

// app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toUTCString();
  // console.log('hello form Middleware');
  // console.log(x);

  next();
});

// ROUTES
app.use('/api/v1/tours', tourRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);

app.all('*', (req, res, next) => {
  const err = new AppError(
    `Can't find ${req.originalUrl} on this server!`,
    404
  );
  next(err);
});

app.use(globalErrorHandler);

// const tours = JSON.parse(
//   fs.readFileSync(`${__dirname}/dev-data/data/tours-simple.json`, 'utf-8')
// );

// ROUTE HANDLERS

// ROUTES
// app.get('/api/v1/tours', getAllTours);
// app.post('/api/v1/tours', createTours);
// app.get('/api/v1/tours/:id', getTour);
// app.patch('/api/v1/tours/:id', updatedTour);
// app.delete('/api/v1/tours/:id', deleteTour);

//ROUTER

// ROUTES
// const tourRouter = express.Router();
// tourRouter.route('/').get(getAllTours).post(createTours);
// tourRouter.route('/:id').get(getTour).patch(updatedTour).delete(deleteTour);

// MOUNTING ROUTES

// app.delete('/api/v1/tours', (req, res) => {
//   res.status(204).json({
//     status: 'success',
//     data: null,
//   });
// });

// SERVER
// app.listen(port, () => console.log(`Example app listening on port ${port}!`));

module.exports = app;
