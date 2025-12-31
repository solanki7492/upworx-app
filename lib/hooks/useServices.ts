import { useEffect, useState } from 'react';
import { getServices } from '../services';
import { ApiException } from '../types/api';
import { Service } from '../types/service';

interface UseServicesReturn {
    services: Service[];
    loading: boolean;
    error: string | null;
    refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage services data
 * @returns Object containing services, loading state, error, and refetch function
 */
export const useServices = (): UseServicesReturn => {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServices = async () => {
        try {
            setLoading(true);
            setError(null);
            const services = await getServices();
            setServices(services);
        } catch (err) {
            if (err instanceof ApiException) {
                setError(err.message);
                console.error('API Error:', {
                    message: err.message,
                    statusCode: err.statusCode,
                    errors: err.errors,
                });
            } else {
                setError(err instanceof Error ? err.message : 'An error occurred while fetching services');
                console.error('Error fetching services:', err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    return {
        services,
        loading,
        error,
        refetch: fetchServices,
    };
};
