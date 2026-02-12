import { useState, useEffect } from 'react';
import { FiBook } from 'react-icons/fi';

const CourseThumbnail = ({ src, alt, className, fallback, fallbackClassName = "bg-gray-200 dark:bg-gray-700 flex items-center justify-center" }) => {
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        setHasError(false);
    }, [src]);

    if (!src || hasError) {
        if (fallback) return fallback;
        return (
            <div className={`${className} ${fallbackClassName}`}>
                <FiBook className="w-16 h-16 text-gray-400" />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={alt}
            className={className}
            onError={() => setHasError(true)}
            loading="lazy"
        />
    );
};

export default CourseThumbnail;
