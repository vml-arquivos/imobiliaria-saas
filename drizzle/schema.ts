import { pgTable, serial, text, varchar, timestamp, boolean, integer, numeric, jsonb, pgEnum, date } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

/**
 * Schema completo para o sistema Casa DF
 * Inclui: usuários, imóveis, leads, interações, blog, configurações
 * REFATORADO PARA POSTGRESQL
 */

// ============================================
// ENUMS
// ============================================

export const roleEnum = pgEnum("role", ["user", "admin"]);
export const propertyTypeEnum = pgEnum("propertyType", [
  "casa",
  "apartamento",
  "cobertura",
  "terreno",
  "comercial",
  "rural",
  "lancamento"
]);
export const transactionTypeEnum = pgEnum("transactionType", ["venda", "locacao", "ambos"]);
export const propertyStatusEnum = pgEnum("propertyStatus", ["disponivel", "reservado", "vendido", "alugado", "inativo"]);
export const leadSourceEnum = pgEnum("leadSource", [
  "site",
  "whatsapp",
  "instagram",
  "facebook",
  "indicacao",
  "portal_zap",
  "portal_vivareal",
  "portal_olx",
  "google",
  "outro"
]);
export const leadStageEnum = pgEnum("leadStage", [
  "novo",
  "contato_inicial",
  "qualificado",
  "visita_agendada",
  "visita_realizada",
  "proposta",
  "negociacao",
  "fechado_ganho",
  "fechado_perdido",
  "sem_interesse"
]);
export const clientTypeEnum = pgEnum("clientType", [
  "comprador",
  "locatario",
  "proprietario"
]);
export const qualificationEnum = pgEnum("qualification", [
  "quente",
  "morno",
  "frio",
  "nao_qualificado"
]);
export const buyerProfileEnum = pgEnum("buyerProfile", [
  "investidor",
  "primeira_casa",
  "upgrade",
  "curioso",
  "indeciso"
]);
export const urgencyLevelEnum = pgEnum("urgencyLevel", [
  "baixa",
  "media",
  "alta",
  "urgente"
]);
export const priorityEnum = pgEnum("priority", ["baixa", "media", "alta", "urgente"]);
export const interactionTypeEnum = pgEnum("interactionType", [
  "ligacao",
  "whatsapp",
  "email",
  "visita",
  "reuniao",
  "proposta",
  "nota",
  "status_change"
]);
export const themeStyleEnum = pgEnum("themeStyle", ["modern", "classic"]);
export const messageTypeEnum = pgEnum("messageType", ["incoming", "outgoing"]);
export const aiRoleEnum = pgEnum("aiRole", ["user", "assistant", "system"]);
export const webhookStatusEnum = pgEnum("webhookStatus", ["success", "error", "pending"]);


// ============================================
// TABELA DE USUÁRIOS (AUTH)
// ============================================

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  openId: varchar("openId", { length: 64 }).unique(), // Nullable para compatibilidade com auth local
  name: text("name").notNull(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  password: varchar("password", { length: 255 }), // Hash da senha (bcrypt/scrypt)
  loginMethod: varchar("loginMethod", { length: 64 }).default("local"),
  role: roleEnum("role").default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ============================================
// TABELA DE IMÓVEIS
// ============================================

export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  
  // Informações básicas
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  referenceCode: varchar("referenceCode", { length: 50 }).unique(),
  
  // Tipo e finalidade
  propertyType: propertyTypeEnum("propertyType").notNull(),
  transactionType: transactionTypeEnum("transactionType").notNull(),
  
  // Localização
  address: varchar("address", { length: 255 }),
  neighborhood: varchar("neighborhood", { length: 100 }),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  latitude: varchar("latitude", { length: 50 }),
  longitude: varchar("longitude", { length: 50 }),
  
  // Valores (usando numeric para precisão monetária)
  salePrice: numeric("salePrice"),
  rentPrice: numeric("rentPrice"),
  condoFee: numeric("condoFee"),
  iptu: numeric("iptu"),
  
  // Características
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  suites: integer("suites"),
  parkingSpaces: integer("parkingSpaces"),
  totalArea: numeric("totalArea"), // em m²
  builtArea: numeric("builtArea"), // em m²
  
  // Características adicionais (JSONB)
  features: jsonb("features"), // JSON array: ["piscina", "churrasqueira", "academia"]
  
  // Imagens (JSONB array de URLs)
  images: jsonb("images"), // JSON array de objetos: [{url: "", caption: ""}]
  mainImage: varchar("mainImage", { length: 500 }),
  
  // Status e visibilidade
  status: propertyStatusEnum("status").default("disponivel").notNull(),
  featured: boolean("featured").default(false),
  published: boolean("published").default(true),
  
  // SEO
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  slug: varchar("slug", { length: 255 }).unique(),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  createdBy: integer("createdBy").references(() => users.id),
});

export type Property = typeof properties.$inferSelect;
export type InsertProperty = typeof properties.$inferInsert;

// ============================================
// TABELA DE IMAGENS DE IMÓVEIS
// ============================================

export const propertyImages = pgTable("propertyImages", {
  id: serial("id").primaryKey(),
  propertyId: integer("propertyId").notNull().references(() => properties.id),
  imageUrl: varchar("imageUrl", { length: 500 }).notNull(),
  imageKey: varchar("imageKey", { length: 500 }).notNull(),
  isPrimary: boolean("isPrimary").default(false).notNull(), // true = imagem principal, false = secundária
  displayOrder: integer("displayOrder").default(0).notNull(),
  caption: varchar("caption", { length: 255 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type PropertyImage = typeof propertyImages.$inferSelect;
export type InsertPropertyImage = typeof propertyImages.$inferInsert;

// ============================================
// TABELA DE LEADS/CLIENTES
// ============================================

export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  
  // Informações pessoais
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  
  // Origem do lead
  source: leadSourceEnum("source").default("site"),
  
  // Status no pipeline
  stage: leadStageEnum("stage").default("novo").notNull(),
  
  // Perfil do cliente
  clientType: clientTypeEnum("clientType").default("comprador").notNull(),
  
  qualification: qualificationEnum("qualification").default("nao_qualificado").notNull(),
  
  buyerProfile: buyerProfileEnum("buyerProfile"),
  
  urgencyLevel: urgencyLevelEnum("urgencyLevel").default("media"),
  
  // Interesse
  interestedPropertyId: integer("interestedPropertyId").references(() => properties.id), // ID do imóvel de interesse
  transactionInterest: transactionTypeEnum("transactionInterest").default("venda"),
  budgetMin: numeric("budgetMin"),
  budgetMax: numeric("budgetMax"),
  preferredNeighborhoods: text("preferredNeighborhoods"), // JSON array
  preferredPropertyTypes: text("preferredPropertyTypes"), // JSON array
  
  // Notas e tags
  notes: text("notes"),
  tags: text("tags"), // JSON array: ["vip", "urgente", "investidor"]
  
  // Atribuição
  assignedTo: integer("assignedTo").references(() => users.id), // ID do usuário responsável
  
  // Score e prioridade
  score: integer("score").default(0), // 0-100
  priority: priorityEnum("priority").default("media"),
  
  // Timestamps
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
  lastContactedAt: timestamp("lastContactedAt"),
  convertedAt: timestamp("convertedAt"),
});

export type Lead = typeof leads.$inferSelect;
export type InsertLead = typeof leads.$inferInsert;

// ============================================
// TABELA DE INTERAÇÕES/HISTÓRICO
// ============================================

export const interactions = pgTable("interactions", {
  id: serial("id").primaryKey(),
  
  leadId: integer("leadId").notNull().references(() => leads.id),
  userId: integer("userId").references(() => users.id), // Quem fez a interação
  
  type: interactionTypeEnum("type").notNull(),
  
  subject: varchar("subject", { length: 255 }),
  description: text("description"),
  
  // Metadados específicos (JSONB)
  metadata: jsonb("metadata"), // Ex: {duration: 300, outcome: "positivo"}
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type Interaction = typeof interactions.$inferSelect;
export type InsertInteraction = typeof interactions.$inferInsert;

// ============================================
// TABELA DE BLOG POSTS
// ============================================

export const blogPosts = pgTable("blog_posts", {
  id: serial("id").primaryKey(),
  
  title: varchar("title", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).unique().notNull(),
  excerpt: text("excerpt"),
  content: text("content").notNull(),
  
  featuredImage: varchar("featuredImage", { length: 500 }),
  
  categoryId: integer("categoryId"),
  authorId: integer("authorId").references(() => users.id),
  
  // SEO
  metaTitle: varchar("metaTitle", { length: 255 }),
  metaDescription: text("metaDescription"),
  
  // Status
  published: boolean("published").default(false),
  publishedAt: timestamp("publishedAt"),
  
  // Estatísticas
  views: integer("views").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type BlogPost = typeof blogPosts.$inferSelect;
export type InsertBlogPost = typeof blogPosts.$inferInsert;

// ============================================
// TABELA DE CATEGORIAS DE BLOG
// ============================================

export const blogCategories = pgTable("blog_categories", {
  id: serial("id").primaryKey(),
  
  name: varchar("name", { length: 100 }).notNull(),
  slug: varchar("slug", { length: 100 }).unique().notNull(),
  description: text("description"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type BlogCategory = typeof blogCategories.$inferSelect;
export type InsertBlogCategory = typeof blogCategories.$inferInsert;

// ============================================
// TABELA DE CONFIGURAÇÕES DO SITE
// ============================================

export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  
  // Informações da empresa
  companyName: varchar("companyName", { length: 255 }),
  companyDescription: text("companyDescription"),
  companyLogo: varchar("companyLogo", { length: 500 }),
  
  // Informações do corretor
  realtorName: varchar("realtorName", { length: 255 }),
  realtorPhoto: varchar("realtorPhoto", { length: 500 }),
  realtorBio: text("realtorBio"),
  realtorCreci: varchar("realtorCreci", { length: 50 }),
  
  // Contatos
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  email: varchar("email", { length: 320 }),
  address: text("address"),
  
  // Redes sociais
  instagram: varchar("instagram", { length: 255 }),
  facebook: varchar("facebook", { length: 255 }),
  youtube: varchar("youtube", { length: 255 }),
  tiktok: varchar("tiktok", { length: 255 }),
  linkedin: varchar("linkedin", { length: 255 }),
  
  // SEO
  siteTitle: varchar("siteTitle", { length: 255 }),
  siteDescription: text("siteDescription"),
  siteKeywords: text("siteKeywords"),
  
  // Integrações
  googleAnalyticsId: varchar("googleAnalyticsId", { length: 50 }),
  facebookPixelId: varchar("facebookPixelId", { length: 50 }),
  
  // Customização Visual (Site Builder)
  themeStyle: themeStyleEnum("themeStyle").default("modern"),
  primaryColor: varchar("primaryColor", { length: 7 }).default("#0f172a"), // Hex color
  
  // Seção Hero
  heroTitle: varchar("heroTitle", { length: 255 }),
  heroSubtitle: text("heroSubtitle"),
  heroBackgroundImage: varchar("heroBackgroundImage", { length: 500 }),
  
  // Seção Sobre
  aboutSectionTitle: varchar("aboutSectionTitle", { length: 255 }),
  aboutSectionContent: text("aboutSectionContent"),
  aboutSectionImage: varchar("aboutSectionImage", { length: 500 }),
  
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type SiteSetting = typeof siteSettings.$inferSelect;
export type InsertSiteSetting = typeof siteSettings.$inferInsert;

// ============================================
// TABELAS DE INTEGRAÇÃO WHATSAPP / N8N
// ============================================

// Buffer de mensagens do WhatsApp
export const messageBuffer = pgTable("message_buffer", {
  id: serial("id").primaryKey(),
  phone: varchar("phone", { length: 20 }).notNull(),
  messageId: varchar("messageId", { length: 255 }).notNull().unique(),
  content: text("content"),
  type: messageTypeEnum("type").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  processed: integer("processed").default(0).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type MessageBuffer = typeof messageBuffer.$inferSelect;
export type InsertMessageBuffer = typeof messageBuffer.$inferInsert;

// Contexto e histórico de IA
export const aiContextStatus = pgTable("ai_context_status", {
  id: serial("id").primaryKey(),
  sessionId: varchar("sessionId", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 20 }).notNull(),
  message: jsonb("message").notNull(), // JSON com {type: 'ai'|'user', content: string}
  role: aiRoleEnum("role").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AiContextStatus = typeof aiContextStatus.$inferSelect;
export type InsertAiContextStatus = typeof aiContextStatus.$inferInsert;

// Interesses dos clientes (para N8N)
export const clientInterests = pgTable("client_interests", {
  id: serial("id").primaryKey(),
  clientId: integer("clientId").notNull().references(() => leads.id), // Referência ao lead
  propertyType: varchar("propertyType", { length: 100 }), // Tipo de imóvel de interesse
  interestType: transactionTypeEnum("interestType"),
  budgetMin: numeric("budgetMin"),
  budgetMax: numeric("budgetMax"),
  preferredNeighborhoods: text("preferredNeighborhoods"),
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type ClientInterest = typeof clientInterests.$inferSelect;
export type InsertClientInterest = typeof clientInterests.$inferInsert;

// Webhooks e logs de integração
export const webhookLogs = pgTable("webhook_logs", {
  id: serial("id").primaryKey(),
  source: varchar("source", { length: 50 }).notNull(), // whatsapp, n8n, etc
  event: varchar("event", { length: 100 }).notNull(),
  payload: text("payload"), // JSON do payload recebido
  response: text("response"), // JSON da resposta enviada
  status: webhookStatusEnum("status").notNull(),
  errorMessage: text("errorMessage"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type WebhookLog = typeof webhookLogs.$inferSelect;
export type InsertWebhookLog = typeof webhookLogs.$inferInsert;

// ============================================
// TABELA DE PROPRIETÁRIOS
// ============================================

export const owners = pgTable("owners", {
  id: serial("id").primaryKey(),
  
  // Informações pessoais
  name: varchar("name", { length: 255 }).notNull(),
  cpfCnpj: varchar("cpfCnpj", { length: 20 }),
  email: varchar("email", { length: 320 }),
  phone: varchar("phone", { length: 20 }),
  whatsapp: varchar("whatsapp", { length: 20 }),
  
  // Endereço
  address: text("address"),
  city: varchar("city", { length: 100 }),
  state: varchar("state", { length: 2 }),
  zipCode: varchar("zipCode", { length: 10 }),
  
  // Informações bancárias (para pagamentos)
  bankName: varchar("bankName", { length: 100 }),
  bankAgency: varchar("bankAgency", { length: 20 }),
  bankAccount: varchar("bankAccount", { length: 30 }),
  pixKey: varchar("pixKey", { length: 255 }),
  
  // Notas e observações
  notes: text("notes"),
  
  // Status
  active: boolean("active").default(true),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Owner = typeof owners.$inferSelect;
export type InsertOwner = typeof owners.$inferInsert;

// ============================================
// TABELAS DE ANALYTICS E MÉTRICAS
// ============================================

export const analyticsEvents = pgTable("analytics_events", {
  id: serial("id").primaryKey(),
  
  // Tipo de evento
  eventType: varchar("eventType", { length: 50 }).notNull(), // page_view, property_view, contact_form, whatsapp_click, phone_click
  
  // Dados do evento
  propertyId: integer("propertyId").references(() => properties.id),
  leadId: integer("leadId").references(() => leads.id),
  userId: integer("userId").references(() => users.id),
  
  // Origem do tráfego
  source: varchar("source", { length: 100 }), // google_ads, facebook_ads, instagram, organic, direct
  medium: varchar("medium", { length: 100 }), // cpc, social, organic, referral
  campaign: varchar("campaign", { length: 255 }), // Nome da campanha
  
  // Dados técnicos
  url: varchar("url", { length: 500 }),
  referrer: varchar("referrer", { length: 500 }),
  userAgent: text("userAgent"),
  ipAddress: varchar("ipAddress", { length: 45 }),
  
  // Metadados
  metadata: jsonb("metadata"), // Dados adicionais em JSON
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AnalyticsEvent = typeof analyticsEvents.$inferSelect;
export type InsertAnalyticsEvent = typeof analyticsEvents.$inferInsert;

export const campaignSources = pgTable("campaign_sources", {
  id: serial("id").primaryKey(),
  
  // Identificação da campanha
  name: varchar("name", { length: 255 }).notNull(),
  source: varchar("source", { length: 100 }).notNull(), // google, facebook, instagram, etc
  medium: varchar("medium", { length: 100 }), // cpc, social, etc
  campaignId: varchar("campaignId", { length: 255 }), // ID externo da campanha
  
  // Métricas
  budget: numeric("budget", { precision: 10, scale: 2 }), // Orçamento investido
  clicks: integer("clicks").default(0),
  impressions: integer("impressions").default(0),
  conversions: integer("conversions").default(0), // Leads gerados
  
  // Status
  active: boolean("active").default(true),
  startDate: date("startDate"),
  endDate: date("endDate"),
  
  // Notas
  notes: text("notes"),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type CampaignSource = typeof campaignSources.$inferSelect;
export type InsertCampaignSource = typeof campaignSources.$inferInsert;

// ============================================
// TABELAS FINANCEIRAS
// ============================================

export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  
  // Tipo de transação
  type: varchar("type", { length: 50 }).notNull(), // commission, expense, revenue
  category: varchar("category", { length: 100 }), // sale_commission, marketing, office, etc
  
  // Valores
  amount: numeric("amount", { precision: 12, scale: 2 }).notNull(),
  currency: varchar("currency", { length: 3 }).default("BRL"),
  
  // Relacionamentos
  propertyId: integer("propertyId").references(() => properties.id), // Imóvel relacionado
  leadId: integer("leadId").references(() => leads.id), // Cliente relacionado
  ownerId: integer("ownerId").references(() => owners.id), // Proprietário relacionado
  
  // Descrição
  description: text("description").notNull(),
  notes: text("notes"),
  
  // Status de pagamento
  status: varchar("status", { length: 50 }).default("pending"), // pending, paid, cancelled
  paymentMethod: varchar("paymentMethod", { length: 50 }), // pix, transfer, check, cash
  paymentDate: date("paymentDate"),
  dueDate: date("dueDate"),
  
  // Comprovantes
  receiptUrl: varchar("receiptUrl", { length: 500 }),
  invoiceNumber: varchar("invoiceNumber", { length: 100 }),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = typeof transactions.$inferInsert;

export const commissions = pgTable("commissions", {
  id: serial("id").primaryKey(),
  
  // Venda relacionada
  propertyId: integer("propertyId").notNull().references(() => properties.id),
  leadId: integer("leadId").notNull().references(() => leads.id), // Comprador
  ownerId: integer("ownerId").references(() => owners.id), // Vendedor
  
  // Valores da venda
  salePrice: numeric("salePrice", { precision: 12, scale: 2 }).notNull(),
  commissionRate: numeric("commissionRate", { precision: 5, scale: 2 }).notNull(), // Percentual (ex: 6.00 para 6%)
  commissionAmount: numeric("commissionAmount", { precision: 12, scale: 2 }).notNull(),
  
  // Divisão de comissão (se houver)
  splitWithAgent: boolean("splitWithAgent").default(false),
  agentName: varchar("agentName", { length: 255 }),
  agentCommissionAmount: numeric("agentCommissionAmount", { precision: 12, scale: 2 }),
  
  // Status
  status: varchar("status", { length: 50 }).default("pending"), // pending, paid, cancelled
  paymentDate: date("paymentDate"),
  
  // Notas
  notes: text("notes"),
  
  // Transação financeira relacionada
  transactionId: integer("transactionId").references(() => transactions.id),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Commission = typeof commissions.$inferSelect;
export type InsertCommission = typeof commissions.$inferInsert;

// ============================================
// TABELA DE AVALIAÇÕES DE CLIENTES
// ============================================

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  
  // Informações do cliente
  clientName: varchar("clientName", { length: 255 }).notNull(),
  clientRole: varchar("clientRole", { length: 100 }), // Empresário, Médico, etc
  clientPhoto: varchar("clientPhoto", { length: 500 }),
  
  // Avaliação
  rating: integer("rating").notNull(), // 1 a 5 estrelas
  title: varchar("title", { length: 255 }),
  content: text("content").notNull(),
  
  // Relacionamentos (opcional)
  propertyId: integer("propertyId").references(() => properties.id), // Imóvel avaliado
  leadId: integer("leadId").references(() => leads.id), // Cliente do CRM
  
  // Status
  approved: boolean("approved").default(false),
  featured: boolean("featured").default(false), // Destacar na home
  
  // Metadados
  displayOrder: integer("displayOrder").default(0),
  
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().notNull(),
});

export type Review = typeof reviews.$inferSelect;
export type InsertReview = typeof reviews.$inferInsert;

// ============================================
// RELATIONS (Opcional, mas recomendado para Drizzle)
// ============================================

export const usersRelations = relations(users, ({ many }) => ({
  properties: many(properties),
  leads: many(leads),
  interactions: many(interactions),
  blogPosts: many(blogPosts),
}));

export const propertiesRelations = relations(properties, ({ one, many }) => ({
  createdBy: one(users, {
    fields: [properties.createdBy],
    references: [users.id],
  }),
  images: many(propertyImages),
  leads: many(leads),
  transactions: many(transactions),
  commissions: many(commissions),
  reviews: many(reviews),
}));

export const leadsRelations = relations(leads, ({ one, many }) => ({
  interestedProperty: one(properties, {
    fields: [leads.interestedPropertyId],
    references: [properties.id],
  }),
  assignedTo: one(users, {
    fields: [leads.assignedTo],
    references: [users.id],
  }),
  interactions: many(interactions),
  clientInterests: many(clientInterests),
  transactions: many(transactions),
  commissions: many(commissions),
  reviews: many(reviews),
}));

export const interactionsRelations = relations(interactions, ({ one }) => ({
  lead: one(leads, {
    fields: [interactions.leadId],
    references: [leads.id],
  }),
  user: one(users, {
    fields: [interactions.userId],
    references: [users.id],
  }),
}));

export const blogPostsRelations = relations(blogPosts, ({ one }) => ({
  category: one(blogCategories, {
    fields: [blogPosts.categoryId],
    references: [blogCategories.id],
  }),
  author: one(users, {
    fields: [blogPosts.authorId],
    references: [users.id],
  }),
}));

export const propertyImagesRelations = relations(propertyImages, ({ one }) => ({
  property: one(properties, {
    fields: [propertyImages.propertyId],
    references: [properties.id],
  }),
}));

export const clientInterestsRelations = relations(clientInterests, ({ one }) => ({
  client: one(leads, {
    fields: [clientInterests.clientId],
    references: [leads.id],
  }),
}));

export const transactionsRelations = relations(transactions, ({ one }) => ({
  property: one(properties, {
    fields: [transactions.propertyId],
    references: [properties.id],
  }),
  lead: one(leads, {
    fields: [transactions.leadId],
    references: [leads.id],
  }),
  owner: one(owners, {
    fields: [transactions.ownerId],
    references: [owners.id],
  }),
}));

export const commissionsRelations = relations(commissions, ({ one }) => ({
  property: one(properties, {
    fields: [commissions.propertyId],
    references: [properties.id],
  }),
  lead: one(leads, {
    fields: [commissions.leadId],
    references: [leads.id],
  }),
  owner: one(owners, {
    fields: [commissions.ownerId],
    references: [owners.id],
  }),
  transaction: one(transactions, {
    fields: [commissions.transactionId],
    references: [transactions.id],
  }),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  property: one(properties, {
    fields: [reviews.propertyId],
    references: [properties.id],
  }),
  lead: one(leads, {
    fields: [reviews.leadId],
    references: [leads.id],
  }),
}));
