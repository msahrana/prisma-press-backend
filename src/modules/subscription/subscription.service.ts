import Stripe from 'stripe';
import config from '../../config';
import { prisma } from '../../lib/prisma';
import { stripe } from '../../lib/stripe';
import {
    handleChangeSubscription,
    handleCheckoutCompleted,
} from '../../utils/subscription';

const createCheckoutSessionIntoDB = async (userId: string) => {
    const transactionResults = await prisma.$transaction(async (tx) => {
        // check user
        const user = await tx.user.findUniqueOrThrow({
            where: {
                id: userId,
            },
            include: {
                subscription: true,
            },
            omit: {
                password: true,
            },
        });

        // old subscriber
        let stripeCustomerId = user.subscription?.stripeCustomerId;

        if (!stripeCustomerId) {
            // new subscriber create
            const customer = await stripe.customers.create({
                name: user.name,
                email: user.email,
                metadata: { userId: user.id },
            });

            stripeCustomerId = customer.id;
        }

        // session create
        const session = await stripe.checkout.sessions.create({
            line_items: [
                {
                    price: config.STRIPE_PRODUCT_PRICE_ID,
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            customer: stripeCustomerId,
            payment_method_types: ['card'],
            success_url: `${config.APP_URL}/premium?success=true`,
            cancel_url: `${config.APP_URL}/payment?success=false`,
            metadata: { userId: user.id },
        });

        return session.url;
    });

    return {
        paymentUrl: transactionResults,
    };
};

const handleWebhookIntoDB = async (payload: Buffer, signature: string) => {
    const endpointSecret = config.STRIPE_WEBHOOK_SECRET;
    const event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret,
    );

    // Handle the event
    switch (event.type) {
        case 'checkout.session.completed':
            console.log(event.data.object);
            //Occurs when a Checkout Session has been successfully completed.
            await handleCheckoutCompleted(event.data.object);

            break;
        case 'customer.subscription.updated':
            //Occurs whenever a subscription changes (e.g., switching from one plan to another, or changing the status from trial to active).
            await handleChangeSubscription(event.data.object);

            break;

        /*
            To test this run this command in terminal
            stripe subscriptions cancel sub_1PsYourSubIdHere (paste existing subscribed sub id)
            */

        case 'customer.subscription.deleted':
            //Occurs whenever a customer’s subscription ends
            await handleChangeSubscription(event.data.object);

            break;

        /*
       To test this run this command in terminal
       stripe subscriptions cancel sub_1PsYourSubIdHere (paste existinmg subscribed sub id)
       */
        default:
            // Unexpected event type
            console.log(
                `No events matched. Unhandled event type ${event.type}`,
            );
            break;
    }
};



const getSubscriptionStatusIntoDB = async (userId: string) => {
    const isSubscriptionExist = await prisma.subscription.findUniqueOrThrow({
        where: {
            userId,
        },
    });

    const isActive =
        isSubscriptionExist.status === 'ACTIVE' &&
        isSubscriptionExist.currentPeriodEnd &&
        new Date(isSubscriptionExist.currentPeriodEnd) > new Date();

    return {
        status: isSubscriptionExist.status,
        isSubscribed: isActive,
        currentPeriodEnd: isSubscriptionExist.currentPeriodEnd,
    };
};

export const subscriptionService = {
    createCheckoutSessionIntoDB,
    handleWebhookIntoDB,
    getSubscriptionStatusIntoDB,
};
