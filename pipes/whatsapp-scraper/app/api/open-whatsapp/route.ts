import { NextResponse } from "next/server";
import { pipe } from "@screenpipe/js";

export async function GET() {
  try {
    console.log("Attempting to open WhatsApp Desktop application");
    
    const result = await pipe.operator.openApplication("WhatsApp");
    
    if (!result) {
      console.error("Failed to open WhatsApp application");
      return NextResponse.json(
        { error: "Failed to open WhatsApp application" },
        { status: 500 }
      );
    }
    
    console.log("WhatsApp Desktop application opened successfully");
    
    // Wait a bit for WhatsApp to fully load
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error opening WhatsApp:", error);
    return NextResponse.json(
      { error: `Failed to open WhatsApp: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 