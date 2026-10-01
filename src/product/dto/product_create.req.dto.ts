import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
} from 'class-validator';

export class ProductCreateReqDto {
  @IsString()
  title: string;

  @IsString()
  slug: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsInt()
  @Min(0)
  price: number;

  @IsOptional()
  @IsString()
  image?: string;

  @IsBoolean()
  is_show: boolean;

  @IsInt()
  @Min(1)
  category_id: number;
}

export { ProductCreateReqDto as CreateProductDto };
