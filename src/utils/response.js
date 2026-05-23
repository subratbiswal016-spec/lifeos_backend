export const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  return res.status(statusCode).json({
    success: true,
    message,
    ...(data && { data })
  });
};

export const errorResponse = (res, statusCode = 500, message = 'Something went wrong', error = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(error && { error })
  });
};
