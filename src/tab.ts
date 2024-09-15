    export class Tab {
        id: number = -1;
        url: string = "";
        pendingUrl: string = "";
        createdAt: number;

        constructor(tab: chrome.tabs.Tab) {
            Object.assign(this, tab);
            this.createdAt = Date.now();
        }

        get uptime(): number {
            return Date.now() - this.createdAt;
        }

        get msFromLastAccessed(): number {
            //@ts-ignore
            return Date.now() - Math.round(this.lastAccessed);
        }
    };
