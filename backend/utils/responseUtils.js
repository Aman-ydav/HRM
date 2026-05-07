// utils/responseUtils.js
// Standardized Response Utility

export const sendSuccess = (res, data = null, message = 'Success', statusCode = 200) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

export const sendError = (res, message = 'Error', statusCode = 500, errors = null) => {
  return res.status(statusCode).json({
    success: false,
    message,
    ...(errors && { errors }),
  });
};

export const sendPaginatedResponse = (
  res,
  data,
  page,
  limit,
  total,
  message = 'Success',
  statusCode = 200
) => {
  const totalPages = Math.ceil(total / limit);

  return res.status(statusCode).json({
    success: true,
    message,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    },
  });
};

export default {
  sendSuccess,
  sendError,
  sendPaginatedResponse,
};
