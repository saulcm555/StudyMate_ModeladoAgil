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
exports.Attachment = void 0;
const typeorm_1 = require("typeorm");
const task_entity_1 = require("../../tasks/entities/task.entity");
let Attachment = class Attachment {
    attachmentId;
    fileName;
    originalName;
    fileUrl;
    mimeType;
    fileSize;
    uploadedAt;
    task;
};
exports.Attachment = Attachment;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Attachment.prototype, "attachmentId", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attachment.prototype, "fileName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attachment.prototype, "originalName", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attachment.prototype, "fileUrl", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Attachment.prototype, "mimeType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'bigint' }),
    __metadata("design:type", Number)
], Attachment.prototype, "fileSize", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], Attachment.prototype, "uploadedAt", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => task_entity_1.Task, (task) => task.attachments, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'taskId' }),
    __metadata("design:type", task_entity_1.Task)
], Attachment.prototype, "task", void 0);
exports.Attachment = Attachment = __decorate([
    (0, typeorm_1.Entity)('attachments')
], Attachment);
//# sourceMappingURL=attachment.entity.js.map