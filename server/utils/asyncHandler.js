// Express 4 doesn't catch rejected promises on its own
export const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)
