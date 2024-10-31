import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { UserService } from "src/user/user.service";

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
            throw new UnauthorizedException('Token not provided');
        }

        try {
            const payload = this.jwtService.verify(token, { secret: this.configService.get<string>('JWT_SECRET') });
            const user = await this.userService.findOneUser(payload.id);

            if (!user) {
                throw new UnauthorizedException('User not found or deleted');
            }

            // `request.user` ni belgilash
            request.user = user;
            return true;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token has expired');
            }
            throw new UnauthorizedException('Invalid token');
        }
    }



}
