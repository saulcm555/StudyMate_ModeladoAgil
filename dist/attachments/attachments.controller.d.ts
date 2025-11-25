import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
export declare class AttachmentsController {
    private readonly attachmentsService;
    constructor(attachmentsService: AttachmentsService);
    uploadFile(taskId: string, file: Express.Multer.File): Promise<import("./entities/attachment.entity").Attachment>;
    uploadToSupabase(taskId: string, file: Express.Multer.File): Promise<import("./entities/attachment.entity").Attachment>;
    create(createAttachmentDto: CreateAttachmentDto): Promise<import("./entities/attachment.entity").Attachment>;
    findAll(): Promise<import("./entities/attachment.entity").Attachment[]>;
    findOne(id: string): Promise<import("./entities/attachment.entity").Attachment>;
    findByTask(taskId: string): Promise<import("./entities/attachment.entity").Attachment[]>;
    update(id: string, updateAttachmentDto: UpdateAttachmentDto): Promise<import("./entities/attachment.entity").Attachment>;
    remove(id: string): Promise<void>;
}
