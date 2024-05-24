
export interface header {
    xRapidAPIKey: string;
    xRapidAPIHost: string;
}

export class Project {
    id: string;
    name: string;
    healthcheckUrl: string;
    siteUrl: string;
    assignedTo: string;
    isActive: boolean;
    sendMailifUnhealthy: boolean;
    durationInMinute: number;
    maxResponseTimeInSecond: number;
    headersSerialized: string;
    headers: header[];
}