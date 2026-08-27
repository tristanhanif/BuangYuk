import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { auth } from "firebase-admin";

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private readonly allowedRoles: string[]) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user as Record<string, any>;

    if (!user || !user.customClaims) {
      return false;
    }

    const userRole = user.customClaims.role;
    return this.allowedRoles.includes(userRole);
  }
}