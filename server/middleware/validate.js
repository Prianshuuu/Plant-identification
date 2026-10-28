// Parses and replaces req.body; a ZodError is turned into a 400 by errorHandler
export const validate = (schema) => (req, _res, next) => {
  req.body = schema.parse(req.body)
  next()
}
