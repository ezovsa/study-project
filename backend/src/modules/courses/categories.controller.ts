import { Controller, Get } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../entities/category.entity';

@Controller('categories')
export class CategoriesController {
  constructor(@InjectRepository(Category) private repo: Repository<Category>) {}

  @Get()
  findAll() {
    return this.repo.find();
  }
}
