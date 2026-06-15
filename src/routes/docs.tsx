import { createFileRoute, redirect } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getCurrentUser } from "@/hooks/use-auth";

export const Route = createFileRoute("/docs")({
  head: () => ({
    meta: [
      { title: "Documents — DocuFlow HR" },
      { name: "description", content: "Generate and manage HR documents." },
    ],
  }),
  beforeLoad: async () => {
    const user = getCurrentUser();
    if (!user) {
      throw redirect({ to: "/login" });
    }
  },
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Documents</h1>
          <p className="text-lg text-gray-600">Create and manage internship-related documents</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-6 w-6 text-blue-600" />
                <CardTitle>Offer Letter</CardTitle>
              </div>
              <CardDescription>
                Generate internship offer letters for selected candidates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/offer-letter">
                <Button className="w-full">Create Offer Letter</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-6 w-6 text-green-600" />
                <CardTitle>NDA Agreement</CardTitle>
              </div>
              <CardDescription>Generate Non-Disclosure Agreements for interns</CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/nda">
                <Button className="w-full">Create NDA Agreement</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
