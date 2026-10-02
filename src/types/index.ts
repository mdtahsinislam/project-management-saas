export type Role = "ADMIN" | "OWNER" | "MEMBER";

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}