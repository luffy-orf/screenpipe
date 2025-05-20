import { NextResponse } from "next/server";
import { getAllVisibleContacts } from "@/lib/whatsapp-utils";

export async function GET() {
  try {
    console.log("Attempting to list all visible WhatsApp contacts");
    
    // Get all visible contacts from sidebar
    const contacts = await getAllVisibleContacts();
    
    if (contacts.length === 0) {
      console.warn("No contacts found in WhatsApp sidebar");
    } else {
      console.log(`Found ${contacts.length} contacts in WhatsApp sidebar`);
    }
    
    return NextResponse.json({
      success: true,
      contacts: contacts,
    });
  } catch (error) {
    console.error("Error listing contacts:", error);
    return NextResponse.json(
      { error: `Failed to list contacts: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 