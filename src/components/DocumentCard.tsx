import React from "react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileText, CalendarClock } from "lucide-react";
import { RawDocument } from "@/types";
import { Link } from "react-router-dom";

interface DocumentCardProps {
  document: RawDocument;
}

const DocumentCard: React.FC<DocumentCardProps> = ({ document }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "signed":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRandomDocumentName = (): string => {
    const words = [
      "Report",
      "Summary",
      "Notes",
      "Invoice",
      "Memo",
      "Draft",
      "Proposal",
    ];
    const randomWord = words[Math.floor(Math.random() * words.length)];

    const date = new Date();
    const formattedDate = date.toISOString().split("T")[0]; // "YYYY-MM-DD"

    const randomId = Math.random().toString(36).substring(2, 8); // short alphanumeric

    return `${randomWord}_${formattedDate}_${randomId}`;
  };

  const getRandomFormattedDate = (): string => {
    const start = new Date(2025, 0, 1);
    const end = new Date();

    const randomDate = new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime())
    );

    return randomDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center">
            <FileText className="w-5 h-5 text-sui-teal mr-2" />
            <CardTitle className="text-lg">{document.content.name}</CardTitle>
          </div>
          <Badge className={getStatusColor("draft")}>
            {/* {document.status.charAt(0).toUpperCase() + document.status.slice(1)} */}
            {"Draft"}
          </Badge>
        </div>
        <CardDescription className="flex items-center mt-1">
          <CalendarClock className="w-4 h-4 mr-1 text-gray-400" />
          {/* {format(document.uploadedAt, "MMM d, yyyy")} */}
          {getRandomFormattedDate()}
        </CardDescription>
      </CardHeader>
      {/* <CardContent className="pb-2">
        <div className="text-sm text-gray-600">
          {document.signatureFields.length > 0 ? (
            <p>
              {
                document.signatureFields.filter((field) => field.signedBy)
                  .length
              }{" "}
              of {document.signatureFields.length} signatures completed
            </p>
          ) : (
            <p>No signature fields added yet</p>
          )}
        </div>
      </CardContent> */}
      <CardFooter>
        <Link to={`/documents/${document.content.doc_id}`} className="w-full">
          <Button variant="outline" className="w-full">
            View Document
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
};

export default DocumentCard;
