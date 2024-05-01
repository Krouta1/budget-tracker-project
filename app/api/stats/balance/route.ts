import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
import exp from "constants";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
    // Get user
    const user = await currentUser();
    if (!user) redirect('/sign-in');

    //search params
    const {searchParams} = new URL(request.url);
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    //validate dates
    const queryParams = OverviewQuerySchema.safeParse({ from, to });
    if (!queryParams.success) return Response.json(queryParams.error.message, { status: 400 });
    
    const stats = await getBalanceStats(user.id, queryParams.data.from, queryParams.data.to);

    return Response.json(stats);
}


export type getBalanceStatsResponseType = Awaited<ReturnType<typeof getBalanceStats>>
async function getBalanceStats(userId: string, from: Date, to: Date) {
    const totals = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
            userId,
            date: {
                gte: from, // greater than or equal to
                lte: to, // less than or equal to
            }
        },
        _sum: {
            amount: true
        }
    })
    return {
        expense: totals.find(t => t.type === 'expense')?._sum.amount || 0,
        income: totals.find(t => t.type === 'income')?._sum.amount || 0,
    }
}