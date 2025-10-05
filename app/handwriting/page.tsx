import HandwritingDropzone from "@/components/handwriting-dropzone"

export default function Page() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-semibold text-pretty mb-2">Handwriting → Text</h1>
      <p className="text-muted-foreground mb-6">
        Drop an image of your handwritten notes to extract clean text. Math is returned with LaTeX. The app
        automatically selects the best model; no provider choices are required.
      </p>
      <HandwritingDropzone />
    </main>
  )
}
