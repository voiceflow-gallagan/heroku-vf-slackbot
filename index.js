/* eslint-disable no-await-in-loop */

import slack_pkg from '@slack/bolt'
const { App } = slack_pkg
import { stripEmojis, stripBackSlashs, cleanText } from './components/utils.js'
import * as Home from './components/home.js'
import dotenv from 'dotenv'
import axios from 'axios'

// Get Env
dotenv.config()

const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY
const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET
const PORT = process.env.PORT || 3000

let noreply

const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
})

//let session = `${process.env.VOICEFLOW_VERSION_ID}.${createSession()}`
//const versionID = process.env.VOICEFLOW_VERSION_ID
//const apiKey = process.env.VOICEFLOW_API_KEY

app.event('app_mention', async ({ event, client, say }) => {
  try {
    // Call chat.postMessage with the built-in client
    let i = await client.users.info({
      user: event.user,
    })

    let userName = i.user.profile.real_name_normalized

    await say(`Hi ${userName}`)
    let utterance = event.text.split('>')[1]
    utterance = stripEmojis(utterance)
    utterance = cleanEmail(utterance)
    if (utterance === 'hi' || utterance === 'hi there') {
      await interact(event.user, say, client, {
        type: 'launch',
      })
    } else {
      await interact(event.user, say, client, {
        type: 'text',
        payload: utterance,
      })
    }
  } catch (error) {
    console.error(error)
  }
})

// Listen for users opening your App Home
app.event('app_home_opened', async ({ event, client }) => {
  Home.show(client, event)
})

const CHIP_ACTION_REGEX = new RegExp(/chip:(.+):(.+)/i)
app.action(CHIP_ACTION_REGEX, async ({ action, say, ack, client }) => {
  ack()
  if (action.type !== 'button') return
  // get the user id from the action id
  let userID = action.action_id.split(':')[2]
  let path = action.action_id.split(':')[1]
  await client.users.info({
    user: userID,
  })

  if (path.includes('path-')) {
    console.log('isPath')
    await interact(userID, say, client, {
      type: path,
      payload: {
        label: action.value,
      },
    })
  } else {
    await interact(userID, say, client, {
      type: 'intent',
      payload: {
        query: action.value,
        label: action.value,
        intent: {
          name: path,
        },
        entities: [],
      },
    })
  }
})

const ANY_WORD_REGEX = new RegExp(/(.+)/i)
app.message(ANY_WORD_REGEX, async ({ message, say, client }) => {
  if (
    message.subtype === 'message_changed' ||
    message.subtype === 'message_deleted' ||
    message.subtype === 'message_replied'
  )
    return
  let utterance = stripEmojis(message.text)
  utterance = cleanEmail(utterance)
  console.log('Utterance:', utterance)
  if (utterance === 'hi' || utterance === 'hi there') {
    await interact(message.user, say, client, {
      type: 'launch',
    })
  } else {
    await interact(message.user, say, client, {
      type: 'text',
      payload: utterance,
    })
  }
})
;(async () => {
  // Start the app
  await app.start(PORT)
  console.log(`⚡️ Bolt app is running on port ${PORT}!`)
})()

// Enable graceful stop
//process.once('SIGINT', () => app.stop('SIGINT'))
//process.once('SIGTERM', () => app.stop('SIGTERM'))


function cleanEmail(text) {
  let email = text.match(/([a-zA-Z0-9+._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/gi)
  let result = text
  if (email) {
    console.log('isEmail')
    email = email[0]
    result = text.split('<')[0]
    result = result + email + text.split('>')[1]
  }
  return result
}

async function interact(userID, say, client, request) {
  clearTimeout(noreply)
  await client.users.info({
    user: userID,
  })
  console.log('INTERACT')
  // call the Voiceflow API with the user's name & request, get back a response
  const response = await axios({
    method: 'POST',
    url: `https://general-runtime.voiceflow.com/state/user/${userID}/interact`,
    headers: { Authorization: VOICEFLOW_API_KEY, 'Content-Type': 'application/json' },
    data: {
      request,
      config: {
        tts: false,
        stripSSML: true,
      },
    },
  })

  for (const trace of response.data) {
    console.log('TRACE TYPE:', trace.type)
    // DEBUG PAYLOAD
      console.log(trace.payload)
    switch (trace.type) {
      case 'text': {
        // DEBUG PAYLOAD
        // console.log(trace.payload.slate.content[0]);
        // console.log(trace.payload.message);
          let renderedMessage = trace.payload.slate.content
            // Format each slate child
            .map((slateData) =>
              slateData.children
                // Just the text
                .map((slateChild) => slateChild.text)
                // Join with no separator
                .join('')
            )
            // Join with more newlines
            .join('\n')
          try {
            await say({
            text: 'Voiceflow Bot',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: cleanText(stripBackSlashs(renderedMessage)),
                },
              },
            ],
          })
          } catch (error) {
            console.log('No supported yet')
          }
        break
      }
      case 'speak': {
          await say({
            text: 'Voiceflow Bot',
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: stripBackSlashs(trace.payload.message),
                },
              },
            ],
          })
        break
      }
      case 'visual': {
        if (trace.payload.visualType === 'image') {
          const url = ''
          if (url != 0) {
            await say({
              text: 'Voiceflow Bot',
              blocks: [{ type: 'image', image_url: url, alt_text: 'image' }],
            })
          } else {
            await say({
              text: 'Voiceflow Bot',
              blocks: [
                {
                  type: 'image',
                  image_url: trace.payload.image,
                  alt_text: 'image',
                },
              ],
            })
          }
        }
        break
      }
      case 'choice': {
        const buttons = trace.payload.buttons

        if (buttons.length) {
          await say({
            text: 'Voiceflow Bot',
            blocks: [
              {
                type: 'actions',
                elements: buttons.map(({ name, request }) => {
                  if (request.type == 'intent') {
                    return {
                      type: 'button',
                      action_id: `chip:${
                        request.payload.intent.name
                      }:${userID}:${Math.random().toString(6)}`,
                      text: {
                        type: 'plain_text',
                        text: name,
                        emoji: true,
                      },
                      value: name,
                    }
                  } else {
                    return {
                      type: 'button',
                      action_id: `chip:${
                        request.type
                      }:${userID}:${Math.random().toString(6)}`,
                      text: {
                        type: 'plain_text',
                        text: name,
                        emoji: true,
                      },
                      value: name,
                    }
                  }
                }),
              },
            ],
          })
        }
        break
      }
      case 'no-reply': {
        noreply = setTimeout(function () {
          interact(userID, say, client, {
            type: 'no-reply',
          })
        }, trace.payload.timeout * 1000)
        break
      }
      case 'end': {
        // an end trace means the the Voiceflow dialog has ended
        console.log('End Convo')
        clearTimeout(noreply)
        return false
      }
    }
  }
  return true
}
