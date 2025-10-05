import { FeatureForm } from "@/components/feature-form"

export default function Page() {
  return (
    <FeatureForm
      title="Visual Problem Solver (STEM)"
      description="Analyze diagrams or statements to solve STEM problems with steps."
      featureKey="visualProblemSolver"
      placeholder="Describe the visual or the problem; upload a diagram if helpful..."
      acceptImage
    />
  )
}
