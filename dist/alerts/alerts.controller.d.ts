import { AlertsService } from './alerts.service';
export declare class AlertsController {
    private readonly alertsService;
    constructor(alertsService: AlertsService);
    testAlerts(): Promise<void>;
}
