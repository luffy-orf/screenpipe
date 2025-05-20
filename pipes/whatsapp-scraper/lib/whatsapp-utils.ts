import { pipe } from "@screenpipe/js";

/**
 * Sleep for the specified number of milliseconds
 */
export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Scroll up the chat to load more messages
 */
export async function scrollUpChat(scrollCount: number = 5): Promise<boolean> {
  try {
    // Try to find the chat container
    const chatContainer = await pipe.operator
      .locator({
        app: "WhatsApp",
        role: "AXScrollArea", // or another appropriate role
        useBackgroundApps: true,
      })
      .first();
    
    if (!chatContainer) {
      console.log("Could not find chat container, trying generic scroll");
      
      // If we can't find it specifically, try general scrolling
      for (let i = 0; i < scrollCount; i++) {
        // Press Page Up to scroll up
        await pipe.operator.pixel.press("pageup");
        await sleep(300);
      }
      
      return true;
    }
    
    // If we found the chat container, scroll it
    for (let i = 0; i < scrollCount; i++) {
      await pipe.operator
        .locator({
          app: "WhatsApp",
          role: "AXScrollArea",
          useBackgroundApps: true,
        })
        .scroll("up", 500);
      
      await sleep(300);
    }
    
    return true;
  } catch (error) {
    console.error("Error scrolling chat:", error);
    return false;
  }
}

/**
 * Extract all visible contact elements from the sidebar
 */
export async function getAllVisibleContacts(): Promise<string[]> {
  try {
    // Get text from WhatsApp sidebar
    const result = await pipe.operator.getText({
      app: "WhatsApp",
      window: "sidebar", // This might not be an actual window name, may need adjustment
      maxDepth: 50,
    });
    
    if (!result.success || !result.text) {
      return [];
    }
    
    // Parse the text to extract contact names
    const lines = result.text.split("\n");
    const contacts: string[] = [];
    
    for (const line of lines) {
      // This is a simplified approach and might need adjustment
      // based on the actual structure of WhatsApp's sidebar
      if (line.trim() && !line.includes(":") && !line.match(/\d{1,2}:\d{2}(AM|PM)/)) {
        contacts.push(line.trim());
      }
    }
    
    return contacts;
  } catch (error) {
    console.error("Error getting contacts:", error);
    return [];
  }
}

/**
 * Take a screenshot of the current WhatsApp window
 */
export async function captureWhatsAppScreen(): Promise<string | null> {
  try {
    // This would typically use screenpipe's screenshot functionality
    // but might require additional implementation beyond the scope of this example
    console.log("Screenshot functionality not implemented");
    return null;
  } catch (error) {
    console.error("Error capturing screen:", error);
    return null;
  }
} 