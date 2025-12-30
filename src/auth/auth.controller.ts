import { Controller, Post, Body, HttpCode, HttpStatus, Get, UseGuards, Request, Patch, Put } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) { }

    @Post('register')
    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered' })
    @ApiResponse({ status: 409, description: 'Email already in use' })
    register(@Body() registerDto: RegisterDto) {
        return this.authService.register(registerDto);
    }

    @Post('login')
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: 'Login with email and password' })
    @ApiResponse({ status: 200, description: 'User successfully logged in' })
    @ApiResponse({ status: 401, description: 'Invalid credentials' })
    login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get current user profile' })
    @ApiResponse({ status: 200, description: 'Profile retrieved' })
    getProfile(@Request() req: any) {
        return this.authService.findUserById(req.user.userId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('profile')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update user profile' })
    updateProfile(@Request() req: any, @Body() data: { firstName?: string; lastName?: string }) {
        return this.authService.updateProfile(req.user.userId, data);
    }

    @UseGuards(JwtAuthGuard)
    @Put('change-password')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Change user password' })
    changePassword(@Request() req: any, @Body() data: { oldPassword: string; newPassword: string }) {
        return this.authService.changePassword(req.user.userId, data);
    }
}

