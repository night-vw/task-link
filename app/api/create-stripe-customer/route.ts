import { NextRequest, NextResponse } from "next/server";
import initStripe from "stripe";
import { supabaseServer } from "@/utils/supabaseServer";

export async function POST(req: NextRequest) {
    const supabase = supabaseServer();
    const query = req.nextUrl.searchParams.get("API_ROUTE_SECRET");

    if (query !== process.env.API_ROUTE_SECRET) {
        return NextResponse.json({
            message: "APIを叩く権限がありません。"
        }, { status: 401 });
    }

    const stripe = new initStripe(process.env.STRIPE_SECRET_KEY!);
    
    let data;
    try {
        data = await req.json();
    } catch (error) {
        return NextResponse.json({
            message: "リクエストボディの解析中にエラーが発生しました。"
        }, { status: 400 });
    }

    const { id, email } = data.record;

    try {
        const customer = await stripe.customers.create({
            email,
        });

        await supabase.from("profile").update({
            stripe_customer: customer.id,
        }).eq("id", id);

        console.log(customer.id);

        return NextResponse.json({
            message: `stripe customer created: ${customer.id}`
        });
    } catch (error) {
        console.error("Stripe API error:", error);
        return NextResponse.json({
            message: "Stripe APIエラーが発生しました。"
        }, { status: 500 });
    }
}
