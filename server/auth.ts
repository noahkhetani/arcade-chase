import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { db } from './db';
import { users } from '../shared/schema';
import type { RegisterUser, LoginUser, User } from '../shared/schema';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static async createUser(userData: RegisterUser): Promise<User | null> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, userData.username))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error('Username already exists');
      }

      const existingEmail = await db
        .select()
        .from(users)
        .where(eq(users.email, userData.email))
        .limit(1);

      if (existingEmail.length > 0) {
        throw new Error('Email already exists');
      }

      // Hash password and create user
      const passwordHash = await this.hashPassword(userData.password);
      
      const newUser = await db
        .insert(users)
        .values({
          username: userData.username,
          email: userData.email,
          passwordHash,
        })
        .returning();

      return newUser[0] || null;
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  static async authenticateUser(credentials: LoginUser): Promise<User | null> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.username, credentials.username))
        .limit(1);

      if (user.length === 0) {
        return null;
      }

      const isValidPassword = await this.verifyPassword(
        credentials.password,
        user[0].passwordHash
      );

      if (!isValidPassword) {
        return null;
      }

      // Update last login
      await db
        .update(users)
        .set({ lastLogin: new Date() })
        .where(eq(users.id, user[0].id));

      return user[0];
    } catch (error) {
      console.error('Error authenticating user:', error);
      return null;
    }
  }

  static async getUserById(id: number): Promise<User | null> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      return user[0] || null;
    } catch (error) {
      console.error('Error getting user by ID:', error);
      return null;
    }
  }

  static async getUserByUsername(username: string): Promise<User | null> {
    try {
      const user = await db
        .select()
        .from(users)
        .where(eq(users.username, username))
        .limit(1);

      return user[0] || null;
    } catch (error) {
      console.error('Error getting user by username:', error);
      return null;
    }
  }
}