/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign } from './schema/stripe.schema';
import { CreateCheckoutDto } from './dto/create-checkout-session.dto';
import { User } from '../users/schemas/user.schema';

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
    @InjectModel(User.name) private userModel: Model<User>,
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
        success_url: `http://localhost:3001/fundraising/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `http://localhost:3001/fundraising/stripe/cancel`,
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

  // ========== CONNECTED ACCOUNT ONBOARDING ==========
  async createAccountLink(userId: string) {
    const user = await this.userModel.findById(userId);
    if (!user) throw new Error('User not found');

    if (user.stripeAccountId) {
      return { accountId: user.stripeAccountId };
    }

    // Always create a new Stripe account, but don't save it yet
    const account = await stripe.accounts.create({
      type: 'standard',
      email: user.email,
    });

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: account.id,
      refresh_url: `http://localhost:3001/fundraising/stripe/reauth/${userId}`,
      return_url: `http://localhost:3001/fundraising/stripe/return/${userId}?accountId=${account.id}`,
      type: 'account_onboarding',
    });

    // Notice: we do NOT save account.id yet
    return { url: accountLink.url };
  }

  async getAccountStatus(userId: string, accountId: string) {
    const account = await stripe.accounts.retrieve(accountId);

    // Only save if user actually finished onboarding
    if (account.details_submitted) {
      await this.userModel.findByIdAndUpdate(userId, {
        stripeAccountId: account.id,
      });
    }

    return {
      detailsSubmitted: account.details_submitted,
      payoutsEnabled: account.payouts_enabled,
      chargesEnabled: account.charges_enabled,
      accountId: account.id,
    };
  }
}
