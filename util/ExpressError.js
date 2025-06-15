class ExpressError extends Error {
  constructor(statusCode = 500, message = "Something went wrong") {
    super(message);  // important to set the message property on Error
    this.statusCode = statusCode;
  }
}

module.exports = ExpressError;
