const logger = (req, res, next) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`\n${req.method} ${req.url}\n`);
    console.log('Request Body = ', req.body);
  }
  next();
}
module.exports = { logger }
