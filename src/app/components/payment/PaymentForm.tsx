'use client';

import { useState } from 'react';
import {
  useStripe,
  useElements,
  PaymentElement,
  Elements,
} from '@stripe/react-stripe-js';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { AlertCircle, CreditCard, Loader2 } from 'lucide-react';
import { TokenPackage, createPaymentIntent, formatPrice } from '@/app/lib/stripe';

interface PaymentFormProps {
  package: TokenPackage;
  onSuccess: (tokens: number) => void;
  onCancel: () => void;
  clientSecret?: string;
}

export const PaymentForm = ({ package: pkg, onSuccess, onCancel, clientSecret: externalClientSecret }: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(externalClientSecret || null);
  const [paymentInitialized, setPaymentInitialized] = useState(!!externalClientSecret);

  // Payment initialization is now handled by the parent component

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsLoading(true);
    setError(null);

    const { error: submitError } = await elements.submit();

    if (submitError) {
      setError(submitError.message || 'Payment failed');
      setIsLoading(false);
      return;
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      clientSecret,
      confirmParams: {
        return_url: `${window.location.origin}/wizard?payment=success`,
      },
      redirect: 'if_required', // Only redirect if additional authentication is needed
    });

    if (confirmError) {
      setError(confirmError.message || 'Payment failed');
      setIsLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded immediately
      onSuccess(pkg.tokens);
    } else if (paymentIntent && paymentIntent.status === 'requires_action') {
      // Payment requires additional authentication, Stripe will handle the redirect
      // The user will be redirected back with payment=success if successful
    } else {
      // Payment is processing, wait for webhook to complete
      setError('Payment is being processed. Please wait a moment and refresh the page.');
      setIsLoading(false);
    }
  };

  // Payment initialization is handled by parent component

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <CreditCard className="w-5 h-5" />
          <span>Payment Details</span>
        </CardTitle>
        <CardDescription>
          Secure payment powered by Stripe
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {clientSecret && (
            <div className="border rounded-lg p-4">
              <PaymentElement 
                options={{
                  layout: 'tabs'
                }}
              />
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-red-800">Payment Error</p>
                <p className="text-sm text-red-600">{error}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!stripe || isLoading}
              className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  Pay {formatPrice(pkg.priceInCents)}
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
