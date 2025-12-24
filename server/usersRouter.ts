import { protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

// ============================================
// USERS ROUTER
// ============================================

export const usersRouter = router({
  // Listar todos os usuários (protegido - admin)
  list: protectedProcedure
    .query(async ({ ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Apenas administradores podem listar usuários');
      }
      return await db.getAllUsers();
    }),

  // Obter usuário por ID (protegido - admin)
  getById: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .query(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Apenas administradores podem ver usuários');
      }
      return await db.getUserById(input.id);
    }),

  // Atualizar usuário (protegido - admin)
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      data: z.object({
        name: z.string().optional(),
        email: z.string().email().optional(),
        role: z.enum(["admin", "user", "guest"]).optional(),
        active: z.boolean().optional(),
      }),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Apenas administradores podem atualizar usuários');
      }
      await db.updateUser(input.id, input.data);
      return { success: true };
    }),

  // Deletar usuário (protegido - admin)
  delete: protectedProcedure
    .input(z.object({
      id: z.number(),
    }))
    .mutation(async ({ input, ctx }) => {
      if (ctx.user.role !== 'admin') {
        throw new Error('Apenas administradores podem deletar usuários');
      }
      await db.deleteUser(input.id);
      return { success: true };
    }),
});
