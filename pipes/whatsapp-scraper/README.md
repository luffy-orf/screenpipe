# whatsapp scraper

A general purpose scraper for WhatsApp desktop application built with screenpipe.

## features

- open whatsapp desktop application automatically
- search for specific contacts or groups
- extract messages from conversations
- export data to JSON or CSV format
- scroll through chat history

## prerequisites

- screenpipe installed
- whatsapp desktop application installed and logged in
- the device used for scraping should have access to whatsapp desktop

## usage

1. start the pipe
   ```
   cd pipes/whatsapp-scraper
   bun install
   bun dev
   ```

2. open the UI at http://localhost:3000

3. enter the contact or group name exactly as it appears in whatsapp

4. set the number of messages to scrape 

5. click "start scraping" and wait for the process to complete

6. once scraping is complete, you can export the data in JSON or CSV format

## how it works

this pipe uses the screenpipe operator api to:

1. open whatsapp desktop application
2. navigate to the specified contact/group
3. extract text content from the chat
4. parse the content to identify messages, timestamps, and senders
5. export the structured data

## limitations

- the desktop app must already be logged in
- contact/group names must match exactly as they appear in whatsapp
- message format parsing may need adjustments based on whatsapp's ui changes
- some messages with complex content (like code blocks, quotes) may not be parsed perfectly

## troubleshooting

- if scraping fails, make sure whatsapp desktop is installed and logged in
- make sure the contact/group name is entered exactly as shown in whatsapp
- try restarting the pipe if you encounter unexpected errors
- check console logs for more detailed error information 