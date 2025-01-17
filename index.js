const core = require('@actions/core')
const github = require('@actions/github')
const fetch = require('node-fetch')

async function getContext() {
  const context = github.context
  const payload = context.payload

  const content = {
    body: payload.release.body.length < 1500
      ? payload.release.body
      : payload.release.body.substring(0, 1500) + ` ([...](${payload.release.html_url}))`,
    version: payload.release.tag_name,
    html_url: payload.release.html_url
  }

  return content
}

async function run() {
  try {
    const webhookId = core.getInput('webhook_id')
    const webhookToken = core.getInput('webhook_token')

    if (!webhookId || !webhookToken) {
      return core.setFailed('webhook ID or TOKEN are not configured correctly. Verify config file.')
    }

    const content = await getContext()

    const component = {
      type: 1,
      components: [
        {
          style: 1,
          type: 2,
          label: 'Check it out!',
          url: 'https://index-space.org',
          disabled: false,
          emoji: {
            id: null,
            name: '👋'
          }
        }
      ]
    }

    const embedMsg = {
      color: 0x2cad60,
      title: `Release ${content.version}`,
      description: content.body,
      url: 'https://index-space.org',
      author: {
        name: '@theflowingsky',
        url: 'https://discordapp.com/users/714561137798021213',
        icon_url: 'https://devinhalladay.com/assets/images/bubble-rainbow.png'
      },
      footer: {
        text: 'INDEX RELEASE NOTES'
      }
    }

    const body = { components: [component], embeds: [embedMsg], content: 'Hello! A new release of the Index product has been published. Let us know what you think or if you have any questions ❤️' }

    const url = `https://discord.com/api/webhooks/${core.getInput('webhook_id')}/${core.getInput('webhook_token')}?wait=true`

    fetch(url, {
      method: 'post',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    })
      .then(res => res.json())
      .then(data => core.info(JSON.stringify(data)))
      .catch(err => core.info(err))
  } catch (error) {
    core.setFailed(error.message)
  }
}

run()
