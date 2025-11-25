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
exports.AttachmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const attachment_entity_1 = require("./entities/attachment.entity");
const task_entity_1 = require("../tasks/entities/task.entity");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const supabase_service_1 = require("../supabase/supabase.service");
let AttachmentsService = class AttachmentsService {
    attachmentRepository;
    taskRepository;
    supabaseService;
    constructor(attachmentRepository, taskRepository, supabaseService) {
        this.attachmentRepository = attachmentRepository;
        this.taskRepository = taskRepository;
        this.supabaseService = supabaseService;
    }
    async uploadToSupabase(file, taskId) {
        const task = await this.taskRepository.findOne({
            where: { task_id: taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${taskId} not found`);
        }
        const sanitizedName = file.originalname
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${Date.now()}-${sanitizedName}`;
        const bucketName = 'studymate-attachments';
        const { data, error } = await this.supabaseService
            .getClient()
            .storage
            .from(bucketName)
            .upload(fileName, file.buffer, {
            contentType: file.mimetype,
            upsert: false,
        });
        if (error) {
            throw new common_1.BadRequestException(`Failed to upload to Supabase: ${error.message}`);
        }
        const { data: urlData } = this.supabaseService
            .getClient()
            .storage
            .from(bucketName)
            .getPublicUrl(fileName);
        const attachment = this.attachmentRepository.create({
            fileName: fileName,
            originalName: file.originalname,
            fileUrl: urlData.publicUrl,
            mimeType: file.mimetype,
            fileSize: file.size,
            task,
        });
        return await this.attachmentRepository.save(attachment);
    }
    async create(createAttachmentDto) {
        const task = await this.taskRepository.findOne({
            where: { task_id: createAttachmentDto.taskId },
        });
        if (!task) {
            throw new common_1.NotFoundException(`Task with ID ${createAttachmentDto.taskId} not found`);
        }
        const attachment = this.attachmentRepository.create({
            ...createAttachmentDto,
            task,
        });
        return await this.attachmentRepository.save(attachment);
    }
    async findAll() {
        return await this.attachmentRepository.find({
            relations: ['task'],
        });
    }
    async findOne(id) {
        const attachment = await this.attachmentRepository.findOne({
            where: { attachmentId: id },
            relations: ['task'],
        });
        if (!attachment) {
            throw new common_1.NotFoundException(`Attachment with ID ${id} not found`);
        }
        return attachment;
    }
    async findByTask(taskId) {
        return await this.attachmentRepository.find({
            where: { task: { task_id: taskId } },
            relations: ['task'],
        });
    }
    async update(id, updateAttachmentDto) {
        const attachment = await this.findOne(id);
        Object.assign(attachment, updateAttachmentDto);
        return await this.attachmentRepository.save(attachment);
    }
    async remove(id) {
        const attachment = await this.findOne(id);
        if (attachment.fileUrl.includes('supabase')) {
            const fileName = attachment.fileUrl.split('/').pop();
            if (!fileName) {
                throw new common_1.BadRequestException('Invalid file URL');
            }
            const { error } = await this.supabaseService
                .getClient()
                .storage
                .from('studymate-attachments')
                .remove([fileName]);
            if (error) {
                console.error(`Error deleting from Supabase: ${error.message}`);
            }
            else {
                console.log(`File deleted from Supabase: ${fileName}`);
            }
        }
        else {
            const filePath = (0, path_1.join)(process.cwd(), attachment.fileUrl);
            try {
                await (0, promises_1.unlink)(filePath);
                console.log(`Local file deleted: ${filePath}`);
            }
            catch (error) {
                console.error(`Could not delete local file: ${error.message}`);
            }
        }
        await this.attachmentRepository.remove(attachment);
    }
};
exports.AttachmentsService = AttachmentsService;
exports.AttachmentsService = AttachmentsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(attachment_entity_1.Attachment)),
    __param(1, (0, typeorm_1.InjectRepository)(task_entity_1.Task)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        supabase_service_1.SupabaseService])
], AttachmentsService);
//# sourceMappingURL=attachments.service.js.map