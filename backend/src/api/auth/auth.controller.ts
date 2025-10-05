import { Body, Controller, Get, HttpStatus, Post, Req, Res, UseGuards, UsePipes } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { NeuSentraValidationPipe } from 'src/pipes/neusentra-validation.pipe';
import { CheckInitializationStatusResponse } from './dto/check-initialization.dto';
import { InitializeSuperAdminDto, InitializeSuperAdminResponseDto } from './dto/initialize-superadmin.dto';
import { LoginRequestDto, LoginResponseDto, RefreshTokenResponseDto } from './dto/auth.dto';
import { GetLoginId } from 'src/decorators/get-token-data.decorator';
import { NeuSentraAuthGuard } from 'src/guards/auth.guard';
import { type FastifyReply } from 'fastify';
import { Cookies } from 'src/decorators/cookies.decorator';

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
        @Res() reply: FastifyReply,
    ): Promise<InitializeSuperAdminResponseDto> {
        return this.authService.initializeSuperAdmin(body, reply);
    }

    @Post('login')
    @UsePipes(new NeuSentraValidationPipe())
    @ApiOperation({ summary: 'User login with username and password' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User logged in successfully and received tokens',
        type: LoginResponseDto,
    })
    async login(
        @Body() body: LoginRequestDto,
        @Res() reply: FastifyReply
    ): Promise<LoginResponseDto> {
        return this.authService.userLogin(body, reply);
    }

    @Post('refresh-token')
    @ApiOperation({ summary: 'Refresh access token using refresh token cookie' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'Returns a new access token if refresh token is valid',
        type: RefreshTokenResponseDto,
    })
    async refreshToken(
        @Cookies('refreshToken') token: string,
        @Res() reply: FastifyReply,
    ): Promise<void> {
        await this.authService.refreshAccessToken(token, reply);
    }
    
    @Post('logout')
    @UseGuards(NeuSentraAuthGuard)
    @UsePipes(new NeuSentraValidationPipe({transform: true, whitelist: true}))
    @ApiOperation({ summary: 'User logout' })
    @ApiResponse({
        status: HttpStatus.OK,
        description: 'User logged out successfully',
    })
    async logout(
        @GetLoginId() loginId: string,
        @Res() reply: FastifyReply
    ): Promise<void> {
        return this.authService.logout(loginId, reply);
    }
}
