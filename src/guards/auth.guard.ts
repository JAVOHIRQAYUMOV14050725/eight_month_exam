import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['authorization']?.split(' ')[1]; // `Bearer <token>` formatini olish

        if (!token) {
            throw new UnauthorizedException('Token not provided');
        }

        try {
            const payload = this.jwtService.verify(token); // Tokenni tekshirish va foydalanuvchini aniqlash
            request.user = payload; // Foydalanuvchi ma'lumotlarini requestga qo'shish
            return true;
        } catch (error) {
            throw new UnauthorizedException('Invalid or expired token');
        }
    }
}
