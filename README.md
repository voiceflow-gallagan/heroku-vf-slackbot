# heroku-vf-slackbot

#### Use Voiceflow Dialog Manager API to run a Slack Bot

# Updates

- Fix for Socket Mode on Heroky

# Prerequisite

- [Heroku](https://www.heroku.com/) account
- [Slack API](https://api.slack.com/) access
- [Voiceflow](https://www.voiceflow.com) Chat Assistant project

# Setup

## ![Slack logo](doc/images/slack/slack-logo.png)

### Create your Slack App

> Go to to https://api.slack.com/apps?new_app=1 to **create your Slack app**

> Select <mark>**From an app manifest**</mark>


![Create a new Slack app](doc/images/slack/slack-create-app.png)

> Select the **workspace** you want to publish the app to

![Select a worksapce](doc/images/slack/slack-select-workspace.png)

> Choose <mark>**JSON**</mark> on the next screen and paste the manifest bellow

![Slack Manifest](doc/images/slack/slack-manifest.png)

~~~json
{
    "display_information": {
        "name": "Voiceflow Slack Demo",
        "description": "Slack Assistant using Voiceflow Dialog Manager API",
        "background_color": "#37393d"
    },
    "features": {
        "app_home": {
            "home_tab_enabled": true,
            "messages_tab_enabled": true,
            "messages_tab_read_only_enabled": false
        },
        "bot_user": {
            "display_name": "Voiceflow Demo",
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
~~~

> Click **Next** at the bottom of the window

![Next](doc/images/slack/slack-app-next.png)

> **Review** the app details and comfirm by clicking on **Create**

![Review Slack app](doc/images/slack/slack-app-review.png)

> **Install** the newly created app on your workspace

![Install Slack app](doc/images/slack/slack-install.png)

> Click on **Allow** to finish to install the app on your Workspace

![Allow Slack app](doc/images/slack/slack-allow.png)

### Generate a signin key and tokens

> On the main screen, you want to <mark>**copy the secret key** and **keep it for later**</mark>

![Slack app secret](doc/images/slack/slack-signin-secret.png)

> Scroll down and click on **Generate Token and Scopes**

![Slack app level tokens](doc/images/slack/slack-app-level-tokens.png)

> Give this Token a **name** and add the **connections:write** scope to it. Then click on **Generate**

![Slack app scope](doc/images/slack/slack-app-level-scope.png)

- Copy the <mark>**app token** and **save it for later**</mark>

![Slack app token](doc/images/slack/slack-app-token.png)

> Go to the **OAuth & Permissions** section, <mark>copy the **Bot User OAuth Token** from there and save it for later</mark>

![Slack app bot token](doc/images/slack/slack-bot-user-token.png)

> You should now have:
	a <mark>**secret key**</mark>
	an <mark>**app token**</mark>
	a <mark>**bot token**</mark>

<img src="doc/images/voiceflow/voiceflow-logo.png" alt="Voiceflow logo" width="180"/>

### Get your project Dialog API key

> Go to [Voiceflow Creator](https://creator.voiceflow.com) and open the <mark>**Chat Assistant project**</mark> you want to use

> On your project, click on **Integration** from the left sidebar (or press the **3** key)

![Voiceflow integration](doc/images/voiceflow/voiceflow-integration.png)

> Click **Copy** to <mark>copy your Voiceflow Dialog API Key and save it for later</mark>

![Voiceflow API key](doc/images/voiceflow/voiceflow-copy.png)


<img src="doc/images/heroku/heroku-logo.png" alt="Voiceflow logo" width="180"/>

### Deploy this code to Heroku

<a href="https://heroku.com/deploy" target="_blank"><img src="https://www.herokucdn.com/deploy/button.svg" alt="Heroku logo" width="180"/></a>

### Setup the Heroku app

> Choose a **name** for your app
> Set the config var with all the info you've previously saved

**SLACK\_APP\_TOKEN**
Slack **app secret** (starting with **xapp-**)

**SLACK\_BOT\_TOKEN**
Slack **bot token** (starting with **xoxb-**)

**SLACK\_SIGNING\_SECRET**
Slack app **signing secret**

**VOICEFLOW\_API\_KEY**
Voiceflow **project API key** (from the Integration section)

> Click on **Deploy app**

![Deploy](doc/images/heroku/heroku-setup.png)

> Wait for your app to be fully deployed

![Deploy](doc/images/heroku/heroku-deploy.png)

## ![Slack logo](doc/images/slack/slack-logo.png)

### Install your Slack App

> On your Slack workspace, click on **Apps** > **Add apps**

![Create a new Slack app](doc/images/slack/slack-add-app.png)

> **Search** for the app name you've created earlier on Slack API website and **click on it** in the Search results list to install it

![Create a new Slack app](doc/images/slack/slack-install-app.png)

> The app is now available and you can click on **Messages** to start interacting with your bot.

![Create a new Slack app](doc/images/slack/slack-try-app.png)

![Create a new Slack app](doc/images/slack/slack-bot.png)
