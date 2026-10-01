import { PartialType } from '@nestjs/mapped-types';
import { CreateProductDto } from './product_create.req.dto.js';

export class UpdateProductDto extends PartialType(CreateProductDto) {}
