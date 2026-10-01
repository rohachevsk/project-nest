import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from './entities/product.entity.js';
import { Category } from '../category/entities/category.entity.js';
import { CreateProductDto } from './dto/product_create.req.dto.js';
import { UpdateProductDto } from './dto/product_update.req.dto.js';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private products: Repository<Product>,
    @InjectRepository(Category)
    private categories: Repository<Category>,
  ) {}

  async findCategory(category_id: number) {
    const category = await this.categories.findOneBy({ id: category_id });
    if (category === null) {
      throw new NotFoundException(
        'Category with id ' + category_id + ' not found',
      );
    }
    return category;
  }

  async create(dto: CreateProductDto) {
    const category = await this.findCategory(dto.category_id);
    const product = new Product();
    product.title = dto.title;
    product.slug = dto.slug;
    if (dto.description) {
      product.description = dto.description;
    } else {
      product.description = null;
    }
    product.price = dto.price;
    if (dto.image) {
      product.image = dto.image;
    } else {
      product.image = null;
    }
    product.is_show = dto.is_show;
    product.category = category;
    return this.products.save(product);
  }

  findAll() {
    return this.products.find({ relations: { category: true } });
  }

  async getProductById(id: number) {
    const product = await this.products.findOne({
      where: { id },
      relations: { category: true },
    });
    if (product === null) {
      throw new NotFoundException('Product with id ' + id + ' not found');
    }
    return product;
  }

  async replace(id: number, dto: CreateProductDto) {
    const product = await this.getProductById(id);
    const category = await this.findCategory(dto.category_id);
    product.title = dto.title;
    product.slug = dto.slug;
    if (dto.description) {
      product.description = dto.description;
    } else {
      product.description = null;
    }
    product.price = dto.price;
    if (dto.image) {
      product.image = dto.image;
    } else {
      product.image = null;
    }
    product.is_show = dto.is_show;
    product.category = category;
    return this.products.save(product);
  }

  async update(id: number, dto: UpdateProductDto) {
    const product = await this.getProductById(id);
    if (dto.title) {
      product.title = dto.title;
    }
    if (dto.slug) {
      product.slug = dto.slug;
    }
    if (dto.description !== undefined) {
      if (dto.description) {
        product.description = dto.description;
      } else {
        product.description = null;
      }
    }
    if (dto.price !== undefined) {
      product.price = dto.price;
    }
    if (dto.image !== undefined) {
      if (dto.image) {
        product.image = dto.image;
      } else {
        product.image = null;
      }
    }
    if (dto.is_show !== undefined) {
      product.is_show = dto.is_show;
    }
    if (dto.category_id !== undefined) {
      product.category = await this.findCategory(dto.category_id);
    }
    return this.products.save(product);
  }

  async remove(id: number) {
    const product = await this.getProductById(id);
    await this.products.remove(product);
  }
}
