import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function PrivacyPolicy() {
  return (
    <main className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="mt-3 text-muted-foreground">
          Your privacy is important to us. This Privacy Policy explains how
          Farin Fusion collects, uses, and protects your information.
        </p>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Farin Fusion may collect information that you provide when you
              place an order, contact us, submit a lead form, or interact with
              our website.
            </p>

            <ul className="list-disc space-y-2 pl-5">
              <li>Name and contact information</li>
              <li>Phone number and email address</li>
              <li>Delivery address and order information</li>
              <li>Product preferences and inquiries</li>
              <li>Information submitted through lead forms</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Information Received from Facebook / Meta</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              If you contact Farin Fusion or submit a lead form through
              Facebook or other Meta platforms, we may receive the information
              you choose to provide through that form.
            </p>

            <p>
              This may include your name, phone number, email address, and
              other information submitted through the lead form.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. How We Use Your Information</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p className="mb-3">
              We use collected information only for legitimate business
              purposes, including:
            </p>

            <ul className="list-disc space-y-2 pl-5">
              <li>Processing and delivering orders</li>
              <li>Contacting customers about their orders or inquiries</li>
              <li>Following up on leads submitted through Facebook</li>
              <li>Providing customer support</li>
              <li>Improving our products and services</li>
              <li>Managing and maintaining our website</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Facebook / Meta and Third-Party Services</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-muted-foreground">
            <p>
              Farin Fusion may use Meta platforms and other third-party
              services to receive leads, communicate with customers, process
              orders, provide delivery services, and operate our website.
            </p>

            <p>
              Information shared with third-party service providers is limited
              to what is reasonably necessary to provide the relevant service.
              These providers may process information according to their own
              privacy policies and applicable laws.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. Data Protection</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              We take reasonable measures to protect the information we
              collect from unauthorized access, misuse, alteration, or
              disclosure. However, no online service can guarantee complete
              security of information.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. Your Privacy Choices</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              You may contact us if you have questions about the personal
              information we hold about you or if you want to request
              correction or deletion of your information, subject to applicable
              legal and operational requirements.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. Contact Us</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              If you have any questions about this Privacy Policy or how Farin
              Fusion handles your information, please contact us through the
              contact information provided on our website.
            </p>
          </CardContent>
        </Card>

        <p className="pt-4 text-sm text-muted-foreground">
          Last updated: October 2026
        </p>
      </div>
    </main>
  );
}