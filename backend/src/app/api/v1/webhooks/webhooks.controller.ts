import { Controller, Post, Body } from "@nestjs/common";

@Controller("v1/webhooks")
export class WebhooksController {
  @Post("payment")
  async handlePaymentWebhook(@Body() body: any) {
    return {
      success: true,
      received: body,
    };
  }

  @Post("notification")
  async handleNotificationWebhook(@Body() body: any) {
    return {
      success: true,
      received: body,
    };
  }
}