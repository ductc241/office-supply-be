import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";

import { BrandRepository } from "./brand.repository";
import ERROR_MESSAGE from "src/shared/constants/error";
import { UpdateBrandDto } from "./dto/update-brand.dto";
import { CreateBrandDto } from "./dto/create-brand.dto";
import { IPagination } from "src/shared/pagination/pagination.interface";
import { QueryBrandDto } from "./dto/query-brand.dto";
import { replaceQuerySearch } from "src/shared/helpers/common";
import { PaginationHeaderHelper } from "src/shared/pagination/pagination.helper";

@Injectable()
export class BrandService {
  constructor(
    private readonly brandRepository: BrandRepository,
    private readonly paginationHeaderHelper: PaginationHeaderHelper,
  ) {}

  async create(createBrandDto: CreateBrandDto) {
    const exists = await this.brandRepository.exists({
      name: createBrandDto.name,
    });
    if (exists) {
      throw new BadRequestException("Brand name already exists");
    }
    return this.brandRepository.create(createBrandDto);
  }

  async query(query: QueryBrandDto, pagination: IPagination) {
    const queryParams = {
      ...(query?.name && {
        name: {
          $options: "i",
          $regex: replaceQuerySearch(query.name),
        },
      }),
    };

    const brands = await this.brandRepository.find(queryParams, {
      ...(pagination && { skip: pagination.startIndex }),
      ...(pagination && { limit: pagination.perPage }),
    });

    const brandCount = await this.brandRepository.count(queryParams);
    const responseHeaders = this.paginationHeaderHelper.getHeaders(
      pagination,
      brandCount,
    );

    return { headers: responseHeaders, items: brands };
  }

  async findOne(id: string) {
    const brand = await this.brandRepository.findById(id);
    if (!brand) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);
    return brand;
  }

  async update(id: string, updateBrandDto: UpdateBrandDto) {
    const brand = await this.brandRepository.updateById(id, updateBrandDto);
    if (!brand) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);
    return brand;
  }

  async remove(id: string) {
    const brand = await this.brandRepository.deleteById(id);
    if (!brand) throw new NotFoundException(ERROR_MESSAGE.NOT_FOUND);
    return brand;
  }
}
