import * as signalR from '@microsoft/signalr';

export interface NotificationPayload {
  requestId?: string;
  studentName?: string;
  studentCode?: string;
  totalQuantity?: number;
  isLargeRequest?: boolean;
  assetNames?: string;
  ticketId?: string;
  assetId?: string;
  assetName?: string;
  reportedBy?: string;
  urgency?: string;
  description?: string;
  status?: string;
  message?: string;
  email?: string;
  ipAddress?: string;
  attempts?: number;
}

type NotificationCallback = (data: NotificationPayload) => void;

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private currentHubUrl: string | null = null;
  private listeners: { [event: string]: Set<NotificationCallback> } = {};

  public startConnection(role: number, userId: string) {
    const hubUrl = `http://localhost:5054/r/notifications?role=${role}&userId=${userId}`;

    // If connection exists and is already connected or connecting, and the URL is identical, reuse it
    if (
      this.connection &&
      this.connection.state !== signalR.HubConnectionState.Disconnected &&
      this.currentHubUrl === hubUrl
    ) {
      return;
    }

    // Stop previous connection if URL differs
    if (this.connection) {
      this.connection.stop().catch(() => {});
    }

    this.currentHubUrl = hubUrl;

    const customLogger: signalR.ILogger = {
      log(logLevel: signalR.LogLevel, message: string) {
        // Suppress benign connection abort logs from the internal SignalR library
        if (
          message.includes('stopped during negotiation') ||
          message.includes('Failed to start the connection') ||
          message.includes('Connection was stopped before')
        ) {
          return;
        }

        // Only log warnings and errors
        if (logLevel === signalR.LogLevel.Error) {
          console.error('[SignalR]', message);
        } else if (logLevel === signalR.LogLevel.Warning) {
          console.warn('[SignalR]', message);
        }
      }
    };

    this.connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl)
      .withAutomaticReconnect()
      .configureLogging(customLogger)
      .build();

    this.connection.start()
      .then(() => console.log('SignalR connected successfully.'))
      .catch(err => {
        // Suppress benign AbortError during React StrictMode / Fast Refresh unmounts
        const errMsg = err?.toString() || '';
        if (errMsg.includes('AbortError') || errMsg.includes('stopped during negotiation')) {
          // Log silently or as debug info
          console.debug('SignalR connection start was aborted (normal during reload).');
        } else {
          console.error('SignalR connection failed:', err);
        }
      });

    // Register active event listeners on the HubConnection
    const events = [
      'ReceiveNewRequest',
      'ReceiveRequestStatusChanged',
      'ReceiveReturnConfirmation',
      'ReceiveFailureReport',
      'ReceiveMaintenanceAssignment',
      'ReceiveAnnouncement',
      'ReceiveBruteForceAlert'
    ];

    events.forEach(event => {
      this.connection?.on(event, (data: NotificationPayload) => {
        const callbacks = this.listeners[event];
        if (callbacks) {
          callbacks.forEach(cb => cb(data));
        }
      });
    });
  }

  public subscribe(event: string, callback: NotificationCallback) {
    if (!this.listeners[event]) {
      this.listeners[event] = new Set();
    }
    this.listeners[event].add(callback);

    return () => {
      this.listeners[event]?.delete(callback);
    };
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop()
        .then(() => console.log('SignalR connection stopped.'))
        .catch(err => {
          const errMsg = err?.toString() || '';
          if (!errMsg.includes('stopped during negotiation')) {
            console.error('Error stopping SignalR:', err);
          }
        });
      this.connection = null;
      this.currentHubUrl = null;
    }
  }
}

export const signalRService = new SignalRService();
