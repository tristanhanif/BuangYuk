import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from "@nestjs/common";
import { auth } from "@/common/firebaseAdmin";

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new UnauthorizedException("Missing or invalid Authorization header");
    }

    const token = authHeader.split("Bearer ")[1];
    if (!token) {
      throw new UnauthorizedException("Missing token");
    }

    try {
      const decoded = await auth.verifyIdToken(token);
      (request as any).user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }
}
