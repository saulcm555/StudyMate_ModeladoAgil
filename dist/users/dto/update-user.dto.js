"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateStudentsDto = void 0;
const mapped_types_1 = require("@nestjs/mapped-types");
const create_user_dto_1 = require("./create-user.dto");
class UpdateStudentsDto extends (0, mapped_types_1.PartialType)(create_user_dto_1.CreateStudentDto) {
}
exports.UpdateStudentsDto = UpdateStudentsDto;
//# sourceMappingURL=update-user.dto.js.map