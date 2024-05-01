"use server"

import prisma from "@/lib/prisma"
import { UpdateUserCurrencySchema } from "@/schema/userSettings"
import { currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"

export async function UpdateUserCurrency(currency: string) {
    // Validate the currency
    const parsedBody = UpdateUserCurrencySchema.safeParse({ currency })
    if (!parsedBody.success) {
        throw parsedBody.error
    }

    // Get the current user and validate
    const user = await currentUser()
    if (!user) redirect("/sign-in")
    
    // Update the user's currency
    const userSettings = await prisma.userSettings.update({
        where: {
            userId: user.id
        },
        data: {
            currency,
        }
    })

    return userSettings
}