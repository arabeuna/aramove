const security = (req, res, next) => {
  // Headers de segurança adicionais
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Permitir Google APIs
  if (req.url.includes('/auth/google') || req.url.includes('/drive')) {
    res.setHeader('Cross-Origin-Opener-Policy', 'same-origin-allow-popups');
  }
  
  next();
};

module.exports = security; 