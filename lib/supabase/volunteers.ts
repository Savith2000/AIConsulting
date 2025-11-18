import { createClient } from "./client";
import { getVolunteerAssignmentsForWeek } from "./admin";

export interface VolunteerProfile {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  availability_days: string[];
  is_admin: boolean;
}

export interface CategorizedVolunteers {
  available: VolunteerWithAssignments[];
  alreadyScheduled: VolunteerWithAssignments[];
  notAvailable: VolunteerWithAssignments[];
}

export interface VolunteerWithAssignments extends VolunteerProfile {
  assignmentsThisWeek: Array<{ day: string; routeNumber: number }>;
}

/**
 * Get all volunteers (non-admin users)
 */
export async function getAllVolunteers(): Promise<VolunteerProfile[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone_number, availability_days, is_admin")
      .eq("onboarding_completed", true)
      .order("first_name", { ascending: true });

    if (error) {
      console.error("Error getting volunteers:", error);
      return [];
    }

    // Filter out admins on the client side to avoid query issues
    const volunteers = (data || []).filter(v => !v.is_admin);
    return volunteers;
  } catch (error) {
    console.error("Error getting volunteers:", error);
    return [];
  }
}

/**
 * Categorize volunteers by availability for a specific day and week
 */
export async function categorizeVolunteers(
  day: string,
  weekId: string
): Promise<CategorizedVolunteers> {
  try {
    const supabase = createClient();

    // Get all volunteers
    const volunteers = await getAllVolunteers();

    // Get all assignments for this week
    const { data: weekAssignments } = await supabase
      .from("assignments")
      .select(`
        id,
        day_of_week,
        volunteer_id,
        route_id,
        routes (route_number)
      `)
      .eq("week_id", weekId);

    // Build assignment map: volunteerId -> array of { day, routeNumber }
    const assignmentMap = new Map<string, Array<{ day: string; routeNumber: number }>>();
    
    weekAssignments?.forEach((assignment) => {
      if (assignment.volunteer_id) {
        const existing = assignmentMap.get(assignment.volunteer_id) || [];
        existing.push({
          day: assignment.day_of_week,
          routeNumber: (assignment.routes as any)?.route_number || 0,
        });
        assignmentMap.set(assignment.volunteer_id, existing);
      }
    });

    // Categorize volunteers
    const available: VolunteerWithAssignments[] = [];
    const alreadyScheduled: VolunteerWithAssignments[] = [];
    const notAvailable: VolunteerWithAssignments[] = [];

    volunteers.forEach((volunteer) => {
      const assignmentsThisWeek = assignmentMap.get(volunteer.id) || [];
      const volunteerWithAssignments = {
        ...volunteer,
        assignmentsThisWeek,
      };

      const isAvailableOnDay = volunteer.availability_days?.includes(day) || false;
      const hasAssignments = assignmentsThisWeek.length > 0;

      if (isAvailableOnDay && !hasAssignments) {
        available.push(volunteerWithAssignments);
      } else if (isAvailableOnDay && hasAssignments) {
        alreadyScheduled.push(volunteerWithAssignments);
      } else {
        notAvailable.push(volunteerWithAssignments);
      }
    });

    return {
      available,
      alreadyScheduled,
      notAvailable,
    };
  } catch (error) {
    console.error("Error categorizing volunteers:", error);
    return {
      available: [],
      alreadyScheduled: [],
      notAvailable: [],
    };
  }
}

/**
 * Get volunteer by ID with full details
 */
export async function getVolunteerById(volunteerId: string): Promise<VolunteerProfile | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("profiles")
      .select("id, first_name, last_name, email, phone_number, availability_days, is_admin")
      .eq("id", volunteerId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error getting volunteer:", error);
    return null;
  }
}

