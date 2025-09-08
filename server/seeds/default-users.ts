import { db } from "../db";
import { users } from "@shared/schema";
import { eq, or } from "drizzle-orm";
import { scrypt, randomBytes } from "crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

export async function seedDefaultUsers() {
  try {
    console.log('🔑 Seeding default admin and user accounts...');
    
    // Check if default users already exist
    const existingUsers = await db
      .select()
      .from(users)
      .where(
        or(
          eq(users.username, 'admin'),
          eq(users.username, 'user')
        )
      );
    
    // Create admin user if doesn't exist
    const adminExists = existingUsers.find(u => u.username === 'admin');
    if (!adminExists) {
      const hashedAdminPassword = await hashPassword('admin123');
      await db.insert(users).values({
        username: 'admin',
        email: 'admin@example.com',
        password: hashedAdminPassword,
        displayName: 'Administrator',
        isAdmin: true,
        isVerified: true,
        verifiedAt: new Date(),
        bio: 'Site Administrator',
        status: 'active',
        accountType: 'local',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Created admin user (username: admin, password: admin123)');
    } else {
      console.log('ℹ️  Admin user already exists, skipping');
    }
    
    // Create regular user if doesn't exist
    const userExists = existingUsers.find(u => u.username === 'user');
    if (!userExists) {
      const hashedUserPassword = await hashPassword('user123');
      await db.insert(users).values({
        username: 'user',
        email: 'user@example.com',
        password: hashedUserPassword,
        displayName: 'Demo User',
        isAdmin: false,
        isVerified: true,
        verifiedAt: new Date(),
        bio: 'Demo user account',
        status: 'active',
        accountType: 'local',
        createdAt: new Date(),
        updatedAt: new Date()
      });
      console.log('✅ Created user account (username: user, password: user123)');
    } else {
      console.log('ℹ️  User account already exists, skipping');
    }

    console.log('🎉 Default users seeded successfully!');

  } catch (error) {
    console.error('❌ Error seeding default users:', error);
    throw error;
  }
}