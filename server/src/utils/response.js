class Response {
  static success(res, message, data = null, statusCode = 200) {
    return res.status(statusCode).json({
      status: 'success',
      message,
      data,
    });
  }

  static created(res, message, data = null) {
    return res.status(201).json({
      status: 'success',
      message,
      data,
    });
  }

  static badRequest(res, message, errors = null) {
    return res.status(400).json({
      status: 'error',
      message,
      errors,
    });
  }

  static unauthorized(res, message = 'Unauthorized') {
    return res.status(401).json({
      status: 'error',
      message,
    });
  }

  static forbidden(res, message = 'Forbidden') {
    return res.status(403).json({
      status: 'error',
      message,
    });
  }

  static notFound(res, message = 'Resource not found') {
    return res.status(404).json({
      status: 'error',
      message,
    });
  }

  static serverError(res, message = 'Internal server error', error = null) {
    return res.status(500).json({
      status: 'error',
      message,
      ...(process.env.NODE_ENV === 'development' && error ? { error: error.message } : {}),
    });
  }
}

module.exports = Response;