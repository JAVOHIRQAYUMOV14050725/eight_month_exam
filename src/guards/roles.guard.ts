
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User_Role } from '../enums/user.role.enum';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.get<User_Role[]>('roles', context.getHandler());
        if (!requiredRoles) {
            return true; 
        }
       


        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.role) {
            throw new ForbiddenException('You do not have permission to access this resource'); 
        }

        const hasRole = () => requiredRoles.includes(user.role);

        
        if (hasRole()) {
            return true;
        } else {
            throw new ForbiddenException('You do not have permission to access this resource');
        }
    }
}

