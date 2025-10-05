import { FeatureForm } from "@/components/feature-form"

export default function Page() {
  return (
    <FeatureForm
      title="AI Concept Explainer"
      description="Explains a topic at child, high-school, and college levels."
      featureKey="conceptExplainer"
      placeholder="Enter a topic, e.g., 'Photosynthesis'..."
    />
  )
}
