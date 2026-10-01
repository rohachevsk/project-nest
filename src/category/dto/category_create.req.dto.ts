import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';

export class CategoryCreateReqDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  image?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsBoolean()
  is_show: boolean;

  @ValidateIf((o) => o.parent_id !== null && o.parent_id !== undefined)
  @IsInt()
  @Min(1)
  parent_id: number | null;
}

export { CategoryCreateReqDto as CreateCategoryDto };
