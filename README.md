# heroku-vf-slackbot
Use Voiceflow to run a Slack Bot with Dialog Manager API

## Prerequisite

- [Heroku](https://www.heroku.com/) account
- An access to Slack API website
- A Chat Assistant project on Voiceflow

## Usage

1. Go to to https://api.slack.com/apps?new_app=1 to create your Slack app



2. click [![Deploy](https://www.herokucdn.com/deploy/button.svg)](https://heroku.com/deploy)
3. On Heroku, enter the following and click "Deploy app"
  - *App Name*
    - set your app name on Heroku as well as some info from Slack and Voiceflow
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





```
{
    "display_information": {
        "name": "Voiceflow Assistant",
        "description": "Assistant to help us in every day tasks",
        "background_color": "#37393d"
    },
    "features": {
        "app_home": {
            "home_tab_enabled": true,
            "messages_tab_enabled": true,
            "messages_tab_read_only_enabled": false
        },
        "bot_user": {
            "display_name": "Voiceflow",
            "always_online": true
        }
    },
    "oauth_config": {
        "scopes": {
            "user": [
                "users:read"
            ],
            "bot": [
                "app_mentions:read",
                "channels:history",
                "chat:write",
                "im:history",
                "im:read",
                "im:write",
                "mpim:history",
                "mpim:read",
                "mpim:write",
                "users.profile:read",
                "users:read"
            ]
        }
    },
    "settings": {
        "event_subscriptions": {
            "user_events": [
                "message.app_home",
                "user_change"
            ],
            "bot_events": [
                "app_home_opened",
                "app_mention",
                "message.channels",
                "message.im",
                "message.mpim",
                "user_change"
            ]
        },
        "interactivity": {
            "is_enabled": true
        },
        "org_deploy_enabled": false,
        "socket_mode_enabled": true,
        "token_rotation_enabled": false
    }
}
```
