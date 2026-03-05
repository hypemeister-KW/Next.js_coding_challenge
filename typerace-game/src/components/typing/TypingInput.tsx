'use client'

type Props = {
  value: string
  inputRef: React.RefObject<HTMLTextAreaElement | null>
  onInput: (value: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
}

export function TypingInput({ value, inputRef, onInput, onKeyDown }: Props) {
  return (
    <>
      <textarea
        ref={inputRef as React.RefObject<HTMLTextAreaElement>}
        aria-label="typing input"
        value={value}
        onInput={(e) => onInput((e.target as HTMLTextAreaElement).value)}
        onKeyDown={onKeyDown as React.KeyboardEventHandler<HTMLTextAreaElement>}
        className="absolute inset-0 w-full h-full opacity-0 cursor-default resize-none"
        style={{ caretColor: 'transparent' }}
        autoComplete="off"
        autoCapitalize="off"
        autoCorrect="off"
        spellCheck={false}
        tabIndex={0}
      />
    </>
  )
}
