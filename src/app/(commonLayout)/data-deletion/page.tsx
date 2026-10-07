import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DataDeletionPage() {
  return (
    <main className="container mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Data Deletion
        </h1>
        <p className="mt-3 text-muted-foreground">
          Request the deletion of your personal data associated with Farin
          Fusion.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Request Data Deletion</CardTitle>
        </CardHeader>

        <CardContent className="space-y-4 text-muted-foreground">
          <p>
            Users can request deletion of their personal data associated with
            Farin Fusion by contacting us through our contact email or
            available contact method.
          </p>

          <p>
            Upon receiving a valid request, we will review the request and
            delete applicable user data according to our data retention
            requirements and applicable legal obligations.
          </p>

          <p>
            To request data deletion, please contact us and provide enough
            information for us to identify the relevant account or data.
          </p>

          <div className="rounded-lg border bg-muted/50 p-4">
            <p className="font-medium text-foreground">Contact Farin Fusion</p>
            <p className="mt-1">
              Please use the contact information provided on our website to
              submit your data deletion request.
            </p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}