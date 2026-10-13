import { z } from "zod";
import { DELIVERY_STATUSES, EXPENSE_CATEGORIES } from "@/domain/types";

/**
 * Única fuente de validación: la usan los formularios (feedback rápido) y
 * las Server Actions (la que realmente decide). Los mensajes están en
 * castellano porque los lee la usuaria.
 */

export const brandSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Ponele un nombre a la marca."),
  marginPct: z.coerce
    .number({ message: "El porcentaje tiene que ser un número." })
    .min(0, "El porcentaje de ganancia no puede ser negativo.")
    .max(100, "El porcentaje de ganancia no puede superar 100."),
});

export type BrandInput = z.infer<typeof brandSchema>;

export const cycleSchema = z.object({
  name: z.string().trim().min(1, "Ponele un nombre al ciclo."),
});

export type CycleInput = z.infer<typeof cycleSchema>;

export const customerSchema = z.object({
  name: z.string().trim().min(1, "Ponele un nombre a la clienta."),
  phone: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
});

export type CustomerInput = z.infer<typeof customerSchema>;

const nullableCost = z.preprocess(
  (value) => (value === null || value === undefined || value === "" ? null : value),
  z.union([z.null(), z.coerce.number().min(0, "El costo no puede ser negativo.")]),
);

export const orderItemSchema = z.object({
  name: z.string().trim().min(1, "Ponele un nombre al producto."),
  brandId: z.string().nullable(),
  quantity: z.coerce
    .number({ message: "La cantidad tiene que ser un número." })
    .positive("La cantidad tiene que ser mayor a cero."),
  unitPrice: z.coerce
    .number({ message: "El precio tiene que ser un número." })
    .min(0, "El precio no puede ser negativo."),
  unitCost: nullableCost,
});

export type OrderItemInput = z.infer<typeof orderItemSchema>;

export const orderSchema = z.object({
  customerId: z.string().trim().min(1, "Elegí una clienta."),
  notes: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  items: z.array(orderItemSchema).min(1, "Agregá al menos un producto."),
});

export type OrderInput = z.infer<typeof orderSchema>;

export const deliveryStatusSchema = z.object({
  deliveryStatus: z.enum(DELIVERY_STATUSES),
});

export const paymentSchema = z.object({
  amount: z.coerce
    .number({ message: "El monto tiene que ser un número." })
    .positive("El monto tiene que ser mayor a cero."),
  date: z.string().trim().min(1, "Elegí una fecha."),
});

export type PaymentInput = z.infer<typeof paymentSchema>;

export const expenseSchema = z.object({
  category: z.enum(EXPENSE_CATEGORIES, { message: "Elegí una categoría." }),
  amount: z.coerce
    .number({ message: "El monto tiene que ser un número." })
    .positive("El monto tiene que ser mayor a cero."),
  description: z
    .string()
    .trim()
    .optional()
    .transform((value) => (value ? value : null)),
  date: z.string().trim().min(1, "Elegí una fecha."),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;

const emailField = z.email("Ese mail no parece válido.").min(1, "Ingresá tu mail.");

export const signUpSchema = z.object({
  name: z.string().trim().min(1, "Contanos cómo te llamás."),
  email: emailField,
  password: z.string().min(6, "La contraseña tiene que tener al menos 6 caracteres."),
});

export const signInSchema = z.object({
  email: emailField,
  password: z.string().min(1, "Ingresá tu contraseña."),
});

export const requestPasswordResetSchema = z.object({
  email: emailField,
});

export const updatePasswordSchema = z.object({
  password: z.string().min(6, "La contraseña tiene que tener al menos 6 caracteres."),
});
