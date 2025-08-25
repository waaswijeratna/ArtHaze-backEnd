/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign } from './schema/stripe.schema';
import { CreateCheckoutDto } from './dto/create-checkout-session.dto';

const stripe = new Stripe(
  'sk_test_51RSdqz06JJqqu9XHEvoPweuJIQLA8ry7kquRf2x8G0hDWSlSqNvcJmLgo67IcCsvCUDbKz6tiep93I9ENDvEtnmI00fMnI93wS',
  {
    apiVersion: '2025-04-30.basil',
  },
);

@Injectable()
export class StripeService {
  constructor(
    @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
  ) {}

  async createCheckoutSession(dto: CreateCheckoutDto) {
    try {
      const campaign = await this.campaignModel.findById(dto.campaignId);
      if (!campaign) throw new Error('Campaign not found');

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: dto.amount * 100,
              product_data: {
                name: campaign.title,
              },
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `http://localhost:3000/fundraising/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3000/fundraising/stripe/cancel`,
        payment_intent_data: {
          transfer_data: {
            destination: campaign.stripeAccountId,
          },
        },
        metadata: { campaignId: dto.campaignId },
      });

      return { url: session.url };
    } catch (err) {
      console.error('Stripe error:', err);
      throw err;
    }
  }

  async handleStripeWebhook(body: any) {
    const event = body;

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;
      const amount = (session.amount_total ?? 0) / 100;

      const metadata = session.metadata;
      const campaignId = metadata?.campaignId;

      console.log(
        'Payment succeeded for amount:',
        amount + 'campaignId:',
        campaignId,
      );

      if (campaignId) {
        await this.campaignModel.findByIdAndUpdate(campaignId, {
          $inc: { fundedAmount: amount },
        });
      }
    }

    return { received: true };
  }

  async confirmPayment(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status === 'paid') {
        const amount = (session.amount_total ?? 0) / 100;
        const campaignId = session.metadata?.campaignId;

        if (campaignId) {
          await this.campaignModel.findByIdAndUpdate(campaignId, {
            $inc: { fundedAmount: amount },
          });
        }

        return {
          success: true,
          message: 'Payment confirmed & campaign updated',
        };
      }

      return { success: false, message: 'Payment not completed yet' };
    } catch (err) {
      console.error('Error confirming payment:', err);
      throw err;
    }
  }
}
