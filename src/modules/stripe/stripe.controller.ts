import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { StripeService } from './stripe.service';
import { CreateCheckoutDto } from './dto/create-checkout-session.dto';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @Post('checkout')
  async createCheckoutSession(@Body() dto: CreateCheckoutDto) {
    return this.stripeService.createCheckoutSession(dto);
  }

  @Post('webhook')
  async handleWebhook(@Body() body: any) {
    return this.stripeService.handleStripeWebhook(body);
  }

  @Post('confirm-payment')
  async confirmPayment(@Body('sessionId') sessionId: string) {
    return this.stripeService.confirmPayment(sessionId);
  }

  @Get('connect/:userId')
  connect(@Param('userId') userId: string) {
    return this.stripeService.createAccountLink(userId);
  }

  @Get('account-status/:userId/:accountId')
  async status(
    @Param('userId') userId: string,
    @Param('accountId') accountId: string,
  ) {
    return await this.stripeService.getAccountStatus(userId, accountId);
  }
}
