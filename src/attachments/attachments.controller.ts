import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AttachmentsService } from './attachments.service';
import { CreateAttachmentDto } from './dto/create-attachment.dto';
import { UpdateAttachmentDto } from './dto/update-attachment.dto';

@Controller('attachments')
export class AttachmentsController {
  constructor(private readonly attachmentsService: AttachmentsService) {}
  //Enddpoint de subida de archivos
  @Post('upload/:taskId')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads', // Carpeta destinada a guardar los archivos
        filename: (_req, file, cb) => {
          //Esto genera el nombre único para evitar conflictos entre archivos
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.fieldname}-${uniqueSuffix}${ext}`;
          cb(null, filename);
        },
      }),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
      },
      fileFilter: (req, file, cb) => {
        // Permite solo ciertos tipos de archivos
        const allowedMimes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
        const mimeValid = allowedMimes.test(file.mimetype);
        const extValid = allowedMimes.test(extname(file.originalname).toLowerCase());
        
        if (mimeValid && extValid) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type. Allowed: images, PDF, Word, TXT, ZIP'), false);
        }
      },
    }),
  )
  async uploadFile(
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Crear el DTO con la información del archivo
    const createAttachmentDto: CreateAttachmentDto = {
      fileName: file.filename,
      originalName: file.originalname,
      fileUrl: `./uploads/${file.filename}`,
      mimeType: file.mimetype,
      fileSize: file.size,
      taskId,
    };

    return await this.attachmentsService.create(createAttachmentDto);
  }

  // 🆕 Endpoint para subir archivos a SUPABASE (en la nube)
  @Post('upload/supabase/:taskId')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB máximo
      },
      fileFilter: (_req, file, cb) => {
        // Permite solo ciertos tipos de archivos
        const allowedMimes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|zip/;
        const mimeValid = allowedMimes.test(file.mimetype);
        const extValid = allowedMimes.test(extname(file.originalname).toLowerCase());
        
        if (mimeValid && extValid) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Invalid file type. Allowed: images, PDF, Word, TXT, ZIP'), false);
        }
      },
    }),
  )
  async uploadToSupabase(
    @Param('taskId') taskId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    // Llamar al servicio que sube a Supabase
    return await this.attachmentsService.uploadToSupabase(file, taskId);
  }

  // Endpoint original para crear attachment manualmente (sin archivo físico)
  @Post()
  @HttpCode(HttpStatus.CREATED)
  create(@Body() createAttachmentDto: CreateAttachmentDto) {
    return this.attachmentsService.create(createAttachmentDto);
  }

  @Get()
  findAll() {
    return this.attachmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.attachmentsService.findOne(id);
  }

  @Get('task/:taskId')
  findByTask(@Param('taskId') taskId: string) {
    return this.attachmentsService.findByTask(taskId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateAttachmentDto: UpdateAttachmentDto,
  ) {
    return this.attachmentsService.update(id, updateAttachmentDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id') id: string) {
    return this.attachmentsService.remove(id);
  }
}
