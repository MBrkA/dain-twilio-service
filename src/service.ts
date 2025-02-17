import { defineDAINService } from "@dainprotocol/service-sdk";
import { sendWhatsappConfig } from "./tools/send-whatsapp-tool";
import { getWhatsappMessagesConfig } from "./tools/get-whatsapp-messages-tool";

export const dainService = defineDAINService({
  metadata: {
    title: "WhatsApp Messaging Service",
    description: "A DAIN service for sending WhatsApp messages via Twilio",
    version: "1.0.0",
    author: "DAIN Developer",
    tags: ["whatsapp", "messaging", "twilio"],
  },
  identity: {
    apiKey: process.env.DAIN_API_KEY,
  },
  tools: [sendWhatsappConfig, getWhatsappMessagesConfig],
});
