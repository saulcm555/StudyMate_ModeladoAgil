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
exports.AttachmentsController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const attachments_service_1 = require("./attachments.service");
const create_attachment_dto_1 = require("./dto/create-attachment.dto");
const update_attachment_dto_1 = require("./dto/update-attachment.dto");
let AttachmentsController = class AttachmentsController {
    attachmentsService;
    constructor(attachmentsService) {
        this.attachmentsService = attachmentsService;
    }
    async uploadFile(taskId, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        const createAttachmentDto = {
            fileName: file.filename,
            originalName: file.originalname,
            fileUrl: `./uploads/${file.filename}`,
            mimeType: file.mimetype,
            fileSize: file.size,
            taskId,
        };
        return await this.attachmentsService.create(createAttachmentDto);
    }
    async uploadToSupabase(taskId, file) {
        if (!file) {
            throw new common_1.BadRequestException('No file uploaded');
        }
        return await this.attachmentsService.uploadToSupabase(file, taskId);
    }
    create(createAttachmentDto) {
        return this.attachmentsService.create(createAttachmentDto);
    }
    findAll() {
        return this.attachmentsService.findAll();
    }
    findOne(id) {
        return this.attachmentsService.findOne(id);
    }
    findByTask(taskId) {
        return this.attachmentsService.findByTask(taskId);
    }
    update(id, updateAttachmentDto) {
        return this.attachmentsService.update(id, updateAttachmentDto);
    }
    remove(id) {
        return this.attachmentsService.remove(id);
    }
};
exports.AttachmentsController = AttachmentsController;
__decorate([
    (0, common_1.Post)('upload/:taskId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (_req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
                cb(null, filename);
            },
        }),
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (req, file, cb) => {
            const allowedMimes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
            const mimeValid = allowedMimes.test(file.mimetype);
            const extValid = allowedMimes.test((0, path_1.extname)(file.originalname).toLowerCase());
            if (mimeValid && extValid) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Invalid file type. Allowed: images, PDF, Word, TXT, ZIP'), false);
            }
        },
    })),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "uploadFile", null);
__decorate([
    (0, common_1.Post)('upload/supabase/:taskId'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('file', {
        limits: {
            fileSize: 10 * 1024 * 1024,
        },
        fileFilter: (_req, file, cb) => {
            const allowedMimes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
            const mimeValid = allowedMimes.test(file.mimetype);
            const extValid = allowedMimes.test((0, path_1.extname)(file.originalname).toLowerCase());
            if (mimeValid && extValid) {
                cb(null, true);
            }
            else {
                cb(new common_1.BadRequestException('Invalid file type. Allowed: images, PDF, Word, TXT, ZIP'), false);
            }
        },
    })),
    __param(0, (0, common_1.Param)('taskId')),
    __param(1, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AttachmentsController.prototype, "uploadToSupabase", null);
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_attachment_dto_1.CreateAttachmentDto]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "findOne", null);
__decorate([
    (0, common_1.Get)('task/:taskId'),
    __param(0, (0, common_1.Param)('taskId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "findByTask", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_attachment_dto_1.UpdateAttachmentDto]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, common_1.HttpCode)(common_1.HttpStatus.NO_CONTENT),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], AttachmentsController.prototype, "remove", null);
exports.AttachmentsController = AttachmentsController = __decorate([
    (0, common_1.Controller)('attachments'),
    __metadata("design:paramtypes", [attachments_service_1.AttachmentsService])
], AttachmentsController);
//# sourceMappingURL=attachments.controller.js.map