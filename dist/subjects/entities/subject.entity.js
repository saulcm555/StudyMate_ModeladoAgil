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
exports.Subject = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../../users/entities/user.entity");
const task_entity_1 = require("../../tasks/entities/task.entity");
let Subject = class Subject {
    subjectId;
    student;
    tasks;
    name;
    assignedTeacher;
    schedule;
    color;
};
exports.Subject = Subject;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Subject.prototype, "subjectId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.Student, (student) => student.subjects, {
        onDelete: 'CASCADE',
    }),
    (0, typeorm_1.JoinColumn)({ name: 'studentId' }),
    __metadata("design:type", user_entity_1.Student)
], Subject.prototype, "student", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => task_entity_1.Task, (task) => task.subject),
    __metadata("design:type", Array)
], Subject.prototype, "tasks", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Subject.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Subject.prototype, "assignedTeacher", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Array)
], Subject.prototype, "schedule", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Subject.prototype, "color", void 0);
exports.Subject = Subject = __decorate([
    (0, typeorm_1.Entity)('subjects')
], Subject);
//# sourceMappingURL=subject.entity.js.map