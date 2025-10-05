import { FeatureForm } from "@/components/feature-form"

export default function Page() {
  return (
    <FeatureForm
      title="Interactive Study Mode (Quizzes)"
      description="Generate 10 practice questions with answers from your notes."
      featureKey="interactiveStudy"
      placeholder="Paste your notes or textbook content..."
    />
  )
}
