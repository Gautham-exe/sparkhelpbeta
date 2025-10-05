import { FeatureForm } from "@/components/feature-form"

export default function Page() {
  return (
    <FeatureForm
      title="AI Note Organizer"
      description="Cluster notes by subject/topics and suggest folder names."
      featureKey="noteOrganizer"
      placeholder="Paste multiple notes; include subjects or classes if available..."
    />
  )
}
