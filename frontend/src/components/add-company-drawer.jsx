/* eslint-disable react/prop-types */
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { useJobs } from "../contexts/JobsContext";

const schema = z.object({
  name: z.string().min(1, { message: "Company name is required" }),
  description: z.string().min(10, { message: "Description should be at least 10 characters" }).optional(),
  website: z.string().url({ message: "Please enter a valid URL" }).optional(),
  industry: z.string().min(1, { message: "Industry is required" }),
  company_size: z.string().optional(),
  location: z.string().min(1, { message: "Location is required" }),
  logo: z
    .any()
    .refine(
      (file) =>
        !file[0] || (file[0] && 
        (file[0].type === "image/png" || file[0].type === "image/jpeg")),
      {
        message: "Only PNG and JPEG images are allowed",
      }
    ),
});

const AddCompanyDrawer = ({ onCompanyAdded }) => {
  const { addCompany } = useJobs();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setError("");
    setSuccess("");
    try {
      const result = await addCompany({
        name: data.name,
        description: data.description || '',
        website: data.website || '',
        industry: data.industry || '',
        company_size: data.company_size || '',
        location: data.location || '',
        // logo_url will be handled later with proper file upload
        logo_url: '/companies/default.svg'
      });
      
      if (result.success) {
        setSuccess("Company added successfully!");
        reset();
        setTimeout(() => {
          setIsOpen(false);
          setSuccess("");
        }, 1500);
        
        if (onCompanyAdded) {
          onCompanyAdded();
        }
      } else {
        console.error("Failed to add company:", result.error);
        setError(result.error || "Failed to add company");
      }
    } catch (error) {
      console.error("Error adding company:", error);
      setError("Error adding company: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button type="button" size="sm" variant="secondary">
          Add Company
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Add a New Company</DrawerTitle>
        </DrawerHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 p-4">
          {/* Company Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Name *</label>
            <Input placeholder="Enter company name" {...register("name")} />
            {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              className="min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              placeholder="Enter company description"
              {...register("description")}
            />
            {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
          </div>

          {/* Website */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Website</label>
            <Input type="url" placeholder="https://..." {...register("website")} />
            {errors.website && <p className="text-red-500 text-xs">{errors.website.message}</p>}
          </div>

          {/* Industry */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Industry *</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register("industry")}
            >
              <option value="">Select industry</option>
              <option value="Technology">Technology</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Finance">Finance</option>
              <option value="Education">Education</option>
              <option value="Manufacturing">Manufacturing</option>
              <option value="Retail">Retail</option>
              <option value="Other">Other</option>
            </select>
            {errors.industry && <p className="text-red-500 text-xs">{errors.industry.message}</p>}
          </div>

          {/* Company Size */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Size</label>
            <select
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              {...register("company_size")}
            >
              <option value="">Select company size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="501-1000">501-1000 employees</option>
              <option value="1000+">1000+ employees</option>
            </select>
          </div>

          {/* Location */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Location *</label>
            <Input placeholder="Enter location" {...register("location")} />
            {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
          </div>

          {/* Company Logo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Company Logo</label>
            <Input
              type="file"
              accept="image/*"
              className="file:text-gray-500"
              {...register("logo")}
            />
            {errors.logo && <p className="text-red-500 text-xs">{errors.logo.message}</p>}
          </div>

          {/* Add Button */}
          <Button
            type="submit"
            variant="destructive"
            className="w-full mt-4"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add Company"}
          </Button>
        </form>
        <DrawerFooter>
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
          {errors.logo && <p className="text-red-500">{errors.logo.message}</p>}
          {error && <p className="text-red-500">{error}</p>}
          {success && <p className="text-green-500">{success}</p>}
          <DrawerClose asChild>
            <Button type="button" variant="secondary">
              Cancel
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
};

export default AddCompanyDrawer;
