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

const isShown = atom({ plugin: 'claudopus-en', key: 'isShown' } as const, false)

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    const result = await next(e)
    if (e.isInteractive) await update($, isShown, () => true)
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
        <Text color="#f5f5f5" bold>GRAAAAAAAAH Here's the mighty Claudopus 🦖</Text>
      </Box>
    )
  })
}
