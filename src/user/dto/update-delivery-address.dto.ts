import {
  IsInt,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateDeliveryAddressDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  countryId?: number | null;

  @IsOptional()
  @IsInt()
  @Min(1)
  cityId?: number | null;

  @IsOptional()
  @IsString()
  @MaxLength(255)
  street?: string | null;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  postalCode?: string | null;
}
