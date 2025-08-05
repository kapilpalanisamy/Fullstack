import apiService from "@/services/apiService";

// Fetch Companies
export async function getCompanies(token) {
  try {
    const response = await apiService.getCompanies();
    
    if (!response.success) {
      console.error("Error fetching Companies:", response.message);
      return null;
    }

    return response.companies;
  } catch (error) {
    console.error("Error fetching Companies:", error);
    return null;
  }
}

// Add Company (placeholder - will need backend endpoint with file upload)
export async function addNewCompany(token, _, companyData) {
  try {
    // TODO: Implement file upload for company logo
    // For now, just send the company data without logo upload
    const backendCompanyData = {
      name: companyData.name,
      description: companyData.description || null,
      website: companyData.website || null,
      industry: companyData.industry || null,
      location: companyData.location || null,
      // TODO: Handle logo upload when backend supports it
      logo_url: companyData.logo_url || null
    };

    const response = await apiService.createCompany(backendCompanyData);
    return response.data;
  } catch (error) {
    console.error("Error creating company:", error);
    throw new Error("Error submitting Company");
  }
}
