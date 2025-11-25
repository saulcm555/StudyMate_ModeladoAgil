"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var AlertsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AlertsService = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("typeorm");
const alert_entity_1 = require("./entities/alert.entity");
const tasks_service_1 = require("../tasks/tasks.service");
const dayjs_1 = __importDefault(require("dayjs"));
const typeorm_2 = require("@nestjs/typeorm");
let AlertsService = AlertsService_1 = class AlertsService {
    alertsRepository;
    tasksService;
    logger = new common_1.Logger(AlertsService_1.name);
    constructor(alertsRepository, tasksService) {
        this.alertsRepository = alertsRepository;
        this.tasksService = tasksService;
    }
    async create() {
        this.logger.log('Revisando tareas próximas a vencer...');
        const alertDayStart = (0, dayjs_1.default)().add(2, 'day').startOf('day').toDate();
        const alertDayEnd = (0, dayjs_1.default)().add(2, 'day').endOf('day').toDate();
        console.log(alertDayStart);
        console.log(alertDayEnd);
        const tasks = await this.tasksService.findByAlertRange(alertDayStart, alertDayEnd);
        if (!tasks.length) {
            this.logger.log('No hay tareas proximas a vencer');
            return;
        }
        for (const task of tasks) {
            await this.alertsRepository.insert({
                task: task,
                alertDate: alertDayStart,
                message: `The task "${task.title}" is due in 3 days.`,
            });
            this.logger.log(`Notification created for task ${task.title}`);
        }
    }
};
exports.AlertsService = AlertsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AlertsService.prototype, "create", null);
exports.AlertsService = AlertsService = AlertsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_2.InjectRepository)(alert_entity_1.Alert)),
    __metadata("design:paramtypes", [typeorm_1.Repository,
        tasks_service_1.TasksService])
], AlertsService);
//# sourceMappingURL=alerts.service.js.map