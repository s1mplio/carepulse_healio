'use client'

import { FormEvent, useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface SymptomResult {
  department: string
  urgency: string
  doctorType: string
  notes: string
  rawText?: string
}

const SymptomCheckerPage = () => {
  const [symptoms, setSymptoms] = useState("")
  const [result, setResult] = useState<SymptomResult | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setResult(null)

    if (!symptoms.trim()) {
      setError("Please describe your symptoms before checking.")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/ai-symptom-checker", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ symptoms }),
      })

      const body = await response.json()

      if (!response.ok) {
        throw new Error(body?.message || "Unable to reach the symptom checker.")
      }

      setResult(body)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unexpected error.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <main className="container mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl rounded-3xl border border-dark-500 bg-dark-200 p-8 shadow-lg">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-white">AI Symptom Checker</h1>
            <p className="mt-2 text-sm text-dark-600">
              Enter your symptoms and get department, urgency, and doctor recommendations.
            </p>
          </div>
          <Link href="/" className="text-sm font-medium text-green-500 hover:text-green-400">
            Back to home
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="symptoms" className="mb-2 block text-sm font-medium text-white">
              Symptoms
            </label>
            <Textarea
              id="symptoms"
              value={symptoms}
              onChange={(event) => setSymptoms(event.target.value)}
              placeholder="Examples: chest pain, shortness of breath, fever, sore throat, headache..."
              rows={8}
              className="min-h-[180px] bg-dark-300 text-white"
            />
          </div>

          {error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? "Analyzing symptoms..." : "Check My Symptoms"}
          </Button>
        </form>

        {result ? (
          <section className="mt-10 space-y-4 rounded-3xl border border-dark-500 bg-dark-300 p-6">
            <h2 className="text-2xl font-semibold text-white">Suggested care plan</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-dark-500 bg-dark-400 p-4">
                <p className="text-sm text-muted-foreground">Department</p>
                <p className="mt-2 text-lg font-semibold text-white">{result.department}</p>
              </div>
              <div className="rounded-2xl border border-dark-500 bg-dark-400 p-4">
                <p className="text-sm text-muted-foreground">Urgency</p>
                <p className="mt-2 text-lg font-semibold text-white">{result.urgency}</p>
              </div>
              <div className="rounded-2xl border border-dark-500 bg-dark-400 p-4">
                <p className="text-sm text-muted-foreground">Recommended doctor</p>
                <p className="mt-2 text-lg font-semibold text-white">{result.doctorType}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-dark-500 bg-dark-400 p-4">
              <p className="text-sm text-muted-foreground">Notes</p>
              <p className="mt-2 text-base leading-7 text-white">{result.notes}</p>
            </div>
            <div className="rounded-2xl border border-dark-500 bg-dark-400 p-4 text-sm text-dark-500">
              <p className="font-medium text-white">Disclaimer</p>
              <p>This tool provides a suggested care path only. It is not a substitute for professional medical advice.</p>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  )
}

export default SymptomCheckerPage
