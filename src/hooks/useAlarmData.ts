import { useEffect, useRef, useState } from 'react';
import { useThingsboard } from './ThingsboardProvider';
import { 
    AlarmDataQuery, 
    AlarmDataCmd, 
    WsCmdType, 
    TelemetrySubscriber, 
    WebsocketDataMsg,
    AlarmDataUpdate
} from '../model/telemetry';

export const useAlarmData = (query: AlarmDataQuery) => {
    const client = useThingsboard();
    const [data, setData] = useState<AlarmDataUpdate | null>(null);
    const subscriberRef = useRef<TelemetrySubscriber | null>(null);

    useEffect(() => {
        const service = client.getTelemetryService();
        
        const cmd: AlarmDataCmd = {
            type: WsCmdType.ALARM_DATA,
            query: query
        };

        const subscriber: TelemetrySubscriber = {
            subscriptionCommands: [cmd],
            onCmdUpdate: (msg: WebsocketDataMsg) => {
                setData(msg as unknown as AlarmDataUpdate);
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

    return data;
};

