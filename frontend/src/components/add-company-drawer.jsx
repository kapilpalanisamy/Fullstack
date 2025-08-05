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
        // logo_url will be handled later with proper file upload
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
        <form onSubmit={handleSubmit(onSubmit)} className="flex gap-2 p-4 pb-0">
          {/* Company Name */}
          <Input placeholder="Company name" {...register("name")} />

          {/* Company Logo */}
          <Input
            type="file"
            accept="image/*"
            className="file:text-gray-500"
            {...register("logo")}
          />

          {/* Add Button */}
          <Button
            type="submit"
            variant="destructive"
            className="w-40"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Adding..." : "Add"}
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
