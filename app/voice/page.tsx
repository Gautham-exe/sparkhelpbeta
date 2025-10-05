import { FeatureForm } from "@/components/feature-form"

export default function Page() {
  return (
    <FeatureForm
      title="Voice → Text Converter"
      description="Use voice commands like 'make this bold', 'center align', or type directly."
      featureKey="voiceToTextFormatting"
      placeholder="Speak or type your command or text content here..."
      enableVoice
    />
  )
}
