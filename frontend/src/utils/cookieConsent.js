export const handleCookieConsent = () => {
  const consent = localStorage.getItem('cookieConsent');
  
  if (!consent) {
    const userConsent = window.confirm(
      'Este site usa cookies para melhorar sua experiência. Aceita?'
    );
    
    localStorage.setItem('cookieConsent', userConsent);
    return userConsent;
  }
  
  return consent === 'true';
}; 