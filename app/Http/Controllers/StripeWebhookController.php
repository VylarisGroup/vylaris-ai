<?php

namespace App\Http\Controllers;

use App\Services\Billing\StripeService;
use Illuminate\Http\Request;
use Illuminate\Http\Response;

class StripeWebhookController extends Controller
{
    public function __invoke(Request $request, StripeService $stripe): Response
    {
        $event = $stripe->verifyWebhook($request->getContent(), $request->header('Stripe-Signature'));

        if ($event === null) {
            return response('Ungültige Signatur.', 400);
        }

        $stripe->handleEvent($event);

        return response('ok');
    }
}
