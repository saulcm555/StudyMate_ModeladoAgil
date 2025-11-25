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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Task = exports.TaskPriority = exports.TaskState = void 0;
const typeorm_1 = require("typeorm");
const subject_entity_1 = require("../../subjects/entities/subject.entity");
const alert_entity_1 = require("../../alerts/entities/alert.entity");
const attachment_entity_1 = require("../../attachments/entities/attachment.entity");
var TaskState;
(function (TaskState) {
    TaskState["PENDING"] = "pending";
    TaskState["IN_PROGRESS"] = "in_progress";
    TaskState["COMPLETED"] = "completed";
    TaskState["CANCELLED"] = "cancelled";
})(TaskState || (exports.TaskState = TaskState = {}));
var TaskPriority;
(function (TaskPriority) {
    TaskPriority["LOW"] = "low";
    TaskPriority["MEDIUM"] = "medium";
    TaskPriority["HIGH"] = "high";
    TaskPriority["URGENT"] = "urgent";
})(TaskPriority || (exports.TaskPriority = TaskPriority = {}));
let Task = class Task {
    task_id;
    subject;
    title;
    description;
    start_date;
    delivery_date;
    priority;
    state;
    alerts;
    attachments;
};
exports.Task = Task;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Task.prototype, "task_id", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => subject_entity_1.Subject, (subject) => subject.tasks, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'subjectId' }),
    __metadata("design:type", subject_entity_1.Subject)
], Task.prototype, "subject", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Task.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Task.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Task.prototype, "start_date", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Task.prototype, "delivery_date", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TaskPriority,
        default: TaskPriority.MEDIUM,
    }),
    __metadata("design:type", String)
], Task.prototype, "priority", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TaskState,
        default: TaskState.PENDING,
    }),
    __metadata("design:type", String)
], Task.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => alert_entity_1.Alert, (alert) => alert.task),
    __metadata("design:type", Array)
], Task.prototype, "alerts", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => attachment_entity_1.Attachment, (attachment) => attachment.task, {
        cascade: true,
    }),
    __metadata("design:type", Array)
], Task.prototype, "attachments", void 0);
exports.Task = Task = __decorate([
    (0, typeorm_1.Entity)('tasks')
], Task);
//# sourceMappingURL=task.entity.js.map