import { FeatureForm } from "@/components/feature-form"

export default function Page() {
  return (
    <FeatureForm
      title="AI Revision Planner"
      description="Generate a study schedule with spaced repetition."
      featureKey="revisionPlanner"
      placeholder="List syllabus topics, available time per day, and your exam date..."
    />
  )
}
