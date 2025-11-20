import { parseIncoming } from "../utils/parser.js";
import { normalizeIncomingMessage } from "../utils/normalizer.js";
import { getCheckboxValue } from "../utils/getCheckboxValue.js";
import { patchMetadata, sendMessageToLaburenAgent } from "../services/laburen.service.js";
import { getContact, getLead, updateLead, launchSalesBot } from "../services/kommo.service.js";

const conversationMap = new Map();
const KOMMO_SWITCH_ID = Number(process.env.KOMMO_TEXT_FIELD_ID);
const KOMMO_TEXT_FIELD_ID = Number(process.env.KOMMO_TEXT_FIELD_ID);
const KOMMO_BOT_ID = process.env.KOMMO_BOT_ID;

export async function kommoWebhook(req, res) {
  res.sendStatus(204); // responder rápido 

  try {
    const contentType = req.headers["content-type"] || "";
    const raw =
      typeof req.body === "string"
        ? req.body
        : req.body?.toString("utf8") || "";

    const parsed = parseIncoming(raw, contentType);
    const normalized = normalizeIncomingMessage(parsed);
    const contact = await getContact(normalized.contact_id);
    const lead = await getLead(normalized.element_id);
    const checkboxValue = getCheckboxValue(lead, KOMMO_SWITCH_ID);

    if (checkboxValue === true) {
      await processKommoMessage(normalized, contact);
      console.log('--------------------------------------------------------------------------------------------------------------------------------------------------------');
    }
    else if (checkboxValue === false) {
      console.log(`⚠️ El lead ${normalized.element_id} esta pausado.`);
      console.log('--------------------------------------------------------------------------------------------------------------------------------------------------------');
    }

  } catch (err) {
    console.error("Error en kommoWebhook:", err);
    console.log('-------------------------------------------------------------------------------------------------------------------------------------------------------');
  }

}

async function processKommoMessage(normalized, contact) {
  let conversationId;
  let data;

  // --- Manejo de conversación en Laburen ---
  if (conversationMap.has(normalized.contact_id)) {
    conversationId = conversationMap.get(normalized.contact_id);
    console.log(`Reusando conversación existente para contact_id ${normalized.contact_id} -> ${conversationId}`);

    data = await sendMessageToLaburenAgent({
      conversationId: conversationId,
      query: normalized.text,
      visitorId: normalized.contact_id
    });
  } else {
    data = await sendMessageToLaburenAgent({
      query: normalized.text,
      visitorId: normalized.contact_id
    });

    conversationId = data?.conversationId;
    conversationMap.set(normalized.contact_id, conversationId);

    console.log(`Nueva conversación asignada para contact_id ${normalized.contact_id}: ${conversationId}`);
    patchMetadata(conversationId, contact.phone, normalized.origin);
  }

  const answer = (data?.answer || "").trim();

  console.log(`${contact.name}: ${normalized.text}`);
  console.log(`Agente: ${answer}`);

  await updateLead(normalized.element_id, KOMMO_TEXT_FIELD_ID, answer);
  await launchSalesBot(KOMMO_BOT_ID, normalized.element_id, 2);

  return;
}