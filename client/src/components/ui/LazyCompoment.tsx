// Compoment to implement lazy loading of the app 

import React, { lazy, Suspense } from 'react';
import LoaderPage from '@/layouts/loaders/LoaderPage';

interface DynamicPageLoaderProps {
    pageKey: string; // Key representing the page to load dynamically
}

// Dynamically import pages using import.meta.glob
const pages = import.meta.glob('/src/pages/**/*.tsx');

const DynamicPageLoader: React.FC<DynamicPageLoaderProps> = ({ pageKey }) => {
    console.log(`Loading page: ${pageKey}`);

    // Lazy load the page based on the provided pageKey 
    // @ts-ignore-next-line
    const PageComponent = lazy(() => {
        // Try exact match
        let importer = pages[`/src/pages/${pageKey}.tsx`];

        // Fallback: try to find by suffix to avoid path mismatches
        if (!importer) {
            const matchKey = Object.keys(pages).find((k) =>
                k.endsWith(`/${pageKey}.tsx`)
            );
            if (matchKey) {
                // @ts-ignore-next-line – dynamic import map types
                importer = pages[matchKey];
            }
        }

        if (!importer) {
            console.error(`Page not found: ${pageKey}`);
            return Promise.reject(new Error(`Page not found: ${pageKey}`));
        }

        console.log("Corect import ");
        return importer();
    });

    return (
        <Suspense fallback={<LoaderPage />}>
            <React.StrictMode>
                <PageComponent />
            </React.StrictMode>
        </Suspense>
    );
};

export default DynamicPageLoader;
