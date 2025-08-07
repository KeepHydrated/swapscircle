import { useState } from "react";
import { Flag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportModal } from "./ReportModal";

interface ReportButtonProps {
  reportedUserId: string;
  reportedUsername: string;
}

export const ReportButton = ({ reportedUserId, reportedUsername }: ReportButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setShowModal(true)}
        className="text-muted-foreground hover:text-destructive w-10 h-10 p-0"
        title="Report User"
      >
        <Flag className="w-4 h-4" />
      </Button>
      
      <ReportModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        reportedUserId={reportedUserId}
        reportedUsername={reportedUsername}
      />
    </>
  );
};