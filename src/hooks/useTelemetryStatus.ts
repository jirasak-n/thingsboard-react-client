import { useState, useEffect } from 'react';
import { useThingsboard } from './ThingsboardProvider';
import { ConnectionStatus } from '../model/telemetry';

export const useTelemetryStatus = (): ConnectionStatus => {
    const tbClient = useThingsboard();
    const [status, setStatus] = useState<ConnectionStatus>(tbClient.getTelemetryStatus());

    useEffect(() => {
        // Update initial status in case it changed before subscription
        setStatus(tbClient.getTelemetryStatus());

        const unsubscribe = tbClient.onTelemetryStatusChange((newStatus) => {
            setStatus(newStatus);
        });

        return () => {
            unsubscribe();
        };
    }, [tbClient]);

    return status;
};
