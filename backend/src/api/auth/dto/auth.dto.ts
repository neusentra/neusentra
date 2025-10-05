import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsString, MaxLength, MinLength } from 'class-validator';
import { SuccessResponseDto } from 'src/common/dto/success-response.dto';
import { UserPermissionsDto } from 'src/common/dto/user-permission.dto';

export class LoginRequestDto {
  @ApiProperty({ example: 'groot', description: 'Username of the user' })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  username: string;

  @ApiProperty({ description: 'Password of the user' })
  @IsString()
  @MinLength(8)
  @MaxLength(16)
  password: string;
}

export class UserInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  loginId?: string;

  @ApiProperty()
  fullname: string;

  @ApiProperty()
  username: string;

  @ApiProperty()
  @Expose({ name: 'password_hash' })
  passwordHash: string;

  @ApiProperty()
  role: string;

  @ApiProperty({ type: () => UserPermissionsDto })
  permissions: UserPermissionsDto;
}

export class LoginDataDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsIn...' })
  accessToken: string;

  @ApiProperty({ type: () => UserPermissionsDto })
  permissions: UserPermissionsDto;
}

export class LoginResponseDto extends SuccessResponseDto {
  @ApiProperty({ type: () => LoginDataDto })
  declare data: LoginDataDto;
}

export class PayloadDto {
  loginId: string;
  userId: string;
  name: string;
  role: string;
}
class AccessTokenDto {
  accessToken: string;
}

export class RefreshTokenResponseDto extends SuccessResponseDto {
  @ApiProperty({ type: () => AccessTokenDto })
  declare data: AccessTokenDto;
}

class AccessTokenDto {
    accessToken: string;
}

export class RefreshTokenResponseDto extends SuccessResponseDto {
    @ApiProperty({ type: () => AccessTokenDto })
    declare data: AccessTokenDto;
}