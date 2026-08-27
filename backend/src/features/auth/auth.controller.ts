import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";

@Controller("auth")
export class AuthController {
  @Get("profile")
  @UseGuards(AuthGuard)
  getProfile() {
    return {
      success: true,
      message: "Auth endpoint - profile retrieved",
    };
  }
}
