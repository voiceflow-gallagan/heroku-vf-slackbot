/* eslint-disable no-await-in-loop */
import slack_pkg from '@slack/bolt'
const { App } = slack_pkg
import { cleanEmail, stripEmojis, stripBackSlashs, cleanText, CHIP_ACTION_REGEX, ANY_WORD_REGEX } from './components/utils.js'
import * as Home from './components/home.js'
import dotenv from 'dotenv'
import axios from 'axios'
import { Text } from 'slate'
import escapeHtml from 'escape-html'

// Get Env
dotenv.config()

const VOICEFLOW_API_KEY = process.env.VOICEFLOW_API_KEY
const SLACK_APP_TOKEN = process.env.SLACK_APP_TOKEN
const SLACK_BOT_TOKEN = process.env.SLACK_BOT_TOKEN
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET

// Handle local dev
let PORT = process.env.PORT
if (PORT == null || PORT == "") {
  PORT = 3000;
}

let noreply

// Create the Slack app
const app = new App({
  signingSecret: SLACK_SIGNING_SECRET,
  token: SLACK_BOT_TOKEN,
  socketMode: true,
  appToken: SLACK_APP_TOKEN,
})

// Slack app_mention event
app.event('app_mention', async ({ event, client, say }) => {
  try {

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

app.message(ANY_WORD_REGEX, async ({ message, say, client }) => {
  // Ignoring some message types
  if (
    message.subtype === 'message_changed' ||
    message.subtype === 'message_deleted' ||
    message.subtype === 'message_replied'
  )
    return

  // Cleaning user's utterance from Slack
  let utterance = stripEmojis(message.text)
  // Formating Slack email format from <mailto:name@email.com|name@email.com> to name@email.com
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

// Interact with Voiceflow | Dialog Manager API
async function interact(userID, say, client, request) {
  clearTimeout(noreply)
  await client.users.info({
    user: userID,
  })

  // call the Voiceflow API with the user's ID & request
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

  // Handeling the API response
  for (const trace of response.data) {
    switch (trace.type) {
      case 'text': {
          // We use Slate's rendering
          // and add custom styling
          const serialize = node => {
            if (Text.isText(node)) {
              let string = node.text
              let tags = ''
              if (node.fontWeight) {
                tags = '*'
              }
              if (node.italic) {
                tags = tags + '_'
              }
              if (node.underline) {
                // ignoring underline tag as Slack doesn't support it
                // https://api.slack.com/reference/surfaces/formatting
              }
              if (node.strikeThrough) {
                tags = tags + '~'
              }
              return `${tags}${string}${tags.split('').reverse().join('')}`
            }

            const children = node.children.map(n => serialize(n)).join('')

            switch (node.type) {
              case 'link':
                return `<${escapeHtml(node.url)}|${children}>`
              default:
                return children
            }
          }

          // Render slate content
          let renderedMessage = trace.payload.slate.content
            .map((slateData) =>
              slateData.children
                  .map((slateChild) => serialize(slateChild))
                  .join('')
            )
            .join('\n')

          console.log('Render:',renderedMessage)
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
            // Avoid breaking the Bot by ignoring then content if not supported
            console.log('Not supported yet')
            return false
          }
        break
      }
      case 'speak': {
        try {
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
        } catch (error) {
            // Avoid breaking the Bot by ignoring then content if not supported
            console.log('Not supported yet')
            return false
        }
        break
      }
      case 'visual': {
        if (trace.payload.visualType === 'image') {
              try {
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
              } catch (error) {
                // Avoid breaking the Bot by ignoring then content if not supported
                console.log('Not supported yet')
                return false
              }
        }
        break
      }
      case 'choice': {
        const buttons = trace.payload.buttons

        if (buttons.length) {
          try {
            let url = null
            await say({
              text: 'Voiceflow Bot',
              blocks: [
                {
                  type: 'actions',
                  elements: buttons.map(({ name, request }) => {
                    // Handle URL action
                    if(Object.keys(request.payload).includes("actions")){
                      if(Object.values(request.payload.actions[0]).includes("open_url")){
                        url = escapeHtml(request.payload.actions[0].payload.url)
                      }
                    }
                    if (request.type == 'intent') {
                      let button = {
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
                        style: 'primary'
                      }
                      if(url){ button.url = url}
                      return button
                    } else {
                      let button = {
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
                        style: 'primary'
                      }
                      if(url){ button.url = url}
                      return button
                    }
                  }),
                },
              ],
            })
          } catch (error) {
            // Avoid breaking the Bot by ignoring then content if not supported
            console.log('Not supported yet')
            return false
          }
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

process.once('SIGINT', () => app.stop('SIGINT'))
process.once('SIGTERM', () => app.stop('SIGTERM'))
