// app/api/migrate-all-users/route.ts
import { clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { secret } = await req.json();
    
    if (secret !== process.env.MIGRATION_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const client = await clerkClient();
    
    // Get all users from Clerk
    const { data: users } = await client.users.getUserList({ limit: 500 });
    
    let migratedCount = 0;
    let alreadyOnboardedCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        const alreadyOnboarded = (user.publicMetadata as { onboarded?: boolean })?.onboarded;
        
        if (alreadyOnboarded === true) {
          console.log(`⏭️  Already onboarded: ${user.id}`);
          alreadyOnboardedCount++;
          continue;
        }

        // Update metadata
        await client.users.updateUser(user.id, {
          publicMetadata: {
            onboarded: true,
          },
        });

        // 🔥 Force session refresh by getting user's sessions and marking them for refresh
        const sessions = await client.sessions.getSessionList({ userId: user.id });
        for (const session of sessions.data) {
          // Revoke old sessions to force re-authentication with new metadata
          await client.sessions.revokeSession(session.id);
        }
        
        migratedCount++;
        console.log(`✅ Migrated: ${user.id}`);
        
      } catch (error) {
        errorCount++;
        console.error(`❌ Error migrating user ${user.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      migrated: migratedCount,
      alreadyOnboarded: alreadyOnboardedCount,
      errors: errorCount,
      total: users.length,
    });
  } catch (error) {
    console.error("❌ Migration error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}