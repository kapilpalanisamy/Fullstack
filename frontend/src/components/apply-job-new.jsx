/* eslint-disable react/prop-types */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { useJobs } from "../contexts/JobsContext";

export function ApplyJobDrawer({ user, job, applied = false, open, onOpenChange }) {
  const { applyToJob, isDeadlinePassed } = useJobs();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    coverLetter: "",
    experience: "",
    skills: "",
    resume: null
  });

  const deadlinePassed = job?.application_deadline ? isDeadlinePassed(job.application_deadline) : false;
  const canApply = !applied && !deadlinePassed && job?.is_active;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user || !job) return;

    setIsLoading(true);
    try {
      await applyToJob(job.id, {
        user_id: user.id,
        cover_letter: formData.coverLetter,
        resume_url: formData.resume ? 'uploaded-resume-url' : null, // In real app, upload resume to server first
        applied_at: new Date().toISOString()
      });
      
      // Reset form and close drawer
      setFormData({
        coverLetter: "",
        experience: "",
        skills: "",
        resume: null
      });
      onOpenChange?.(false);
    } catch (error) {
      console.error("Failed to apply:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle>
            Apply for {job?.title} at {job?.company?.name}
          </DrawerTitle>
          <DrawerDescription>
            {deadlinePassed ? (
              <span className="text-red-600">Application deadline has passed</span>
            ) : applied ? (
              <span className="text-green-600">You have already applied for this job</span>
            ) : (
              "Please fill out the form below to apply for this position"
            )}
          </DrawerDescription>
        </DrawerHeader>

        {canApply ? (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 p-4 pb-0">
            <div className="space-y-2">
              <Label htmlFor="coverLetter">Cover Letter</Label>
              <Textarea
                id="coverLetter"
                placeholder="Tell us why you're interested in this position..."
                value={formData.coverLetter}
                onChange={(e) => handleInputChange("coverLetter", e.target.value)}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="experience">Years of Experience</Label>
              <Input
                id="experience"
                type="number"
                min="0"
                placeholder="e.g., 3"
                value={formData.experience}
                onChange={(e) => handleInputChange("experience", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Relevant Skills</Label>
              <Input
                id="skills"
                placeholder="e.g., React, Node.js, Python (comma-separated)"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="resume">Resume (Optional)</Label>
              <Input
                id="resume"
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={(e) => handleInputChange("resume", e.target.files[0])}
                className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>

            <DrawerFooter className="px-0">
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Submitting Application..." : "Submit Application"}
              </Button>
              <DrawerClose asChild>
                <Button variant="outline" type="button">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        ) : (
          <div className="p-4">
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                {deadlinePassed 
                  ? "The application deadline for this job has passed."
                  : applied 
                  ? "You have already applied for this position."
                  : "This job is no longer accepting applications."
                }
              </p>
              <DrawerClose asChild>
                <Button variant="outline">
                  Close
                </Button>
              </DrawerClose>
            </div>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
