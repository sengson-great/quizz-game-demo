import { useEffect } from 'react';
import { useParams, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export function LangRedirect() {
    const { lang } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { currentUser } = useAuth();

    useEffect(() => {
        const validLangs = ['km', 'en'];
        
        if (!validLangs.includes(lang)) {
            // Get preferred language: from auth, then localStorage, default to km
            const preferredLang = currentUser?.language || localStorage.getItem('lang') || 'km';
            
            // Reconstruct the path. 
            // If the URL was /dashboard, it should become /km/dashboard
            // If it was /, it should become /km/
            const currentPath = location.pathname;
            
            // If currentPath already starts with a lang (but it was invalid, e.g. /fr/dashboard),
            // we replace the first segment.
            let newPath;
            const pathSegments = currentPath.split('/').filter(Boolean);
            
            if (pathSegments.length > 0 && !validLangs.includes(pathSegments[0])) {
                // The first segment is not a valid lang, so we treat the whole path as path-after-lang
                newPath = `/${preferredLang}${currentPath}`;
            } else if (pathSegments.length === 0) {
                newPath = `/${preferredLang}/`;
            } else {
                // It already has a valid lang segment in pathSegments[0] but params.lang might be weird?
                // Or pathSegments[0] IS valid and we just missed it in useParams (unlikely).
                // Just in case, if it's already /km/... we don't redirect again.
                return;
            }

            // Remove double slashes
            newPath = newPath.replace(/\/+/g, '/');
            
            if (currentPath !== newPath) {
                navigate(newPath + location.search + location.hash, { replace: true });
            }
        } else {
            // Persist the valid lang in localStorage
            localStorage.setItem('lang', lang);
        }
    }, [lang, navigate, location.pathname, currentUser]);

    // Only render children if lang is valid
    if (!['km', 'en'].includes(lang)) return null;

    return <Outlet />;
}
