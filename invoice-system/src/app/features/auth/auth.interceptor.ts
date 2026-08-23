import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authDataStr = sessionStorage.getItem('authData');
  
  if (authDataStr) {
    const authData = JSON.parse(authDataStr);
    
    const token = authData.access_token || authData.token; 

    if (token) {
      const clonedRequest = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      return next(clonedRequest);
    }
  }

  return next(req);
};