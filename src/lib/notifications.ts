// 浏览器推送通知服务

export class NotificationService {
  private static instance: NotificationService;
  private permission: NotificationPermission = 'default';

  private constructor() {
    this.checkPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private checkPermission() {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      this.permission = Notification.permission;
    }
  }

  public async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (this.permission === 'granted') {
      return true;
    }

    if (this.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      return permission === 'granted';
    }

    return false;
  }

  public async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (this.permission !== 'granted') {
      const granted = await this.requestPermission();
      if (!granted) {
        return;
      }
    }

    const defaultOptions: NotificationOptions = {
      icon: '/favicon.ico',
      badge: '/favicon.ico',
      tag: 'support-notification',
      requireInteraction: false,
      ...options
    };

    try {
      const notification = new Notification(title, defaultOptions);
      
      // 自动关闭通知
      setTimeout(() => {
        notification.close();
      }, 5000);

      // 点击通知时的处理
      notification.onclick = () => {
        window.focus();
        notification.close();
        if (options?.data?.action) {
          options.data.action();
        }
      };

    } catch (error) {
      console.error('Error showing notification:', error);
    }
  }

  public showSupportMessage(senderName: string, message: string, sessionId: string) {
    this.showNotification(
      `New message from ${senderName}`,
      {
        body: message.length > 100 ? message.substring(0, 100) + '...' : message,
        icon: '/icons/support.png',
        tag: `support-${sessionId}`,
        data: {
          sessionId,
          action: () => {
            // 可以在这里添加点击通知后的操作，比如打开客服窗口
            console.log('Notification clicked for session:', sessionId);
          }
        }
      }
    );
  }

  public showAgentAssigned(agentName: string, sessionId: string) {
    this.showNotification(
      'Support Agent Assigned',
      {
        body: `${agentName} has been assigned to help you`,
        icon: '/icons/agent.png',
        tag: `agent-${sessionId}`,
        data: { sessionId }
      }
    );
  }

  public showSessionClosed(sessionId: string) {
    this.showNotification(
      'Support Session Closed',
      {
        body: 'Your support session has been closed. Thank you for contacting us!',
        icon: '/icons/closed.png',
        tag: `closed-${sessionId}`,
        data: { sessionId }
      }
    );
  }

  public isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  public getPermission(): NotificationPermission {
    return this.permission;
  }
}
