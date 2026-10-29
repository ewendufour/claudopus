import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

const DINO = [
  '       ▄██████▄',
  '       ██▀██████',
  '       █████████',
  '       ██████▄▄▄',
  '█     ██████',
  '██▄ ▄████████▄',
  '▀███████████ ▀',
  '  ▀███████▀',
  '    ██▀ ██',
  '    █▄  █▄',
].join('\n')

const isShown = atom({ plugin: 'claudopus', key: 'isShown' } as const, false)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    if (e.isInteractive) {
      await update($, isShown, () => true)
      // Roar in the background: $.audio.play is silent in a Linux terminal,
      // so try the usual players first, then $.audio.play (macOS).
      void (async () => {
        const clip = `${$.plugin.root}/sounds/claudopus-roar.mp3`
        for (const argv of [['pw-play', clip], ['paplay', clip], ['ffplay', '-nodisp', '-autoexit', '-loglevel', 'quiet', clip]]) {
          if (await $.process.run(argv).then(r => r.exitCode === 0, () => false)) return
        }
        await $.audio.play({ asset: 'sounds/claudopus-roar.mp3' }).catch(() => {})
      })()
    }
    return result
  })

  // The dino goes away on the first message.
  on('prompt.submit', async ($, e, next) => {
    await update($, isShown, () => false).catch(() => {})
    return next(e)
  })

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    if (e.props.hasSurvey || !(await read($, isShown))) return next(e)
    const { Box, Text } = $.ui.resolve(e)
    return (
      <Box flexDirection="column" paddingLeft={3}>
        <Text color="#78e66e" bold>{DINO}</Text>
        <Text color="#f5f5f5" bold>GRAAAAAAAAA Here's the mighty Claudopus 🦖</Text>
      </Box>
    )
  })
}
