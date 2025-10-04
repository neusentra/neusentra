import { Body, Controller, Get, HttpStatus, Post, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { NeuSentraValidationPipe } from 'src/pipes/neusentra-validation.pipe';
import { CheckInitializationStatusResponse } from './dto/check-initialization.dto';
import { InitializeSuperAdminDto, InitializeSuperAdminResponseDto } from './dto/initialize-superadmin.dto';
import { LoginRequestDto, LoginResponseDto } from './dto/auth.dto';
import { GetLoginId } from 'src/decorators/get-token-data.decorator';
import { NeuSentraAuthGuard } from 'src/guards/auth.guard';

@ApiTags('Auth')
@Controller({ path: 'auth', version: '1' })
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Get('initialization-status')
    @ApiOperation({ summary: 'Get application auth initialization status' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Indicates whether the application has been initialized',
        type: CheckInitializationStatusResponse,
    })
    async checkStatus(): Promise<CheckInitializationStatusResponse> {
        return this.authService.checkInitializationStatus();
    }

    @Post('initialize')
    @ApiOperation({ summary: 'Initialize the system with a Super Admin account' })
    @ApiBody({ type: InitializeSuperAdminDto })
    @ApiResponse({
        status: HttpStatus.CREATED,
        description: 'Super Admin initialized successfully',
        type: InitializeSuperAdminResponseDto,
    })
    @UsePipes(new NeuSentraValidationPipe())
    async initialize(
        @Body() body: InitializeSuperAdminDto,
    ): Promise<InitializeSuperAdminResponseDto> {
        return this.authService.initializeSuperAdmin(body);
    }

    @Post('login')
    @UsePipes(new NeuSentraValidationPipe())
    @ApiOperation({ summary: 'User login with username and password' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User logged in successfully and received tokens',
        type: LoginResponseDto,
    })
    async login(@Body() body: LoginRequestDto): Promise<LoginResponseDto> {
        return this.authService.userLogin(body);
    }
    
    @Post('logout')
    @UseGuards(NeuSentraAuthGuard)
    @UsePipes(new NeuSentraValidationPipe({transform: true, whitelist: true}))
    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User logged out successfully',
    })
    async logout(@GetLoginId() loginId: string): Promise<void> {
        return this.authService.logout(loginId);
    }
}
