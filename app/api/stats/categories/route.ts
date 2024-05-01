import prisma from "@/lib/prisma";
import { OverviewQuerySchema } from "@/schema/overview";
import { currentUser } from "@clerk/nextjs/server";
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

        const stats = await getCategoriesStats(user.id, queryParams.data.from, queryParams.data.to);

    return Response.json(stats);
}

export type getCategoriesStatsResponseType = Awaited<ReturnType<typeof getCategoriesStats>>
async function getCategoriesStats(userId: string, from: Date, to: Date) {
    const stats = await prisma.transaction.groupBy({
        by: ['type',"category","categoryIcon"],
        where: {
            userId,
            date: {
                gte: from, // greater than or equal to
                lte: to, // less than or equal to
            }
        },
        _sum: {
            amount: true
        },
        orderBy: {
            _sum: {
                amount: 'desc'
            },
        }
    })
    return stats
}