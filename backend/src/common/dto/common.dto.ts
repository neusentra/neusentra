import { Expose } from "class-transformer";
import { IsString } from "class-validator";

export class CountDto {
  count: number;
}

export class IdDto {
  @Expose()
  @IsString()
  id: string | number;
}