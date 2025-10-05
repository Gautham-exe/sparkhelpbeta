import { FeatureForm } from "@/components/feature-form"

export default function Page() {
  return (
    <FeatureForm
      title="Essay & Grammar Checker"
      description="Improve grammar, flow, and get constructive feedback."
      featureKey="essayChecker"
      placeholder="Paste your essay here..."
    />
  )
}
