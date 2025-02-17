import { ToolConfig } from "@dainprotocol/service-sdk";
import { z } from "zod";
import axios from "axios";
import { AlertUIBuilder, TableUIBuilder } from "@dainprotocol/utils";

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

      const response = await axios.get(
        `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json?PageSize=${limit}`,
        {
          auth: {
            username: accountSid,
            password: authToken,
          },
        }
      );

      const messages = response.data.messages.map((msg: any) => ({
        sid: msg.sid,
        from: msg.from.replace('whatsapp:', ''),
        body: msg.body,
        dateSent: msg.date_sent,
        status: msg.status
      }));

      const tableUI = new TableUIBuilder()
        .addColumns([
          { key: "from", header: "From", type: "text" },
          { key: "body", header: "Message", type: "text" },
          { key: "dateSent", header: "Date Sent", type: "text" },
          { key: "status", header: "Status", type: "text" }
        ])
        .rows(messages)
        .build();

      return {
        text: `Retrieved ${messages.length} WhatsApp messages`,
        data: { messages },
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
