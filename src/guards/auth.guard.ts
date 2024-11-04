import { CanActivate, ExecutionContext, Injectable, HttpException, HttpStatus } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "../user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly userService: UserService
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = request.headers['authorization']?.split(' ')[1];

        if (!token) {
            throw new HttpException('Token not provided', HttpStatus.UNAUTHORIZED);
        }

        try {
            const payload = this.jwtService.verify(token, { secret: this.configService.get<string>('JWT_SECRET') });
            const user = await this.userService.findOneUser(payload.id);

            if (!user) {
                throw new HttpException('Siz registratsiyadan o\'tmagansiz', HttpStatus.UNAUTHORIZED);
            }

            if (!user.refreshToken) {
                throw new HttpException('Sizning refresh tokeningiz yo\'q, iltimos yangilang', HttpStatus.UNAUTHORIZED);
            }

            request.user = user;
            return true;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new HttpException('Token has expired', HttpStatus.UNAUTHORIZED);
            }
            throw new HttpException('Invalid token', HttpStatus.UNAUTHORIZED);
        }
    }
}
