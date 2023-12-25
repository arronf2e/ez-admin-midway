import {
  IsInt,
  IsNumberString,
  ArrayNotEmpty,
  IsString,
  Min,
  IsOptional,
} from 'class-validator';
import { Expose } from 'class-transformer';

export class CreateDeptDto {
  @IsString()
  @Expose()
  name: string;

  @IsInt()
  @Expose()
  parentId: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Expose()
  orderNum: number;
}

export class UpdateDeptDto {
  @IsInt()
  @Expose()
  id: number;

  @IsString()
  @Expose()
  name: string;

  @IsInt()
  @Expose()
  parentId: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Expose()
  orderNum: number;
}

export class DeleteDeptDto {
  @IsInt()
  @Expose()
  departmentId: number;
}

export class InfoDeptDto {
  @IsNumberString()
  @Expose()
  departmentId: number;
}

export class TransferDeptDto {
  @ArrayNotEmpty()
  @Expose()
  userIds: number[];

  @IsInt()
  @Expose()
  departmentId: number;
}

export class MoveDeptDto {
  @ArrayNotEmpty()
  @Expose()
  depts: MoveDept[];
}

export interface MoveDept {
  id: number;
  parentId: number | null;
}
