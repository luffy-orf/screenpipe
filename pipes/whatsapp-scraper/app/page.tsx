"use client";

import { useState } from "react";
import { toast } from "sonner";
import { ArrowRight, Loader2, Search } from "lucide-react";
import MessageList from "@/components/message-list";

export default function Home() {
  const [contact, setContact] = useState("");
  const [messageCount, setMessageCount] = useState(50);
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{text: string, timestamp: string, sender: string}[]>([]);
  const [exportFormat, setExportFormat] = useState<"json" | "csv">("json");
  const [searchQuery, setSearchQuery] = useState("");

  const startScraping = async () => {
    if (!contact) {
      toast.error("please enter a contact name");
      return;
    }

    setLoading(true);
    setMessages([]);

    try {
      // First, try to open WhatsApp application
      const openResponse = await fetch("/api/open-whatsapp");
      if (!openResponse.ok) {
        throw new Error("failed to open whatsapp");
      }

      // Search for the contact
      const searchResponse = await fetch(`/api/search-contact?contact=${encodeURIComponent(contact)}`);
      if (!searchResponse.ok) {
        throw new Error("failed to search for contact");
      }

      // Scrape messages
      const scrapeResponse = await fetch(`/api/scrape-messages?messageCount=${messageCount}`);
      if (!scrapeResponse.ok) {
        throw new Error("failed to scrape messages");
      }

      const data = await scrapeResponse.json();
      setMessages(data.messages);
      toast.success(`successfully scraped ${data.messages.length} messages`);
    } catch (error) {
      toast.error(`error: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (messages.length === 0) {
      toast.error("no messages to export");
      return;
    }

    let content: string;
    let filename: string;
    
    if (exportFormat === "json") {
      content = JSON.stringify(messages, null, 2);
      filename = `whatsapp-${contact}-${new Date().toISOString()}.json`;
    } else {
      // CSV format
      const headers = "timestamp,sender,message\n";
      const rows = messages.map(msg => 
        `"${msg.timestamp}","${msg.sender}","${msg.text.replace(/"/g, '""')}"`
      ).join("\n");
      content = headers + rows;
      filename = `whatsapp-${contact}-${new Date().toISOString()}.csv`;
    }

    // Create blob and download
    const blob = new Blob([content], { type: exportFormat === "json" ? "application/json" : "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success(`exported ${messages.length} messages to ${filename}`);
  };

  const listContacts = async () => {
    try {
      // First, try to open WhatsApp application if not already open
      const openResponse = await fetch("/api/open-whatsapp");
      if (!openResponse.ok) {
        throw new Error("failed to open whatsapp");
      }
      
      // Get all visible contacts
      const contactsResponse = await fetch("/api/list-contacts");
      if (!contactsResponse.ok) {
        throw new Error("failed to list contacts");
      }
      
      const data = await contactsResponse.json();
      
      if (data.contacts.length === 0) {
        toast.info("no contacts found in sidebar");
      } else {
        toast.success(`found ${data.contacts.length} contacts`);
        // Show contacts in a more user-friendly way
        console.log("contacts:", data.contacts);
      }
    } catch (error) {
      toast.error(`error: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  return (
    <main className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">whatsapp scraper</h1>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-6">
        <h2 className="text-xl font-semibold mb-4">configuration</h2>
        
        <div className="space-y-4">
          <div className="flex gap-2">
            <div className="flex-grow">
              <label htmlFor="contact" className="block mb-2 text-sm font-medium">
                contact or group name
              </label>
              <input
                id="contact"
                type="text"
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
                placeholder="enter exact contact or group name"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={listContacts}
                className="p-2 h-10 bg-secondary text-secondary-foreground rounded-md"
                title="list available contacts"
              >
                <Search className="h-5 w-5" />
              </button>
            </div>
          </div>
          
          <div>
            <label htmlFor="messageCount" className="block mb-2 text-sm font-medium">
              number of messages to scrape
            </label>
            <input
              id="messageCount"
              type="number"
              value={messageCount}
              onChange={(e) => setMessageCount(Number(e.target.value))}
              min={1}
              max={500}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            />
          </div>
          
          <div>
            <label htmlFor="exportFormat" className="block mb-2 text-sm font-medium">
              export format
            </label>
            <select
              id="exportFormat"
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value as "json" | "csv")}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
            >
              <option value="json">JSON</option>
              <option value="csv">CSV</option>
            </select>
          </div>
          
          <div className="flex space-x-4">
            <button
              onClick={startScraping}
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-md flex items-center space-x-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>scraping...</span>
                </>
              ) : (
                <>
                  <span>start scraping</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
            
            <button
              onClick={exportData}
              disabled={messages.length === 0}
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md disabled:opacity-50"
            >
              export data
            </button>
          </div>
        </div>
      </div>
      
      {/* Results display */}
      {messages.length > 0 && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <div className="mb-4">
            <label htmlFor="search" className="block mb-2 text-sm font-medium">
              search in messages
            </label>
            <input
              id="search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full p-2 border rounded-md dark:bg-gray-700 dark:border-gray-600"
              placeholder="enter search term"
            />
          </div>
          
          <MessageList messages={messages} highlightText={searchQuery} />
        </div>
      )}
    </main>
  );
} 