import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['authorization']?.split(' ')[1];

        if (!token) {
            throw new UnauthorizedException('Token taqdim etilmagan');
        }

        try {
            const secretKey = this.configService.get<string>('JWT_SECRET');
            const payload = this.jwtService.verify(token, { secret: secretKey });
            console.log('Dekodlangan JWT payload:', payload); // Payloadni log qilish
            request.user = payload;
            return true;
        } catch (error) {
            throw new UnauthorizedException('Notogri yoki amal qilish muddati tugagan token');
        }
    }
}
