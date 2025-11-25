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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TasksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const task_entity_1 = require("./entities/task.entity");
const subject_entity_1 = require("../subjects/entities/subject.entity");
let TasksService = class TasksService {
    taskRepository;
    subjectRepository;
    constructor(taskRepository, subjectRepository) {
        this.taskRepository = taskRepository;
        this.subjectRepository = subjectRepository;
    }
    async create(createTaskDto) {
        const subject = await this.subjectRepository.findOne({
            where: { subjectId: createTaskDto.subjectId }
        });
        if (!subject) {
            throw new common_1.NotFoundException(`Subject with ID ${createTaskDto.subjectId} not found`);
        }
        const task = this.taskRepository.create({
            ...createTaskDto,
            subject
        });
        return await this.taskRepository.save(task);
    }
    async findAll() {
        return await this.taskRepository.find({
            relations: ['subject'],
        });
    }
    async findByAlertRange(start, end) {
        return await this.taskRepository.find({
            where: { delivery_date: (0, typeorm_2.Between)(start, end) },
        });
    }
    async findOne(id) {
        const task = await this.taskRepository.findOne({
            where: { task_id: id },
            relations: ['subject'],
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${id} not found`);
        }
        return task;
    }
    async findBySubject(subjectId) {
        return await this.taskRepository.find({
            where: { subject: { subjectId } },
            relations: ['subject'],
        });
    }
    async update(id, updateTaskDto) {
        const task = await this.findOne(id);
        Object.assign(task, updateTaskDto);
        return await this.taskRepository.save(task);
    }
    async remove(id) {
        const task = await this.findOne(id);
        await this.taskRepository.remove(task);
    }
};
exports.TasksService = TasksService;
exports.TasksService = TasksService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __param(1, (0, typeorm_1.InjectRepository)(subject_entity_1.Subject)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], TasksService);
//# sourceMappingURL=tasks.service.js.map