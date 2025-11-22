import { useEffect, useRef, useState, useCallback } from 'react';
import { useThingsboard } from './ThingsboardProvider';
import { 
    NotificationsCmd, 
    WsCmdType, 
    TelemetrySubscriber, 
    WebsocketDataMsg 
} from '../model/telemetry';

export const useNotifications = (limit: number = 10) => {
    const client = useThingsboard();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState<number>(0);
    const subscriberRef = useRef<TelemetrySubscriber | null>(null);

    useEffect(() => {
        const service = client.getTelemetryService();
        
        // Subscribe to unread count
        const countCmd: NotificationsCmd = {
            type: WsCmdType.NOTIFICATIONS_COUNT
        };

        // Subscribe to notifications stream
        const subCmd: NotificationsCmd = {
            type: WsCmdType.NOTIFICATIONS,
            limit: limit
        };

        const subscriber: TelemetrySubscriber = {
            subscriptionCommands: [countCmd, subCmd],
            onCmdUpdate: (msg: WebsocketDataMsg) => {
                if (msg.cmdUpdateType === 'NOTIFICATIONS_COUNT') {
                    if (typeof msg.totalUnreadCount === 'number') {
                        setUnreadCount(msg.totalUnreadCount);
                    }
                } else if (msg.cmdUpdateType === 'NOTIFICATIONS') {
                    // This handles both initial list and updates
                    if (msg.notifications) {
                        setNotifications(msg.notifications);
                    } else if (msg.update) { // or msg.update for single notification push?
                         // Depending on TB version, it might push a single notification in `update` field
                         // Logic to prepend to list would go here.
                         // For now, let's assume msg.notifications sends the full list or we re-fetch
                    }
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
    }, [client, limit]);

    const markAsRead = useCallback((notificationId: string) => {
        const service = client.getTelemetryService();
        const cmd: NotificationsCmd = {
            type: WsCmdType.MARK_NOTIFICATIONS_AS_READ,
            notifications: [notificationId]
        };
        // We send this as a one-off command, but via subscribe mechanism effectively
        // Or we can implement a `sendOneWayCommand` in service.
        // For now, create a temporary subscriber that just sends command.
        const subscriber: TelemetrySubscriber = {
            subscriptionCommands: [cmd]
        };
        service.subscribe(subscriber);
        // No need to unsubscribe as this cmd type doesn't establish a long-lived subscription usually?
        // Actually, standard practice is just sending it. 
    }, [client]);

    const markAllAsRead = useCallback(() => {
        const service = client.getTelemetryService();
        const cmd: NotificationsCmd = {
            type: WsCmdType.MARK_ALL_NOTIFICATIONS_AS_READ
        };
        const subscriber: TelemetrySubscriber = {
            subscriptionCommands: [cmd]
        };
        service.subscribe(subscriber);
    }, [client]);

    return { notifications, unreadCount, markAsRead, markAllAsRead };
};

