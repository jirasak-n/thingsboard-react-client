import { useEffect, useRef } from 'react';
import { useThingsboard } from './ThingsboardProvider';
import { TelemetrySubscriber, WebsocketDataMsg, SubscriptionCmd } from '../model/telemetry';
import { EntityId } from '../model/entity';

export interface UseTelemetryOptions {
  entityId: EntityId;
  keys?: string[];
  scope?: 'LATEST_TELEMETRY' | 'CLIENT_SCOPE' | 'SERVER_SCOPE' | 'SHARED_SCOPE';
  onData: (data: WebsocketDataMsg) => void;
  type?: 'timeseries' | 'attributes';
}

export const useTelemetry = ({ entityId, keys, scope, onData, type = 'timeseries' }: UseTelemetryOptions) => {
  const client = useThingsboard();
  const subscriberRef = useRef<TelemetrySubscriber | null>(null);

  useEffect(() => {
    if (!entityId || !entityId.id) return;

    const telemetryService = client.getTelemetryService();
    
    // Determine scope and cmdType
    // Simplified logic: scope is usually for attributes, but telemetry is just 'timeseries'
    const cmdType = type === 'attributes' ? 'ATTRIBUTES' : 'TIMESERIES';
    
    const cmd: SubscriptionCmd = {
      entityType: entityId.entityType,
      entityId: entityId.id,
      keys: keys?.join(','),
      scope: scope,
      type: cmdType
    };

    const subscriber: TelemetrySubscriber = {
      subscriptionCommands: [cmd],
      onData: (data) => {
        onData(data);
      },
      onReconnected: () => {
        // Service handles resubscription, but we can add custom logic here if needed
      }
    };

    subscriberRef.current = subscriber;
    telemetryService.subscribe(subscriber);

    return () => {
      if (subscriberRef.current) {
        telemetryService.unsubscribe(subscriberRef.current);
      }
    };
  }, [client, entityId.id, entityId.entityType, keys?.join(','), scope, type]);
};

