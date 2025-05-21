// This script helps with immediate redirection after login
// It's added to the login page to ensure proper routing to dashboard

// Check for a login success flag in session storage
if (sessionStorage.getItem('loginSuccess')) {
  // Clear the flag
  sessionStorage.removeItem('loginSuccess');
  
  // Redirect to dashboard
  if (window.location.pathname !== '/dashboard') {
    window.location.href = '/dashboard';
  }
}