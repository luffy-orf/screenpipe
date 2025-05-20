import { NextResponse } from "next/server";
import { pipe } from "@screenpipe/js";
import { scrollUpChat, sleep } from "@/lib/whatsapp-utils";

interface WhatsAppMessage {
  text: string;
  timestamp: string;
  sender: string;
}

export async function GET(request: Request) {
  try {
    // Get query parameters
    const url = new URL(request.url);
    const messageCountParam = url.searchParams.get("messageCount");
    const messageCount = messageCountParam ? parseInt(messageCountParam, 10) : 50;
    
    if (isNaN(messageCount) || messageCount <= 0) {
      return NextResponse.json(
        { error: "messageCount must be a positive number" },
        { status: 400 }
      );
    }
    
    console.log(`Scraping ${messageCount} messages from WhatsApp chat`);
    
    // Calculate how many times we need to scroll based on message count
    // More messages means more scrolling needed
    const scrollCount = Math.ceil(messageCount / 15); // Roughly 15 messages visible at a time
    
    console.log(`Will scroll up ${scrollCount} times to load more messages`);
    
    // Scroll up to load more messages
    await scrollUpChat(scrollCount);
    
    // Wait a bit for messages to load
    await sleep(1000);
    
    // First, get the chat container text to extract messages
    const result = await pipe.operator.getText({
      app: "WhatsApp",
      maxDepth: 100, // Adjust as needed to capture enough messages
    });
    
    if (!result.success || !result.text) {
      console.error("Failed to extract text from WhatsApp");
      return NextResponse.json(
        { error: "Failed to extract text from WhatsApp" },
        { status: 500 }
      );
    }
    
    console.log(`Extracted ${result.text.length} characters of text`);
    
    // Now we need to parse the raw text to extract messages
    // This is the most challenging part as we need to identify the pattern of messages
    const messages = parseWhatsAppMessages(result.text, messageCount);
    
    return NextResponse.json({
      success: true,
      messages: messages,
    });
  } catch (error) {
    console.error("Error scraping messages:", error);
    return NextResponse.json(
      { error: `Failed to scrape messages: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    );
  }
}

function parseWhatsAppMessages(rawText: string, limit: number): WhatsAppMessage[] {
  const messages: WhatsAppMessage[] = [];
  
  // WhatsApp desktop messages typically follow these patterns:
  // 1. Timestamps are often in format like "10:42 AM" or "Yesterday 3:15 PM"
  // 2. Sender names appear before messages in group chats
  // 3. Messages are typically separated by some whitespace
  
  // Split the text into lines for easier processing
  const lines = rawText.split('\n');
  
  let currentSender = "";
  let currentTimestamp = "";
  let currentMessage = "";
  let collectingMessage = false;
  
  // Regular expressions to identify patterns
  const timeRegex = /\b([0-9]{1,2}:[0-9]{2} (?:AM|PM))\b/; // Matches "10:42 AM"
  const dateTimeRegex = /\b(Today|Yesterday|[0-9]{1,2}\/[0-9]{1,2}\/[0-9]{2,4}) ([0-9]{1,2}:[0-9]{2} (?:AM|PM))\b/; // Matches "Yesterday 3:15 PM"
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (line.length === 0) {
      // Empty line could separate messages
      if (collectingMessage && currentMessage) {
        messages.push({
          text: currentMessage.trim(),
          timestamp: currentTimestamp,
          sender: currentSender || "You",
        });
        
        collectingMessage = false;
        currentMessage = "";
      }
      continue;
    }
    
    // Check if line contains a timestamp
    const timeMatch = line.match(timeRegex);
    const dateTimeMatch = line.match(dateTimeRegex);
    
    if (dateTimeMatch || timeMatch) {
      // If we were collecting a message, save it before starting a new one
      if (collectingMessage && currentMessage) {
        messages.push({
          text: currentMessage.trim(),
          timestamp: currentTimestamp,
          sender: currentSender || "You",
        });
      }
      
      // Start collecting a new message
      collectingMessage = true;
      currentMessage = "";
      
      if (dateTimeMatch) {
        currentTimestamp = `${dateTimeMatch[1]} ${dateTimeMatch[2]}`;
        // The rest might be the sender or message
        const remaining = line.replace(dateTimeMatch[0], "").trim();
        if (remaining) {
          if (remaining.endsWith(":")) {
            // Likely a sender name
            currentSender = remaining.slice(0, -1).trim();
          } else {
            // Part of the message
            currentMessage = remaining;
          }
        }
      } else if (timeMatch) {
        currentTimestamp = timeMatch[1];
        // The rest might be the sender or message
        const remaining = line.replace(timeMatch[0], "").trim();
        if (remaining) {
          if (remaining.endsWith(":")) {
            // Likely a sender name
            currentSender = remaining.slice(0, -1).trim();
          } else {
            // Part of the message
            currentMessage = remaining;
          }
        }
      }
    } else if (collectingMessage) {
      // If we're collecting a message, add this line to it
      currentMessage += (currentMessage ? "\n" : "") + line;
    } else if (line.endsWith(":")) {
      // Might be a sender without a visible timestamp
      currentSender = line.slice(0, -1).trim();
      collectingMessage = true;
    } else {
      // Just add as a message with unknown time
      messages.push({
        text: line,
        timestamp: "Unknown",
        sender: currentSender || "Unknown",
      });
    }
    
    // Check if we've reached the limit
    if (messages.length >= limit) {
      break;
    }
  }
  
  // Add the last message if we were collecting one
  if (collectingMessage && currentMessage && messages.length < limit) {
    messages.push({
      text: currentMessage.trim(),
      timestamp: currentTimestamp,
      sender: currentSender || "You",
    });
  }
  
  // Take only the requested number of messages
  return messages.slice(0, limit);
} 