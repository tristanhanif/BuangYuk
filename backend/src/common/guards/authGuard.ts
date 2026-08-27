import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { auth } from "@/common/firebaseAdmin";

@Injectable()
export class AuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return false;
    }

    const token = authHeader.split("Bearer ")[1];
    try {
      const decoded = await auth.verifyIdToken(token);
      (request as any).user = decoded;
      return true;
    } catch {
      return false;
    }
  }
}
