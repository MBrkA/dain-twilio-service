import { ToolConfig } from "@dainprotocol/service-sdk";
import { z } from "zod";
import { AlertUIBuilder, TableUIBuilder } from "@dainprotocol/utils";
import twilio from 'twilio';

const getWhatsappMessagesConfig: ToolConfig = {
  id: "get-whatsapp-messages",
  name: "Get WhatsApp Messages",
  description: "Retrieve received WhatsApp messages from Twilio",
  input: z.object({
    limit: z.number().optional().describe("Maximum number of messages to retrieve"),
  }),
  output: z.object({
    messages: z.array(z.object({
      sid: z.string(),
      from: z.string(), 
      body: z.string(),
      dateSent: z.string(),
      status: z.string()
    }))
  }),
  handler: async ({ limit = 10 }, agentInfo) => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error("Missing Twilio credentials");
      }

      // Initialize Twilio client
      const client = twilio(accountSid, authToken);

      // Get messages using Twilio client
      const messages = await client.messages.list({
        limit: limit
      });

      const formattedMessages = messages.map(msg => ({
        sid: msg.sid,
        from: msg.from.replace('whatsapp:', ''),
        body: msg.body,
        dateSent: msg.dateCreated.toISOString(),
        status: msg.status
      }));

      const tableUI = new TableUIBuilder()
        .addColumns([
          { key: "from", header: "From", type: "text" },
          { key: "body", header: "Message", type: "text" },
          { key: "dateSent", header: "Date Sent", type: "text" },
          { key: "status", header: "Status", type: "text" }
        ])
        .rows(formattedMessages)
        .build();

      return {
        text: `Retrieved ${formattedMessages.length} WhatsApp messages`,
        data: { messages: formattedMessages },
        ui: tableUI
      };

    } catch (error) {
      console.error("Error retrieving WhatsApp messages:", error);

      const errorUI = new AlertUIBuilder()
        .variant("error")
        .title("Failed to Retrieve Messages")
        .message(error.message)
        .build();

      return {
        text: `Failed to retrieve WhatsApp messages: ${error.message}`,
        data: { messages: [] },
        ui: errorUI
      };
    }
  }
};

export { getWhatsappMessagesConfig };
