const http = require("http");

// Somehow throwing errors: (node:147) UnhandledPromiseRejectionWarning: Error: Table 'main.platforminfo' doesn't exist
//const config = require("platformsh-config").config();

const server = http.createServer(async function(_request, response) {
  // Make the output.
  const outputString = `Hello, World! - A simple Node.js template for Platform.sh`
  response.writeHead(200, { "Content-Type": "text/plain" });
  response.end(outputString);
});

// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET
});

// This will match any Slack message from channels where the bot has been invited.
app.message(async ({ message, say }) => {
  var threadTs;
  var channelId;
  var replyCount;
  var replyMessage;
  
  // Get the channel where the message was posted.
  channelId = message.channel;
  
  // Get the thread that contains the message.
  if(message.thread_ts) {threadTs = message.thread_ts;} else {threadTs = message.ts;}
  
  //console.log (message);
  
  // Get the threads posted to the conversation containing the message.
  try {
    const result = await app.client.conversations.replies({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId,
      ts: threadTs
    });
    // Get the number of threads within the conversation.
    if(result.messages[0]['reply_count']) {replyCount = result.messages[0]['reply_count'];} else {replyCount = 0;}
  }
  catch(e){
    console.log(e);
  }
  
  if(replyCount == process.env.THREAD_NUMBER_LIMIT) { 
    replyMessage = `Hi :wave:, this thread is becoming quite long (${replyCount} messages)! Have you considered opening an issue or schedule a call to find a solution?`; 
    // Reply as a thread within the conversation. 
    await say({text:`${replyMessage}`,thread_ts:threadTs});
  }
  
});

// Get PORT and start the server
//server.listen(config.port, function() {
server.listen(8888, function() {
  console.log('⚡️ Slack Bolt app is running!');
});