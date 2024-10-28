    import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
    import { Reflector } from '@nestjs/core';
    import { Observable } from 'rxjs';

    @Injectable()
    export class RolesGuard implements CanActivate {
        constructor(private reflector: Reflector) { }

        canActivate(context: ExecutionContext): boolean | Promise<boolean> | Observable<boolean> {
            const requiredRoles = this.reflector.get<string[]>('roles', context.getHandler());
            
            if (!requiredRoles) {
                return true; 
            }

            const { user } = context.switchToHttp().getRequest();

            const hasRole = () => user.roles.some((role: string) => requiredRoles.includes(role));
            
            console.log(`mana user:${user},  mana user.roles:${user.roles},   mana hasRole:${hasRole}`);
            
            if (!user || !user.roles || !hasRole()) {
                throw new ForbiddenException('You do not have permission to access this resource');
            }

            return true;
        }
    }
