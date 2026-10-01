import { PartialType } from '@nestjs/mapped-types';
import { CreateCategoryDto } from './category_create.req.dto.js';

export class UpdateCategoryDto extends PartialType(CreateCategoryDto) { }
