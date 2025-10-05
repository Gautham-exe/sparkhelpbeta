import { FeatureForm } from "@/components/feature-form"

export default function Page() {
  return (
    <FeatureForm
      title="Smart Summary Maker"
      description="Get a short summary, 5 key points, and flashcards."
      featureKey="summaryMaker"
      placeholder="Paste a long article, notes, or textbook excerpt..."
    />
  )
}
