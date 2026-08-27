import { Controller, Get, UseGuards } from "@nestjs/common";
import { AuthGuard } from "@/common/guards/authGuard";
import { CarbonCalculator } from "@/common/services/carbonCalculator";

@Controller("v1/categories")
export class CategoriesController {
  private calculator = new CarbonCalculator();

  @Get()
  @UseGuards(AuthGuard)
  getCategories() {
    const mockCategories = [
      { id: "paper_cardboard", name: "Kertas Cardboard", group: "Kertas" },
      { id: "plastic", name: "Plastik", group: "Plastik" },
      { id: "glass", name: "Kaca", group: "Kaca" },
    ];

    return {
      success: true,
      data: mockCategories,
    };
  }
}