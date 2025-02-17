import { ToolConfig } from "@dainprotocol/service-sdk";
import { z } from "zod";
import { AlertUIBuilder, CardUIBuilder } from "@dainprotocol/utils";
import twilio from 'twilio';

const sendWhatsappConfig: ToolConfig = {
  id: "send-whatsapp",
  name: "Send WhatsApp Message", 
  description: "Send a WhatsApp message using Twilio",
  input: z.object({
    to: z.string().describe("Recipient's WhatsApp number in E.164 format"),
    message: z.string().describe("Message content to send"),
  }),
  output: z.object({
    status: z.string(),
    sid: z.string(),
  }),
  handler: async ({ to, message }, agentInfo) => {
    try {
      const accountSid = process.env.TWILIO_ACCOUNT_SID;
      const authToken = process.env.TWILIO_AUTH_TOKEN;
      const fromNumber = process.env.TWILIO_WHATSAPP_NUMBER;

      if (!accountSid || !authToken || !fromNumber) {
        throw new Error("Missing Twilio credentials");
      }

      // Initialize Twilio client
      const client = twilio(accountSid, authToken);

      // Send message using Twilio client
      const response = await client.messages.create({
        to: `whatsapp:${to}`,
        from: `whatsapp:${fromNumber}`,
        body: message
      });

      const successUI = new CardUIBuilder()
        .title("Message Sent Successfully")
        .content(`Message sent to ${to}`)
        .build();

      return {
        text: "WhatsApp message sent successfully",
        data: {
          status: response.status,
          sid: response.sid,
        },
        ui: successUI,
      };
    } catch (error) {
      console.error("Error sending WhatsApp message:", error);

      const errorUI = new AlertUIBuilder()
        .variant("error")
        .title("Message Send Failed") 
        .message(error.message)
        .build();

      return {
        text: `Failed to send WhatsApp message: ${error.message}`,
        data: {
          status: "failed",
          sid: "",
        },
        ui: errorUI,
      };
    }
  },
};

export { sendWhatsappConfig };
