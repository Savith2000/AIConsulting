import { createClient } from "./client";

export interface ProfileData {
  first_name: string;
  last_name: string;
  phone_number: string;
  email: string;
  availability_days?: string[]; // Array of day names: ["Monday", "Tuesday", etc.]
  onboarding_completed: boolean;
  is_admin?: boolean; // Admin status - set manually in Supabase
}

/**
 * Check if user has completed onboarding
 */
export async function checkOnboardingComplete(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("onboarding_completed")
      .eq("id", userId)
      .single();

    if (error) {
      // If profile doesn't exist, onboarding is not complete
      if (error.code === "PGRST116") {
        return false;
      }
      console.error("Error checking onboarding status:", error);
      return false;
    }

    return data?.onboarding_completed === true;
  } catch (error) {
    console.error("Error checking onboarding complete:", error);
    return false;
  }
}

/**
 * Check if user is admin
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userId)
      .single();

    if (error) {
      // If profile doesn't exist, user is not admin
      if (error.code === "PGRST116") {
        return false;
      }
      console.error("Error checking admin status:", error);
      return false;
    }

    return data?.is_admin === true;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Get user profile
 */
export async function getUserProfile(userId: string) {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();

    if (error) {
      console.error("Error getting user profile:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error getting user profile:", error);
    return null;
  }
}

/**
 * Create or update user profile
 */
export async function createOrUpdateProfile(
  userId: string,
  profileData: ProfileData
) {
  try {
    const supabase = createClient();
    
    // First, check if profile exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from("profiles")
        .update({
          ...profileData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from("profiles")
        .insert({
          id: userId,
          ...profileData,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error: any) {
    console.error("Error creating/updating profile:", error);
    throw new Error(error.message || "Failed to save profile");
  }
}

