import { TranslatorWithVoice } from "@/components/translator-with-voice"

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Multi-Language Translator
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Preserves tone and context. Use voice input or type your text.
        </p>
      </div>
      <TranslatorWithVoice />
    </div>
  )
}
