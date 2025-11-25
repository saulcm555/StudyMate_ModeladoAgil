import { Repository } from 'typeorm';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';
import { Attachment } from './entities/attachment.entity';
import { Task } from '../tasks/entities/task.entity';
import { SupabaseService } from '../supabase/supabase.service';
export declare class AttachmentsService {
    private readonly attachmentRepository;
    private readonly taskRepository;
    private readonly supabaseService;
    constructor(attachmentRepository: Repository<Attachment>, taskRepository: Repository<Task>, supabaseService: SupabaseService);
    uploadToSupabase(file: Express.Multer.File, taskId: string): Promise<Attachment>;
    create(createAttachmentDto: CreateAttachmentDto): Promise<Attachment>;
    findAll(): Promise<Attachment[]>;
    findOne(id: string): Promise<Attachment>;
    findByTask(taskId: string): Promise<Attachment[]>;
    update(id: string, updateAttachmentDto: UpdateAttachmentDto): Promise<Attachment>;
    remove(id: string): Promise<void>;
}
