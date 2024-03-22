import { IsNumber, IsOptional, Min } from 'class-validator';

export class GetProjectsDto {
  @IsOptional()
  @IsNumber()
  @Min(0)
  readonly from?: number;

  @IsOptional()
  @IsNumber()
  @Min(1)
  readonly size?: number;
}
