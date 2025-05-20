import { NextResponse } from "next/server";
import { pipe } from "@screenpipe/js";

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const contact = url.searchParams.get("contact");
    
    if (!contact) {
      return NextResponse.json(
        { error: "Contact name is required" },
        { status: 400 }
      );
    }
    
    console.log(`Searching for contact: ${contact}`);
    
    // First, focus on the search field
    // WhatsApp's search field is often a textbox at the top of the sidebar
    try {
      // Find search field, usually an input element
      const searchField = await pipe.operator
        .locator({
          app: "WhatsApp",
          role: "AXTextField", // or "AXSearchField" depending on WhatsApp's implementation
          useBackgroundApps: true,
        })
        .first();
      
      if (!searchField) {
        console.error("Could not find the search field");
        
        // Try to use keyboard shortcut for search instead
        await pipe.operator.pixel.press("ctrl+f");
        // or on Mac: await pipe.operator.pixel.press("command+f");
        
        // Wait for search field to appear
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        // If we found the search field, click it
        await pipe.operator
          .locator({
            app: "WhatsApp",
            role: "AXTextField",
            useBackgroundApps: true,
          })
          .click();
      }
      
      // Clear the search field first (if there was any previous search)
      await pipe.operator.pixel.press("escape");
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // Type the contact name
      await pipe.operator.pixel.type(contact);
      
      // Wait for search results
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Press enter to select the first result
      await pipe.operator.pixel.press("enter");
      
      // Wait for chat to load
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return NextResponse.json({ success: true });
    } catch (error) {
      console.error("Error searching for contact:", error);
      return NextResponse.json(
        { error: `Failed to search for contact: ${error instanceof Error ? error.message : String(error)}` },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Route error:", error);
    return NextResponse.json(
      { error: `Failed to process request: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
} 