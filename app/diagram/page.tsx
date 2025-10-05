import { FeatureForm } from "@/components/feature-form"

export default function Page() {
  return (
    <FeatureForm
      title="Diagram to Digital Converter"
      description="Convert hand-drawn diagrams into structured text (Mermaid/JSON)."
      featureKey="diagramConverter"
      placeholder="Describe your diagram and what you'd like extracted, or upload a photo..."
      acceptImage
    />
  )
}
