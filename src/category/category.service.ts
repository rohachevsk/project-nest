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
    private categories: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto) {
    const category = new Category();
    category.title = dto.title;
    category.slug = dto.slug;
    if (dto.description) {
      category.description = dto.description;
    } else {
      category.description = null;
    }
    if (dto.image) {
      category.image = dto.image;
    } else {
      category.image = null;
    }
    category.is_show = dto.is_show;
    if (dto.parent_id) {
      const parent = new Category();
      parent.id = dto.parent_id;
      category.parent = parent;
    } else {
      category.parent = null;
    }
    return this.categories.save(category);
  }

  findAll() {
    return this.categories.find({ relations: { parent: true } });
  }

  async getCategoryById(id: number) {
    const category = await this.categories.findOne({
      where: { id },
      relations: { parent: true },
    });
    if (category === null) {
      throw new NotFoundException('Category with id ' + id + ' not found');
    }
    return category;
  }

  async getCategoryBySlug(slug: string) {
    const category = await this.categories.findOne({
      where: { slug },
      relations: { parent: true },
    });
    if (category === null) {
      throw new NotFoundException('Category with slug ' + slug + ' not found');
    }
    return category;
  }

  getChildren(id: number) {
    return this.categories.find({
      where: { parent: { id } },
      relations: { parent: true },
    });
  }

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.getCategoryById(id);
    if (dto.title) {
      category.title = dto.title;
    }
    if (dto.slug) {
      category.slug = dto.slug;
    }
    if (dto.description !== undefined) {
      if (dto.description) {
        category.description = dto.description;
      } else {
        category.description = null;
      }
    }
    if (dto.image !== undefined) {
      if (dto.image) {
        category.image = dto.image;
      } else {
        category.image = null;
      }
    }
    if (dto.is_show !== undefined) {
      category.is_show = dto.is_show;
    }
    if (dto.parent_id !== undefined) {
      if (dto.parent_id) {
        const parent = new Category();
        parent.id = dto.parent_id;
        category.parent = parent;
      } else {
        category.parent = null;
      }
    }
    return this.categories.save(category);
  }

  async replace(id: number, dto: CreateCategoryDto) {
    const category = await this.getCategoryById(id);
    category.title = dto.title;
    category.slug = dto.slug;
    if (dto.description) {
      category.description = dto.description;
    } else {
      category.description = null;
    }
    if (dto.image) {
      category.image = dto.image;
    } else {
      category.image = null;
    }
    category.is_show = dto.is_show;
    if (dto.parent_id) {
      const parent = new Category();
      parent.id = dto.parent_id;
      category.parent = parent;
    } else {
      category.parent = null;
    }
    return this.categories.save(category);
  }

  async remove(id: number) {
    const category = await this.getCategoryById(id);
    await this.categories.remove(category);
  }
}
