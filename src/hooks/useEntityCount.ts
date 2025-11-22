import { useEffect, useRef, useState } from 'react';
import { useThingsboard } from './ThingsboardProvider';
import { 
    EntityCountQuery, 
    EntityCountCmd, 
    WsCmdType, 
    TelemetrySubscriber, 
    WebsocketDataMsg
} from '../model/telemetry';

export const useEntityCount = (query: EntityCountQuery) => {
    const client = useThingsboard();
    const [count, setCount] = useState<number | null>(null);
    const subscriberRef = useRef<TelemetrySubscriber | null>(null);

    useEffect(() => {
        const service = client.getTelemetryService();
        
        const cmd: EntityCountCmd = {
            type: WsCmdType.ENTITY_COUNT,
            query: query
        };

        const subscriber: TelemetrySubscriber = {
            subscriptionCommands: [cmd],
            onCmdUpdate: (msg: WebsocketDataMsg) => {
                if (typeof msg.count === 'number') {
                    setCount(msg.count);
                }
            }
        };

        subscriberRef.current = subscriber;
        service.subscribe(subscriber);

        return () => {
            if (subscriberRef.current) {
                service.unsubscribe(subscriberRef.current);
            }
        };
    }, [client, JSON.stringify(query)]);

    return count;
};

