import { SetMetadata } from '@nestjs/common';
import { User_Role } from '../enums/user.role.enum'; // Adjust the path as necessary

export const Roles = (...roles: User_Role[]) => SetMetadata('roles', roles);