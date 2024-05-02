import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";


export async function GET (request: Request) {
    // Get user
    const user = await currentUser();
    if (!user) redirect('/sign-in');

    const period = getHistoryPeriod(user.id)
    return Response.json(period);
}

export type getHistoryPeriodResponseType = Awaited<ReturnType<typeof getHistoryPeriod>>
async function getHistoryPeriod(userId: string) {
    const result = await prisma.monthHistory.findMany({
        where: {
            userId
        },
        select: {
            year: true,
        },
        distinct: ['year'],
        orderBy: {
            year: 'asc'
        }
    })

    const years = result.map(r => r.year)
    //return current year if no history
    if (years.length === 0) return { year: new Date().getFullYear() }
    
    return  years
    
}