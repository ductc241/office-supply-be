import { Injectable } from "@nestjs/common";
import { WarehouseRepository } from "./warehouse.repository";

@Injectable()
export class WarehouseService {
  constructor(private readonly warehouseRepository: WarehouseRepository) {}
}
