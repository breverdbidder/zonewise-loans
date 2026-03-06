/**
 * @fileoverview Server-side admin role verification via Supabase
 * @module utils/adminAuth
 * 
 * Checks the `user_roles` table in Supabase to determine if the
 * authenticated user has admin privileges. This replaces the previous
 * client-side ADMIN_EMAILS whitelist with a proper server-side check.
 * 
 * Security: The role check happens via RLS — users can only read
 * their own role from the user_roles table.
 */

import { supabase } from "../supabase";

/**
 * Check if the current authenticated user has admin role
 * @returns {Promise<boolean>} True if user is admin
 */
export async function checkAdminRole() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error || !data) return false;
    return data.role === "admin";
  } catch (err) {
    console.error("Admin role check failed:", err);
    return false;
  }
}

/**
 * Fetch all loan applications (admin only — enforced by RLS)
 * @returns {Promise<Array>} Array of loan applications
 */
export async function fetchAdminApplications() {
  try {
    const { data, error } = await supabase
      .from("loan_applications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Failed to fetch applications:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Application fetch error:", err);
    return [];
  }
}
