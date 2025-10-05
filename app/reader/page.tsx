import { ReadingAssistant } from "@/components/reading-assistant"

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-6 md:py-8 max-w-4xl">
      <div className="mb-6 md:mb-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          AI Reading Assistant
        </h1>
        <p className="text-muted-foreground text-sm md:text-base">
          Translate and read text aloud in Hindi, English, or Kannada.
        </p>
      </div>
      <ReadingAssistant />
    </div>
  )
}
