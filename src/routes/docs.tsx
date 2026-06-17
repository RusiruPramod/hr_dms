import { Link } from "react-router-dom";
import { FileText, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function DocsPage() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-3 sm:p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2">Documents</h1>
          <p className="text-sm sm:text-base md:text-lg text-gray-600">Create and manage internship-related documents</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <FileText className="h-5 sm:h-6 w-5 sm:w-6 text-blue-600 flex-shrink-0" />
                <CardTitle className="text-lg sm:text-xl">Offer Letter</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">
                Generate internship offer letters for selected candidates
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Link to="/offer-letter" className="w-full">
                <Button className="w-full text-xs sm:text-sm">Create Offer Letter</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center gap-3 mb-2">
                <ShieldCheck className="h-5 sm:h-6 w-5 sm:w-6 text-green-600 flex-shrink-0" />
                <CardTitle className="text-lg sm:text-xl">NDA Agreement</CardTitle>
              </div>
              <CardDescription className="text-xs sm:text-sm">Generate Non-Disclosure Agreements for interns</CardDescription>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <Link to="/nda" className="w-full">
                <Button className="w-full text-xs sm:text-sm">Create NDA Agreement</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
