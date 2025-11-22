import { useEffect, useRef, useState } from 'react';
import { useThingsboard } from './ThingsboardProvider';
import { 
    EntityDataQuery, 
    EntityDataCmd, 
    WsCmdType, 
    TelemetrySubscriber, 
    WebsocketDataMsg,
    EntityDataUpdate
} from '../model/telemetry';

export const useEntityData = (query: EntityDataQuery) => {
    const client = useThingsboard();
    const [data, setData] = useState<EntityDataUpdate | null>(null);
    const subscriberRef = useRef<TelemetrySubscriber | null>(null);

    useEffect(() => {
        const service = client.getTelemetryService();
        
        const cmd: EntityDataCmd = {
            type: WsCmdType.ENTITY_DATA,
            query: query
        };

        const subscriber: TelemetrySubscriber = {
            subscriptionCommands: [cmd],
            onCmdUpdate: (msg: WebsocketDataMsg) => {
                // In a real app, we might need to merge updates with previous data here
                // For now, we just return the latest update message
                setData(msg as unknown as EntityDataUpdate);
            },
            onReconnected: () => {
                // Auto-handled by service usually, but good hook point
            }
        };

        subscriberRef.current = subscriber;
        service.subscribe(subscriber);

        return () => {
            if (subscriberRef.current) {
                service.unsubscribe(subscriberRef.current);
            }
        };
    }, [client, JSON.stringify(query)]); // Re-subscribe if query changes

    return data;
};

