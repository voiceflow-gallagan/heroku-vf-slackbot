# heroku-vf-slackbot
Use Voiceflow to run a Slack Bot with Dialog Manager API

## Prerequisite

- [Heroku](https://www.heroku.com/) account
- A slack app setup and ready
- A Chat Assistant project on Voiceflow
## Usage

1. Dialog API key.
2. click [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
3. On Heroku, enter the following and click "Deploy app"
  - *App Name*
    - set your app name on Heroku
      - used for heroku URL for your app
      - ex) https://APP_NAME.herokuapp.com
      - will need this for chatbot settings in your website
  - *VF_API_KEY*
    - enter Voiceflow Dlaog API key
  - *SLACK_SIGNING_SECRET*
    - Slack app signing secret
  - *SLACK_BOT_SECRET*
    - Slack bot token (starting with xoxb-)
  - *SLACK_APP_SECRET*
    - Slack app secret (starting with xapp-)
  - *PORT*
    - The port to use (default: 3000)
