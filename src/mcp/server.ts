#!/usr/bin/env node
import "dotenv/config";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { z } from "zod";
import {
  cancelPayment,
  cancelPaymentSchema,
  checkPaymentStatus,
  checkPaymentStatusSchema,
  createCampaign,
  createCampaignSchema,
  createMoneyDonation,
  createMoneyDonationSchema,
  createMushafDonation,
  createMushafDonationSchema,
  generateReceipt,
  generateReceiptSchema,
  getCampaignProgress,
  getCampaignProgressSchema,
  getDonation,
  getDonationSchema,
  getDonationStats,
  getDonationStatsSchema,
  handleWebhook,
  handleWebhookSchema,
  listCampaigns,
  listCampaignsSchema,
  listDonations,
  listDonationsSchema,
} from "../lib/donations.js";

interface ToolDef {
  name: string;
  description: string;
  schema: z.ZodTypeAny;
  handler: (input: unknown) => Promise<unknown>;
}

const tools: ToolDef[] = [
  {
    name: "create_money_donation",
    description:
      "Membuat donasi uang baru dan menerbitkan transaksi pembayaran via Midtrans Snap. Mengembalikan paymentUrl yang bisa dibuka donatur untuk membayar.",
    schema: createMoneyDonationSchema,
    handler: (input) => createMoneyDonation(createMoneyDonationSchema.parse(input)),
  },
  {
    name: "create_mushaf_donation",
    description:
      "Membuat donasi wakaf mushaf Al-Qur'an. Total dihitung dari quantity x unitPrice (default unitPrice dari env MUSHAF_UNIT_PRICE).",
    schema: createMushafDonationSchema,
    handler: (input) => createMushafDonation(createMushafDonationSchema.parse(input)),
  },
  {
    name: "list_donations",
    description:
      "Daftar donasi dengan filter type/status/campaign/donorEmail.",
    schema: listDonationsSchema,
    handler: (input) => listDonations(listDonationsSchema.parse(input)),
  },
  {
    name: "get_donation",
    description: "Ambil detail donasi berdasarkan id atau orderId.",
    schema: getDonationSchema,
    handler: (input) => getDonation(getDonationSchema.parse(input)),
  },
  {
    name: "check_payment_status",
    description:
      "Cek status pembayaran ke Midtrans dan sinkronkan ke storage lokal.",
    schema: checkPaymentStatusSchema,
    handler: (input) => checkPaymentStatus(checkPaymentStatusSchema.parse(input)),
  },
  {
    name: "cancel_payment",
    description: "Batalkan transaksi yang masih pending.",
    schema: cancelPaymentSchema,
    handler: (input) => cancelPayment(cancelPaymentSchema.parse(input)),
  },
  {
    name: "handle_payment_webhook",
    description:
      "Proses notifikasi webhook dari Midtrans (verifikasi signature + update status).",
    schema: handleWebhookSchema,
    handler: (input) => handleWebhook(handleWebhookSchema.parse(input)),
  },
  {
    name: "create_campaign",
    description:
      "Buat campaign donasi (uang atau mushaf) dengan target nominal.",
    schema: createCampaignSchema,
    handler: (input) => createCampaign(createCampaignSchema.parse(input)),
  },
  {
    name: "list_campaigns",
    description: "Daftar campaign donasi.",
    schema: listCampaignsSchema,
    handler: (input) => listCampaigns(listCampaignsSchema.parse(input)),
  },
  {
    name: "get_campaign_progress",
    description: "Progress sebuah campaign: persentase, sisa target, sisa hari.",
    schema: getCampaignProgressSchema,
    handler: (input) => getCampaignProgress(getCampaignProgressSchema.parse(input)),
  },
  {
    name: "get_donation_stats",
    description:
      "Statistik agregat: total terkumpul, jumlah donasi, jumlah mushaf, donatur unik.",
    schema: getDonationStatsSchema,
    handler: (input) => getDonationStats(getDonationStatsSchema.parse(input)),
  },
  {
    name: "generate_receipt",
    description:
      "Buat tanda terima donasi (markdown) untuk donasi yang sudah dibayar.",
    schema: generateReceiptSchema,
    handler: (input) => generateReceipt(generateReceiptSchema.parse(input)),
  },
];

function zodToJsonSchema(schema: z.ZodTypeAny): Record<string, unknown> {
  // Konversi minimal: cukup untuk MCP listTools. Untuk skema kompleks,
  // disarankan pakai package zod-to-json-schema saat scaling.
  if (schema instanceof z.ZodObject) {
    const shape = schema.shape as Record<string, z.ZodTypeAny>;
    const properties: Record<string, unknown> = {};
    const required: string[] = [];
    for (const [key, value] of Object.entries(shape)) {
      properties[key] = zodToJsonSchema(value);
      if (!(value instanceof z.ZodOptional) && !(value instanceof z.ZodDefault)) {
        required.push(key);
      }
    }
    return { type: "object", properties, required, additionalProperties: false };
  }
  if (schema instanceof z.ZodOptional) return zodToJsonSchema(schema.unwrap());
  if (schema instanceof z.ZodDefault) return zodToJsonSchema(schema.removeDefault());
  if (schema instanceof z.ZodString) return { type: "string" };
  if (schema instanceof z.ZodNumber) return { type: "number" };
  if (schema instanceof z.ZodBoolean) return { type: "boolean" };
  if (schema instanceof z.ZodEnum) return { type: "string", enum: schema.options };
  if (schema instanceof z.ZodArray)
    return { type: "array", items: zodToJsonSchema(schema.element) };
  return {};
}

const server = new Server(
  {
    name: "donasi-mcp-server",
    version: "0.1.0",
  },
  {
    capabilities: { tools: {} },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => ({
  tools: tools.map((t) => ({
    name: t.name,
    description: t.description,
    inputSchema: zodToJsonSchema(t.schema),
  })),
}));

server.setRequestHandler(CallToolRequestSchema, async (req) => {
  const tool = tools.find((t) => t.name === req.params.name);
  if (!tool) {
    return {
      isError: true,
      content: [{ type: "text", text: `Tool tidak ditemukan: ${req.params.name}` }],
    };
  }
  try {
    const result = await tool.handler(req.params.arguments ?? {});
    return {
      content: [{ type: "text", text: JSON.stringify(result, null, 2) }],
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return {
      isError: true,
      content: [{ type: "text", text: `Error: ${message}` }],
    };
  }
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("[donasi-mcp] server siap pada stdio.");
}

main().catch((err) => {
  console.error("[donasi-mcp] fatal:", err);
  process.exit(1);
});
