import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { UserPermissionsDto } from 'src/common/dto/user-permission.dto';

export class InitializeSuperAdminDto {
  @ApiProperty({
    description: 'Full name of the Super Admin',
    example: 'Groot',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(25)
  @IsNotEmpty()
  fullname: string;

  @ApiProperty({
    description: 'Unique username for Super Admin login',
    example: 'groot',
  })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  @IsNotEmpty()
  username: string;

  @ApiProperty({
    description: "Strong password that meets the system's requirements",
    example: 'S3cur3#P@55',
  })
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  @IsNotEmpty()
  password: string;
}

export class InitializeSuperAdminResponseDto extends SuccessResponseDto {
  @ApiProperty({
    type: Object,
    description: 'Access token returned after successful initialization',
    example: { accessToken: 'string' },
  })
  declare data: {
    accessToken: string;
    permissions: UserPermissionsDto;
  };
}
