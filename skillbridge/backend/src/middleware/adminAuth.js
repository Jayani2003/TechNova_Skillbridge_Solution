module.exports = (req, res, next) => {
  if (!req.user || req.user.user_type !== 'ADMIN') {
    return res.status(403).json({ message: 'Forbidden: Admin access required.' });
  }
  next();
};
