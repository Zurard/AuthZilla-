import { eq } from 'drizzle-orm';
import { db } from './index';
import { users, type NewUser, type User } from './schema';
import { createHash } from 'crypto';

// User operations
export class UserService {
  
  // Helper function to hash password with SHA256
  private static hashPassword(password: string): string {
    return createHash('sha256').update(password).digest('hex');
  }
  
  // Create a new user with hashed password
  static async createUser(userData: { email: string; password: string }): Promise<User> {
    // Hash the password before storing
    const hashedPassword = this.hashPassword(userData.password);
    
    const newUser: NewUser = {
      email: userData.email,
      password: hashedPassword,
    };

    const [user] = await db.insert(users).values(newUser).returning();
    return user;
  }

  // Find user by email
  static async findUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  // Verify user password
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    const hashedPlainPassword = this.hashPassword(plainPassword);
    return hashedPlainPassword === hashedPassword;
  }

  // Update user's shared secret for 2FA
  static async updateSharedSecret(userId: string, sharedSecret: string): Promise<void> {
    await db.update(users)
      .set({ 
        sharedSecret,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Update user's last login
  static async updateLastLogin(userId: string): Promise<void> {
    await db.update(users)
      .set({ 
        lastLogin: new Date(),
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Verify user email
  static async verifyUser(userId: string): Promise<void> {
    await db.update(users)
      .set({ 
        isVerified: true,
        updatedAt: new Date()
      })
      .where(eq(users.id, userId));
  }

  // Get all users (admin function)
  static async getAllUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  // Delete user
  static async deleteUser(userId: string): Promise<void> {
    await db.delete(users).where(eq(users.id, userId));
  }
}
