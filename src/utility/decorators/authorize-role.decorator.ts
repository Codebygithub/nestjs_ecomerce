import { SetMetadata } from "@nestjs/common";

export const AuthorizeRoles = (...roles:string[]) => SetMetadata('allowedRoles',roles)
export const AuthorizePermission = (...permissions:string[]) => SetMetadata('allowedPermissions',permissions)