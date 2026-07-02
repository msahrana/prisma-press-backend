import express, { Application, Request, Response } from 'express';
import { commentRouter } from './modules/comments/comment.route';
import { userRouter } from './modules/user/user.route';
import { authRouter } from './modules/auth/auth.route';
import { postRouter } from './modules/posts/post.route';
import { notFound } from './middleware/notFound';
import cookieParser from 'cookie-parser';
import config from './config';
import cors from 'cors';
import { globalErrorHandler } from './middleware/globalErrorHandler';
import { subscriptionRouter } from './modules/subscription/subscription.route';
import { stripe } from './lib/stripe';

const app: Application = express();

app.use(
    cors({
        origin: config.APP_URL,
        credentials: true,
    }),
);

const endpointSecret = config.STRIPE_WEBHOOK_SECRET;

// app.post(
//     'api/subscription/webhook',
//     express.raw({ type: 'application/json' }),
//     (request, response) => {
//         let event;
//         console.log(event, 'stripe request body');
//         console.log(request.headers, 'stripe req headers');
//         if (endpointSecret) {
//             // Get the signature sent by Stripe
//             const signature = request.headers['stripe-signature']!;
//             try {
//                 event = stripe.webhooks.constructEvent(
//                     request.body,
//                     signature,
//                     endpointSecret,
//                 );
//             } catch (err: any) {
//                 console.log(
//                     `⚠️  Webhook signature verification failed.`,
//                     err.message,
//                 );
//                 return response.status(400).json({
//                     message: err.message,
//                 });
//             }

//             console.log(event, 'event after try block');
//             // Handle the event
//             switch (event.type) {
//                 case 'payment_intent.succeeded':
//                     const paymentIntent = event.data.object;
//                     // Then define and call a method to handle the successful payment intent.
//                     // handlePaymentIntentSucceeded(paymentIntent);
//                     break;
//                 case 'payment_method.attached':
//                     const paymentMethod = event.data.object;
//                     // Then define and call a method to handle the successful attachment of a PaymentMethod.
//                     // handlePaymentMethodAttached(paymentMethod);
//                     break;
//                 // ... handle other event types
//                 default:
//                     console.log(`Unhandled event type ${event.type}`);
//             }

//             // Return a response to acknowledge receipt of the event
//             response.json({ received: true });
//         }
//     },
// );

app.use('/api/subscription/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => {
    res.send('Hello, Welcome our Prisma Press Backend server...!');
});

app.use('/api/users', userRouter);
app.use('/api/auth', authRouter);
app.use('/api/posts', postRouter);
app.use('/api/comments', commentRouter);
app.use('/api/subscription', subscriptionRouter);

app.use(notFound);
app.use(globalErrorHandler);

export default app;
