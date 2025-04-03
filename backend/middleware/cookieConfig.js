const cookieConfig = (req, res, next) => {
  res.cookie('cookieConsent', 'true', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 365 * 24 * 60 * 60 * 1000 // 1 ano
  });
  next();
};

module.exports = cookieConfig; 