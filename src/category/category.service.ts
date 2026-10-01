import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity.js';
import { CreateCategoryDto } from './dto/category_create.req.dto.js';
import { UpdateCategoryDto } from './dto/category_get.res.dto.js';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly repository: Repository<Category>,
  ) {}

  create(dto: CreateCategoryDto): Promise<Category> {
    const category = this.repository.create({
      title: dto.title,
      slug: dto.slug,
      description: dto.description ?? null,
      image: dto.image ?? null,
      is_show: dto.is_show,
      parent: dto.parent_id ? ({ id: dto.parent_id } as Category) : null,
    });
    return this.repository.save(category);
  }

  findAll(): Promise<Category[]> {
    return this.repository.find({ relations: { parent: true } });
  }

  async getCategoryById(id: number): Promise<Category> {
    const category = await this.repository.findOne({
      where: { id },
      relations: { parent: true },
    });
    if (!category) {
      throw new NotFoundException(`Category with id ${id} not found`);
    }
    return category;
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category> {
    const category = await this.getCategoryById(id);

    if (dto.title !== undefined) category.title = dto.title;
    if (dto.slug !== undefined) category.slug = dto.slug;
    if (dto.description !== undefined)
      category.description = dto.description ?? null;
    if (dto.image !== undefined) category.image = dto.image ?? null;
    if (dto.is_show !== undefined) category.is_show = dto.is_show;
    if (dto.parent_id !== undefined) {
      category.parent = dto.parent_id
        ? ({ id: dto.parent_id } as Category)
        : null;
    }

    return this.repository.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.getCategoryById(id);
    await this.repository.remove(category);
  }

  async getCategoryBySlug(slug: string): Promise<Category> {
    const category = await this.repository.findOne({
      where: { slug },
      relations: { parent: true },
    });
    if (!category) {
      throw new NotFoundException(`Category with slug ${slug} not found`);
    }
    return category;
  }

  getChildren(id: number): Promise<Category[]> {
    return this.repository.find({
      where: { parent: { id } },
      relations: { parent: true },
    });
  }
}
