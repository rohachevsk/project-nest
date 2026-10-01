import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';

export class CategoryCreateReqDto {
  //Не меньше 5-ти символів
  //Не більше 20-ти символів (зробити 2 способами)
  //спосіб 1: @MinLength + @MaxLength, спосіб 2: @Length
  @IsString({ message: 'Поле повинно бути строкою' })
  @MinLength(5, { message: 'Мінімум 5 символів (спосіб 1: MinLength)' })
  @MaxLength(20, { message: 'Максимум 20 символів (спосіб 1: MaxLength)' })
  @Length(5, 20, {
    message: 'Поле повинно бути від 5 до 20 символів (спосіб 2: Length)',
  })
  title: string;

  @IsNotEmpty({ message: 'Поле повинно бути заповнено' })
  @MinLength(3)
  @MaxLength(30)
  //pattern в slug можуть входити літери латинського
  //алфавіт, цифри, -, _
  @IsString({ message: 'Поле повинно бути строкою' })
  @Matches(/^[A-Za-z0-9_-]+$/, {
    message: 'slug може містити лише літери латинського алфавіту, цифри, - та _',
  })
  slug: string;

  //рядок, не порожній
  @IsOptional()
  @IsString({ message: 'Поле повинно бути строкою' })
  @IsNotEmpty({ message: 'Поле повинно бути заповнено' })
  image?: string;

  //необов'язковий опис
  @IsOptional()
  @IsString({ message: 'Поле повинно бути строкою' })
  description?: string;

  //протестувати
  @IsBoolean({ message: 'Поле повинно бути або true або false' })
  is_show: boolean;

  //дозволяється ціле число >0 або null
  @ValidateIf((o) => o.parent_id !== null && o.parent_id !== undefined)
  @IsInt({ message: 'parent_id повинно бути цілим числом' })
  @Min(1, { message: 'parent_id повинно бути більше 0' })
  parent_id: number | null;
}

// Аліас, щоб не ламати існуючий імпорт у контролері
export { CategoryCreateReqDto as CreateCategoryDto };
