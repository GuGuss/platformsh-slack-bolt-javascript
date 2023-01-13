// Require the Bolt package (github.com/slackapi/bolt)
const { App } = require("@slack/bolt");

const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  signingSecret: process.env.SLACK_SIGNING_SECRET,
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
  if (message.thread_ts) {
    threadTs = message.thread_ts;
  } else {
    threadTs = message.ts;
  }

  //console.log (message);

  // Get the threads posted to the conversation containing the message.
  try {
    const result = await app.client.conversations.replies({
      token: process.env.SLACK_BOT_TOKEN,
      channel: channelId,
      ts: threadTs,
    });
    // Get the number of threads within the conversation.
    if (result.messages[0]["reply_count"]) {
      replyCount = result.messages[0]["reply_count"];
    } else {
      replyCount = 0;
    }
  } catch (e) {
    console.log(e);
  }

  if (replyCount == process.env.THREAD_NUMBER_LIMIT) {
    replyMessage = `Hi :wave:, this thread is becoming quite long (${replyCount} messages)! Have you considered opening an issue or schedule a call to find a solution?`;
    // Reply as a thread within the conversation.
    await say({ text: `${replyMessage}`, thread_ts: threadTs });
  }
});

(async () => {
  // Start the app.
  await app.start(process.env.PORT || 3000);

  console.log("⚡️ Slack Bolt app is running!");
})();
