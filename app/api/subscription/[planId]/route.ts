import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import initStripe from "stripe";

export async function GET(req: NextRequest, context: { params: { planId: string } }) {
    const supabase = createRouteHandlerClient({ cookies });
    const { data } = await supabase.auth.getUser();
    const user = data.user;

    if(!user) {
        return NextResponse.json("Unauthorized",{status:401})
    }

    const { data: stripe_customer_data } =
        await supabase.from("profile")
            .select("stripe_customer")
            .eq("id", user?.id)
            .single();

    const { planId } = context.params;

    const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);

    const session = await stripe.checkout.sessions.create({
        customer: stripe_customer_data?.stripe_customer,
        mode: "subscription",
        payment_method_types: ["card"],
        line_items: [{ price: planId, quantity: 1 }],
        success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success`,
        cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancelled`,
    });

    return NextResponse.json({ id: session.id });
}
